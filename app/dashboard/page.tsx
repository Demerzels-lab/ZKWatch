'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAnalytics, useWhaleTransactions, useAlerts, useAgents } from '@/lib/hooks';
import { mockAgents } from '@/lib/mockData';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Bot,
  Bell,
  Zap,
  ChevronRight,
  ArrowUpRight,
  Play,
  Pause,
  FileText,
  Settings,
  TrendingDown
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

// Generate realistic mock activity data for user agents
function generateAgentActivity(agent: Agent) {
  const now = new Date();
  const minutesAgo = Math.floor(Math.random() * 30) + 1; // 1-30 minutes ago
  const lastActivity = new Date(now.getTime() - minutesAgo * 60000);
  
  // Base metrics from agent.metrics or generate realistic ones
  const baseTransactions = agent.metrics?.transactions_scanned || 0;
  const baseAlerts = agent.metrics?.alerts_generated || 0;
  
  // Generate today's activity (realistic numbers based on agent status)
  const todayTransactions = agent.status === 'running' 
    ? Math.floor(Math.random() * 200) + 50 // 50-250 transactions
    : Math.floor(Math.random() * 20); // 0-20 if stopped
    
  const todayAlerts = agent.status === 'running'
    ? Math.floor(Math.random() * 30) + 5 // 5-35 alerts
    : Math.floor(Math.random() * 5); // 0-5 if stopped
    
  const accuracy = agent.status === 'running'
    ? 85 + Math.random() * 13 // 85-98%
    : 75 + Math.random() * 15; // 75-90% if stopped
    
  const scanProgress = agent.status === 'running'
    ? Math.floor(Math.random() * 60) + 20 // 20-80% if actively scanning
    : 0;
  
  return {
    todayTransactions: baseTransactions + todayTransactions,
    todayAlerts: baseAlerts + todayAlerts,
    accuracy: parseFloat(accuracy.toFixed(1)),
    lastActivity,
    scanProgress,
    status: agent.status === 'running' ? 'Monitoring' : agent.status === 'deploying' ? 'Starting' : 'Stopped'
  };
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

        {/* User Deployed Agents Section */}
        {agents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">Your Deployed Agents</h3>
                <p className="text-gray-400 text-sm mt-1">Agents yang Anda buat sedang bekerja memantau blockchain</p>
              </div>
              <Link 
                href="/agents" 
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
              >
                Manage All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, index) => {
                const activity = generateAgentActivity(agent);
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group card-hover"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          agent.status === 'running' ? 'bg-green-500/20' :
                          agent.status === 'deploying' ? 'bg-blue-500/20' : 'bg-gray-500/20'
                        }`}>
                          <Bot className={`w-6 h-6 ${
                            agent.status === 'running' ? 'text-green-400' :
                            agent.status === 'deploying' ? 'text-blue-400' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-base group-hover:text-blue-400 transition-colors">
                            {agent.name}
                          </h4>
                          <p className="text-xs text-gray-500 capitalize">{agent.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        agent.status === 'running' ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' :
                        agent.status === 'deploying' ? 'bg-blue-400 animate-pulse' : 'bg-gray-500'
                      }`} />
                    </div>

                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium mb-4 ${
                      agent.status === 'running' ? 'bg-green-500/20 text-green-400' :
                      agent.status === 'deploying' ? 'bg-blue-500/20 text-blue-400' : 
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {activity.status}
                      {agent.status === 'running' && (
                        <span className="w-1 h-1 bg-green-400 rounded-full animate-ping" />
                      )}
                    </div>

                    {/* Metrics */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Transaksi Terdeteksi</span>
                        <span className="text-sm font-bold text-white">{activity.todayTransactions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Alert Dibuat</span>
                        <span className="text-sm font-bold text-orange-400">{activity.todayAlerts}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Akurasi</span>
                        <span className={`text-sm font-bold ${
                          activity.accuracy >= 95 ? 'text-green-400' :
                          activity.accuracy >= 90 ? 'text-blue-400' : 'text-yellow-400'
                        }`}>
                          {activity.accuracy}%
                        </span>
                      </div>
                    </div>

                    {/* Current Scan Progress */}
                    {agent.status === 'running' && activity.scanProgress > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-gray-400">Current Scan</span>
                          <span className="text-blue-400">{activity.scanProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${activity.scanProgress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                    )}

                    {/* Last Activity */}
                    <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Last detected: {formatDistanceToNow(activity.lastActivity, { addSuffix: true, locale: id })}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                      <Link
                        href={`/agents/${agent.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs font-medium"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Details
                      </Link>
                      <button
                        className={`px-3 py-2 rounded-lg transition-colors text-xs font-medium ${
                          agent.status === 'running'
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                      >
                        {agent.status === 'running' ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-xs font-medium">
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State for User Agents */}
        {agents.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-xl p-12 mb-8 text-center"
          >
            <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Belum Ada Agent Terdeploy</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Deploy agent pertama Anda untuk mulai memantau aktivitas whale di blockchain secara real-time
            </p>
            <Link
              href="/deploy"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium"
            >
              <Zap className="w-5 h-5" />
              Deploy Your First Agent
            </Link>
          </motion.div>
        )}

        {/* Active Agents Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Available Whale Tracking Agents</h3>
            <Link 
              href="/agents" 
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {mockAgents.slice(0, 10).map((agent, index) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="glass rounded-xl p-5 hover:bg-white/10 transition-all duration-300 group card-hover"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    agent.status === 'active' ? 'bg-green-500/20' :
                    agent.status === 'monitoring' ? 'bg-blue-500/20' :
                    agent.status === 'paused' ? 'bg-yellow-500/20' : 'bg-gray-500/20'
                  }`}>
                    <Bot className={`w-5 h-5 ${
                      agent.status === 'active' ? 'text-green-400' :
                      agent.status === 'monitoring' ? 'text-blue-400' :
                      agent.status === 'paused' ? 'text-yellow-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === 'active' || agent.status === 'monitoring' 
                      ? 'bg-green-400 animate-pulse' 
                      : 'bg-gray-500'
                  }`} />
                </div>

                <h4 className="font-semibold mb-2 text-sm leading-tight group-hover:text-blue-400 transition-colors">
                  {agent.name}
                </h4>
                
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Alerts</span>
                    <span className="font-medium">{agent.totalAlerts}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Accuracy</span>
                    <span className={`font-medium ${
                      agent.successRate >= 95 ? 'text-green-400' :
                      agent.successRate >= 90 ? 'text-blue-400' : 'text-yellow-400'
                    }`}>
                      {agent.successRate}%
                    </span>
                  </div>
                </div>

                <div className={`text-xs px-2 py-1 rounded-md inline-block ${
                  agent.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  agent.status === 'monitoring' ? 'bg-blue-500/20 text-blue-400' :
                  agent.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' : 
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

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
