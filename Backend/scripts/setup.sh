#!/bin/bash

# ZKWatch Setup Script
# Automated setup for development environment
# Author: ZKWatch Team
# Version: 1.0.0

set -e

echo "🚀 Setting up ZKWatch development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running in CI/CD environment
if [ "$CI" = "true" ]; then
    print_info "Detected CI/CD environment, using package manager: $CI_PACKAGE_MANAGER"
fi

# Check system requirements
check_requirements() {
    print_info "Checking system requirements..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js is required but not installed"
        print_info "Install Node.js from https://nodejs.org/"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm found: v$NPM_VERSION"
    else
        print_error "npm is required but not installed"
        exit 1
    fi
    
    # Check Rust
    if command -v rustc &> /dev/null; then
        RUST_VERSION=$(rustc --version)
        print_status "Rust found: $RUST_VERSION"
    else
        print_warning "Rust not found, installing..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source ~/.cargo/env
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_status "Docker found: $DOCKER_VERSION"
    else
        print_warning "Docker not found (optional for containerized deployment)"
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_status "Git found: $GIT_VERSION"
    else
        print_error "Git is required but not installed"
        exit 1
    fi
}

# Install Node.js dependencies
install_dependencies() {
    print_info "Installing Node.js dependencies..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the project root?"
        exit 1
    fi
    
    # Clean install to avoid cache issues
    npm ci
    
    print_status "Node.js dependencies installed"
}

# Build Rust components
build_rust_components() {
    print_info "Building Rust components..."
    
    if [ ! -f "rust/Cargo.toml" ]; then
        print_warning "Rust project not found, skipping..."
        return
    fi
    
    cd rust
    
    # Install Rust dependencies
    cargo fetch
    
    # Build release version for production
    cargo build --release
    
    # Build for current platform
    cargo build
    
    cd ..
    
    print_status "Rust components built successfully"
}

# Setup environment files
setup_environment() {
    print_info "Setting up environment files..."
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        cat > .env << EOL
# ZKWatch Environment Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/demo
NEXT_PUBLIC_CHAIN_ID=1

# Database Configuration (if using database)
DATABASE_URL=postgresql://user:password@localhost:5432/zkwatch

# API Keys
ALCHEMY_API_KEY=your_alchemy_api_key_here
INFURA_API_KEY=your_infura_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# ZK-Proof Configuration
ZK_PROOF_CIRCUIT_PATH=./circuits/
ZK_PROOF_KEY_PATH=./keys/

# Analytics Configuration
ANALYTICS_BATCH_SIZE=100
ANALYTICS_RETENTION_DAYS=30

# Monitoring Configuration
MONITORING_ENABLED=true
ALERT_EMAIL=alerts@zkwatch.ai
SLACK_WEBHOOK_URL=your_slack_webhook_here

# Security Configuration
ENCRYPTION_KEY=your_32_char_encryption_key_here
JWT_SECRET=your_jwt_secret_here

# Development Configuration
DEBUG_MODE=true
LOG_LEVEL=debug
EOL
        print_status "Created .env file from template"
    else
        print_status ".env file already exists"
    fi
    
    # Create .env.local for local overrides
    if [ ! -f ".env.local" ]; then
        cat > .env.local << EOL
# Local Development Overrides
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEBUG_MODE=true
LOG_LEVEL=debug
EOL
        print_status "Created .env.local file"
    fi
}

# Setup database
setup_database() {
    print_info "Setting up database..."
    
    # Check if PostgreSQL is available
    if command -v psql &> /dev/null; then
        print_status "PostgreSQL found, you can setup the database"
        print_info "Database setup commands:"
        echo "  createdb zkwatch_dev"
        echo "  psql zkwatch_dev < scripts/schema.sql"
    else
        print_warning "PostgreSQL not found, skipping database setup"
    fi
}

# Setup pre-commit hooks
setup_git_hooks() {
    print_info "Setting up Git hooks..."
    
    # Install husky if not exists
    if [ ! -d ".git/hooks" ]; then
        print_warning "Not a Git repository, skipping Git hooks setup"
        return
    fi
    
    # Create pre-commit hook
    cat > .git/hooks/pre-commit << 'EOL'
#!/bin/sh
# ZKWatch Pre-commit Hook

echo "🔍 Running pre-commit checks..."

# Run linting
echo "📋 Running ESLint..."
npm run lint

if [ $? -ne 0 ]; then
    echo "❌ ESLint failed. Please fix the issues before committing."
    exit 1
fi

# Run TypeScript type checking
echo "📘 Running TypeScript checks..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ TypeScript checks failed. Please fix the type errors before committing."
    exit 1
fi

# Run Rust checks if Rust components exist
if [ -f "rust/Cargo.toml" ]; then
    echo "🦀 Running Rust checks..."
    cd rust && cargo check && cargo test --quiet && cd ..
    
    if [ $? -ne 0 ]; then
        echo "❌ Rust checks failed. Please fix the issues before committing."
        exit 1
    fi
fi

echo "✅ Pre-commit checks passed!"
EOL
    
    chmod +x .git/hooks/pre-commit
    print_status "Git pre-commit hook installed"
}

