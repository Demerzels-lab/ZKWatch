//! ZKWatch Core Library
//! 
//! This module provides cryptographic operations, ZK-proof computations,
//! and blockchain analytics for the ZKWatch platform.

pub mod zk_proofs;
pub mod blockchain;
pub mod whale_tracker;
pub mod analytics;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

/// Main result type for ZKWatch operations
pub type ZKWatchResult<T> = Result<T, ZKWatchError>;

/// Error types for ZKWatch operations
#[derive(Debug, thiserror::Error)]
pub enum ZKWatchError {
    #[error("Cryptographic operation failed: {0}")]
    Crypto(#[from] ring::error::Unspecified),
    
    #[error("Blockchain connection failed: {0}")]
    Blockchain(String),
    
    #[error("ZK-proof verification failed")]
    ProofVerification,
    
    #[error("Analytics computation error: {0}")]
    Analytics(String),
    
    #[error("Network request failed: {0}")]
    Network(#[from] reqwest::Error),
    
    #[error("JSON serialization error: {0}")]
    Json(#[from] serde_json::Error),
}

/// Whale tracking data structure
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WhaleTransaction {
    pub hash: String,
    pub from: String,
    pub to: String,
    pub value: u128,
    pub gas_used: u64,
    pub block_number: u64,
    pub timestamp: DateTime<Utc>,
    pub zk_proof_hash: Option<String>,
    pub risk_score: f64,
    pub pattern_type: TransactionPattern,
}

/// ZK-proof structure
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ZKProof {
    pub proof_data: Vec<u8>,
    pub public_inputs: Vec<String>,
    pub verification_key: String,
    pub timestamp: DateTime<Utc>,
}

/// Blockchain network configurations
#[derive(Debug, Clone)]
pub struct NetworkConfig {
    pub name: String,
    pub chain_id: u64,
    pub rpc_url: String,
    pub explorer_url: String,
}

/// Transaction pattern classification
#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TransactionPattern {
    Standard,
    LargeTransaction,
    WashTrade,
    MEVAttack,
    FlashLoan,
    DefiInteraction,
    CrossChainBridge,
    SuspectedPump,
}

/// Analytics metrics
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AnalyticsMetrics {
    pub total_whale_transactions: u64,
    pub total_volume: u128,
    pub average_transaction_size: f64,
    pub suspected_manipulation_count: u64,
    pub top_whale_addresses: Vec<String>,
    pub risk_distribution: HashMap<TransactionPattern, u64>,
    pub time_series_data: Vec<TimeSeriesPoint>,
}

/// Time series data point
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TimeSeriesPoint {
    pub timestamp: DateTime<Utc>,
    pub volume: u128,
    pub transaction_count: u64,
    pub avg_gas_price: f64,
}

/// Whale tracking configuration
#[derive(Debug, Clone)]
pub struct WhaleTrackerConfig {
    pub min_transaction_threshold: u128,
    pub tracking_networks: Vec<NetworkConfig>,
    pub zk_proof_enabled: bool,
    pub real_time_monitoring: bool,
    pub alerts_enabled: bool,
}

impl Default for WhaleTrackerConfig {
    fn default() -> Self {
        Self {
            min_transaction_threshold: 100_000_000_000_000_000_000u128, // 100 ETH
            tracking_networks: vec![
                NetworkConfig {
                    name: "Ethereum".to_string(),
                    chain_id: 1,
                    rpc_url: "https://eth-mainnet.g.alchemy.com/v2/demo".to_string(),
                    explorer_url: "https://etherscan.io".to_string(),
                },
                NetworkConfig {
                    name: "Polygon".to_string(),
                    chain_id: 137,
                    rpc_url: "https://polygon-rpc.com".to_string(),
                    explorer_url: "https://polygonscan.com".to_string(),
                },
                NetworkConfig {
                    name: "Arbitrum".to_string(),
                    chain_id: 42161,
                    rpc_url: "https://arb1.arbitrum.io/rpc".to_string(),
                    explorer_url: "https://arbiscan.io".to_string(),
                },
                NetworkConfig {
                    name: "Optimism".to_string(),
                    chain_id: 10,
                    rpc_url: "https://mainnet.optimism.io".to_string(),
                    explorer_url: "https://optimistic.etherscan.io".to_string(),
                },
            ],
            zk_proof_enabled: true,
            real_time_monitoring: true,
            alerts_enabled: true,
        }
    }
}