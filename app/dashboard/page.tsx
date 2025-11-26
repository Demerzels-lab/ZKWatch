'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import Link from 'next/link';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield
} from 'lucide-react';
import { mockAgents, mockTransactions, mockAlerts, mockStatistics } from '@/lib/mockData';
import { formatCurrency, formatDate, getStatusColor, getStatusBgColor, formatAddress } from '@/lib/utils';
import type { Agent, Transaction, Alert } from '@/types';

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions.slice(0, 5));
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts.slice(0, 4));
  const [stats, setStats] = useState(mockStatistics);

  const activeAgents = agents.filter(a => a.status === 'active');
  const recentAlerts = alerts.filter(a => !a.read);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Overview of your agent activity and performance</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-sm text-green-400 flex items-center">
                  <ArrowUpRight className="w-4 h-4" />
                  +12%
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{activeAgents.length}</div>
              <div className="text-sm text-gray-400">Active Agents</div>
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
                <span className="text-sm text-green-400 flex items-center">
                  <ArrowUpRight className="w-4 h-4" />
                  +8%
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{formatCurrency(stats.totalValue, 1)}</div>
              <div className="text-sm text-gray-400">Total Value Tracked</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                </div>
                <span className="text-sm text-orange-400 flex items-center">
                  {recentAlerts.length} new
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{alerts.length}</div>
              <div className="text-sm text-gray-400">Total Alerts</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-sm text-green-400 flex items-center">
                  <CheckCircle className="w-4 h-4" />
                  100%
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.zkProofs}</div>
              <div className="text-sm text-gray-400">ZK Proofs Verified</div>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Active Agents */}
            <div className="lg:col-span-2">
              <div className="glass rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Agent Aktif</h2>
                  <Link
                    href="/agents"
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {activeAgents.slice(0, 4).map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 ${getStatusBgColor(agent.status)} rounded-lg flex items-center justify-center`}>
                          <Zap className={`w-5 h-5 ${getStatusColor(agent.status)}`} />
                        </div>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-gray-400">{agent.tokenSymbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{agent.totalAlerts}</div>
                        <div className="text-sm text-gray-400">alerts</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Link
                  href="/deploy"
                  className="mt-6 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Deploy New Agent</span>
                </Link>
              </div>

              {/* Recent Transactions */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Recent Transactions</h2>
                  <Link
                    href="/monitoring"
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {transactions.map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium">{tx.tokenSymbol}</div>
                          <div className="text-sm text-gray-400">
                            {formatAddress(tx.fromAddress)} → {formatAddress(tx.toAddress)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(tx.value)}</div>
                        <div className="text-sm text-gray-400">{formatDate(tx.timestamp)}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="lg:col-span-1">
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Alerts</h2>
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                    {recentAlerts.length}
                  </div>
                </div>

                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        alert.read 
                          ? 'bg-white/5 border-white/10' 
                          : 'bg-orange-500/10 border-orange-500/20'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          alert.severity === 'critical' ? 'text-red-400' :
                          alert.severity === 'high' ? 'text-orange-400' :
                          alert.severity === 'medium' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`} />
                        <div className="flex-1">
                          <div className="font-medium mb-1">{alert.title}</div>
                          <div className="text-sm text-gray-400 mb-2">{alert.message}</div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(alert.timestamp)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
