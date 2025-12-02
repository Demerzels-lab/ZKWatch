#!/bin/bash

# ZKWatch Deployment Script
# Automated deployment pipeline for production environments
# Author: ZKWatch Team
# Version: 1.0.0

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_ENV="${DEPLOY_ENV:-production}"
BUILD_DIR="${BUILD_DIR:-dist}"
LOG_FILE="$SCRIPT_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to log messages
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
    log "INFO" "$1"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    log "SUCCESS" "$1"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    log "WARNING" "$1"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    log "ERROR" "$1"
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Are you in the project root?"
        exit 1
    fi
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | sed 's/v//')
        REQUIRED_NODE_VERSION="18.0.0"
        
        if [ "$(printf '%s\n' "$REQUIRED_NODE_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_NODE_VERSION" ]; then
            log_success "Node.js version: $NODE_VERSION"
        else
            log_error "Node.js version $NODE_VERSION is too old. Required: $REQUIRED_NODE_VERSION+"
            exit 1
        fi
    else
        log_error "Node.js is required but not installed"
        exit 1
    fi
    
    # Check Rust if building Rust components
    if [ "$BUILD_RUST" = "true" ] && [ -f "rust/Cargo.toml" ]; then
        if command -v rustc &> /dev/null; then
            RUST_VERSION=$(rustc --version)
            log_success "Rust found: $RUST_VERSION"
        else
            log_error "Rust is required for Rust components but not installed"
            exit 1
        fi
    fi
    
    # Check if required files exist
    if [ "$DEPLOY_ENV" = "production" ]; then
        if [ ! -f ".env.production" ]; then
            log_error ".env.production file not found for production deployment"
            exit 1
        fi
    fi
}

# Function to install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Clear npm cache
    npm ci
    
    log_success "Dependencies installed"
}

# Function to build Rust components
build_rust_components() {
    if [ "$BUILD_RUST" = "true" ] && [ -f "rust/Cargo.toml" ]; then
        log_info "Building Rust components..."
        
        cd rust
        
        # Update dependencies
        cargo fetch
        
        # Build for production
        cargo build --release --bin zkwatch-core
        
        if [ $? -eq 0 ]; then
            log_success "Rust components built successfully"
            
            # Copy binary to a accessible location
            if [ -f "target/release/zkwatch-core" ]; then
                cp "target/release/zkwatch-core" "$PROJECT_ROOT/bin/"
                chmod +x "$PROJECT_ROOT/bin/zkwatch-core"
                log_success "Rust binary copied to bin/"
            fi
        else
            log_error "Failed to build Rust components"
            exit 1
        fi
        
        cd "$PROJECT_ROOT"
    fi
}

# Function to run tests
run_tests() {
    if [ "$SKIP_TESTS" != "true" ]; then
        log_info "Running tests..."
        
        # Run linting
        log_info "Running ESLint..."
        npm run lint
        
        if [ $? -ne 0 ]; then
            log_error "ESLint failed"
            exit 1
        fi
        
        # Run type checking
        log_info "Running TypeScript checks..."
        npm run type-check
        
        if [ $? -ne 0 ]; then
            log_error "TypeScript checks failed"
            exit 1
        fi
        
        # Run unit tests
        log_info "Running unit tests..."
        npm test
        
        if [ $? -ne 0 ]; then
            log_error "Unit tests failed"
            exit 1
        fi
        
        # Run Rust tests if building Rust components
        if [ "$BUILD_RUST" = "true" ] && [ -f "rust/Cargo.toml" ]; then
            log_info "Running Rust tests..."
            cd rust && cargo test --release && cd "$PROJECT_ROOT"
            
            if [ $? -ne 0 ]; then
                log_error "Rust tests failed"
                exit 1
            fi
        fi
        
        log_success "All tests passed"
    else
        log_warning "Tests skipped"
    fi
}

# Function to build frontend
build_frontend() {
    log_info "Building frontend application..."
    
    # Set environment variables for build
    export NODE_ENV="$DEPLOY_ENV"
    export NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-https://zkwatch.ai}"
    
    # Build Next.js application
    npm run build
    
    if [ $? -eq 0 ]; then
        log_success "Frontend built successfully"
        
        # Optimize for production
        if [ "$OPTIMIZE" = "true" ]; then
            log_info "Optimizing build artifacts..."
            
            # Analyze bundle size
            if npm run analyze &> /dev/null; then
                log_info "Bundle analysis completed"
            fi
            
            # Compress assets (if applicable)
            if [ -d "public" ]; then
                find public -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec gzip -k {} \;
                log_info "Assets compressed"
            fi
        fi
    else
        log_error "Failed to build frontend"
        exit 1
    fi
}

