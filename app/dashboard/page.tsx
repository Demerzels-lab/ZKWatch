'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAnalytics, useWhaleTransactions, useAlerts, useAgents } from '@/lib/hooks';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Bot,
  Bell,
  Zap,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const blockchainColors: Record<string, string> = {
  ethereum: '#627EEA',
  polygon: '#8247E5',
  arbitrum: '#28A0F0',
  optimism: '#FF0420',
  bsc: '#F0B90B'
};

function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
}

function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function DashboardContent() {
  const { dashboardStats, riskAssessment, fetchDashboardStats } = useAnalytics();
  const { transactions, fetchTransactions } = useWhaleTransactions();
  const { alerts, unreadCount, markAsRead, generateTestAlerts } = useAlerts();
  const { agents } = useAgents();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardStats(), fetchTransactions()]);
    setRefreshing(false);
  };

  const runningAgents = agents.filter(a => a.status === 'running').length;

  const hourlyData = dashboardStats?.hourly_volume || [];
  const blockchainData = Object.entries(dashboardStats?.blockchain_distribution || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value as number,
    color: blockchainColors[name] || '#6B7280'
  }));

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400 mt-1">Monitor aktivitas whale secara real-time</p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              href="/deploy"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Deploy Agent</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-green-400 text-sm flex items-center">
                <ArrowUpRight className="w-4 h-4" />
                +12%
              </span>
            </div>
            <p className="text-2xl font-bold">{dashboardStats?.overview?.total_transactions || 0}</p>
            <p className="text-gray-400 text-sm">Total Transaksi</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-green-400 text-sm flex items-center">
                <ArrowUpRight className="w-4 h-4" />
                +8%
              </span>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(dashboardStats?.overview?.total_volume_usd || 0)}
            </p>
            <p className="text-gray-400 text-sm">Total Volume</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-green-400" />
              </div>
              <span className={`text-sm flex items-center ${runningAgents > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                {runningAgents > 0 ? 'Aktif' : 'Offline'}
              </span>
            </div>
            <p className="text-2xl font-bold">{runningAgents}/{agents.length}</p>
            <p className="text-gray-400 text-sm">Agent Aktif</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-orange-400" />
              </div>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount} baru
                </span>
              )}
            </div>
            <p className="text-2xl font-bold">{alerts.length}</p>
            <p className="text-gray-400 text-sm">Total Alerts</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Volume per Jam (24h)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    formatter={(value: number) => [formatCurrency(value), 'Volume']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#8B5CF6" 
                    fillOpacity={1} 
                    fill="url(#volumeGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Distribusi Blockchain</h3>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={blockchainData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {blockchainData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {blockchainData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-300">{item.name}</span>
                    <span className="text-gray-500">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Risk Assessment */}
        {riskAssessment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Penilaian Risiko</h3>
              <div className={`px-4 py-2 rounded-lg font-medium ${
                riskAssessment.risk_level === 'high' 
                  ? 'bg-red-500/20 text-red-400' 
                  : riskAssessment.risk_level === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-green-500/20 text-green-400'
              }`}>
                Risk Score: {riskAssessment.overall_risk_score}/100
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(riskAssessment.factors || {}).map(([key, data]: [string, any]) => (
                <div key={key} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                    <span className={`text-lg font-bold ${
                      data.score > 60 ? 'text-red-400' : data.score > 40 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {data.score}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        data.score > 60 ? 'bg-red-500' : data.score > 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Transactions & Alerts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Transaksi Terbaru</h3>
              <Link href="/monitoring" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                Lihat semua
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx, index) => (
                <div 
                  key={tx.id || index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${blockchainColors[tx.blockchain]}20` }}
                    >
                      <span className="text-xs font-bold" style={{ color: blockchainColors[tx.blockchain] }}>
                        {tx.blockchain.slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{formatAddress(tx.from_address)}</p>
                      <p className="text-xs text-gray-400">{tx.pattern_type || 'transfer'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(tx.value_usd || 0)}</p>
                    <p className={`text-xs ${
                      tx.risk_level === 'high' || tx.risk_level === 'critical'
                        ? 'text-red-400'
                        : tx.risk_level === 'medium'
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }`}>
                      {tx.risk_level}
                    </p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-center text-gray-400 py-8">Belum ada transaksi</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Alert Terbaru</h3>
              <button 
                onClick={generateTestAlerts}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Generate Test
              </button>
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert, index) => (
                <div 
                  key={alert.id || index}
                  onClick={() => markAsRead(alert.id)}
                  className={`p-3 rounded-lg transition-colors cursor-pointer ${
                    alert.is_read ? 'bg-white/5' : 'bg-blue-500/10 border border-blue-500/20'
                  } hover:bg-white/10`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      alert.severity === 'critical'
                        ? 'bg-red-500/20'
                        : alert.severity === 'warning'
                        ? 'bg-yellow-500/20'
                        : 'bg-blue-500/20'
                    }`}>
                      {alert.severity === 'critical' ? (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      ) : alert.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <Bell className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{alert.title}</p>
                      <p className="text-xs text-gray-400 truncate">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: id })}
                      </p>
                    </div>
                    {!alert.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <p className="text-center text-gray-400 py-8">Belum ada alert</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Top Whales */}
        {dashboardStats?.top_whales && dashboardStats.top_whales.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="glass rounded-xl p-6 mt-8"
          >
            <h3 className="text-lg font-semibold mb-4">Top Whales</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400">
                    <th className="pb-3 font-medium">Address</th>
                    <th className="pb-3 font-medium">Total Volume</th>
                    <th className="pb-3 font-medium">Transaksi</th>
                    <th className="pb-3 font-medium">Terakhir Aktif</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {dashboardStats.top_whales.map((whale: any, index: number) => (
                    <tr key={index} className="border-t border-white/5">
                      <td className="py-3">
                        <span className="font-mono text-blue-400">{formatAddress(whale.address)}</span>
                      </td>
                      <td className="py-3 font-medium">{formatCurrency(whale.total_volume_usd)}</td>
                      <td className="py-3">{whale.transaction_count}</td>
                      <td className="py-3 text-gray-400">
                        {formatDistanceToNow(new Date(whale.last_active), { addSuffix: true, locale: id })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Navigation />
      <DashboardContent />
    </ProtectedRoute>
  );
}
