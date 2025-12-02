#!/bin/bash

# ZKWatch Monitoring Script
# Real-time whale tracking and system monitoring
# Author: ZKWatch Team
# Version: 1.0.0

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MONITOR_LOG="$PROJECT_ROOT/logs/monitor-$(date +%Y%m%d).log"
PID_FILE="$PROJECT_ROOT/monitor.pid"
CONFIG_FILE="$PROJECT_ROOT/.monitoring.conf"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Default configuration
DEFAULT_CONFIG='
# ZKWatch Monitoring Configuration
WHALE_THRESHOLD=100000000000000000000
SCAN_INTERVAL=30
MAX_RETRIES=3
ALERT_ENABLED=true
EMAIL_ALERTS=false
SLACK_ALERTS=false
WEBHOOK_URL=""
EMAIL_ADDRESS=""
NETWORKS=ethereum,polygon,arbitrum,optimism
MONITOR_MODES=whales,patterns,mev,anomalies
LOG_LEVEL=info
'

# Function to log messages
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$MONITOR_LOG"
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

log_critical() {
    echo -e "${RED}🚨 $1${NC}"
    log "CRITICAL" "$1"
}

log_whale() {
    echo -e "${CYAN}🐋 $1${NC}"
    log "WHALE" "$1"
}

# Function to display banner
show_banner() {
    echo "==================================================================="
    echo "           ZKWatch Real-Time Monitoring System"
    echo "==================================================================="
    echo "Monitor Mode: $(get_config 'MONITOR_MODES')"
    echo "Whale Threshold: $(echo "$(get_config 'WHALE_THRESHOLD') / 1e18" | bc) ETH"
    echo "Scan Interval: $(get_config 'SCAN_INTERVAL') seconds"
    echo "Networks: $(get_config 'NETWORKS')"
    echo "==================================================================="
    echo
}

# Function to load configuration
load_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        echo "$DEFAULT_CONFIG" > "$CONFIG_FILE"
        log_info "Created default configuration file: $CONFIG_FILE"
    fi
    
    # Source the configuration
    source "$CONFIG_FILE"
    
    # Validate configuration
    if [ -z "$WHALE_THRESHOLD" ] || [ -z "$SCAN_INTERVAL" ]; then
        log_error "Invalid configuration. Please check $CONFIG_FILE"
        exit 1
    fi
}

# Function to get configuration value
get_config() {
    local key="$1"
    grep "^$key=" "$CONFIG_FILE" | cut -d'=' -f2 | tr -d '"'
}

# Function to set configuration value
set_config() {
    local key="$1"
    local value="$2"
    sed -i "s/^$key=.*/$key=\"$value\"/" "$CONFIG_FILE"
}

# Function to check system health
check_system_health() {
    log_info "Checking system health..."
    
    # Check Node.js process
    if pgrep -f "npm run dev" > /dev/null || pgrep -f "next start" > /dev/null; then
        log_success "Frontend process running"
    else
        log_warning "Frontend process not running"
    fi
    
    # Check Rust process
    if [ -f "$PROJECT_ROOT/bin/zkwatch-core" ]; then
        if pgrep -f "zkwatch-core" > /dev/null; then
            log_success "Rust backend running"
        else
            log_warning "Rust backend not running"
        fi
    fi
    
    # Check disk space
    local disk_usage=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        log_warning "Disk usage is high: ${disk_usage}%"
    elif [ "$disk_usage" -gt 95 ]; then
        log_critical "Disk usage is critically high: ${disk_usage}%"
    fi
    
    # Check memory usage
    local memory_usage=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
    if (( $(echo "$memory_usage > 90" | bc -l) )); then
        log_warning "Memory usage is high: ${memory_usage}%"
    fi
    
    # Check network connectivity
    if ping -c 1 8.8.8.8 &> /dev/null; then
        log_success "Network connectivity OK"
    else
        log_error "Network connectivity issues detected"
    fi
}

# Function to scan for whale transactions
scan_whale_transactions() {
    log_info "Scanning for whale transactions..."
    
    # Check if Rust binary exists
    if [ ! -f "$PROJECT_ROOT/bin/zkwatch-core" ]; then
        log_warning "Rust binary not found, using mock data"
        use_mock_whale_data
        return
    fi
    
    # Run whale scan
    local result
    result=$("$PROJECT_ROOT/bin/zkwatch-core" scan "$WHALE_THRESHOLD" 2>/dev/null || echo "")
    
    if [ -n "$result" ]; then
        parse_whale_results "$result"
    else
        log_info "No whale transactions detected in this scan"
    fi
}