# Function to create deployment package
create_deployment_package() {
    log_info "Creating deployment package..."
    
    local package_name="zkwatch-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"
    local temp_dir=$(mktemp -d)
    
    # Copy essential files
    cp -r .next "$temp_dir/" 2>/dev/null || true
    cp -r public "$temp_dir/" 2>/dev/null || true
    cp package.json "$temp_dir/"
    cp package-lock.json "$temp_dir/" 2>/dev/null || true
    cp .env.production "$temp_dir/.env" 2>/dev/null || true
    cp -r bin "$temp_dir/" 2>/dev/null || true
    cp -r rust "$temp_dir/" 2>/dev/null || true
    cp README.md "$temp_dir/"
    cp -r scripts "$temp_dir/"
    
    # Create deployment manifest
    cat > "$temp_dir/deployment.json" << EOF
{
    "version": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
    "build_time": "$(date -Iseconds)",
    "environment": "$DEPLOY_ENV",
    "node_version": "$(node --version)",
    "rust_version": "$(rustc --version 2>/dev/null || echo 'not-installed')"
}
EOF
    
    # Create tarball
    cd "$temp_dir"
    tar -czf "$PROJECT_ROOT/$package_name" .
    cd "$PROJECT_ROOT"
    rm -rf "$temp_dir"
    
    log_success "Deployment package created: $package_name"
    
    if [ "$CLEANUP" = "true" ]; then
        cleanup_old_packages "$package_name"
    fi
}

