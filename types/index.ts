export type AgentStatus = 'active' | 'paused' | 'monitoring' | 'inactive' | 'running' | 'stopped' | 'error' | 'deploying';

export type AgentPrivacy = 'public' | 'private';

export type TransactionType = 'buy' | 'sell' | 'transfer' | 'swap';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  privacy?: AgentPrivacy;
  token?: string;
  tokenSymbol?: string;
  threshold?: number;
  monitoringFrequency?: number;
  createdAt: Date | string;
  totalAlerts?: number;
  successRate?: number;
  totalValue?: number;
  lastActivity?: Date | string;
  description?: string;
  walletAddress?: string;
  type?: string;
  configuration?: any;
  metrics?: {
    alerts_generated?: number;
  };
  last_activity?: Date | string;
  deployment_info?: {
    region?: string;
  };
}

export interface Transaction {
  id: string;
  hash?: string;
  agentId?: string;
  agentName?: string;
  type: TransactionType | string;
  token?: string;
  tokenSymbol?: string;
  amount?: number;
  value: number;
  value_usd?: number;
  fromAddress?: string;
  toAddress?: string;
  from_address?: string;
  to_address?: string;
  txHash?: string;
  timestamp: string | Date;
  created_at?: string | Date;
  network?: string;
  blockchain?: string;
  gasUsed?: number;
  gasPrice?: number;
  gas_used?: number;
  status?: string;
  zkProof?: string;
  verified?: boolean;
  risk_level?: string;
  pattern_type?: string;
  token_symbol?: string;
  block_number?: number;
  is_suspicious?: boolean;
  whale_score?: number;
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
  type: 'threshold' | 'whale_activity' | 'price_change' | 'volume_spike' | string;
  title?: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | string;
  timestamp: string | Date;
  created_at?: string | Date;
  read?: boolean;
  is_read?: boolean;
}

export interface PerformanceMetric {
  date: string;
  alerts: number;
  accuracy: number;
  value: number;
}
