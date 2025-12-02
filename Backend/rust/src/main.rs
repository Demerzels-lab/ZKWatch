//! ZKWatch Core Engine - Main Entry Point
//! 
//! This is the main executable for the ZKWatch core engine, providing
//! command-line interface for whale tracking, ZK-proof generation,
//! and blockchain analytics.

use zkwatch_core::*;
use std::env;
use tokio;

#[tokio::main]
async fn main() -> ZKWatchResult<()> {
    let args: Vec<String> = env::args().collect();
    
    if args.len() < 2 {
        print_usage();
        return Ok(());
    }
    
    match args[1].as_str() {
        "scan" => {
            let config = WhaleTrackerConfig::default();
            let networks = config.tracking_networks.clone();
            let mut tracker = AdvancedWhaleTracker::new(config, networks);
            
            let min_value = args[2].parse::<u128>().unwrap_or(100_000_000_000_000_000_000u128);
            
            println!("🔍 Starting whale scanning with minimum value: {} ETH", min_value as f64 / 1e18);
            
            let transactions = tracker.scanner.scan_whale_transactions(min_value).await?;
            
            println!("📊 Found {} whale transactions:", transactions.len());
            for tx in &transactions {
                println!("  - {} ETH from {} to {}", 
                    tx.value as f64 / 1e18, 
                    &tx.from[..10]..., 
                    &tx.to[..10]...
                );
            }
        }
        
        "analyze" => {
            let config = WhaleTrackerConfig::default();
            let networks = config.tracking_networks.clone();
            let mut tracker = AdvancedWhaleTracker::new(config, networks);
            
            println!("🧠 Running comprehensive analytics...");
            
            let analytics = tracker.generate_comprehensive_analytics().await?;
            
            println!("📈 Analytics Summary:");
            println!("  - Total Volume: {:.2} ETH", analytics.summary.total_volume as f64 / 1e18);
            println!("  - Transaction Count: {}", analytics.summary.total_whale_transactions);
            println!("  - Avg Transaction: {:.2} ETH", analytics.summary.average_transaction_size as f64 / 1e18);
            println!("  - Risk Factors: {}", analytics.summary.suspected_manipulation_count);
            
            // Show detected patterns
            if !analytics.detected_patterns.is_empty() {
                println!("\n🎯 Detected Patterns:");
                for pattern in &analytics.detected_patterns {
                    println!("  - {}: {} (confidence: {:.2}%)", 
                        pattern.pattern_type, pattern.description, pattern.confidence * 100.0);
                }
            }
        }
        
        "zkproof" => {
            let mut generator = ZKSNARKGenerator::new();
            
            println!("🔐 Generating ZK-proof for whale transaction...");
            
            let tx_inputs = WhaleTransactionInputs {
                tx_hash: "0x1234567890abcdef1234567890abcdef12345678".to_string(),
                block_number: 18000000,
                timestamp: Utc::now(),
                amount_commitment: "commitment_hash_1".to_string(),
                address_commitment: "commitment_hash_2".to_string(),
                gas_commitment: "commitment_hash_3".to_string(),
            };
            
            let proof = generator.generate_whale_transaction_proof(&tx_inputs)?;
            
            println!("✅ ZK-proof generated successfully!");
            println!("  - Proof size: {} bytes", proof.proof_data.len());
            println!("  - Public inputs: {}", proof.public_inputs.len());
            println!("  - Verification key: {}", proof.verification_key);
            
            let is_valid = generator.verify_proof(&proof)?;
            println!("  - Verification: {}", if is_valid { "Valid ✅" } else { "Invalid ❌" });
        }
        
        "mev" => {
            let config = WhaleTrackerConfig::default();
            let networks = config.tracking_networks.clone();
            let mut scanner = MultiChainScanner::new(networks);
            
            println!("⚡ Detecting MEV opportunities...");
            
            let opportunities = scanner.detect_mev_opportunities(100).await?;
            
            if !opportunities.is_empty() {
                println!("💰 Found {} MEV opportunities:", opportunities.len());
                for opp in &opportunities {
                    println!("  - {}: {:.2} ETH profit (confidence: {:.1}%)", 
                        opp.opportunity_type, 
                        opp.estimated_profit as f64 / 1e18, 
                        opp.confidence * 100.0
                    );
                }
            } else {
                println!("❌ No MEV opportunities detected");
            }
        }
        
        "crosschain" => {
            if args.len() < 3 {
                println!("Usage: {} crosschain <address>", args[0]);
                return Ok(());
            }
            
            let address = &args[2];
            let config = WhaleTrackerConfig::default();
            let networks = config.tracking_networks.clone();
            let mut scanner = MultiChainScanner::new(networks);
            
            println!("🌉 Analyzing cross-chain activity for: {}", address);
            
            let analysis = scanner.analyze_cross_chain_transactions(address).await?;
            
            println!("📊 Cross-chain Analysis:");
            println!("  - Networks analyzed: {}", analysis.networks_analyzed.len());
            println!("  - Total volume: {:.2} ETH", analysis.total_cross_chain_volume as f64 / 1e18);
            println!("  - Risk level: {:?}", analysis.risk_assessment);
            
            if !analysis.bridge_patterns.is_empty() {
                println!("\n🔗 Bridge Patterns:");
                for pattern in &analysis.bridge_patterns {
                    println!("  - {} (confidence: {:.1}%)", pattern.pattern_type, pattern.confidence * 100.0);
                }
            }
            
            if !analysis.recommendations.is_empty() {
                println!("\n💡 Recommendations:");
                for rec in &analysis.recommendations {
                    println!("  - {}", rec);
                }
            }
        }
        
        "predict" => {
            let config = WhaleTrackerConfig::default();
            let networks = config.tracking_networks.clone();
            let mut tracker = AdvancedWhaleTracker::new(config, networks);
            
            println!("🔮 Generating movement predictions...");
            
            let predictions = tracker.predict_whale_movements().await?;
            
            if !predictions.is_empty() {
                println!("🎯 Predictions:");
                for pred in &predictions {
                    println!("  - {}: {} ({:.1}% confidence)", 
                        &pred.predicted_address[..10]...,
                        match pred.predicted_action {
                            PredictionAction::LargePurchase => "Large Purchase",
                            PredictionAction::LargeSale => "Large Sale",
                            PredictionAction::Bridge => "Bridge Activity",
                            PredictionAction::DefiInteraction => "DeFi Interaction",
                            PredictionAction::Hold => "Hold Position",
                        },
                        pred.confidence * 100.0
                    );
                    println!("    Estimated volume: {:.2} ETH", pred.estimated_volume as f64 / 1e18);
                }
            } else {
                println!("❌ No predictions available");
            }
        }
        
        "defi" => {
            if args.len() < 3 {
                println!("Usage: {} defi <address>", args[0]);
                return Ok(());
            }
            
            let address = &args[2];
            let config = WhaleTrackerConfig::default();
            let networks = config.tracking_networks.clone();
            let mut scanner = MultiChainScanner::new(networks);
            
            println!("🏛️ Analyzing DeFi interactions for: {}", address);
            
            let interactions = scanner.analyze_defi_interactions(address).await?;
            
            if !interactions.is_empty() {
                println!("📈 Found {} DeFi interactions:", interactions.len());
                for interaction in &interactions {
                    println!("  - {}: {} {} → {} {} ({})", 
                        interaction.protocol,
                        interaction.action,
                        interaction.token_in,
                        interaction.token_out,
                        (interaction.amount_out as f64 / 1e6).to_string(),
                        interaction.network
                    );
                }
            } else {
                println!("❌ No DeFi interactions found");
            }
        }
        
        "realtime" => {
            let config = WhaleTrackerConfig {
                real_time_monitoring: true,
                ..WhaleTrackerConfig::default()
            };
            let networks = config.tracking_networks.clone();
            let mut tracker = AdvancedWhaleTracker::new(config, networks);
            
            println!("🚀 Starting real-time whale monitoring...");
            println!("Press Ctrl+C to stop");
            
            let _handle = tracker.start_real_time_monitoring().await?;
            
            // Keep the process running
            loop {
                tokio::time::sleep(std::time::Duration::from_secs(30)).await;
                println!("🔄 Monitoring active... {}", Utc::now().format("%H:%M:%S"));
            }
        }
        
        "clusters" => {
            let config = WhaleTrackerConfig::default();
            let networks = config.tracking_networks.clone();
            let mut tracker = AdvancedWhaleTracker::new(config, networks);
            
            println!("🎭 Detecting whale clusters...");
            
            let clusters = tracker.detect_whale_clusters().await?;
            
            if !clusters.is_empty() {
                println!("👥 Found {} whale clusters:", clusters.len());
                for cluster in &clusters {
                    println!("  - Cluster {}: {} addresses ({})", 
                        cluster.cluster_id,
                        cluster.member_addresses.len(),
                        cluster.cluster_type
                    );
                }
            } else {
                println!("❌ No significant whale clusters detected");
            }
        }
        
        "version" | "--version" | "-v" => {
            println!("ZKWatch Core Engine v1.0.0");
            println!("Zero-Knowledge Proof Whale Tracking Platform");
            println!("Built with Rust for maximum performance and security");
        }
        
        "help" | "--help" | "-h" => {
            print_usage();
        }
        
        _ => {
            println!("❌ Unknown command: {}", args[1]);
            print_usage();
        }
    }
    
    Ok(())
}

