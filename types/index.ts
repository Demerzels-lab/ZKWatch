export type AgentStatus = 'active' | 'paused' | 'monitoring' | 'inactive';

export type AgentPrivacy = 'public' | 'private';

export type TransactionType = 'buy' | 'sell' | 'transfer' | 'swap';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  privacy: AgentPrivacy;
  token: string;
  tokenSymbol: string;
  threshold: number;
  monitoringFrequency: number;
  createdAt: string;
  totalAlerts: number;
  successRate: number;
  totalValue: number;
  lastActivity: string;
  description?: string;
  walletAddress?: string;
}

export interface Transaction {
  id: string;
  agentId: string;
  agentName: string;
  type: TransactionType;
  token: string;
  tokenSymbol: string;
  amount: number;
  value: number;
  fromAddress: string;
  toAddress: string;
  txHash: string;
  timestamp: string;
  zkProof: string;
  verified: boolean;
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
  agentId: string;
  type: 'threshold' | 'whale_activity' | 'price_change' | 'volume_spike';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  read: boolean;
}

export interface PerformanceMetric {
  date: string;
  alerts: number;
  accuracy: number;
  value: number;
}
