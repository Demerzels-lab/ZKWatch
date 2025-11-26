import { Agent, Transaction, ZKProof, Statistics, Alert, PerformanceMetric } from '@/types';

// Mock Agents
export const mockAgents: Agent[] = [
  {
    id: 'agent-001',
    name: 'Ethereum Whale Tracker',
    status: 'active',
    privacy: 'public',
    token: '0x0000000000000000000000000000000000000000',
    tokenSymbol: 'ETH',
    threshold: 100,
    monitoringFrequency: 5,
    createdAt: '2025-10-15T08:30:00Z',
    totalAlerts: 234,
    successRate: 94.5,
    totalValue: 12500000,
    lastActivity: '2025-11-26T22:45:00Z',
    description: 'Monitors large Ethereum transactions above 100 ETH',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  },
  {
    id: 'agent-002',
    name: 'USDT Flow Monitor',
    status: 'active',
    privacy: 'private',
    token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    tokenSymbol: 'USDT',
    threshold: 500000,
    monitoringFrequency: 3,
    createdAt: '2025-10-20T14:15:00Z',
    totalAlerts: 456,
    successRate: 97.2,
    totalValue: 45000000,
    lastActivity: '2025-11-26T23:10:00Z',
    description: 'Tracks USDT movements for whale activities',
    walletAddress: '0x8B3192f5eEBD8579568A2Ed41E6FEB402f93f73F'
  },
  {
    id: 'agent-003',
    name: 'BTC Bridge Watcher',
    status: 'monitoring',
    privacy: 'public',
    token: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    tokenSymbol: 'WBTC',
    threshold: 10,
    monitoringFrequency: 10,
    createdAt: '2025-11-01T09:00:00Z',
    totalAlerts: 89,
    successRate: 91.8,
    totalValue: 3400000,
    lastActivity: '2025-11-26T20:30:00Z',
    description: 'Monitors wrapped Bitcoin transactions',
    walletAddress: '0x3FFC03F05D1869f493c7dbf913E636C6280e0ff9'
  },
  {
    id: 'agent-004',
    name: 'DeFi Protocol Scanner',
    status: 'paused',
    privacy: 'private',
    token: '0x6b175474e89094c44da98b954eedeac495271d0f',
    tokenSymbol: 'DAI',
    threshold: 250000,
    monitoringFrequency: 7,
    createdAt: '2025-09-25T16:45:00Z',
    totalAlerts: 178,
    successRate: 88.3,
    totalValue: 8900000,
    lastActivity: '2025-11-25T18:20:00Z',
    description: 'Scans DeFi protocol interactions',
    walletAddress: '0xD551234Ae421e3BCBA99A0Da6d736074f22192FF'
  },
  {
    id: 'agent-005',
    name: 'NFT Whale Spotter',
    status: 'active',
    privacy: 'public',
    token: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    tokenSymbol: 'WETH',
    threshold: 50,
    monitoringFrequency: 15,
    createdAt: '2025-11-10T11:30:00Z',
    totalAlerts: 67,
    successRate: 93.1,
    totalValue: 2100000,
    lastActivity: '2025-11-26T23:00:00Z',
    description: 'Tracks NFT market whale activities',
    walletAddress: '0x1E0049783F008A0085193E00003D00cd54003c71'
  },
  {
    id: 'agent-006',
    name: 'Exchange Flow Tracker',
    status: 'active',
    privacy: 'private',
    token: '0x0000000000000000000000000000000000000000',
    tokenSymbol: 'ETH',
    threshold: 200,
    monitoringFrequency: 5,
    createdAt: '2025-10-28T07:20:00Z',
    totalAlerts: 312,
    successRate: 95.8,
    totalValue: 18700000,
    lastActivity: '2025-11-26T23:15:00Z',
    description: 'Monitors exchange deposit and withdrawal activities',
    walletAddress: '0x28C6c06298d514Db089934071355E5743bf21d60'
  }
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'tx-001',
    agentId: 'agent-001',
    agentName: 'Ethereum Whale Tracker',
    type: 'buy',
    token: '0x0000000000000000000000000000000000000000',
    tokenSymbol: 'ETH',
    amount: 456.78,
    value: 1825000,
    fromAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    toAddress: '0x8B3192f5eEBD8579568A2Ed41E6FEB402f93f73F',
    txHash: '0x7f3b4c8d2e1a9f6d3c2b5a8e4d7c1b3a9f6d5e2c8a7b4d1e3c6f9a2b5d8e1c4',
    timestamp: '2025-11-26T23:15:00Z',
    zkProof: '0xzk1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d',
    verified: true
  },
  {
    id: 'tx-002',
    agentId: 'agent-002',
    agentName: 'USDT Flow Monitor',
    type: 'transfer',
    token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    tokenSymbol: 'USDT',
    amount: 2500000,
    value: 2500000,
    fromAddress: '0x3FFC03F05D1869f493c7dbf913E636C6280e0ff9',
    toAddress: '0xD551234Ae421e3BCBA99A0Da6d736074f22192FF',
    txHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e',
    timestamp: '2025-11-26T23:10:00Z',
    zkProof: '0xzk9f8e7d6c5b4a3z2y1x0w9v8u7t6s5r4q3p2o1n0m9l8k7j6i5h4g3f2e1d0c',
    verified: true
  },
  {
    id: 'tx-003',
    agentId: 'agent-003',
    agentName: 'BTC Bridge Watcher',
    type: 'sell',
    token: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    tokenSymbol: 'WBTC',
    amount: 23.45,
    value: 2345000,
    fromAddress: '0x1E0049783F008A0085193E00003D00cd54003c71',
    toAddress: '0x28C6c06298d514Db089934071355E5743bf21d60',
    txHash: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8',
    timestamp: '2025-11-26T23:05:00Z',
    zkProof: '0xzk5t4s3r2q1p0o9n8m7l6k5j4i3h2g1f0e9d8c7b6a5z4y3x2w1v0u9t8s7r6q',
    verified: true
  },
  {
    id: 'tx-004',
    agentId: 'agent-005',
    agentName: 'NFT Whale Spotter',
    type: 'swap',
    token: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    tokenSymbol: 'WETH',
    amount: 89.12,
    value: 356000,
    fromAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    toAddress: '0x8B3192f5eEBD8579568A2Ed41E6FEB402f93f73F',
    txHash: '0x2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3',
    timestamp: '2025-11-26T23:00:00Z',
    zkProof: '0xzk3p2o1n0m9l8k7j6i5h4g3f2e1d0c9b8a7z6y5x4w3v2u1t0s9r8q7p6o5n4m',
    verified: true
  },
  {
    id: 'tx-005',
    agentId: 'agent-006',
    agentName: 'Exchange Flow Tracker',
    type: 'transfer',
    token: '0x0000000000000000000000000000000000000000',
    tokenSymbol: 'ETH',
    amount: 678.9,
    value: 2715000,
    fromAddress: '0x3FFC03F05D1869f493c7dbf913E636C6280e0ff9',
    toAddress: '0xD551234Ae421e3BCBA99A0Da6d736074f22192FF',
    txHash: '0xa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f',
    timestamp: '2025-11-26T22:55:00Z',
    zkProof: '0xzk7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0v9u8t7s6r5q4p3o2n1m0l9k8j',
    verified: true
  },
  {
    id: 'tx-006',
    agentId: 'agent-001',
    agentName: 'Ethereum Whale Tracker',
    type: 'buy',
    token: '0x0000000000000000000000000000000000000000',
    tokenSymbol: 'ETH',
    amount: 234.56,
    value: 938000,
    fromAddress: '0x1E0049783F008A0085193E00003D00cd54003c71',
    toAddress: '0x28C6c06298d514Db089934071355E5743bf21d60',
    txHash: '0x5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6',
    timestamp: '2025-11-26T22:50:00Z',
    zkProof: '0xzk1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0m',
    verified: true
  }
];

