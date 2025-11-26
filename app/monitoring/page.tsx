'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
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
  RefreshCw
} from 'lucide-react';
import { mockTransactions, mockAgents, generateMockTransaction } from '@/lib/mockData';
import { formatCurrency, formatDate, formatAddress, getTransactionTypeColor, copyToClipboard } from '@/lib/utils';
import type { Transaction } from '@/types';

export default function Monitoring() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time transactions
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newTx = generateMockTransaction();
      setTransactions(prev => [newTx, ...prev].slice(0, 50)); // Keep only latest 50
    }, 8000);

    return () => clearInterval(interval);
  }, [isLive]);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tx.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tx.txHash.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAgent = filterAgent === 'all' || tx.agentId === filterAgent;
    const matchesType = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesAgent && matchesType;
  });

  const handleCopy = async (hash: string) => {
    await copyToClipboard(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Real-time Monitoring</h1>
                <p className="text-gray-400">Live feed aktivitas whale dari semua agent</p>
              </div>
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

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-400">{transactions.length}</div>
              <div className="text-sm text-gray-400">Total Transactions</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400">
                {transactions.filter(t => t.type === 'buy').length}
              </div>
              <div className="text-sm text-gray-400">Buys</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-red-400">
                {transactions.filter(t => t.type === 'sell').length}
              </div>
              <div className="text-sm text-gray-400">Sells</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-400">
                {formatCurrency(transactions.reduce((sum, t) => sum + t.value, 0), 0)}
              </div>
              <div className="text-sm text-gray-400">Total Volume</div>
            </div>
          </div>

          {/* Filters */}
          <div className="glass rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari transaksi..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* Agent Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterAgent}
                  onChange={(e) => setFilterAgent(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="all">Semua Agent</option>
                  {mockAgents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                  <option value="transfer">Transfer</option>
                  <option value="swap">Swap</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transactions Feed */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTransactions.map((tx, index) => (
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
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        tx.type === 'buy' ? 'bg-green-500/20' :
                        tx.type === 'sell' ? 'bg-red-500/20' :
                        tx.type === 'swap' ? 'bg-purple-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        {tx.type === 'buy' ? <ArrowDownRight className="w-6 h-6 text-green-400" /> :
                         tx.type === 'sell' ? <ArrowUpRight className="w-6 h-6 text-red-400" /> :
                         <RefreshCw className="w-6 h-6 text-purple-400" />}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            tx.type === 'buy' ? 'bg-green-500/20 text-green-400' :
                            tx.type === 'sell' ? 'bg-red-500/20 text-red-400' :
                            tx.type === 'swap' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-blue-500/20 text-blue-400'
                          } capitalize`}>
                            {tx.type}
                          </span>
                          <span className="text-sm text-gray-400">{tx.agentName}</span>
                        </div>

                        <div className="text-lg font-semibold mb-2">
                          {tx.amount.toFixed(4)} {tx.tokenSymbol}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-2">
                            <span>From:</span>
                            <code className="px-2 py-1 bg-white/5 rounded">{formatAddress(tx.fromAddress)}</code>
                          </div>
                          <span>→</span>
                          <div className="flex items-center space-x-2">
                            <span>To:</span>
                            <code className="px-2 py-1 bg-white/5 rounded">{formatAddress(tx.toAddress)}</code>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(tx.timestamp)}</span>
                          </div>
                          {tx.verified && (
                            <div className="flex items-center space-x-2 text-green-400">
                              <Shield className="w-4 h-4" />
                              <span>ZK Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Value */}
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-blue-400">
                        {formatCurrency(tx.value)}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">Value</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredTransactions.length === 0 && (
            <div className="text-center py-20 glass rounded-xl">
              <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Tidak ada transaksi</h3>
              <p className="text-gray-400">
                {searchQuery || filterAgent !== 'all' || filterType !== 'all'
                  ? 'Coba ubah filter atau kata kunci pencarian'
                  : 'Menunggu aktivitas whale...'}
              </p>
            </div>
          )}
        </div>
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
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Type & Status */}
                <div className="flex items-center justify-between">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                    selectedTx.type === 'buy' ? 'bg-green-500/20 text-green-400' :
                    selectedTx.type === 'sell' ? 'bg-red-500/20 text-red-400' :
                    selectedTx.type === 'swap' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {selectedTx.type}
                  </span>
                  {selectedTx.verified && (
                    <div className="flex items-center space-x-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">ZK Verified</span>
                    </div>
                  )}
                </div>

                {/* Amount & Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Amount</div>
                    <div className="text-2xl font-bold">{selectedTx.amount.toFixed(4)} {selectedTx.tokenSymbol}</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Value</div>
                    <div className="text-2xl font-bold text-blue-400">{formatCurrency(selectedTx.value)}</div>
                  </div>
                </div>

                {/* Agent */}
                <div>
                  <div className="text-sm text-gray-400 mb-2">Agent</div>
                  <div className="font-medium">{selectedTx.agentName}</div>
                </div>

                {/* Addresses */}
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">From Address</div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <code className="text-sm">{selectedTx.fromAddress}</code>
                      <button
                        onClick={() => handleCopy(selectedTx.fromAddress)}
                        className="p-2 hover:bg-white/10 rounded transition-all"
                      >
                        {copiedHash === selectedTx.fromAddress ? (
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
                      <code className="text-sm">{selectedTx.toAddress}</code>
                      <button
                        onClick={() => handleCopy(selectedTx.toAddress)}
                        className="p-2 hover:bg-white/10 rounded transition-all"
                      >
                        {copiedHash === selectedTx.toAddress ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transaction Hash */}
                <div>
                  <div className="text-sm text-gray-400 mb-2">Transaction Hash</div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <code className="text-sm break-all">{selectedTx.txHash}</code>
                    <div className="flex items-center space-x-2 ml-2">
                      <button
                        onClick={() => handleCopy(selectedTx.txHash)}
                        className="p-2 hover:bg-white/10 rounded transition-all"
                      >
                        {copiedHash === selectedTx.txHash ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <a
                        href={`https://etherscan.io/tx/${selectedTx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/10 rounded transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* ZK Proof */}
                <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    <div className="font-semibold">Zero-Knowledge Proof</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-sm break-all text-gray-400">{selectedTx.zkProof}</code>
                    <button
                      onClick={() => handleCopy(selectedTx.zkProof)}
                      className="p-2 hover:bg-white/10 rounded transition-all ml-2"
                    >
                      {copiedHash === selectedTx.zkProof ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Timestamp */}
                <div>
                  <div className="text-sm text-gray-400 mb-2">Timestamp</div>
                  <div className="font-medium">{new Date(selectedTx.timestamp).toLocaleString('id-ID')}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