fn print_usage() {
    println!("
🔮 ZKWatch Core Engine v1.0.0

Usage: {} <command> [options]

Commands:
  scan [value]         Scan for whale transactions (default: 100 ETH threshold)
  analyze              Run comprehensive whale analytics
  zkproof              Generate ZK-proof for whale transaction
  mev                  Detect MEV (Maximal Extractable Value) opportunities
  crosschain <addr>    Analyze cross-chain activity for address
  predict              Generate whale movement predictions
  defi <addr>          Analyze DeFi interactions for address
  realtime             Start real-time whale monitoring
  clusters             Detect whale clusters
  version              Show version information
  help                 Show this help message

Examples:
  {} scan 500                    # Scan for whales with 500+ ETH transactions
  {} analyze                     # Run full analytics
  {} crosschain 0x742d...C3F    # Analyze cross-chain activity
  {} defi 0x742d...C3F          # Check DeFi interactions
  {} realtime                    # Start live monitoring

For more information, visit: https://zkwatch.ai
", 
    env::args().next().unwrap_or("zkwatch".to_string()),
    env::args().next().unwrap_or("zkwatch".to_string()),
    env::args().next().unwrap_or("zkwatch".to_string()),
    env::args().next().unwrap_or("zkwatch".to_string()),
    env::args().next().unwrap_or("zkwatch".to_string()),
    env::args().next().unwrap_or("zkwatch".to_string())
    );
}