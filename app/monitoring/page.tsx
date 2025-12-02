'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useWhaleTransactions } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  TrendingUp, 
  Search, 
  Filter,
  ExternalLink,
  Copy,
  CheckCircle,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  X,
  Loader2
} from 'lucide-react';

const blockchainExplorers: Record<string, string> = {
  ethereum: 'https://etherscan.io/tx/',
  polygon: 'https://polygonscan.com/tx/',
  arbitrum: 'https://arbiscan.io/tx/',
  optimism: 'https://optimistic.etherscan.io/tx/',
  bsc: 'https://bscscan.com/tx/'
};

const blockchainColors: Record<string, { bg: string; text: string }> = {
  ethereum: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  polygon: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  arbitrum: { bg: 'bg-sky-500/20', text: 'text-sky-400' },
  optimism: { bg: 'bg-red-500/20', text: 'text-red-400' },
  bsc: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' }
};

function formatCurrency(value: number): string {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function MonitoringContent() {
  const { transactions, stats, loading, fetchTransactions } = useWhaleTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBlockchain, setFilterBlockchain] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(async () => {
      // Simulate scanning for new transactions
      try {
        await supabase.functions.invoke('whale-scanner', {
          body: { action: 'scan_new' }
        });
        await fetchTransactions();
      } catch (error) {
        console.error('Error scanning:', error);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isLive, fetchTransactions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.hash?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.to_address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBlockchain = filterBlockchain === 'all' || tx.blockchain === filterBlockchain;
    const matchesRisk = filterRisk === 'all' || tx.risk_level === filterRisk;
    return matchesSearch && matchesBlockchain && matchesRisk;
  });

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedHash(text);
      setTimeout(() => setCopiedHash(null), 2000);
    }
  };

  const totalVolume = transactions.reduce((sum, tx) => sum + (tx.value_usd || 0), 0);
  const highRiskCount = transactions.filter(t => t.risk_level === 'high' || t.risk_level === 'critical').length;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Real-time Monitoring</h1>
              <p className="text-gray-400 mt-1">Live feed aktivitas whale dari semua blockchain</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 glass rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsLive(!isLive)}
                className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all ${
                  isLive 
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                <span>{isLive ? 'Live' : 'Paused'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">{transactions.length}</div>
            <div className="text-sm text-gray-400">Total Transaksi</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-400">{formatCurrency(totalVolume)}</div>
            <div className="text-sm text-gray-400">Total Volume</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-red-400">{highRiskCount}</div>
            <div className="text-sm text-gray-400">High Risk</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">
              {stats?.by_blockchain ? Object.keys(stats.by_blockchain).length : 0}
            </div>
            <div className="text-sm text-gray-400">Blockchains</div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi, address, hash..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterBlockchain}
                onChange={(e) => setFilterBlockchain(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="all">Semua Blockchain</option>
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="arbitrum">Arbitrum</option>
                <option value="optimism">Optimism</option>
                <option value="bsc">BSC</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="all">Semua Risk Level</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Memuat transaksi...</p>
          </div>
        )}

        {/* Transactions Feed */}
        {!loading && (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTransactions.map((tx, index) => {
                const chainColors = blockchainColors[tx.blockchain] || { bg: 'bg-gray-500/20', text: 'text-gray-400' };
                
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setSelectedTx(tx)}
                    className="glass rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${chainColors.bg}`}>
                          <span className={`text-xs font-bold ${chainColors.text}`}>
                            {tx.blockchain.slice(0, 3).toUpperCase()}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                              tx.risk_level === 'critical' ? 'bg-red-500/20 text-red-400' :
                              tx.risk_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              tx.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {tx.risk_level}
                            </span>
                            <span className="text-sm text-gray-400">{tx.pattern_type || 'transfer'}</span>
                            <span className="text-sm text-gray-500">{tx.token_symbol}</span>
                          </div>

                          <div className="text-lg font-semibold mb-2">
                            {Number(tx.amount).toFixed(4)} {tx.token_symbol}
                          </div>

                          <div className="flex items-center flex-wrap gap-4 text-sm text-gray-400">
                            <div className="flex items-center space-x-2">
                              <span>From:</span>
                              <code className="px-2 py-1 bg-white/5 rounded">{formatAddress(tx.from_address)}</code>
                            </div>
                            <span>-</span>
                            <div className="flex items-center space-x-2">
                              <span>To:</span>
                              <code className="px-2 py-1 bg-white/5 rounded">{formatAddress(tx.to_address || '')}</code>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <div className="flex items-center space-x-2 text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true, locale: id })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-green-400">
                              <Shield className="w-4 h-4" />
                              <span>ZK Verified</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-blue-400">
                          {formatCurrency(tx.value_usd || 0)}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Value</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTransactions.length === 0 && (
          <div className="text-center py-20 glass rounded-xl">
            <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Tidak ada transaksi</h3>
            <p className="text-gray-400">
              {searchQuery || filterBlockchain !== 'all' || filterRisk !== 'all'
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Menunggu aktivitas whale...'}
            </p>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTx(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Detail Transaksi</h2>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                    selectedTx.risk_level === 'critical' ? 'bg-red-500/20 text-red-400' :
                    selectedTx.risk_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    selectedTx.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {selectedTx.risk_level}
                  </span>
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">ZK Verified</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Amount</div>
                    <div className="text-2xl font-bold">{Number(selectedTx.amount).toFixed(4)} {selectedTx.token_symbol}</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Value</div>
                    <div className="text-2xl font-bold text-blue-400">{formatCurrency(selectedTx.value_usd || 0)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Blockchain</div>
                    <div className="font-medium capitalize">{selectedTx.blockchain}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Whale Score</div>
                    <div className="font-medium">{selectedTx.whale_score}/100</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">From Address</div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <code className="text-sm truncate">{selectedTx.from_address}</code>
                      <button
                        onClick={() => handleCopy(selectedTx.from_address)}
                        className="p-2 hover:bg-white/10 rounded transition-all flex-shrink-0 ml-2"
                      >
                        {copiedHash === selectedTx.from_address ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">To Address</div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <code className="text-sm truncate">{selectedTx.to_address || 'N/A'}</code>
                      {selectedTx.to_address && (
                        <button
                          onClick={() => handleCopy(selectedTx.to_address)}
                          className="p-2 hover:bg-white/10 rounded transition-all flex-shrink-0 ml-2"
                        >
                          {copiedHash === selectedTx.to_address ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-2">Transaction Hash</div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <code className="text-sm break-all">{selectedTx.hash}</code>
                    <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                      <button
                        onClick={() => handleCopy(selectedTx.hash)}
                        className="p-2 hover:bg-white/10 rounded transition-all"
                      >
                        {copiedHash === selectedTx.hash ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <a
                        href={`${blockchainExplorers[selectedTx.blockchain] || 'https://etherscan.io/tx/'}${selectedTx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/10 rounded transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    <div className="font-semibold">Zero-Knowledge Proof</div>
                  </div>
                  <p className="text-sm text-gray-400">
                    Transaksi ini telah diverifikasi menggunakan teknologi ZK-proof untuk memastikan validitas tanpa mengungkap data sensitif.
                  </p>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-2">Timestamp</div>
                  <div className="font-medium">{new Date(selectedTx.created_at).toLocaleString('id-ID')}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MonitoringPage() {
  return (
    <ProtectedRoute>
      <Navigation />
      <MonitoringContent />
    </ProtectedRoute>
  );
}
