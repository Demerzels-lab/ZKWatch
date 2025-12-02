'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAgents } from '@/lib/hooks';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import { 
  Bot, 
  Search, 
  Filter,
  Play,
  Square,
  Trash2,
  Eye,
  Settings,
  MoreVertical,
  Loader2,
  Plus,
  Activity,
  AlertCircle,
  Clock,
  Zap,
  RefreshCw
} from 'lucide-react';

const agentTypes: Record<string, { label: string; color: string; bgColor: string }> = {
  whale_tracker: { label: 'Whale Tracker', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  alert_system: { label: 'Alert System', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  analyzer: { label: 'Analyzer', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  mev_detector: { label: 'MEV Detector', color: 'text-red-400', bgColor: 'bg-red-500/20' },
  bridge_monitor: { label: 'Bridge Monitor', color: 'text-green-400', bgColor: 'bg-green-500/20' }
};

const statusColors: Record<string, { text: string; bg: string; dot: string }> = {
  running: { text: 'text-green-400', bg: 'bg-green-500/20', dot: 'bg-green-400' },
  stopped: { text: 'text-gray-400', bg: 'bg-gray-500/20', dot: 'bg-gray-400' },
  error: { text: 'text-red-400', bg: 'bg-red-500/20', dot: 'bg-red-400' },
  deploying: { text: 'text-blue-400', bg: 'bg-blue-500/20', dot: 'bg-blue-400' }
};

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function AgentsContent() {
  const { agents, loading, startAgent, stopAgent, deleteAgent, fetchAgents } = useAgents();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || agent.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleStart = async (agentId: string) => {
    setActionLoading(agentId);
    setShowActionMenu(null);
    await startAgent(agentId);
    setActionLoading(null);
  };

  const handleStop = async (agentId: string) => {
    setActionLoading(agentId);
    setShowActionMenu(null);
    await stopAgent(agentId);
    setActionLoading(null);
  };

  const handleDelete = async (agentId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus agent ini?')) {
      setActionLoading(agentId);
      setShowActionMenu(null);
      await deleteAgent(agentId);
      setActionLoading(null);
    }
  };

  const runningCount = agents.filter(a => a.status === 'running').length;
  const stoppedCount = agents.filter(a => a.status === 'stopped').length;
  const totalAlerts = agents.reduce((sum, a) => sum + (a.metrics?.alerts_generated || 0), 0);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Agents</h1>
            <p className="text-gray-400 mt-1">Kelola dan monitor semua AI agent Anda</p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <button
              onClick={fetchAgents}
              className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/deploy"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Deploy Agent</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">{agents.length}</div>
            <div className="text-sm text-gray-400">Total Agents</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">{runningCount}</div>
            <div className="text-sm text-gray-400">Running</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-400">{stoppedCount}</div>
            <div className="text-sm text-gray-400">Stopped</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-400">{totalAlerts}</div>
            <div className="text-sm text-gray-400">Total Alerts</div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari agent..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all appearance-none cursor-pointer min-w-[150px]"
              >
                <option value="all">Semua Status</option>
                <option value="running">Running</option>
                <option value="stopped">Stopped</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Memuat agents...</p>
          </div>
        )}

        {/* Agents Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent, index) => {
              const typeInfo = agentTypes[agent.type] || agentTypes.whale_tracker;
              const statusInfo = statusColors[agent.status] || statusColors.stopped;
              const isLoading = actionLoading === agent.id;

              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass rounded-xl p-6 hover:bg-white/10 transition-all relative ${isLoading ? 'opacity-70' : ''}`}
                >
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-950/50 rounded-xl z-10">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${typeInfo.bgColor} rounded-lg flex items-center justify-center`}>
                        <Bot className={`w-5 h-5 ${typeInfo.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{agent.name}</h3>
                        <span className={`text-xs ${typeInfo.color}`}>{typeInfo.label}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === agent.id ? null : agent.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {showActionMenu === agent.id && (
                        <div className="absolute right-0 mt-2 w-48 glass rounded-lg p-2 z-20 border border-white/10">
                          {agent.status === 'stopped' ? (
                            <button
                              onClick={() => handleStart(agent.id)}
                              className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg flex items-center space-x-2"
                            >
                              <Play className="w-4 h-4 text-green-400" />
                              <span>Start</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStop(agent.id)}
                              className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg flex items-center space-x-2"
                            >
                              <Square className="w-4 h-4 text-yellow-400" />
                              <span>Stop</span>
                            </button>
                          )}
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

                  {/* Description */}
                  {agent.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{agent.description}</p>
                  )}

                  {/* Status Badge */}
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 ${statusInfo.bg} rounded-full mb-4`}>
                    <div className={`w-2 h-2 rounded-full ${statusInfo.dot} ${agent.status === 'running' ? 'animate-pulse' : ''}`} />
                    <span className={`text-sm ${statusInfo.text} capitalize`}>{agent.status}</span>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Scanned</div>
                      <div className="font-semibold text-sm">{agent.metrics?.transactions_scanned || 0}</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Alerts</div>
                      <div className="font-semibold text-sm">{agent.metrics?.alerts_generated || 0}</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Uptime</div>
                      <div className="font-semibold text-sm">{formatUptime(agent.metrics?.uptime_seconds || 0)}</div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {agent.last_activity 
                          ? formatDistanceToNow(new Date(agent.last_activity), { addSuffix: true, locale: id })
                          : 'Belum aktif'}
                      </span>
                    </div>
                    {agent.deployment_info?.region && (
                      <span className="text-blue-400">{agent.deployment_info.region}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAgents.length === 0 && (
          <div className="text-center py-20">
            <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || filterStatus !== 'all' 
                ? 'Tidak ada agent ditemukan' 
                : 'Belum ada agent'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Coba ubah filter atau kata kunci pencarian' 
                : 'Deploy AI agent pertama Anda untuk mulai monitoring'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Link
                href="/deploy"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                <Zap className="w-5 h-5" />
                <span>Deploy Agent Baru</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgentsPage() {
  return (
    <ProtectedRoute>
      <Navigation />
      <AgentsContent />
    </ProtectedRoute>
  );
}
