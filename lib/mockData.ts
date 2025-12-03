export const mockStatistics = {
  totalWhales: 1247,
  totalVolume: 4567890000000000000000000, // 4.56M ETH in wei
  activeNetworks: 5,
  alertsToday: 23,
  topWhaleAddress: '0x742d35Cc6634C0532925a3b8D8Ac87b5F8aF7C3F',
  // Additional properties expected by the component
  totalAgents: 1247,
  activeAgents: 892,
  monitoredWhales: 3460,
  zkProofs: 15680,
  totalValue: 4567890000000000000000000, // Same as totalVolume
  dailyTransactions: 2340,
  recentTransactions: [
    {
      id: '1',
      from: '0x742d35Cc6634C0532925a3b8D8Ac87b5F8aF7C3F',
      to: '0x8ba1f109551bD432803012645261768374161',
      value: 1000000000000000000000, // 1000 ETH
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      network: 'Ethereum',
      type: 'transfer'
    },
    {
      id: '2',
      from: '0x9c1f109551bD432803012645261768374162',
      to: '0x742d35Cc6634C0532925a3b8D8Ac87b5F8aF7C3F',
      value: 500000000000000000000, // 500 ETH
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      network: 'Polygon',
      type: 'bridge'
    }
  ],
  networkStats: {
    ethereum: { volume: 3000000000000000000000000, transactions: 456 },
    polygon: { volume: 800000000000000000000000, transactions: 123 },
    arbitrum: { volume: 400000000000000000000000, transactions: 89 },
    optimism: { volume: 200000000000000000000000, transactions: 67 },
    bsc: { volume: 150000000000000000000000, transactions: 45 }
  },
  alerts: [
    {
      id: '1',
      type: 'coordinated_movement',
      severity: 'high',
      message: 'Detected coordinated whale movement of 1500 ETH across 3 addresses',
      timestamp: new Date(Date.now() - 1800000), // 30 min ago
      addresses: ['0x742d35Cc6634C0532925a3b8D8Ac87b5F8aF7C3F', '0x8ba1f109551bD432803012645261768374161', '0x9c1f109551bD432803012645261768374162']
    },
    {
      id: '2',
      type: 'bridge_whale',
      severity: 'medium',
      message: 'Large bridge transaction detected: 800 ETH to Polygon',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      addresses: ['0x742d35Cc6634C0532925a3b8D8Ac87b5F8aF7C3F']
    }
  ]
};

import { Agent } from '../types';

export const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Whale Tracker Alpha',
    type: 'whale_tracker',
    status: 'running' as const,
    description: 'Advanced whale tracking agent for Ethereum',
    configuration: {
      networks: ['ethereum', 'polygon'],
      minThreshold: 1000000000000000000000, // 1000 ETH
      alertTypes: ['coordinated_movement', 'bridge_whale']
    },
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    lastActivity: new Date(Date.now() - 3600000), // 1 hour ago
    last_activity: new Date(Date.now() - 3600000), // 1 hour ago
    totalAlerts: 15,
    successRate: 95,
    totalValue: 2500000000000000000000 // 2500 ETH
  },
  {
    id: '2',
    name: 'MEV Detector',
    type: 'mev_detector',
    status: 'stopped' as const,
    description: 'Detects MEV opportunities and frontrunning attempts',
    configuration: {
      networks: ['ethereum'],
      minThreshold: 500000000000000000000, // 500 ETH
      alertTypes: ['mev_attack', 'sandwich_attack']
    },
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    lastActivity: new Date(Date.now() - 7200000), // 2 hours ago
    last_activity: new Date(Date.now() - 7200000), // 2 hours ago
    totalAlerts: 8,
    successRate: 87,
    totalValue: 1200000000000000000000 // 1200 ETH
  },
  {
    id: '3',
    name: 'DeFi Whale Monitor',
    type: 'defi_monitor',
    status: 'running' as const,
    description: 'Monitors large DeFi protocol interactions',
    configuration: {
      networks: ['ethereum', 'polygon', 'arbitrum'],
      minThreshold: 200000000000000000000, // 200 ETH
      alertTypes: ['defi_whale', 'liquidity_movement']
    },
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
    lastActivity: new Date(Date.now() - 1800000), // 30 min ago
    last_activity: new Date(Date.now() - 1800000), // 30 min ago
    totalAlerts: 23,
    successRate: 92,
    totalValue: 1800000000000000000000 // 1800 ETH
  }
];

export const mockTransactions = [
  {
    id: 'tx_1',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    agentId: '1',
    from: '0x742d35Cc6634C0532925a3b8D8Ac87b5F8aF7C3F',
    to: '0x8ba1f109551bD432803012645261768374161',
    value: 1000000000000000000000, // 1000 ETH
    amount: 1000,
    tokenSymbol: 'ETH',
    verified: true,
    timestamp: new Date(Date.now() - 3600000),
    network: 'ethereum',
    blockchain: 'ethereum',
    type: 'transfer',
    gasUsed: 21000,
    gasPrice: 20000000000,
    status: 'confirmed'
  },
  {
    id: 'tx_2',
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    agentId: '2',
    from: '0x9c1f109551bD432803012645261768374162',
    to: '0x742d35Cc6634C0532925a3b8D8Ac87b5F8aF7C3F',
    value: 500000000000000000000, // 500 ETH
    amount: 500,
    tokenSymbol: 'ETH',
    verified: true,
    timestamp: new Date(Date.now() - 7200000),
    network: 'polygon',
    blockchain: 'polygon',
    type: 'bridge',
    gasUsed: 150000,
    gasPrice: 50000000000,
    status: 'confirmed'
  },
  {
    id: 'tx_3',
    hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
    agentId: '1',
    from: '0x742d35Cc6634C0532925a3b8D8Ac87b5F8aF7C3F',
    to: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // Uniswap V3
    value: 200000000000000000000, // 200 ETH
    amount: 200,
    tokenSymbol: 'ETH',
    verified: true,
    timestamp: new Date(Date.now() - 10800000),
    network: 'ethereum',
    blockchain: 'ethereum',
    type: 'defi_interaction',
    gasUsed: 180000,
    gasPrice: 25000000000,
    status: 'confirmed'
  }
];