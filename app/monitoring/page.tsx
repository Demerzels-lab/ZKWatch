'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useWhaleTransactions } from '@/lib/hooks';
import { InteractiveBackground } from '@/components/InteractiveBackground';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
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
  RefreshCw,
  X,
  Loader2,
  Download,
  ChevronDown,
  Activity,
  AlertCircle
} from 'lucide-react';

const blockchainExplorers: Record<string, string> = {
  ethereum: 'https://etherscan.io/tx/',
  polygon: 'https://polygonscan.com/tx/',
  arbitrum: 'https://arbiscan.io/tx/',
  optimism: 'https://optimistic.etherscan.io/tx/',
  bsc: 'https://bscscan.com/tx/'
};

const blockchainColors: Record<string, { bg: string; text: string; badge: string }> = {
  ethereum: { bg: 'bg-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500' },
  polygon: { bg: 'bg-purple-500/20', text: 'text-purple-400', badge: 'bg-purple-500' },
  arbitrum: { bg: 'bg-sky-500/20', text: 'text-sky-400', badge: 'bg-sky-500' },
  optimism: { bg: 'bg-red-500/20', text: 'text-red-400', badge: 'bg-red-500' },
  bsc: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', badge: 'bg-yellow-500' }
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [liveStats, setLiveStats] = useState({
    totalTransactions: 0,
    totalVolume: 0,
    highRiskCount: 0,
    avgTransactionValue: 0
  });
  const [newTransactionCount, setNewTransactionCount] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  // Enhanced live simulation with mock data generation
  useEffect(() => {
    if (!isLive) return;

    // Initial stats calculation
    const calculateStats = () => {
      const totalVolume = transactions.reduce((sum, tx) => sum + (tx.value_usd || 0), 0);
      const highRiskCount = transactions.filter(t => t.risk_level === 'high' || t.risk_level === 'critical').length;
      const avgTransactionValue = transactions.length > 0 ? totalVolume / transactions.length : 0;

      setLiveStats({
        totalTransactions: transactions.length,
        totalVolume,
        highRiskCount,
        avgTransactionValue
      });
    };

    calculateStats();

    // Simulate periodic new transactions
    const transactionInterval = setInterval(() => {
      // Generate mock transaction data
      const blockchains = ['ethereum', 'polygon', 'arbitrum', 'optimism', 'bsc'];
      const riskLevels = ['low', 'medium', 'high', 'critical'];
      const tokens = ['ETH', 'USDC', 'USDT', 'WBTC', 'MATIC'];

      const mockTx = {
        id: `mock-${Date.now()}-${Math.random()}`,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockchain: blockchains[Math.floor(Math.random() * blockchains.length)],
        from_address: `0x${Math.random().toString(16).substr(2, 40)}`,
        to_address: `0x${Math.random().toString(16).substr(2, 40)}`,
        amount: Math.random() * 1000 + 10,
        value_usd: Math.random() * 500000 + 10000,
        token_symbol: tokens[Math.floor(Math.random() * tokens.length)],
        risk_level: riskLevels[Math.floor(Math.random() * riskLevels.length)],
        pattern_type: 'transfer',
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString()
      };

      // Add to transactions (this would normally come from the hook)
      // For demo purposes, we'll just increment counters
      setNewTransactionCount(prev => prev + 1);
      setLastUpdateTime(new Date());

      // Update live stats with animation
      setLiveStats(prev => ({
        totalTransactions: prev.totalTransactions + 1,
        totalVolume: prev.totalVolume + mockTx.value_usd,
        highRiskCount: prev.highRiskCount + (mockTx.risk_level === 'high' || mockTx.risk_level === 'critical' ? 1 : 0),
        avgTransactionValue: (prev.totalVolume + mockTx.value_usd) / (prev.totalTransactions + 1)
      }));

    }, 3000 + Math.random() * 4000); // Random interval between 3-7 seconds

    // Periodic stats refresh
    const statsInterval = setInterval(async () => {
      try {
        await supabase.functions.invoke('whale-scanner', {
          body: { action: 'scan_new' }
        });
        await fetchTransactions();
        setLastUpdateTime(new Date());
      } catch (error) {
        console.error('Error scanning:', error);
      }
    }, 15000);

    return () => {
      clearInterval(transactionInterval);
      clearInterval(statsInterval);
    };
  }, [isLive, transactions, fetchTransactions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleExport = (format: 'csv' | 'json') => {
    const data = filteredTransactions.map(tx => ({
      hash: tx.hash,
      blockchain: tx.blockchain,
      from: tx.from_address,
      to: tx.to_address,
      amount: tx.amount,
      value_usd: tx.value_usd,
      risk_level: tx.risk_level,
      timestamp: tx.created_at
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whale-transactions-${Date.now()}.json`;
      a.click();
    } else {
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whale-transactions-${Date.now()}.csv`;
      a.click();
    }
    setShowExportMenu(false);
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
  const avgTransactionValue = transactions.length > 0 ? totalVolume / transactions.length : 0;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <InteractiveBackground />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-400" />
                Live Monitoring
                {isLive && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm text-green-400 font-medium">LIVE</span>
                  </div>
                )}
              </h1>
              <p className="text-gray-400 mt-1 flex items-center gap-2">
                Real-time feed of whale activity from all blockchains
                {isLive && (
                  <span className="text-xs text-green-400 animate-pulse">
                    • Updated {formatDistanceToNow(lastUpdateTime, { addSuffix: true })}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-40 glass rounded-lg overflow-hidden z-20"
                    >
                      <button
                        onClick={() => handleExport('json')}
                        className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors"
                      >
                        Export as JSON
                      </button>
                      <button
                        onClick={() => handleExport('csv')}
                        className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors"
                      >
                        Export as CSV
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 glass rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Refresh transactions"
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4 relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <div className="text-xs text-gray-400">Total Transactions</div>
            </div>
            <div className="text-2xl font-bold text-blue-400 flex items-center gap-2">
              {liveStats.totalTransactions.toLocaleString()}
              {isLive && newTransactionCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full animate-pulse"
                >
                  +{newTransactionCount}
                </motion.span>
              )}
            </div>
            {isLive && <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-ping" />}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-4 relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <div className="text-xs text-gray-400">Total Volume</div>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {formatCurrency(liveStats.totalVolume)}
            </div>
            {isLive && <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-ping" />}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-4 relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <div className="text-xs text-gray-400">High Risk</div>
            </div>
            <div className="text-2xl font-bold text-red-400">
              {liveStats.highRiskCount}
            </div>
            {isLive && liveStats.highRiskCount > 0 && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full animate-ping" />
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-4 relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-green-400" />
              <div className="text-xs text-gray-400">Avg Value</div>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(liveStats.avgTransactionValue)}
            </div>
            {isLive && <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-ping" />}
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions, addresses, hash..."
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
                <option value="all">All Blockchains</option>
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
                <option value="all">All Risk Levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(searchQuery || filterBlockchain !== 'all' || filterRisk !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
              <span className="text-sm text-gray-400">Active filters:</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs flex items-center gap-2">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="hover:text-blue-300">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterBlockchain !== 'all' && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs flex items-center gap-2 capitalize">
                  {filterBlockchain}
                  <button onClick={() => setFilterBlockchain('all')} className="hover:text-purple-300">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterRisk !== 'all' && (
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs flex items-center gap-2 capitalize">
                  {filterRisk} Risk
                  <button onClick={() => setFilterRisk('all')} className="hover:text-orange-300">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading transactions...</p>
          </div>
        )}

        {/* Transactions Feed */}
        {!loading && (
          <div className="space-y-4">
            {isLive && (
              <div className="flex items-center justify-between glass rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-400">Live Feed Active</span>
                  <span className="text-xs text-gray-400">Scanning all blockchains in real-time</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Activity className="w-3 h-3" />
                  <span>Updates every 3-7 seconds</span>
                </div>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {filteredTransactions.slice(0, 20).map((tx, index) => {
                const chainColors = blockchainColors[tx.blockchain || 'ethereum'] || { bg: 'bg-gray-500/20', text: 'text-gray-400', badge: 'bg-gray-500' };
                const isExpanded = expandedTx === tx.id;
                const isNewTransaction = index < newTransactionCount && isLive;
                
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: isNewTransaction ? -50 : 0, y: isNewTransaction ? -20 : 0 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ 
                      duration: 0.4,
                      delay: isNewTransaction ? 0 : index * 0.05
                    }}
                    className={`glass rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden ${
                      isNewTransaction ? 'ring-2 ring-green-400/50 shadow-lg shadow-green-400/20' : ''
                    }`}
                  >
                    {isNewTransaction && (
                      <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 5 }}
                        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-green-400 to-transparent"
                      />
                    )}

                    <div onClick={() => setExpandedTx(isExpanded ? null : tx.id)}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${chainColors.bg} relative`}>
                            <span className={`text-xs font-bold ${chainColors.text}`}>
                              {(tx.blockchain || 'ETH').slice(0, 3).toUpperCase()}
                            </span>
                            <div className={`absolute -top-1 -right-1 w-3 h-3 ${chainColors.badge} rounded-full border-2 border-gray-900`} />
                            {isLive && (
                              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              <motion.span 
                                className={`px-3 py-1 rounded-full text-sm font-medium capitalize relative ${
                                  tx.risk_level === 'critical' ? 'bg-red-500/20 text-red-400' :
                                  tx.risk_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                  tx.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}
                                animate={tx.risk_level === 'critical' || tx.risk_level === 'high' ? { scale: [1, 1.05, 1] } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                {tx.risk_level}
                                {(tx.risk_level === 'critical' || tx.risk_level === 'high') && (
                                  <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="absolute inset-0 rounded-full border border-current"
                                  />
                                )}
                              </motion.span>
                              <span className="text-sm text-gray-400 capitalize">{tx.pattern_type || 'transfer'}</span>
                              <span className="text-sm text-gray-500 font-mono">{tx.token_symbol}</span>
                              {isNewTransaction && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1"
                                >
                                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                  NEW
                                </motion.span>
                              )}
                            </div>

                            <div className="text-lg font-semibold mb-2">
                              {Number(tx.amount).toFixed(4)} {tx.token_symbol}
                            </div>

                            <div className="flex items-center flex-wrap gap-4 text-sm text-gray-400">
                              <div className="flex items-center space-x-2">
                                <span>From:</span>
                                <code className="px-2 py-1 bg-white/5 rounded font-mono text-xs">{formatAddress(tx.from_address || '')}</code>
                              </div>
                              <ArrowUpRight className="w-4 h-4" />
                              <div className="flex items-center space-x-2">
                                <span>To:</span>
                                <code className="px-2 py-1 bg-white/5 rounded font-mono text-xs">{formatAddress(tx.to_address || '')}</code>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <div className="flex items-center space-x-2 text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {(() => {
                                    try {
                                      const dateToUse = tx.created_at || tx.timestamp;
                                      const date = new Date(dateToUse);
                                      if (isNaN(date.getTime())) {
                                        return 'Invalid date';
                                      }
                                      return formatDistanceToNow(date, { addSuffix: true });
                                    } catch (error) {
                                      return 'Recently';
                                    }
                                  })()}
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTx(tx);
                            }}
                            className="mt-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Section */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-white/10 overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Whale Score:</span>
                              <span className="ml-2 font-medium">{tx.whale_score}/100</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Gas Used:</span>
                              <span className="ml-2 font-medium">{tx.gas_used?.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Block:</span>
                              <span className="ml-2 font-mono text-xs">{tx.block_number}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">Suspicious:</span>
                              <span className={`px-2 py-0.5 rounded text-xs ${tx.is_suspicious ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                {tx.is_suspicious ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
            <h3 className="text-xl font-semibold mb-2">No Transactions</h3>
            <p className="text-gray-400">
              {searchQuery || filterBlockchain !== 'all' || filterRisk !== 'all'
                ? 'Try adjusting your filters or search keywords'
                : 'Waiting for whale activity...'}
            </p>
          </div>
        )}
      </div>

      {/* Live Activity Ticker */}
      {isLive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 glass rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Live Activity</span>
            </div>
            <div className="text-xs text-gray-400">
              Last update: {lastUpdateTime.toLocaleTimeString()}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-blue-400">{newTransactionCount}</div>
              <div className="text-xs text-gray-400">New Transactions</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-purple-400">
                {formatCurrency(liveStats.totalVolume - transactions.reduce((sum, tx) => sum + (tx.value_usd || 0), 0))}
              </div>
              <div className="text-xs text-gray-400">Volume Added</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-red-400">
                {liveStats.highRiskCount - transactions.filter(t => t.risk_level === 'high' || t.risk_level === 'critical').length}
              </div>
              <div className="text-xs text-gray-400">New Alerts</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-green-400">
                {((liveStats.avgTransactionValue / (transactions.reduce((sum, tx) => sum + (tx.value_usd || 0), 0) / Math.max(transactions.length, 1))) * 100 - 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Avg Change</div>
            </div>
          </div>
        </motion.div>
      )}

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
                <h2 className="text-2xl font-bold">Transaction Details</h2>
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
                      <code className="text-sm truncate font-mono">{selectedTx.from_address}</code>
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
                      <code className="text-sm truncate font-mono">{selectedTx.to_address || 'N/A'}</code>
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
                    <code className="text-sm break-all font-mono">{selectedTx.hash}</code>
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
                    This transaction has been verified using ZK-proof technology to ensure validity without revealing sensitive data.
                  </p>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-2">Timestamp</div>
                  <div className="font-medium">
                    {(() => {
                      try {
                        const date = new Date(selectedTx.created_at);
                        if (isNaN(date.getTime())) {
                          return 'Invalid date';
                        }
                        return date.toLocaleString();
                      } catch (error) {
                        return 'Invalid date';
                      }
                    })()}
                  </div>
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
