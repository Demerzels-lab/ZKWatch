import { useState, useEffect } from 'react';
import { mockAgents, mockTransactions } from './mockData';
import { Agent, Transaction, Alert, AgentStatus } from '../types';

interface WhaleData {
  message: string;
}

interface AnalyticsData {
  totalVolume: number;
  activeWhales: number;
  networks: string[];
}

export function useWhaleData() {
  const [data, setData] = useState<WhaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        setLoading(true);
        // In real implementation, this would call the Rust backend API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setData({ message: 'Whale data loaded' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching alerts
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setAlerts([
          {
            id: '1',
            type: 'coordinated_movement',
            severity: 'high',
            title: 'Coordinated Whale Movement Detected',
            message: 'Detected coordinated whale movement of 1500 ETH across 3 addresses',
            timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
            created_at: new Date(Date.now() - 1800000).toISOString(),
            is_read: false
          },
          {
            id: '2',
            type: 'bridge_whale',
            severity: 'medium',
            title: 'Large Bridge Transaction',
            message: 'Large bridge transaction detected: 800 ETH to Polygon',
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            created_at: new Date(Date.now() - 3600000).toISOString(),
            is_read: false
          },
          {
            id: '3',
            type: 'defi_whale',
            severity: 'low',
            title: 'DeFi Protocol Interaction',
            message: 'Whale interaction detected with major DeFi protocol',
            timestamp: new Date(Date.now() - 7200000), // 2 hours ago
            created_at: new Date(Date.now() - 7200000).toISOString(),
            is_read: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const unreadCount = alerts.filter(alert => !alert.read && !alert.is_read).length;

  const markAsRead = async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true, is_read: true } : alert
    ));
  };

  const generateTestAlerts = async () => {
    // Mock implementation
    return [];
  };

  return { alerts, loading, unreadCount, markAsRead, generateTestAlerts };
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setAnalytics({
          totalVolume: 1000000000000000000000000, // 1M ETH
          activeWhales: 234,
          networks: ['Ethereum', 'Polygon', 'Arbitrum']
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const dashboardStats = {
    total_agents: 12,
    active_agents: 8,
    total_alerts: 45,
    total_value: 2500000000000000000000, // 2.5M ETH
    weekly_change: 12.5,
    whales_tracked: 156,
    hourly_volume: [
      { hour: '00', volume: 100000000000000000000 },
      { hour: '06', volume: 200000000000000000000 },
      { hour: '12', volume: 300000000000000000000 },
      { hour: '18', volume: 250000000000000000000 }
    ],
    blockchain_distribution: {
      ethereum: 1500000000000000000000,
      polygon: 500000000000000000000,
      arbitrum: 300000000000000000000,
      optimism: 200000000000000000000
    },
    overview: {
      total_transactions: 1234,
      total_volume_usd: 2500000000000000000000
    },
    top_whales: [
      {
        address: '0x742d35Cc6634C0532925a3b8D8Ac87b5F8aF7C3F',
        total_volume_usd: 500000000000000000000,
        last_active: new Date(Date.now() - 3600000)
      }
    ]
  };

  const riskAssessment = {
    high_risk: 3,
    medium_risk: 12,
    low_risk: 45,
    risk_level: 'medium',
    overall_risk_score: 65,
    factors: ['Large transactions detected', 'Cross-chain activity', 'Unusual timing patterns']
  };

  const fetchDashboardStats = async () => {
    // Mock implementation
    return dashboardStats;
  };

  return { analytics, loading, dashboardStats, riskAssessment, fetchDashboardStats };
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load agents from localStorage on mount
  useEffect(() => {
    const loadAgents = () => {
      try {
        const stored = localStorage.getItem('zkwatch_agents');
        if (stored) {
          const parsedAgents = JSON.parse(stored);
          // Convert date strings back to Date objects
          const agentsWithDates = parsedAgents.map((agent: any) => ({
            ...agent,
            createdAt: new Date(agent.createdAt),
            lastActivity: agent.lastActivity ? new Date(agent.lastActivity) : undefined,
            last_activity: agent.last_activity ? new Date(agent.last_activity) : undefined
          }));
          setAgents(agentsWithDates);
        } else {
          // Initialize with mock agents if no stored agents
          setAgents(mockAgents);
          saveAgentsToStorage(mockAgents);
        }
      } catch (error) {
        console.error('Error loading agents from storage:', error);
        setAgents(mockAgents);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  // Save agents to localStorage whenever agents change
  const saveAgentsToStorage = (agentsToSave: Agent[]) => {
    try {
      localStorage.setItem('zkwatch_agents', JSON.stringify(agentsToSave));
    } catch (error) {
      console.error('Error saving agents to storage:', error);
    }
  };

  // Get next agent ID
  const getNextAgentId = () => {
    const stored = localStorage.getItem('zkwatch_agent_counter');
    let counter = parseInt(stored || '0') || 0;
    counter += 1;
    localStorage.setItem('zkwatch_agent_counter', counter.toString());
    return `agent_${counter}`;
  };

  const fetchAgents = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      // Agents are already loaded from localStorage
    } finally {
      setLoading(false);
    }
  };

  const startAgent = async (agentId: string) => {
    const updatedAgents = agents.map(agent =>
      agent.id === agentId ? { ...agent, status: 'running' as AgentStatus, lastActivity: new Date() } : agent
    );
    setAgents(updatedAgents);
    saveAgentsToStorage(updatedAgents);
  };

  const stopAgent = async (agentId: string) => {
    const updatedAgents = agents.map(agent =>
      agent.id === agentId ? { ...agent, status: 'stopped' as AgentStatus, lastActivity: new Date() } : agent
    );
    setAgents(updatedAgents);
    saveAgentsToStorage(updatedAgents);
  };

  const deleteAgent = async (agentId: string) => {
    const updatedAgents = agents.filter(agent => agent.id !== agentId);
    setAgents(updatedAgents);
    saveAgentsToStorage(updatedAgents);
  };

  const deployAgent = async (agentData: any) => {
    try {
      const newAgent: Agent = {
        id: getNextAgentId(),
        name: agentData.name,
        type: agentData.type,
        status: 'deploying' as AgentStatus,
        description: agentData.description,
        configuration: agentData.configuration,
        createdAt: new Date(),
        lastActivity: new Date(),
        // Add additional properties for compatibility
        totalValue: 0,
        totalAlerts: 0,
        successRate: 100,
        deployment_info: {
          region: 'us-east-1'
        }
      };

      const updatedAgents = [...agents, newAgent];
      setAgents(updatedAgents);
      saveAgentsToStorage(updatedAgents);

      // Simulate deployment completion
      setTimeout(() => {
        const completedAgents = updatedAgents.map(agent =>
          agent.id === newAgent.id ? { ...agent, status: 'running' as AgentStatus } : agent
        );
        setAgents(completedAgents);
        saveAgentsToStorage(completedAgents);
      }, 3000);

      return { data: [newAgent] };
    } catch (error) {
      return { error: { message: 'Failed to deploy agent' } };
    }
  };  return { agents, loading, startAgent, stopAgent, deleteAgent, fetchAgents, deployAgent };
}

export function useWhaleTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1200));
        setTransactions(mockTransactions);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const stats = {
    totalTransactions: transactions.length,
    highRiskCount: transactions.filter(t => t.risk_level === 'high' || t.risk_level === 'critical').length,
    totalVolume: transactions.reduce((sum, tx) => sum + (tx.value_usd || 0), 0)
  };

  const fetchTransactions = async () => {
    // Mock implementation
    return transactions;
  };

  return { transactions, loading, stats, fetchTransactions };
}