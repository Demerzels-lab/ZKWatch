'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { mockAgents, mockTransactions } from '@/lib/mockData';
import { formatDistanceToNow } from 'date-fns';
import { 
  ArrowLeft, Activity, TrendingUp, AlertCircle, Clock, Zap, 
  Shield, BarChart3, Globe, Play, Square, Settings, RefreshCw, 
  CheckCircle2, XCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const statusConfig = {
  active: { label: 'Active', color: 'text-green-400', bg: 'bg-green-500/20', icon: Activity },
  monitoring: { label: 'Monitoring', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Activity },
  paused: { label: 'Paused', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Clock },
  inactive: { label: 'Inactive', color: 'text-gray-400', bg: 'bg-gray-500/20', icon: XCircle },
  // Fallbacks for other statuses
  running: { label: 'Running', color: 'text-green-400', bg: 'bg-green-500/20', icon: Activity },
  stopped: { label: 'Stopped', color: 'text-gray-400', bg: 'bg-gray-500/20', icon: Square },
  error: { label: 'Error', color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertCircle },
  deploying: { label: 'Deploying', color: 'text-[#01F4D4]', bg: 'bg-[#01F4D4]/20', icon: RefreshCw }
};

function formatCurrency(value: number): string {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

// Generate mock performance data
function generatePerformanceData() {
  const data = [];
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
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-[#01F4D4] text-black rounded-lg hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Safe status lookup
  const statusKey = agent.status as keyof typeof statusConfig;
  const statusInfo = statusConfig[statusKey] || statusConfig.active;
  const StatusIcon = statusInfo.icon;

  // Handle property aliases safely
  const totalAlerts = agent.totalAlerts || agent.alerts_sent || 0;
  const successRate = agent.successRate || agent.success_rate || 0;
  const totalValue = agent.totalValue || 0;
  const monitoringFreq = agent.monitoringFrequency || 5;

  return (
    <div className="min-h-screen pb-16">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Header */}
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

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-3 text-white">{agent.name}</h1>
              <p className="text-xl text-gray-400 mb-4">{agent.description || 'No description provided'}</p>
              
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
                    Created {(() => {
                      try {
                        const date = new Date(agent.createdAt);
                        if (isNaN(date.getTime())) return 'Recently';
                        return formatDistanceToNow(date, { addSuffix: true });
                      } catch { return 'Recently'; }
                    })()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="px-6 py-3 glass rounded-lg hover:bg-white/10 transition-all flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Configure</span>
              </button>
              {agent.status === 'active' || agent.status === 'monitoring' || agent.status === 'running' ? (
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
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Alerts</span>
              <AlertCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{totalAlerts}</div>
            <div className="text-sm text-green-400 mt-1">+12% from last week</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Success Rate</span>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">{successRate}%</div>
            <div className="text-sm text-green-400 mt-1">Above target</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Value</span>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{formatCurrency(totalValue)}</div>
            <div className="text-sm text-green-400 mt-1">+8% this month</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Monitoring Freq</span>
              <RefreshCw className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-white">{monitoringFreq}min</div>
            <div className="text-sm text-gray-400 mt-1">Update interval</div>
          </div>
        </div>

        {/* Configuration Panel - FIXED CRASH HERE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2 text-white">
              <Settings className="w-5 h-5 text-[#01F4D4]" />
              <span>Configuration</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-gray-400">Threshold</span>
                <span className="font-medium text-white">{agent.threshold || 0} {agent.tokenSymbol || 'USD'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-gray-400">Blockchain</span>
                <span className="font-medium text-white capitalize">{agent.blockchain || 'Ethereum'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-gray-400">Privacy Mode</span>
                <span className="font-medium capitalize text-white">{agent.privacy || 'Public'}</span>
              </div>
              {/* FIXED: Safe access to walletAddress */}
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-gray-400">Wallet Address</span>
                <span className="font-mono text-sm text-[#01F4D4]">
                  {agent.walletAddress 
                    ? `${agent.walletAddress.slice(0, 10)}...${agent.walletAddress.slice(-8)}`
                    : 'Not Configured'}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-400">Last Activity</span>
                <span className="text-sm text-white">
                  {(() => {
                    const dateStr = agent.lastActivity || agent.last_activity;
                    if (!dateStr) return 'No activity yet';
                    try {
                      const date = new Date(dateStr);
                      if (isNaN(date.getTime())) return 'Invalid date';
                      return formatDistanceToNow(date, { addSuffix: true });
                    } catch { return 'Recently'; }
                  })()}
                </span>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2 text-white">
              <Shield className="w-5 h-5 text-purple-400" />
              <span>Security & Privacy</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="font-medium text-white">ZK-Proof Enabled</div>
                    <div className="text-sm text-gray-400">All transactions verified</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-medium text-white">End-to-End Encryption</div>
                    <div className="text-sm text-gray-400">Data secured</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="font-medium text-white">Multi-Chain Support</div>
                    <div className="text-sm text-gray-400">5 networks monitored</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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