# Function to cleanup old deployment packages
cleanup_old_packages() {
    local current_package="$1"
    local max_age_days="${PACKAGE_RETENTION_DAYS:-7}"
    
    log_info "Cleaning up old deployment packages (older than $max_age_days days)..."
    
    find "$PROJECT_ROOT" -name "zkwatch-deploy-*.tar.gz" -type f -not -name "$current_package" -mtime +$max_age_days -delete 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Function to deploy to server
deploy_to_server() {
    if [ "$DEPLOY_TO_SERVER" = "true" ]; then
        log_info "Deploying to server..."
        
        # SSH deployment (example)
        if [ -n "$DEPLOY_HOST" ]; then
            local deploy_path="${DEPLOY_PATH:-/var/www/zkwatch}"
            local package_name="zkwatch-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"
            
            log_info "Deploying to $DEPLOY_HOST:$deploy_path"
            
            # Upload package
            scp "$package_name" "$DEPLOY_HOST:$deploy_path/"
            
            # Deploy on server
            ssh "$DEPLOY_HOST" << EOF
                cd $deploy_path
                tar -xzf $package_name
                npm ci --production
                pm2 restart zkwatch || true
                rm $package_name
EOF
            
            log_success "Deployment to server completed"
        else
            log_warning "DEPLOY_HOST not set, skipping server deployment"
        fi
    fi
}

# Function to run post-deployment checks
post_deployment_checks() {
    if [ "$RUN_HEALTH_CHECKS" = "true" ]; then
        log_info "Running post-deployment health checks..."
        
        local app_url="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
        
        # Wait for application to be ready
        log_info "Waiting for application to be ready..."
        local max_attempts=30
        local attempt=0
        
        while [ $attempt -lt $max_attempts ]; do
            if curl -f -s "$app_url" > /dev/null; then
                log_success "Application is responding"
                break
            fi
            
            attempt=$((attempt + 1))
            if [ $attempt -lt $max_attempts ]; then
                log_info "Waiting... (attempt $attempt/$max_attempts)"
                sleep 5
            fi
        done
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "Application failed to start after $max_attempts attempts"
            exit 1
        fi
        
        # Run additional health checks
        if [ -n "$DEPLOY_HOST" ]; then
            local health_url="$app_url/api/health"
            log_info "Checking health endpoint: $health_url"
            
            if curl -f -s "$health_url" > /dev/null; then
                log_success "Health check passed"
            else
                log_warning "Health check failed"
            fi
        fi
        
        log_success "Post-deployment checks completed"
    fi
}

# Function to send notifications
send_notifications() {
    if [ -n "$SLACK_WEBHOOK" ]; then
        local status="$1"
        local message="ZKWatch deployment $status"
        
        if [ "$status" = "success" ]; then
            send_slack_notification "$message" "good"
        elif [ "$status" = "failure" ]; then
            send_slack_notification "$message" "danger"
        fi
    fi
    
    if [ -n "$DISCORD_WEBHOOK" ]; then
        local status="$1"
        local message="ZKWatch deployment $status"
        send_discord_notification "$message"
    fi
}

# Function to send Slack notification
send_slack_notification() {
    local message="$1"
    local color="$2"
    
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"$message\",\"attachments\":[{\"color\":\"$color\"}]}" \
        "$SLACK_WEBHOOK" 2>/dev/null || true
}

# Function to send Discord notification
send_discord_notification() {
    local message="$1"
    
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"content\":\"$message\"}" \
        "$DISCORD_WEBHOOK" 2>/dev/null || true
}

# Function to show deployment summary
show_summary() {
    echo
    echo "==================================================================="
    log_success "Deployment completed successfully! 🎉"
    echo "==================================================================="
    echo
    echo "Deployment Summary:"
    echo "  Environment: $DEPLOY_ENV"
    echo "  Build Time: $(date)"
    echo "  Version: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
    echo "  Log File: $LOG_FILE"
    echo
    
    if [ -n "$DEPLOY_HOST" ]; then
        echo "  Server: $DEPLOY_HOST"
        echo "  Application URL: ${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
    fi
    
    echo "Next steps:"
    echo "  1. Monitor the application logs"
    echo "  2. Run post-deployment tests"
    echo "  3. Check the deployment dashboard"
    echo
}

# Function to handle cleanup on error
cleanup_on_error() {
    log_error "Deployment failed. Cleaning up..."
    
    # Restore previous version if deploying to server
    if [ "$DEPLOY_TO_SERVER" = "true" ] && [ -n "$DEPLOY_HOST" ] && [ -n "$BACKUP_VERSION" ]; then
        log_info "Restoring previous version..."
        ssh "$DEPLOY_HOST" "pm2 restart zkwatch || true" 2>/dev/null || true
    fi
    
    send_notifications "failure"
    
    log_error "Deployment failed. Check logs at: $LOG_FILE"
    exit 1
}

# Main deployment function
main() {
    echo "==================================================================="
    echo "           ZKWatch Production Deployment"
    echo "==================================================================="
    echo "Environment: $DEPLOY_ENV"
    echo "Timestamp: $(date)"
    echo
    
    # Set up error handling
    trap cleanup_on_error ERR
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --env)
                DEPLOY_ENV="$2"
                shift 2
                ;;
            --build-rust)
                BUILD_RUST="true"
                shift
                ;;
            --skip-tests)
                SKIP_TESTS="true"
                shift
                ;;
            --deploy-server)
                DEPLOY_TO_SERVER="true"
                shift
                ;;
            --host)
                DEPLOY_HOST="$2"
                shift 2
                ;;
            --path)
                DEPLOY_PATH="$2"
                shift 2
                ;;
            --health-checks)
                RUN_HEALTH_CHECKS="true"
                shift
                ;;
            --optimize)
                OPTIMIZE="true"
                shift
                ;;
            --cleanup)
                CLEANUP="true"
                shift
                ;;
            --help|-h)
                echo "ZKWatch Deployment Script"
                echo
                echo "Usage: $0 [options]"
                echo
                echo "Options:"
                echo "  --env ENV           Set deployment environment (default: production)"
                echo "  --build-rust        Build Rust components"
                echo "  --skip-tests        Skip running tests"
                echo "  --deploy-server     Deploy to server"
                echo "  --host HOST         Server hostname for deployment"
                echo "  --path PATH         Server deployment path"
                echo "  --health-checks     Run health checks after deployment"
                echo "  --optimize          Optimize build artifacts"
                echo "  --cleanup           Clean up old deployment packages"
                echo "  --help, -h          Show this help message"
                echo
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Set defaults
    BUILD_RUST="${BUILD_RUST:-false}"
    SKIP_TESTS="${SKIP_TESTS:-false}"
    DEPLOY_TO_SERVER="${DEPLOY_TO_SERVER:-false}"
    RUN_HEALTH_CHECKS="${RUN_HEALTH_CHECKS:-false}"
    OPTIMIZE="${OPTIMIZE:-true}"
    CLEANUP="${CLEANUP:-true}"
    
    # Execute deployment steps
    check_prerequisites
    install_dependencies
    build_rust_components
    run_tests
    build_frontend
    create_deployment_package
    deploy_to_server
    post_deployment_checks
    
    # Send success notification
    send_notifications "success"
    
    # Show summary
    show_summary
}

# Handle script arguments
main "$@"