// Mock ZK Proofs
export const mockZKProofs: ZKProof[] = mockTransactions.map((tx, index) => ({
  id: `proof-${String(index + 1).padStart(3, '0')}`,
  hash: tx.zkProof,
  transactionId: tx.id,
  verified: tx.verified,
  timestamp: tx.timestamp,
  privacyLevel: index % 3 === 0 ? 'high' : index % 2 === 0 ? 'medium' : 'low',
  validatorAddress: '0xValidator' + String(index).padStart(40, '0'),
  proofSize: Math.floor(Math.random() * 1000) + 500
}));

// Mock Statistics
export const mockStatistics: Statistics = {
  totalAgents: 1247,
  activeAgents: 892,
  monitoredWhales: 3456,
  zkProofs: 15678,
  totalValue: 125000000,
  dailyTransactions: 2345
};

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    agentId: 'agent-001',
    type: 'whale_activity',
    title: 'Large ETH Transfer Detected',
    message: '456.78 ETH transferred - exceeding threshold of 100 ETH',
    severity: 'high',
    timestamp: '2025-11-26T23:15:00Z',
    read: false
  },
  {
    id: 'alert-002',
    agentId: 'agent-002',
    type: 'threshold',
    title: 'USDT Threshold Exceeded',
    message: '2.5M USDT movement detected from monitored wallet',
    severity: 'critical',
    timestamp: '2025-11-26T23:10:00Z',
    read: false
  },
  {
    id: 'alert-003',
    agentId: 'agent-003',
    type: 'volume_spike',
    title: 'WBTC Volume Spike',
    message: 'Unusual WBTC activity - 300% increase in 1 hour',
    severity: 'medium',
    timestamp: '2025-11-26T23:05:00Z',
    read: true
  },
  {
    id: 'alert-004',
    agentId: 'agent-005',
    type: 'price_change',
    title: 'Price Alert',
    message: 'WETH price movement detected during large transaction',
    severity: 'low',
    timestamp: '2025-11-26T23:00:00Z',
    read: true
  }
];

