'use client';

import { Navigation } from '@/components/Navigation';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Activity,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { mockAgents, mockTransactions } from '@/lib/mockData';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function Portfolio() {
  const totalValue = mockAgents.reduce((sum, agent) => sum + agent.totalValue, 0);
  const totalAlerts = mockAgents.reduce((sum, agent) => sum + agent.totalAlerts, 0);
  const avgSuccessRate = mockAgents.reduce((sum, agent) => sum + agent.successRate, 0) / mockAgents.length;

  const tokenDistribution = mockAgents.reduce((acc, agent) => {
    acc[agent.tokenSymbol] = (acc[agent.tokenSymbol] || 0) + agent.totalValue;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Portfolio</h1>
            <p className="text-gray-400">Overview performa dan value tracking Anda</p>
          </div>

          {/* Main Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-sm text-green-400 flex items-center">
                  <ArrowUpRight className="w-4 h-4" />
                  +15.3%
                </span>
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(totalValue, 1)}</div>
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
                <span className="text-sm text-green-400 flex items-center">
                  <ArrowUpRight className="w-4 h-4" />
                  +8.7%
                </span>
              </div>
              <div className="text-3xl font-bold mb-1">{totalAlerts}</div>
              <div className="text-sm text-gray-400">Total Alerts Generated</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-sm text-green-400 flex items-center">
                  <ArrowUpRight className="w-4 h-4" />
                  +2.1%
                </span>
              </div>
              <div className="text-3xl font-bold mb-1">{avgSuccessRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Avg Success Rate</div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Token Distribution */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Distribusi Token</h2>
                  <p className="text-sm text-gray-400">Value tracking per token</p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(tokenDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([token, value], index) => {
                    const percentage = (value / totalValue) * 100;
                    return (
                      <div key={token}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              index === 0 ? 'bg-blue-500/20 text-blue-400' :
                              index === 1 ? 'bg-purple-500/20 text-purple-400' :
                              index === 2 ? 'bg-green-500/20 text-green-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {token.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{token}</div>
                              <div className="text-sm text-gray-400">{percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(value)}</div>
                          </div>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              index === 0 ? 'bg-blue-500' :
                              index === 1 ? 'bg-purple-500' :
                              index === 2 ? 'bg-green-500' :
                              'bg-gray-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Top Performing Agents */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Top Performing Agents</h2>
                  <p className="text-sm text-gray-400">Berdasarkan success rate</p>
                </div>
              </div>

              <div className="space-y-4">
                {mockAgents
                  .sort((a, b) => b.successRate - a.successRate)
                  .slice(0, 5)
                  .map((agent, index) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-gray-400">{agent.tokenSymbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-400">{agent.successRate}%</div>
                        <div className="text-sm text-gray-400">{agent.totalAlerts} alerts</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 glass rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Aktivitas Terbaru</h2>
                  <p className="text-sm text-gray-400">Transaksi whale terbaru</p>
                </div>
              </div>

              <div className="space-y-3">
                {mockTransactions.slice(0, 6).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        tx.type === 'buy' ? 'bg-green-500/20' :
                        tx.type === 'sell' ? 'bg-red-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        {tx.type === 'buy' ? (
                          <ArrowDownRight className="w-5 h-5 text-green-400" />
                        ) : tx.type === 'sell' ? (
                          <ArrowUpRight className="w-5 h-5 text-red-400" />
                        ) : (
                          <Activity className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{tx.amount.toFixed(2)} {tx.tokenSymbol}</div>
                        <div className="text-sm text-gray-400">{tx.agentName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-400">{formatCurrency(tx.value)}</div>
                      <div className="text-sm text-gray-400 capitalize">{tx.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
