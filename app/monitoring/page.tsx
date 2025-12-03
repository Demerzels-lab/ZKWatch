'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useWhaleTransactions } from '@/lib/hooks';
import { InteractiveBackground } from '@/components/InteractiveBackground';
import { formatDistanceToNow } from 'date-fns';
import { Transaction } from '@/types'; // Ensure we use the shared type if available, or fallback
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
  AlertCircle,
  ArrowDownRight,
  ArrowRightLeft
} from 'lucide-react';

// --- Constants & Helpers ---

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
  if (value === undefined || value === null || isNaN(value)) return '$0.00';
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

// --- Mock Data Generator ---

const MOCK_TOKENS = ['ETH', 'USDC', 'USDT', 'WBTC', 'DAI', 'MATIC', 'BNB'];
const MOCK_CHAINS = ['ethereum', 'polygon', 'arbitrum', 'optimism', 'bsc'];
const MOCK_TYPES = ['transfer', 'swap', 'mint', 'burn', 'bridge'];
const MOCK_RISKS = ['low', 'low', 'low', 'medium', 'medium', 'high', 'critical']; // Weighted towards low/medium

const generateMockTransaction = (): any => {
  const chain = MOCK_CHAINS[Math.floor(Math.random() * MOCK_CHAINS.length)];
  const token = MOCK_TOKENS[Math.floor(Math.random() * MOCK_TOKENS.length)];
  const type = MOCK_TYPES[Math.floor(Math.random() * MOCK_TYPES.length)];
  const risk = MOCK_RISKS[Math.floor(Math.random() * MOCK_RISKS.length)];
  
  // Value curve: mostly smaller whales, occasional massive ones
  const baseValue = Math.random() > 0.9 ? 1000000 : 50000; 
  const valueUsd = baseValue + Math.random() * 500000;
  
  // Approximate amount based on token (very rough approximation for mock)
  let amount = valueUsd;
  if (token === 'ETH' || token === 'WBTC') amount = valueUsd / 3000; // rough crypto price
  if (token === 'MATIC') amount = valueUsd / 0.5;
  if (token === 'BNB') amount = valueUsd / 300;

  return {
    id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    blockchain: chain,
    from_address: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    to_address: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    amount: amount,
    value_usd: valueUsd,
    token_symbol: token,
    risk_level: risk,
    pattern_type: type,
    whale_score: Math.floor(Math.random() * 40) + 60, // 60-100
    gas_used: Math.floor(Math.random() * 500000) + 21000,
    is_suspicious: risk === 'high' || risk === 'critical',
    created_at: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    is_new: true // Flag for animation
  };
};