# Run initial tests
run_initial_tests() {
    print_info "Running initial tests..."
    
    # Test Node.js components
    if npm run test -- --passWithNoTests 2>/dev/null; then
        print_status "Node.js tests passed"
    else
        print_warning "Node.js tests failed or no tests found"
    fi
    
    # Test Rust components
    if [ -f "rust/Cargo.toml" ]; then
        cd rust && cargo test --quiet && cd ..
        print_status "Rust tests passed"
    fi
}

# Create startup scripts
create_scripts() {
    print_info "Creating startup scripts..."
    
    # Create start-dev.sh
    cat > start-dev.sh << 'EOL'
#!/bin/bash
# Start development server

echo "🚀 Starting ZKWatch development environment..."

# Start Rust backend if exists
if [ -f "rust/target/debug/zkwatch-core" ]; then
    echo "🦀 Starting Rust backend..."
    ./rust/target/debug/zkwatch-core realtime &
    RUST_PID=$!
fi

# Start Next.js development server
echo "⚛️  Starting Next.js frontend..."
npm run dev &

# Wait for all processes
wait $RUST_PID 2>/dev/null || true
EOL
    
    chmod +x start-dev.sh
    
    # Create build-production.sh
    cat > build-production.sh << 'EOL'
#!/bin/bash
# Build for production

echo "🏗️  Building ZKWatch for production..."

# Build Rust components
if [ -f "rust/Cargo.toml" ]; then
    echo "🦀 Building Rust components..."
    cd rust && cargo build --release && cd ..
fi

# Build Next.js application
echo "⚛️  Building Next.js application..."
npm run build

echo "✅ Production build complete!"
echo "🚀 Start with: npm start"
EOL
    
    chmod +x build-production.sh
    
    print_status "Startup scripts created"
}

# Generate documentation
generate_docs() {
    print_info "Generating documentation..."
    
    # Install typedoc if not exists
    if npm list typedoc &> /dev/null; then
        npx typedoc --out docs/typescript src/
        print_status "TypeScript documentation generated"
    else
        print_warning "typedoc not installed, skipping documentation generation"
    fi
    
    # Generate Rust documentation
    if [ -f "rust/Cargo.toml" ]; then
        cd rust && cargo doc --no-deps && cd ..
        print_status "Rust documentation generated"
    fi
}

# Main setup function
main() {
    echo "==================================================================="
    echo "           ZKWatch Development Environment Setup"
    echo "==================================================================="
    echo
    
    check_requirements
    install_dependencies
    build_rust_components
    setup_environment
    setup_database
    setup_git_hooks
    create_scripts
    run_initial_tests
    generate_docs
    
    echo
    echo "==================================================================="
    print_status "Setup complete! 🎉"
    echo "==================================================================="
    echo
    echo "Next steps:"
    echo "1. Review and update .env and .env.local files"
    echo "2. Run 'npm run dev' to start the development server"
    echo "3. Run 'npm test' to execute tests"
    echo "4. Visit http://localhost:3000 to see your application"
    echo
    echo "Useful commands:"
    echo "  ./start-dev.sh      - Start all services"
    echo "  ./build-production.sh - Build for production"
    echo "  npm run lint        - Run linting"
    echo "  npm run type-check  - TypeScript type checking"
    echo "  npm test            - Run tests"
    echo
    echo "For more information, check the README.md file"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "ZKWatch Setup Script"
        echo
        echo "Usage: $0 [options]"
        echo
        echo "Options:"
        echo "  --skip-deps     Skip dependency installation"
        echo "  --skip-rust     Skip Rust component setup"
        echo "  --skip-hooks    Skip Git hooks setup"
        echo "  --help, -h      Show this help message"
        exit 0
        ;;
    --skip-deps)
        SKIP_DEPS=true
        ;;
    --skip-rust)
        SKIP_RUST=true
        ;;
    --skip-hooks)
        SKIP_HOOKS=true
        ;;
esac

# Run main setup
main