# Function to parse whale scanning results
parse_whale_results() {
    local result="$1"
    local line
    local whale_count=0
    
    while IFS= read -r line; do
        if [[ "$line" =~ "Found" ]] && [[ "$line" =~ "whale transactions" ]]; then
            whale_count=$(echo "$line" | grep -o '[0-9]*' | head -1)
            if [ "$whale_count" -gt 0 ]; then
                log_whale "Detected $whale_count whale transaction(s)"
            fi
        elif [[ "$line" =~ "ETH" ]]; then
            local amount=$(echo "$line" | grep -o '[0-9]*\.[0-9]* ETH' | head -1)
            local from=$(echo "$line" | grep -o "from [a-fA-F0-9]*" | cut -d' ' -f2 | cut -c1-10)
            local to=$(echo "$line" | grep -o "to [a-fA-F0-9]*" | cut -d' ' -f2 | cut -c1-10)
            
            log_whale "🐋 Whale: $amount from $from... to $to..."
            
            # Send alert if enabled
            if [ "$ALERT_ENABLED" = "true" ]; then
                send_whale_alert "$amount" "$from" "$to"
            fi
        fi
    done <<< "$result"
    
    if [ "$whale_count" -gt 0 ]; then
        log_success "Whale scan completed - Found $whale_count transaction(s)"
    fi
}

