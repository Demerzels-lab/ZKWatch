'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { mockAgents, mockTransactions } from '@/lib/mockData';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { 
  ArrowLeft,
  Activity, 
  TrendingUp,
  AlertCircle,
  Clock,
  Zap,
  Shield,
  BarChart3,
  Globe,
  Play,
  Square,
  Settings,
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const statusConfig = {
  active: { label: 'Active', color: 'text-green-400', bg: 'bg-green-500/20', icon: Activity },
  monitoring: { label: 'Monitoring', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Activity },
  paused: { label: 'Paused', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Clock },
  inactive: { label: 'Inactive', color: 'text-gray-400', bg: 'bg-gray-500/20', icon: XCircle }
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

// Generate mock performance data
function generatePerformanceData() {
  const data = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    data.push({
      hour: `${23 - i}h ago`,
      transactions: Math.floor(Math.random() * 30) + 10,
      value: Math.floor(Math.random() * 5000000) + 1000000,
      accuracy: Math.random() * 10 + 90
    });
  }
  return data;
}

function AgentDetailContent({ agentId }: { agentId: string }) {
  const router = useRouter();
  
  const [agent, setAgent] = useState(mockAgents.find(a => a.id === agentId));
  const [performanceData, setPerformanceData] = useState(generatePerformanceData());
  const [recentActivity, setRecentActivity] = useState(
    mockTransactions.filter(t => t.agentId === agentId).slice(0, 10)
  );

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Agent Not Found</h2>
          <p className="text-gray-400 mb-6">The agent you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[agent.status as keyof typeof statusConfig]?.icon || Activity;
  const statusInfo = statusConfig[agent.status as keyof typeof statusConfig] || statusConfig.active;

  return (
    <div className="min-h-screen pb-16">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Header dengan Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">{agent.name}</h1>
              <p className="text-xl text-gray-400 mb-4">{agent.description}</p>
              
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${statusInfo.bg}`}>
                  <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                  <span className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>
                    Created {formatDistanceToNow(new Date(agent.createdAt), { locale: localeId, addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="px-6 py-3 glass rounded-lg hover:bg-white/10 transition-all flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Configure</span>
              </button>
              {agent.status === 'active' || agent.status === 'monitoring' ? (
                <button className="px-6 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center space-x-2">
                  <Square className="w-5 h-5" />
                  <span>Stop</span>
                </button>
              ) : (
                <button className="px-6 py-3 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Start</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Alerts</span>
              <AlertCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold">{agent.totalAlerts}</div>
            <div className="text-sm text-green-400 mt-1">+12% from last week</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Success Rate</span>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold">{agent.successRate}%</div>
            <div className="text-sm text-green-400 mt-1">Above target</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Value</span>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold">{formatCurrency(agent.totalValue)}</div>
            <div className="text-sm text-green-400 mt-1">+8% this month</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Monitoring Freq</span>
              <RefreshCw className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-3xl font-bold">{agent.monitoringFrequency}min</div>
            <div className="text-sm text-gray-400 mt-1">Update interval</div>
          </motion.div>
        </div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">24-Hour Performance</h2>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm">24H</button>
              <button className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10">7D</button>
              <button className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10">30D</button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="transactions" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorTransactions)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Agent Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-400" />
              <span>Configuration</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-gray-400">Threshold</span>
                <span className="font-medium">{agent.threshold} {agent.tokenSymbol}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-gray-400">Token Symbol</span>
                <span className="font-medium">{agent.tokenSymbol}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-gray-400">Privacy Mode</span>
                <span className="font-medium capitalize">{agent.privacy}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-gray-400">Wallet Address</span>
                <span className="font-mono text-sm">{agent.walletAddress.slice(0, 10)}...{agent.walletAddress.slice(-8)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-400">Last Activity</span>
                <span className="text-sm">
                  {formatDistanceToNow(new Date(agent.lastActivity), { locale: localeId, addSuffix: true })}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <span>Security & Privacy</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="font-medium">ZK-Proof Enabled</div>
                    <div className="text-sm text-gray-400">All transactions verified</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-medium">End-to-End Encryption</div>
                    <div className="text-sm text-gray-400">Data secured</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="font-medium">Multi-Chain Support</div>
                    <div className="text-sm text-gray-400">5 networks monitored</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-400" />
            <span>Recent Activity</span>
          </h3>

          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((tx, index) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      tx.type === 'buy' ? 'bg-green-400' :
                      tx.type === 'sell' ? 'bg-red-400' :
                      tx.type === 'transfer' ? 'bg-blue-400' : 'bg-purple-400'
                    }`} />
                    <div>
                      <div className="font-medium">
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} {tx.amount} {tx.tokenSymbol}
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatDistanceToNow(new Date(tx.timestamp), { locale: localeId, addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(tx.value)}</div>
                    {tx.verified && (
                      <div className="text-xs text-green-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function AgentDetailClient({ agentId }: { agentId: string }) {
  return (
    <ProtectedRoute>
      <AgentDetailContent agentId={agentId} />
    </ProtectedRoute>
  );
}