function MonitoringContent() {
  const { transactions: initialTransactions, loading: initialLoading, fetchTransactions } = useWhaleTransactions();
  
  // Local state to hold merged transactions (initial + live generated)
  const [localTransactions, setLocalTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBlockchain, setFilterBlockchain] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  // Initialize data
  useEffect(() => {
    if (!initialLoading) {
      setLocalTransactions(initialTransactions);
      setLoading(false);
    }
  }, [initialLoading, initialTransactions]);

  // Live Data Simulation
  useEffect(() => {
    if (!isLive || loading) return;

    // Random interval between 800ms and 3000ms for "live" feeling
    const timeout = setTimeout(() => {
      const newTx = generateMockTransaction();
      
      setLocalTransactions(prev => {
        // Keep list size manageable (e.g., max 100 items)
        const updated = [newTx, ...prev].slice(0, 100);
        return updated;
      });
      
      setLastUpdateTime(new Date());
    }, Math.random() * 2200 + 800);

    return () => clearTimeout(timeout);
  }, [isLive, loading, localTransactions]); // Depend on localTransactions to re-trigger the timeout loop

  // Derived Stats
  const totalTransactions = localTransactions.length;
  const totalVolume = localTransactions.reduce((sum, tx) => sum + (tx.value_usd || 0), 0);
  const highRiskCount = localTransactions.filter(t => t.risk_level === 'high' || t.risk_level === 'critical').length;
  const avgTransactionValue = totalTransactions > 0 ? totalVolume / totalTransactions : 0;

  // Filter Logic
  const filteredTransactions = localTransactions.filter(tx => {
    const matchesSearch = 
      tx.hash?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.to_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.token_symbol?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBlockchain = filterBlockchain === 'all' || tx.blockchain === filterBlockchain;
    const matchesRisk = filterRisk === 'all' || tx.risk_level === filterRisk;
    
    return matchesSearch && matchesBlockchain && matchesRisk;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    setLocalTransactions([]); // Clear current view
    setLoading(true);
    await fetchTransactions(); // Refetch baseline
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedHash(text);
      setTimeout(() => setCopiedHash(null), 2000);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    // Export logic (same as before)
    const data = filteredTransactions.map(tx => ({
      hash: tx.hash,
      blockchain: tx.blockchain,
      amount: tx.amount,
      value_usd: tx.value_usd,
      token: tx.token_symbol,
      time: tx.created_at
    }));
    
    const content = format === 'json' ? JSON.stringify(data, null, 2) : 
      Object.keys(data[0]).join(',') + '\n' + data.map(r => Object.values(r).join(',')).join('\n');
      
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zkwatch-export.${format}`;
    a.click();
    setShowExportMenu(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <InteractiveBackground />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Activity className="w-8 h-8 text-[#01F4D4]" />
                Live Monitoring
                {isLive && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-green-400 font-bold tracking-wider">LIVE FEED</span>
                  </div>
                )}
              </h1>
              <p className="text-gray-400 mt-2 flex items-center gap-2 text-sm">
                Real-time ZK-verified whale activity
                {isLive && (
                  <span className="text-[#01F4D4]/70">
                    — Incoming Data Stream Active
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Export Button */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-40 glass bg-[#111] border border-white/10 rounded-lg overflow-hidden z-20 shadow-xl"
                    >
                      <button onClick={() => handleExport('json')} className="w-full px-4 py-2 text-left hover:bg-white/10 text-sm">JSON</button>
                      <button onClick={() => handleExport('csv')} className="w-full px-4 py-2 text-left hover:bg-white/10 text-sm">CSV</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 glass rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => setIsLive(!isLive)}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all text-sm border ${
                  isLive 
                    ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                {isLive ? <Activity className="w-4 h-4 animate-pulse" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                <span>{isLive ? 'Monitoring' : 'Paused'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Stats Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Transactions', value: totalTransactions.toLocaleString(), icon: Activity, color: 'text-blue-400' },
            { label: '24h Volume', value: formatCurrency(totalVolume), icon: TrendingUp, color: 'text-purple-400' },
            { label: 'High Risk', value: highRiskCount, icon: AlertCircle, color: 'text-red-400' },
            { label: 'Avg Value', value: formatCurrency(avgTransactionValue), icon: ArrowUpRight, color: 'text-green-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-4 relative overflow-hidden group"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-gray-400">{stat.label}</span>
              </div>
              <div className={`text-2xl font-bold ${stat.color} tabular-nums`}>
                {stat.value}
              </div>
              {isLive && <div className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${stat.color.replace('text', 'bg')} animate-ping opacity-75`} />}
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by address, hash, or token..."
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:border-[#01F4D4] focus:outline-none text-sm transition-all"
              />
            </div>
            <div className="flex gap-4">
              <div className="relative min-w-[160px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  value={filterBlockchain}
                  onChange={(e) => setFilterBlockchain(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:border-[#01F4D4] focus:outline-none text-sm appearance-none cursor-pointer"
                >
                  <option value="all">All Chains</option>
                  {Object.keys(blockchainColors).map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div className="relative min-w-[160px]">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:border-[#01F4D4] focus:outline-none text-sm appearance-none cursor-pointer"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Feed */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#01F4D4] mx-auto mb-4" />
            <p className="text-gray-400">Connecting to node...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false} mode="popLayout">
              {filteredTransactions.slice(0, 50).map((tx) => {
                const chainStyle = blockchainColors[tx.blockchain] || blockchainColors.ethereum;
                const isExpanded = expandedTx === tx.id;
                
                return (
                  <motion.div
                    layout
                    key={tx.id}
                    initial={{ opacity: 0, y: -20, scale: 0.98, backgroundColor: "rgba(1, 244, 212, 0.1)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, backgroundColor: "rgba(17, 17, 17, 0.6)" }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                    className={`glass rounded-xl p-0 border border-white/5 hover:border-white/20 transition-colors overflow-hidden ${
                      isExpanded ? 'ring-1 ring-[#01F4D4]/30' : ''
                    }`}
                  >
                    {/* Main Row */}
                    <div 
                      onClick={() => setExpandedTx(isExpanded ? null : tx.id)}
                      className="p-4 cursor-pointer flex flex-col md:flex-row items-start md:items-center gap-4 relative"
                    >
                      {/* Risk Indicator Bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        tx.risk_level === 'critical' ? 'bg-red-500' :
                        tx.risk_level === 'high' ? 'bg-orange-500' :
                        tx.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-transparent'
                      }`} />

                      <div className="flex items-center gap-4 flex-1">
                        {/* Chain Icon */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${chainStyle.bg} flex-shrink-0`}>
                          <span className={`text-[10px] font-bold ${chainStyle.text} uppercase`}>
                            {tx.blockchain.substring(0, 3)}
                          </span>
                        </div>

                        {/* TX Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white truncate text-base">
                              {Number(tx.amount).toFixed(2)} <span className="text-[#01F4D4]">{tx.token_symbol}</span>
                            </h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wide border ${
                              tx.pattern_type === 'transfer' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              tx.pattern_type === 'swap' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                              'bg-gray-500/10 text-gray-400 border-gray-500/20'
                            }`}>
                              {tx.pattern_type}
                            </span>
                            {tx.is_new && (
                              <span className="text-[10px] text-green-400 font-bold animate-pulse ml-auto md:ml-0">NEW</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                            <span className="flex items-center gap-1">
                              {formatAddress(tx.from_address)} <ArrowRightLeft className="w-3 h-3" /> {formatAddress(tx.to_address)}
                            </span>
                            <span className="hidden sm:inline text-gray-600">|</span>
                            <span className="hidden sm:flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Value & Action */}
                      <div className="flex items-center justify-between w-full md:w-auto gap-6 pl-14 md:pl-0">
                        <div className="text-right">
                          <div className="text-lg font-bold text-white tabular-nums">
                            {formatCurrency(tx.value_usd)}
                          </div>
                          <div className={`text-xs font-medium uppercase ${
                            tx.risk_level === 'critical' ? 'text-red-400' :
                            tx.risk_level === 'high' ? 'text-orange-400' :
                            tx.risk_level === 'medium' ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {tx.risk_level} Risk
                          </div>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedTx(tx); }}
                          className="p-2 hover:bg-white/10 rounded-lg text-[#01F4D4] transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-white/5 border-t border-white/5"
                        >
                          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-500 text-xs mb-1">Transaction Hash</div>
                              <div className="font-mono text-white/80 truncate flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => handleCopy(tx.hash)}>
                                {formatAddress(tx.hash)} <Copy className="w-3 h-3" />
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500 text-xs mb-1">Whale Score</div>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-gray-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#01F4D4]" style={{ width: `${tx.whale_score}%` }} />
                                </div>
                                <span className="font-bold">{tx.whale_score}/100</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500 text-xs mb-1">Gas Used</div>
                              <div className="font-mono text-white/80">{tx.gas_used.toLocaleString()} GWEI</div>
                            </div>
                            <div>
                              <div className="text-gray-500 text-xs mb-1">Status</div>
                              <div className="flex items-center gap-1 text-green-400">
                                <CheckCircle className="w-3 h-3" />
                                <span>Verified ZK-Proof</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No transactions found matching your filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transaction Modal Detail */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedTx(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    Transaction Details
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 uppercase border border-blue-500/30">
                      {selectedTx.blockchain}
                    </span>
                  </h2>
                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                    {selectedTx.timestamp}
                    <span className="w-1 h-1 bg-gray-500 rounded-full" />
                    <span className="text-green-400 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> ZK Verified
                    </span>
                  </p>
                </div>
                <button onClick={() => setSelectedTx(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Amount Card */}
                <div className="bg-white/5 rounded-xl p-6 text-center border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
                  <div className="text-sm text-gray-400 uppercase tracking-widest mb-1">Total Value</div>
                  <div className="text-4xl font-bold text-white mb-2">{formatCurrency(selectedTx.value_usd)}</div>
                  <div className="text-lg text-[#01F4D4] font-mono">
                    {Number(selectedTx.amount).toFixed(4)} {selectedTx.token_symbol}
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-xs text-gray-500 mb-2 uppercase font-bold">From Address</div>
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-blue-300">{formatAddress(selectedTx.from_address)}</code>
                      <button onClick={() => handleCopy(selectedTx.from_address)} className="text-gray-400 hover:text-white"><Copy className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-xs text-gray-500 mb-2 uppercase font-bold">To Address</div>
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-purple-300">{formatAddress(selectedTx.to_address)}</code>
                      <button onClick={() => handleCopy(selectedTx.to_address)} className="text-gray-400 hover:text-white"><Copy className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>

                {/* Hash */}
                <div className="p-4 bg-black/20 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-white/5 rounded-lg"><ExternalLink className="w-4 h-4 text-gray-400" /></div>
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">Transaction Hash</div>
                      <div className="text-sm font-mono text-white/80 truncate w-full">{selectedTx.hash}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleCopy(selectedTx.hash)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                      {copiedHash === selectedTx.hash ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a 
                      href={`${blockchainExplorers[selectedTx.blockchain]}${selectedTx.hash}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
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