# Function to use mock whale data for testing
use_mock_whale_data() {
    log_info "Generating mock whale data for testing..."
    
    local whale_amounts=("250.5" "500.0" "1000.0" "2500.0" "5000.0")
    local addresses=("0x742d35Cc6634C0532925a3b8D8Ac87b5F8aF7C3F" "0x8ba1f109551bD432803012645Hac136c33Be3b85" "0x1234567890abcdef1234567890abcdef12345678")
    
    local num_whales=$((RANDOM % 5))
    
    for i in $(seq 1 $num_whales); do
        local amount=${whale_amounts[$((RANDOM % ${#whale_amounts[@]}))]}
        local from=${addresses[$((RANDOM % ${#addresses[@]}))]}
        local to=${addresses[$((RANDOM % ${#addresses[@]}))]}
        
        log_whale "🐋 Whale: $amount ETH from ${from:0:10}... to ${to:0:10}..."
        
        if [ "$ALERT_ENABLED" = "true" ]; then
            send_whale_alert "$amount ETH" "$from" "$to"
        fi
    done
}

# Function to monitor MEV opportunities
monitor_mev_opportunities() {
    log_info "Monitoring MEV opportunities..."
    
    if [ ! -f "$PROJECT_ROOT/bin/zkwatch-core" ]; then
        return
    fi
    
    local result
    result=$("$PROJECT_ROOT/bin/zkwatch-core" mev 2>/dev/null || echo "")
    
    if [[ "$result" =~ "Found" ]] && [[ "$result" =~ "MEV opportunities" ]]; then
        local mev_count=$(echo "$result" | grep -o '[0-9]*' | head -1)
        if [ "$mev_count" -gt 0 ]; then
            log_warning "⚡ Detected $mev_count MEV opportunity(ies)"
            
            # Parse MEV details
            local line
            while IFS= read -r line; do
                if [[ "$line" =~ "ETH profit" ]]; then
                    log_info "💰 MEV: $line"
                fi
            done <<< "$result"
        fi
    fi
}

# Function to detect suspicious patterns
detect_suspicious_patterns() {
    log_info "Analyzing transaction patterns..."
    
    # This would integrate with the analytics module
    # For now, we'll simulate pattern detection
    
    local patterns=("wash_trading" "pump_dump" "spoofing" "coordinated_movement")
    local random_pattern=${patterns[$((RANDOM % ${#patterns[@]}))]}
    
    # Random chance of detecting a pattern
    if [ $((RANDOM % 10)) -eq 0 ]; then
        log_warning "🚨 Detected suspicious pattern: $random_pattern"
        
        if [ "$ALERT_ENABLED" = "true" ]; then
            send_pattern_alert "$random_pattern"
        fi
    fi
}

# Function to analyze cross-chain activity
analyze_cross_chain() {
    log_info "Analyzing cross-chain activity..."
    
    # This would analyze bridge transactions and cross-chain movements
    # For demonstration, we'll simulate some activity
    
    local cross_chain_events=$((RANDOM % 3))
    
    for i in $(seq 1 $cross_chain_events); do
        local source_networks=("Ethereum" "Polygon" "Arbitrum")
        local target_networks=("Optimism" "BSC" "Avalanche")
        
        local source=${source_networks[$((RANDOM % ${#source_networks[@]}))]}
        local target=${target_networks[$((RANDOM % ${#target_networks[@]}))]}
        
        log_info "🌉 Cross-chain: $source → $target"
    done
}

# Function to send whale alert
send_whale_alert() {
    local amount="$1"
    local from="$2"
    local to="$3"
    
    # Send email alert if enabled
    if [ "$EMAIL_ALERTS" = "true" ] && [ -n "$EMAIL_ADDRESS" ]; then
        echo "Whale Alert: $amount from $from to $to" | mail -s "ZKWatch Whale Alert" "$EMAIL_ADDRESS" 2>/dev/null || true
    fi
    
    # Send Slack alert if enabled
    if [ "$SLACK_ALERTS" = "true" ] && [ -n "$WEBHOOK_URL" ]; then
        local message="🚨 Whale Alert: $amount from \`${from:0:10}...\` to \`${to:0:10}...\`"
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$WEBHOOK_URL" 2>/dev/null || true
    fi
    
    log_success "Alert sent for whale transaction: $amount"
}

# Function to send pattern alert
send_pattern_alert() {
    local pattern="$1"
    
    # Similar alerting logic for pattern alerts
    if [ "$SLACK_ALERTS" = "true" ] && [ -n "$WEBHOOK_URL" ]; then
        local message="🚨 Pattern Alert: Suspicious $pattern pattern detected"
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$WEBHOOK_URL" 2>/dev/null || true
    fi
}

# Function to generate monitoring report
generate_report() {
    log_info "Generating monitoring report..."
    
    local report_file="$PROJECT_ROOT/reports/monitor-report-$(date +%Y%m%d-%H%M%S).txt"
    local uptime=$(uptime | awk '{print $3,$4}' | tr -d ',')
    
    cat > "$report_file" << EOF
ZKWatch Monitoring Report
Generated: $(date)
System Uptime: $uptime

=== System Health ===
$(free -h | head -2)

=== Disk Usage ===
$(df -h "$PROJECT_ROOT")

=== Network Status ===
$(ping -c 3 8.8.8.8 | grep "packets transmitted")

=== Process Status ===
Frontend: $(pgrep -f "npm\|next" | wc -l) process(es)
Backend: $(pgrep -f "zkwatch-core" | wc -l) process(es)

=== Recent Alerts ===
$(tail -10 "$MONITOR_LOG" | grep -E "(WHALE|PATTERN|MEV)")
EOF
    
    log_success "Monitoring report generated: $report_file"
}

# Function to cleanup old logs
cleanup_old_logs() {
    log_info "Cleaning up old logs..."
    
    # Keep last 30 days of logs
    find "$PROJECT_ROOT/logs" -name "monitor-*.log" -mtime +30 -delete 2>/dev/null || true
    
    # Keep last 10 reports
    find "$PROJECT_ROOT/reports" -name "monitor-report-*.txt" -type f | sort -r | tail -n +11 | xargs rm -f 2>/dev/null || true
    
    log_success "Log cleanup completed"
}

# Function to setup monitoring environment
setup_monitoring() {
    log_info "Setting up monitoring environment..."
    
    # Create necessary directories
    mkdir -p "$PROJECT_ROOT/logs"
    mkdir -p "$PROJECT_ROOT/reports"
    mkdir -p "$PROJECT_ROOT/bin"
    
    # Create log file if it doesn't exist
    touch "$MONITOR_LOG"
    
    # Set proper permissions
    chmod 755 "$PROJECT_ROOT/logs" "$PROJECT_ROOT/reports"
    
    log_success "Monitoring environment setup complete"
}

# Function to check if already running
check_running() {
    if [ -f "$PID_FILE" ]; then
        local pid
        pid=$(cat "$PID_FILE")
        
        if kill -0 "$pid" 2>/dev/null; then
            log_error "Monitoring script is already running (PID: $pid)"
            echo "To stop the running instance, use: $0 stop"
            exit 1
        else
            # Clean up stale PID file
            rm -f "$PID_FILE"
        fi
    fi
}

# Function to start monitoring
start_monitoring() {
    log_info "Starting ZKWatch monitoring system..."
    
    # Check if already running
    check_running
    
    # Save PID
    echo $$ > "$PID_FILE"
    
    # Setup environment
    setup_monitoring
    
    # Show banner
    show_banner
    
    # Main monitoring loop
    local scan_count=0
    
    while true; do
        # Run system health check every 5 minutes
        if [ $((scan_count % 10)) -eq 0 ]; then
            check_system_health
        fi
        
        # Run whale scanning
        if [[ "$MONITOR_MODES" =~ "whales" ]]; then
            scan_whale_transactions
        fi
        
        # Monitor MEV opportunities
        if [[ "$MONITOR_MODES" =~ "mev" ]]; then
            monitor_mev_opportunities
        fi
        
        # Detect patterns
        if [[ "$MONITOR_MODES" =~ "patterns" ]]; then
            detect_suspicious_patterns
        fi
        
        # Analyze cross-chain activity
        if [[ "$MONITOR_MODES" =~ "crosschain" ]]; then
            analyze_cross_chain
        fi
        
        scan_count=$((scan_count + 1))
        
        # Generate hourly report
        if [ $((scan_count % $(echo "$(get_config 'SCAN_INTERVAL') * 2" | bc -l))) -eq 0 ]; then
            generate_report
        fi
        
        # Cleanup old logs daily
        if [ $((scan_count % 1440)) -eq 0 ]; then
            cleanup_old_logs
        fi
        
        # Wait for next scan
        sleep "$(get_config 'SCAN_INTERVAL')"
    done
}

# Function to stop monitoring
stop_monitoring() {
    log_info "Stopping ZKWatch monitoring system..."
    
    if [ -f "$PID_FILE" ]; then
        local pid
        pid=$(cat "$PID_FILE")
        
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            sleep 2
            
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid"
            fi
            
            rm -f "$PID_FILE"
            log_success "Monitoring system stopped"
        else
            log_warning "No running monitoring process found"
            rm -f "$PID_FILE"
        fi
    else
        log_warning "No PID file found"
    fi
}

# Function to show monitoring status
show_status() {
    if [ -f "$PID_FILE" ]; then
        local pid
        pid=$(cat "$PID_FILE")
        
        if kill -0 "$pid" 2>/dev/null; then
            log_success "Monitoring system is running (PID: $pid)"
            
            # Show last few log entries
            echo
            echo "Recent monitoring activity:"
            tail -5 "$MONITOR_LOG"
        else
            log_warning "PID file exists but process is not running"
            rm -f "$PID_FILE"
        fi
    else
        log_info "Monitoring system is not running"
    fi
}

# Function to show help
show_help() {
    echo "ZKWatch Monitoring Script"
    echo
    echo "Usage: $0 <command> [options]"
    echo
    echo "Commands:"
    echo "  start           Start monitoring system"
    echo "  stop            Stop monitoring system"
    echo "  status          Show monitoring status"
    echo "  config          Show/edit configuration"
    echo "  logs            Show recent logs"
    echo "  report          Generate monitoring report"
    echo "  cleanup         Clean up old logs and reports"
    echo "  help            Show this help message"
    echo
    echo "Configuration:"
    echo "  Edit $CONFIG_FILE to customize monitoring settings"
    echo
    echo "Examples:"
    echo "  $0 start        # Start monitoring"
    echo "  $0 status       # Check status"
    echo "  $0 logs         # View logs"
    echo
}

# Main function
main() {
    # Create logs directory if it doesn't exist
    mkdir -p "$(dirname "$MONITOR_LOG")"
    
    # Load configuration
    load_config
    
    # Parse command line arguments
    case "${1:-start}" in
        start)
            start_monitoring
            ;;
        stop)
            stop_monitoring
            ;;
        status)
            show_status
            ;;
        config)
            if [ -n "$2" ]; then
                set_config "$2" "$3"
                log_info "Configuration updated: $2=$3"
            else
                echo "Current configuration:"
                cat "$CONFIG_FILE"
            fi
            ;;
        logs)
            if [ -f "$MONITOR_LOG" ]; then
                tail -20 "$MONITOR_LOG"
            else
                log_info "No logs found"
            fi
            ;;
        report)
            generate_report
            ;;
        cleanup)
            cleanup_old_logs
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Handle script execution
main "$@"