// Mock Performance Metrics
export const mockPerformanceMetrics: PerformanceMetric[] = [
  { date: '2025-11-20', alerts: 45, accuracy: 92.5, value: 8500000 },
  { date: '2025-11-21', alerts: 52, accuracy: 94.2, value: 9200000 },
  { date: '2025-11-22', alerts: 38, accuracy: 91.8, value: 7800000 },
  { date: '2025-11-23', alerts: 61, accuracy: 95.6, value: 11200000 },
  { date: '2025-11-24', alerts: 48, accuracy: 93.4, value: 9600000 },
  { date: '2025-11-25', alerts: 55, accuracy: 96.1, value: 10800000 },
  { date: '2025-11-26', alerts: 67, accuracy: 94.8, value: 12500000 }
];

// Helper function to generate new transaction
export function generateMockTransaction(): Transaction {
  const agents = mockAgents.filter(a => a.status === 'active');
  const agent = agents[Math.floor(Math.random() * agents.length)];
  const types: TransactionType[] = ['buy', 'sell', 'transfer', 'swap'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  return {
    id: `tx-${Date.now()}`,
    agentId: agent.id,
    agentName: agent.name,
    type,
    token: agent.token,
    tokenSymbol: agent.tokenSymbol,
    amount: Math.random() * 1000 + 100,
    value: Math.random() * 5000000 + 100000,
    fromAddress: '0x' + Math.random().toString(16).substring(2, 42),
    toAddress: '0x' + Math.random().toString(16).substring(2, 42),
    txHash: '0x' + Math.random().toString(16).substring(2, 66),
    timestamp: new Date().toISOString(),
    zkProof: '0xzk' + Math.random().toString(16).substring(2, 66),
    verified: Math.random() > 0.1
  };
}
