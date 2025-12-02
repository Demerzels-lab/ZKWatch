'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/Backend/lib/AuthContext';
import { useAgents, useWhaleTransactions, useAnalytics } from '@/Backend/lib/hooks';
import { supabase } from '@/Backend/lib/supabase';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Activity,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  Wallet,
  Target,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface PortfolioStats {
  totalValueTracked: number;
  totalAlerts: number;
  avgSuccessRate: number;
  activeAgents: number;
  totalTransactions: number;
  weeklyChange: number;
}

interface ChainDistribution {
  chain: string;
  value: number;
  count: number;
  color: string;
}

export default function Portfolio() {
  const { user } = useAuth();
  const { agents, loading: agentsLoading } = useAgents();
  const { transactions, loading: txLoading } = useWhaleTransactions();
  const { dashboardStats, loading: statsLoading } = useAnalytics();
  
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalValueTracked: 0,
    totalAlerts: 0,
    avgSuccessRate: 0,
    activeAgents: 0,
    totalTransactions: 0,
    weeklyChange: 0
  });
  
  const [chainDistribution, setChainDistribution] = useState<ChainDistribution[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const chainColors: Record<string, string> = {
    ethereum: 'blue',
    polygon: 'purple',
    arbitrum: 'cyan',
    optimism: 'red',
    bsc: 'yellow'
  };

  // Calculate portfolio stats
  const calculateStats = useCallback(() => {
    if (!agents.length && !transactions.length) {
      setLoading(false);
      return;
    }

    // Calculate total value tracked from transactions
    const totalValue = transactions.reduce((sum, tx) => sum + (tx.value_usd || 0), 0);
    
    // Calculate active agents
    const activeAgents = agents.filter(a => a.status === 'running').length;
    
    // Calculate average success rate from agents
    const avgRate = agents.length > 0
      ? agents.reduce((sum, a) => sum + (a.success_rate || 85), 0) / agents.length
      : 0;

    // Calculate chain distribution
    const chainMap = new Map<string, { value: number; count: number }>();
    transactions.forEach(tx => {
      const chain = tx.blockchain || 'ethereum';
      const existing = chainMap.get(chain) || { value: 0, count: 0 };
      chainMap.set(chain, {
        value: existing.value + (tx.value_usd || 0),
        count: existing.count + 1
      });
    });

    const distribution: ChainDistribution[] = Array.from(chainMap.entries())
      .map(([chain, data]) => ({
        chain,
        value: data.value,
        count: data.count,
        color: chainColors[chain] || 'gray'
      }))
      .sort((a, b) => b.value - a.value);

    setPortfolioStats({
      totalValueTracked: totalValue,
      totalAlerts: dashboardStats?.total_alerts || agents.reduce((sum, a) => sum + (a.alerts_sent || 0), 0),
      avgSuccessRate: avgRate,
      activeAgents,
      totalTransactions: transactions.length,
      weeklyChange: dashboardStats?.weekly_change || 12.5
    });

    setChainDistribution(distribution);
    setRecentActivity(transactions.slice(0, 8));
    setLoading(false);
  }, [agents, transactions, dashboardStats]);

  useEffect(() => {
    if (!agentsLoading && !txLoading && !statsLoading) {
      calculateStats();
    }
  }, [agentsLoading, txLoading, statsLoading, calculateStats]);

  // Refresh data
  const handleRefresh = () => {
    setLoading(true);
    window.location.reload();
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isLoading = loading || agentsLoading || txLoading;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Portfolio</h1>
                <p className="text-gray-400">Ringkasan performa dan tracking aktivitas whale</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="ml-3 text-gray-400">Memuat portfolio...</span>
              </div>
            ) : (
              <>
                {/* Main Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-blue-400" />
                      </div>
                      <span className={`text-sm flex items-center ${
                        portfolioStats.weeklyChange >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {portfolioStats.weeklyChange >= 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {Math.abs(portfolioStats.weeklyChange).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {formatCurrency(portfolioStats.totalValueTracked)}
                    </div>
                    <div className="text-sm text-gray-400">Total Value Tracked</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Activity className="w-6 h-6 text-purple-400" />
                      </div>
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                        Live
                      </span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{portfolioStats.totalAlerts}</div>
                    <div className="text-sm text-gray-400">Total Alerts</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {portfolioStats.avgSuccessRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">Avg Success Rate</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-orange-400" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {portfolioStats.activeAgents}/{agents.length}
                    </div>
                    <div className="text-sm text-gray-400">Active Agents</div>
                  </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Chain Distribution */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass rounded-xl p-6"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <PieChart className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Distribusi Chain</h2>
                        <p className="text-sm text-gray-400">Nilai tracking per blockchain</p>
                      </div>
                    </div>

                    {chainDistribution.length > 0 ? (
                      <div className="space-y-4">
                        {chainDistribution.map((chain, index) => {
                          const percentage = portfolioStats.totalValueTracked > 0
                            ? (chain.value / portfolioStats.totalValueTracked) * 100
                            : 0;
                          return (
                            <div key={chain.chain}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${chain.color}-500/20 text-${chain.color}-400`}>
                                    {chain.chain.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-medium capitalize">{chain.chain}</div>
                                    <div className="text-sm text-gray-400">
                                      {chain.count} transaksi | {percentage.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold">{formatCurrency(chain.value)}</div>
                                </div>
                              </div>
                              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                                  className={`h-full ${
                                    index === 0 ? 'bg-blue-500' :
                                    index === 1 ? 'bg-purple-500' :
                                    index === 2 ? 'bg-cyan-500' :
                                    index === 3 ? 'bg-red-500' :
                                    'bg-yellow-500'
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Belum ada data transaksi</p>
                      </div>
                    )}
                  </motion.div>

                  {/* Top Performing Agents */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass rounded-xl p-6"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Top Agents</h2>
                        <p className="text-sm text-gray-400">Berdasarkan success rate</p>
                      </div>
                    </div>

                    {agents.length > 0 ? (
                      <div className="space-y-4">
                        {agents
                          .sort((a, b) => (b.success_rate || 85) - (a.success_rate || 85))
                          .slice(0, 5)
                          .map((agent, index) => (
                            <motion.div
                              key={agent.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 + index * 0.1 }}
                              className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                  #{index + 1}
                                </div>
                                <div>
                                  <div className="font-medium">{agent.name}</div>
                                  <div className="text-sm text-gray-400 capitalize">
                                    {agent.blockchain || 'ethereum'} | {agent.status}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-green-400">
                                  {(agent.success_rate || 85).toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-400">
                                  {agent.alerts_sent || 0} alerts
                                </div>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Belum ada agents aktif</p>
                        <a href="/deploy" className="text-blue-400 hover:underline mt-2 inline-block">
                          Deploy Agent Pertama
                        </a>
                      </div>
                    )}
                  </motion.div>

                  {/* Recent Activity */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="lg:col-span-2 glass rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Aktivitas Terbaru</h2>
                          <p className="text-sm text-gray-400">Transaksi whale terkini</p>
                        </div>
                      </div>
                      <a
                        href="/monitoring"
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Lihat Semua
                      </a>
                    </div>

                    {recentActivity.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {recentActivity.map((tx, index) => (
                          <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 + index * 0.05 }}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                tx.transaction_type === 'buy' ? 'bg-green-500/20' :
                                tx.transaction_type === 'sell' ? 'bg-red-500/20' :
                                'bg-blue-500/20'
                              }`}>
                                {tx.transaction_type === 'buy' ? (
                                  <ArrowDownRight className="w-5 h-5 text-green-400" />
                                ) : tx.transaction_type === 'sell' ? (
                                  <ArrowUpRight className="w-5 h-5 text-red-400" />
                                ) : (
                                  <Activity className="w-5 h-5 text-blue-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {formatNumber(tx.amount || 0)} {tx.token_symbol || 'ETH'}
                                </div>
                                <div className="text-sm text-gray-400 capitalize">
                                  {tx.blockchain || 'ethereum'} | {formatDate(tx.timestamp)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-blue-400">
                                {formatCurrency(tx.value_usd || 0)}
                              </div>
                              <div className="text-sm text-gray-400 capitalize">
                                {tx.transaction_type || 'transfer'}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Belum ada aktivitas whale terdeteksi</p>
                      </div>
                    )}
                  </motion.div>

                  {/* Performance Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="lg:col-span-2 glass rounded-xl p-6"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Ringkasan Performa</h2>
                        <p className="text-sm text-gray-400">Statistik keseluruhan tracking</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                      <div className="p-4 bg-white/5 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {portfolioStats.totalTransactions}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Total Transaksi</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {chainDistribution.length}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Chain Aktif</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {agents.filter(a => a.status === 'running').length}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Agents Running</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-400">
                          {dashboardStats?.whales_tracked || 0}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Whales Tracked</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
