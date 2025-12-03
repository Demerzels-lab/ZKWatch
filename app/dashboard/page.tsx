'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAnalytics, useWhaleTransactions, useAlerts, useAgents } from '@/lib/hooks';
import { mockAgents } from '@/lib/mockData';
import { Agent } from '@/types';
import { InteractiveBackground } from '@/components/InteractiveBackground';
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
  ethereum: '#01F4D4',
  polygon: '#00FAF4',
  arbitrum: '#01E5C5',
  optimism: '#00D4B4',
  bsc: '#01F4D4'
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

function formatAddress(address?: string): string {
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
    color: blockchainColors[name] || '#01F4D4'
  }));

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <InteractiveBackground />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#01F4D4] to-[#00FAF4] bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Monitor whale activity in real-time</p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-[#01F4D4]/10 hover:shadow-[0_0_20px_rgba(1,244,212,0.3)] transition-all disabled:opacity-50 group"
            >
              <RefreshCw className={`w-4 h-4 text-[#01F4D4] group-hover:text-[#00FAF4] ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-gray-300 group-hover:text-white">Refresh</span>
            </button>
            <Link
              href="/deploy"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#01F4D4] to-[#00FAF4] text-gray-900 font-medium rounded-lg hover:shadow-[0_0_30px_rgba(1,244,212,0.5)] transition-all"
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
            className="glass rounded-xl p-6 border border-[#01F4D4]/20 hover:border-[#01F4D4]/40 hover:shadow-[0_0_30px_rgba(1,244,212,0.2)] transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#01F4D4]/10 rounded-lg flex items-center justify-center group-hover:bg-[#01F4D4]/20 group-hover:shadow-[0_0_20px_rgba(1,244,212,0.3)] transition-all">
                <Activity className="w-6 h-6 text-[#01F4D4]" />
              </div>
              <span className="text-[#01F4D4] text-sm flex items-center font-medium">
                <ArrowUpRight className="w-4 h-4" />
                +12%
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{dashboardStats?.overview?.total_transactions || 0}</p>
            <p className="text-gray-400 text-sm">Total Transactions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-6 border border-[#00FAF4]/20 hover:border-[#00FAF4]/40 hover:shadow-[0_0_30px_rgba(0,250,244,0.2)] transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#00FAF4]/10 rounded-lg flex items-center justify-center group-hover:bg-[#00FAF4]/20 group-hover:shadow-[0_0_20px_rgba(0,250,244,0.3)] transition-all">
                <TrendingUp className="w-6 h-6 text-[#00FAF4]" />
              </div>
              <span className="text-[#01F4D4] text-sm flex items-center font-medium">
                <ArrowUpRight className="w-4 h-4" />
                +8%
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(dashboardStats?.overview?.total_volume_usd || 0)}
            </p>
            <p className="text-gray-400 text-sm">Total Volume</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-6 border border-[#01F4D4]/20 hover:border-[#01F4D4]/40 hover:shadow-[0_0_30px_rgba(1,244,212,0.2)] transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#01F4D4]/10 rounded-lg flex items-center justify-center group-hover:bg-[#01F4D4]/20 group-hover:shadow-[0_0_20px_rgba(1,244,212,0.3)] transition-all">
                <Bot className="w-6 h-6 text-[#01F4D4]" />
              </div>
              <span className={`text-sm flex items-center font-medium ${runningAgents > 0 ? 'text-[#01F4D4]' : 'text-gray-400'}`}>
                {runningAgents > 0 ? 'Active' : 'Offline'}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{runningAgents}/{agents.length}</p>
            <p className="text-gray-400 text-sm">Active Agents</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-6 border border-[#00FAF4]/20 hover:border-[#00FAF4]/40 hover:shadow-[0_0_30px_rgba(0,250,244,0.2)] transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#00FAF4]/10 rounded-lg flex items-center justify-center group-hover:bg-[#00FAF4]/20 group-hover:shadow-[0_0_20px_rgba(0,250,244,0.3)] transition-all">
                <Bell className="w-6 h-6 text-[#00FAF4]" />
              </div>
              {unreadCount > 0 && (
                <span className="bg-gradient-to-r from-[#01F4D4] to-[#00FAF4] text-gray-900 text-xs px-2 py-1 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-white">{alerts.length}</p>
            <p className="text-gray-400 text-sm">Total Alerts</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl p-6 border border-[#01F4D4]/20 hover:border-[#01F4D4]/30 hover:shadow-[0_0_30px_rgba(1,244,212,0.15)] transition-all"
          >
            <h3 className="text-lg font-semibold mb-4 text-white">Hourly Volume (24h)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#01F4D4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00FAF4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid rgba(1,244,212,0.2)', 
                      borderRadius: '8px',
                      boxShadow: '0 0 20px rgba(1,244,212,0.2)'
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Volume']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#01F4D4" 
                    strokeWidth={2}
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
            className="glass rounded-xl p-6 border border-[#00FAF4]/20 hover:border-[#00FAF4]/30 hover:shadow-[0_0_30px_rgba(0,250,244,0.15)] transition-all"
          >
            <h3 className="text-lg font-semibold mb-4 text-white">Blockchain Distribution</h3>
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
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid rgba(0,250,244,0.2)', 
                      borderRadius: '8px',
                      boxShadow: '0 0 20px rgba(0,250,244,0.2)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {blockchainData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(1,244,212,0.5)]" style={{ backgroundColor: item.color }} />
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
            className="glass rounded-xl p-6 mb-8 border border-[#01F4D4]/20 hover:border-[#01F4D4]/30 transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Penilaian Risiko</h3>
              <div className={`px-4 py-2 rounded-lg font-medium ${
                riskAssessment.risk_level === 'high' 
                  ? 'bg-red-500/20 text-red-400' 
                  : riskAssessment.risk_level === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-[#01F4D4]/20 text-[#01F4D4]'
              }`}>
                Risk Score: {riskAssessment.overall_risk_score}/100
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(riskAssessment.factors || {}).map(([key, data]: [string, any]) => (
                <div key={key} className="bg-white/5 rounded-lg p-4 border border-[#01F4D4]/10 hover:border-[#01F4D4]/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                    <span className={`text-lg font-bold ${
                      data.score > 60 ? 'text-red-400' : data.score > 40 ? 'text-yellow-400' : 'text-[#01F4D4]'
                    }`}>
                      {data.score}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        data.score > 60 ? 'bg-red-500' : data.score > 40 ? 'bg-yellow-500' : 'bg-gradient-to-r from-[#01F4D4] to-[#00FAF4] shadow-[0_0_10px_rgba(1,244,212,0.5)]'
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
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#01F4D4] to-[#00FAF4] bg-clip-text text-transparent">
                  Your Deployed Agents
                </h3>
                <p className="text-gray-400 text-sm mt-1">Agents yang Anda buat sedang bekerja memantau blockchain</p>
              </div>
              <Link 
                href="/agents" 
                className="text-[#01F4D4] hover:text-[#00FAF4] text-sm flex items-center gap-1 group"
              >
                Manage All
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                    className="glass rounded-xl p-6 border border-[#01F4D4]/20 hover:border-[#01F4D4]/40 hover:shadow-[0_0_30px_rgba(1,244,212,0.2)] transition-all duration-300 group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          agent.status === 'running' ? 'bg-[#01F4D4]/20 shadow-[0_0_20px_rgba(1,244,212,0.3)]' :
                          agent.status === 'deploying' ? 'bg-[#00FAF4]/20' : 'bg-gray-500/20'
                        }`}>
                          <Bot className={`w-6 h-6 ${
                            agent.status === 'running' ? 'text-[#01F4D4]' :
                            agent.status === 'deploying' ? 'text-[#00FAF4]' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-base group-hover:text-[#01F4D4] transition-colors">
                            {agent.name}
                          </h4>
                          <p className="text-xs text-gray-500 capitalize">{agent.type?.replace('_', ' ') || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        agent.status === 'running' ? 'bg-[#01F4D4] animate-pulse shadow-[0_0_10px_rgba(1,244,212,0.8)]' :
                        agent.status === 'deploying' ? 'bg-[#00FAF4] animate-pulse' : 'bg-gray-500'
                      }`} />
                    </div>

                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium mb-4 ${
                      agent.status === 'running' ? 'bg-[#01F4D4]/20 text-[#01F4D4] border border-[#01F4D4]/30' :
                      agent.status === 'deploying' ? 'bg-[#00FAF4]/20 text-[#00FAF4] border border-[#00FAF4]/30' : 
                      'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {activity.status}
                      {agent.status === 'running' && (
                        <span className="w-1 h-1 bg-[#01F4D4] rounded-full animate-ping" />
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
                        <span className="text-sm font-bold text-[#00FAF4]">{activity.todayAlerts}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Akurasi</span>
                        <span className={`text-sm font-bold ${
                          activity.accuracy >= 95 ? 'text-[#01F4D4]' :
                          activity.accuracy >= 90 ? 'text-[#00FAF4]' : 'text-yellow-400'
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
                          <span className="text-[#01F4D4]">{activity.scanProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${activity.scanProgress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-[#01F4D4] to-[#00FAF4] rounded-full shadow-[0_0_10px_rgba(1,244,212,0.5)]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Last Activity */}
                    <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Last detected: {(() => {
                        try {
                          if (!activity.lastActivity) return 'Never';
                          const date = new Date(activity.lastActivity);
                          if (isNaN(date.getTime())) {
                            return 'Invalid date';
                          }
                          return formatDistanceToNow(date, { addSuffix: true });
                        } catch (error) {
                          return 'Recently';
                        }
                      })()}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                      <Link
                        href={`/agents/${agent.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#01F4D4]/20 text-[#01F4D4] rounded-lg hover:bg-[#01F4D4]/30 hover:shadow-[0_0_15px_rgba(1,244,212,0.3)] transition-all text-xs font-medium border border-[#01F4D4]/30"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Details
                      </Link>
                      <button
                        className={`px-3 py-2 rounded-lg transition-all text-xs font-medium border ${
                          agent.status === 'running'
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/30'
                            : 'bg-[#00FAF4]/20 text-[#00FAF4] hover:bg-[#00FAF4]/30 hover:shadow-[0_0_15px_rgba(0,250,244,0.3)] border-[#00FAF4]/30'
                        }`}
                      >
                        {agent.status === 'running' ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button className="px-3 py-2 bg-[#00FAF4]/20 text-[#00FAF4] rounded-lg hover:bg-[#00FAF4]/30 hover:shadow-[0_0_15px_rgba(0,250,244,0.3)] transition-all text-xs font-medium border border-[#00FAF4]/30">
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
            className="glass rounded-xl p-12 mb-8 text-center border border-[#01F4D4]/20 hover:border-[#01F4D4]/30 transition-all"
          >
            <div className="w-20 h-20 bg-[#01F4D4]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(1,244,212,0.3)]">
              <Bot className="w-10 h-10 text-[#01F4D4]" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">No Agents Deployed Yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Deploy your first agent to start monitoring whale activity on the blockchain in real-time
            </p>
            <Link
              href="/deploy"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#01F4D4] to-[#00FAF4] text-gray-900 rounded-lg hover:shadow-[0_0_30px_rgba(1,244,212,0.5)] transition-all font-medium"
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
            <h3 className="text-2xl font-bold text-white">Available Whale Tracking Agents</h3>
            <Link 
              href="/agents" 
              className="text-[#01F4D4] hover:text-[#00FAF4] text-sm flex items-center gap-1 group"
            >
              View All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {mockAgents.slice(0, 10).map((agent, index) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="glass rounded-xl p-5 border border-[#01F4D4]/20 hover:border-[#01F4D4]/40 hover:shadow-[0_0_25px_rgba(1,244,212,0.2)] transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    agent.status === 'active' ? 'bg-[#01F4D4]/20 shadow-[0_0_15px_rgba(1,244,212,0.3)]' :
                    agent.status === 'monitoring' ? 'bg-[#00FAF4]/20' :
                    agent.status === 'paused' ? 'bg-yellow-500/20' : 'bg-gray-500/20'
                  }`}>
                    <Bot className={`w-5 h-5 ${
                      agent.status === 'active' ? 'text-[#01F4D4]' :
                      agent.status === 'monitoring' ? 'text-[#00FAF4]' :
                      agent.status === 'paused' ? 'text-yellow-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === 'active' || agent.status === 'monitoring' 
                      ? 'bg-[#01F4D4] animate-pulse shadow-[0_0_8px_rgba(1,244,212,0.8)]' 
                      : 'bg-gray-500'
                  }`} />
                </div>

                <h4 className="font-semibold mb-2 text-sm leading-tight group-hover:text-[#01F4D4] transition-colors">
                  {agent.name}
                </h4>
                
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Alerts</span>
                    <span className="font-medium text-white">{agent.totalAlerts}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Accuracy</span>
                    <span className={`font-medium ${
                      (agent.successRate || 0) >= 95 ? 'text-[#01F4D4]' :
                      (agent.successRate || 0) >= 90 ? 'text-[#00FAF4]' : 'text-yellow-400'
                    }`}>
                      {agent.successRate || 0}%
                    </span>
                  </div>
                </div>

                <div className={`text-xs px-2 py-1 rounded-md inline-block border ${
                  agent.status === 'active' ? 'bg-[#01F4D4]/20 text-[#01F4D4] border-[#01F4D4]/30' :
                  agent.status === 'monitoring' ? 'bg-[#00FAF4]/20 text-[#00FAF4] border-[#00FAF4]/30' :
                  agent.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                  'bg-gray-500/20 text-gray-400 border-gray-500/30'
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
            className="glass rounded-xl p-6 border border-[#01F4D4]/20 hover:border-[#01F4D4]/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
              <Link href="/monitoring" className="text-[#01F4D4] hover:text-[#00FAF4] text-sm flex items-center gap-1 group">
                Lihat semua
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx, index) => (
                <div 
                  key={tx.id || index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-[#01F4D4]/10 hover:border hover:border-[#01F4D4]/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${blockchainColors[tx.blockchain || 'ethereum']}20` }}
                    >
                      <span className="text-xs font-bold" style={{ color: blockchainColors[tx.blockchain || 'ethereum'] }}>
                        {(tx.blockchain || 'ethereum').slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">{formatAddress(tx.from_address)}</p>
                      <p className="text-xs text-gray-400">{tx.pattern_type || 'transfer'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-white">{formatCurrency(tx.value_usd || 0)}</p>
                    <p className={`text-xs ${
                      tx.risk_level === 'high' || tx.risk_level === 'critical'
                        ? 'text-red-400'
                        : tx.risk_level === 'medium'
                        ? 'text-yellow-400'
                        : 'text-[#01F4D4]'
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
            className="glass rounded-xl p-6 border border-[#00FAF4]/20 hover:border-[#00FAF4]/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
              <button 
                onClick={generateTestAlerts}
                className="text-[#01F4D4] hover:text-[#00FAF4] text-sm transition-colors"
              >
                Generate Test
              </button>
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert, index) => (
                <div 
                  key={alert.id || index}
                  onClick={() => markAsRead(alert.id)}
                  className={`p-3 rounded-lg transition-all cursor-pointer ${
                    alert.is_read ? 'bg-white/5' : 'bg-[#01F4D4]/10 border border-[#01F4D4]/20'
                  } hover:bg-[#00FAF4]/10 hover:border-[#00FAF4]/20`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      alert.severity === 'critical'
                        ? 'bg-red-500/20'
                        : alert.severity === 'warning'
                        ? 'bg-yellow-500/20'
                        : 'bg-[#00FAF4]/20'
                    }`}>
                      {alert.severity === 'critical' ? (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      ) : alert.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <Bell className="w-4 h-4 text-[#00FAF4]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-white">{alert.title}</p>
                      <p className="text-xs text-gray-400 truncate">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(() => {
                          try {
                            const dateToUse = alert.created_at || alert.timestamp;
                            const date = new Date(dateToUse);
                            if (isNaN(date.getTime())) {
                              return 'Invalid date';
                            }
                            return formatDistanceToNow(date, { addSuffix: true });
                          } catch (error) {
                            return 'Recently';
                          }
                        })()}
                      </p>
                    </div>
                    {!alert.is_read && (
                      <div className="w-2 h-2 bg-[#01F4D4] rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(1,244,212,0.8)]" />
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
            className="glass rounded-xl p-6 mt-8 border border-[#01F4D4]/20 hover:border-[#01F4D4]/30 transition-all"
          >
            <h3 className="text-lg font-semibold mb-4 text-white">Top Whales</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400">
                    <th className="pb-3 font-medium">Address</th>
                    <th className="pb-3 font-medium">Total Volume</th>
                    <th className="pb-3 font-medium">Transaksi</th>
                    <th className="pb-3 font-medium">Last Active</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {dashboardStats.top_whales.map((whale: any, index: number) => (
                    <tr key={index} className="border-t border-white/5 hover:bg-[#01F4D4]/5 transition-colors">
                      <td className="py-3">
                        <span className="font-mono text-[#01F4D4]">{formatAddress(whale.address)}</span>
                      </td>
                      <td className="py-3 font-medium text-white">{formatCurrency(whale.total_volume_usd)}</td>
                      <td className="py-3 text-gray-300">{whale.transaction_count}</td>
                      <td className="py-3 text-gray-400">
                        {(() => {
                          try {
                            const date = new Date(whale.last_active);
                            if (isNaN(date.getTime())) {
                              return 'Invalid date';
                            }
                            return formatDistanceToNow(date, { addSuffix: true });
                          } catch (error) {
                            return 'Recently';
                          }
                        })()}
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
