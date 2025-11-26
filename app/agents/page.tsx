'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { 
  Users, 
  Search, 
  Filter,
  Play,
  Pause,
  Trash2,
  Eye,
  TrendingUp,
  AlertCircle,
  Settings,
  MoreVertical
} from 'lucide-react';
import { mockAgents } from '@/lib/mockData';
import { formatCurrency, formatDate, getStatusColor, getStatusBgColor } from '@/lib/utils';
import type { Agent, AgentStatus } from '@/types';

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<AgentStatus | 'all'>('all');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || agent.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleStatusChange = (agentId: string, newStatus: AgentStatus) => {
    setAgents(agents.map(agent => 
      agent.id === agentId ? { ...agent, status: newStatus } : agent
    ));
    setShowActionMenu(null);
  };

  const handleDelete = (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      setAgents(agents.filter(agent => agent.id !== agentId));
      setShowActionMenu(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Manage Agent</h1>
            <p className="text-gray-400">Monitor and manage all your AI agents</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-400">{agents.length}</div>
              <div className="text-sm text-gray-400">Total Agents</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400">
                {agents.filter(a => a.status === 'active').length}
              </div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {agents.filter(a => a.status === 'paused').length}
              </div>
              <div className="text-sm text-gray-400">Paused</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-400">
                {agents.reduce((sum, a) => sum + a.totalAlerts, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Alerts</div>
            </div>
          </div>

          {/* Filters */}
          <div className="glass rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search agents..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as AgentStatus | 'all')}
                  className="pl-10 pr-8 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Selected Actions */}
            {selectedAgents.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  {selectedAgents.length} selected agent(s)
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Activate</span>
                  </button>
                  <button className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all flex items-center space-x-2">
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </button>
                  <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center space-x-2">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Agents Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl p-6 hover:bg-white/10 transition-all relative"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedAgents.includes(agent.id)}
                      onChange={() => toggleAgentSelection(agent.id)}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <div className={`w-10 h-10 ${getStatusBgColor(agent.status)} rounded-lg flex items-center justify-center`}>
                      <Users className={`w-5 h-5 ${getStatusColor(agent.status)}`} />
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowActionMenu(showActionMenu === agent.id ? null : agent.id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Action Menu */}
                    {showActionMenu === agent.id && (
                      <div className="absolute right-0 mt-2 w-48 glass rounded-lg p-2 z-10 border border-white/10">
                        <button
                          onClick={() => handleStatusChange(agent.id, 'active')}
                          className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg flex items-center space-x-2"
                        >
                          <Play className="w-4 h-4 text-green-400" />
                          <span>Activate</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(agent.id, 'paused')}
                          className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg flex items-center space-x-2"
                        >
                          <Pause className="w-4 h-4 text-yellow-400" />
                          <span>Pause</span>
                        </button>
                        <button
                          onClick={() => {}}
                          className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg flex items-center space-x-2"
                        >
                          <Settings className="w-4 h-4 text-blue-400" />
                          <span>Settings</span>
                        </button>
                        <button
                          onClick={() => handleDelete(agent.id)}
                          className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg flex items-center space-x-2 text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Agent Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-1">{agent.name}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {agent.description || 'No description'}
                  </p>
                </div>

                {/* Status Badge */}
                <div className={`inline-flex items-center space-x-2 px-3 py-1 ${getStatusBgColor(agent.status)} rounded-full mb-4`}>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status).replace('text-', 'bg-')}`} />
                  <span className={`text-sm ${getStatusColor(agent.status)} capitalize`}>{agent.status}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-400">Token</div>
                    <div className="font-semibold">{agent.tokenSymbol}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Threshold</div>
                    <div className="font-semibold">{agent.threshold}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Total Alerts</div>
                    <div className="font-semibold">{agent.totalAlerts}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Success Rate</div>
                    <div className="font-semibold text-green-400">{agent.successRate}%</div>
                  </div>
                </div>

                {/* Value */}
                <div className="p-3 bg-white/5 rounded-lg mb-4">
                  <div className="text-xs text-gray-400 mb-1">Total Value Tracked</div>
                  <div className="text-xl font-bold text-blue-400">{formatCurrency(agent.totalValue)}</div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div>Last activity:</div>
                  <div>{formatDate(agent.lastActivity)}</div>
                </div>

                {/* Privacy Badge */}
                {agent.privacy === 'private' && (
                  <div className="absolute top-3 right-3">
                    <div className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-medium">
                      Private
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAgents.length === 0 && (
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No agents found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try changing filter or search keywords' 
                  : 'Start with your first AI agent deployment'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <a
                  href="/deploy"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  <Users className="w-5 h-5" />
                  <span>Deploy New Agent</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
