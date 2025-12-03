export type AgentStatus = 'active' | 'paused' | 'monitoring' | 'inactive' | 'running' | 'stopped' | 'error' | 'deploying';

export type AgentPrivacy = 'public' | 'private';

export type TransactionType = 'buy' | 'sell' | 'transfer' | 'swap';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  privacy?: AgentPrivacy;
  
  // Blockchain & Token Info
  token?: string;
  tokenSymbol?: string;
  threshold?: number;
  blockchain?: string; // Fixed: Added blockchain property
  
  // Configuration
  monitoringFrequency?: number;
  type?: string;
  description?: string;
  walletAddress?: string;
  configuration?: any;
  
  // Metrics & Stats
  createdAt: Date | string;
  lastActivity?: Date | string;
  last_activity?: Date | string; // Handle snake_case from DB
  
  // Unified Stats (CamelCase vs SnakeCase handling)
  totalAlerts?: number;
  alerts_sent?: number; // Fixed: Added alias
  
  successRate?: number;
  success_rate?: number; // Fixed: Added alias
  
  totalValue?: number;
  
  metrics?: {
    alerts_generated?: number;
    transactions_scanned?: number; // Fixed: Added missing property
    uptime_seconds?: number;
  };
  
  deployment_info?: {
    region?: string;
    instance_id?: string;
  };
}

export interface Transaction {
  id: string;
  hash?: string;
  txHash?: string;
  
  // Relations
  agentId?: string;
  agentName?: string;
  
  // Transaction Details
  type: TransactionType | string;
  amount?: number;
  value: number;
  value_usd?: number;
  
  token?: string;
  tokenSymbol?: string;
  token_symbol?: string;
  
  fromAddress?: string;
  from_address?: string;
  toAddress?: string;
  to_address?: string;
  
  // Network
  network?: string;
  blockchain?: string; // Fixed: Added blockchain
  block_number?: number;
  
  // Metadata
  timestamp: string | Date;
  created_at?: string | Date;
  
  gasUsed?: number;
  gas_used?: number;
  gasPrice?: number;
  
  // Analysis
  status?: string;
  risk_level?: string;
  pattern_type?: string;
  is_suspicious?: boolean;
  whale_score?: number;
  
  // Verification
  zkProof?: string;
  verified?: boolean;
}

export interface ZKProof {
  id: string;
  hash: string;
  transactionId: string;
  verified: boolean;
  timestamp: string;
  privacyLevel: 'high' | 'medium' | 'low';
  validatorAddress: string;
  proofSize: number;
}

export interface Statistics {
  totalAgents: number;
  activeAgents: number;
  monitoredWhales: number;
  zkProofs: number;
  totalValue: number;
  dailyTransactions: number;
}

export interface Alert {
  id: string;
  agentId?: string;
  type: string;
  title?: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | string;
  timestamp: string | Date;
  created_at?: string | Date;
  read?: boolean;
  is_read?: boolean;
}