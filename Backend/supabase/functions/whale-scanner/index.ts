// Whale Scanner Edge Function - Real Blockchain Data Integration
// Uses public APIs: Etherscan, DeFi Llama, Public RPC endpoints

interface BlockchainConfig {
    name: string;
    rpcUrl: string;
    explorerApi: string;
    nativeCurrency: string;
    whaleThreshold: number; // in USD
}

const BLOCKCHAIN_CONFIGS: Record<string, BlockchainConfig> = {
    ethereum: {
        name: 'Ethereum',
        rpcUrl: 'https://eth.llamarpc.com',
        explorerApi: 'https://api.etherscan.io/api',
        nativeCurrency: 'ETH',
        whaleThreshold: 100000
    },
    polygon: {
        name: 'Polygon',
        rpcUrl: 'https://polygon.llamarpc.com',
        explorerApi: 'https://api.polygonscan.com/api',
        nativeCurrency: 'MATIC',
        whaleThreshold: 50000
    },
    arbitrum: {
        name: 'Arbitrum',
        rpcUrl: 'https://arbitrum.llamarpc.com',
        explorerApi: 'https://api.arbiscan.io/api',
        nativeCurrency: 'ETH',
        whaleThreshold: 50000
    },
    optimism: {
        name: 'Optimism',
        rpcUrl: 'https://optimism.llamarpc.com',
        explorerApi: 'https://api-optimistic.etherscan.io/api',
        nativeCurrency: 'ETH',
        whaleThreshold: 50000
    },
    bsc: {
        name: 'BSC',
        rpcUrl: 'https://bsc.llamarpc.com',
        explorerApi: 'https://api.bscscan.com/api',
        nativeCurrency: 'BNB',
        whaleThreshold: 50000
    }
};

// Cache for token prices
const priceCache: Record<string, { price: number; timestamp: number }> = {};
const PRICE_CACHE_TTL = 60000; // 1 minute

async function getTokenPrice(symbol: string): Promise<number> {
    const now = Date.now();
    const cached = priceCache[symbol];
    
    if (cached && (now - cached.timestamp) < PRICE_CACHE_TTL) {
        return cached.price;
    }

    try {
        // Use DeFi Llama API for prices (free, no API key)
        const coinIds: Record<string, string> = {
            'ETH': 'coingecko:ethereum',
            'BTC': 'coingecko:bitcoin',
            'USDC': 'coingecko:usd-coin',
            'USDT': 'coingecko:tether',
            'DAI': 'coingecko:dai',
            'MATIC': 'coingecko:matic-network',
            'BNB': 'coingecko:binancecoin',
            'WETH': 'coingecko:weth',
            'WBTC': 'coingecko:wrapped-bitcoin'
        };

        const coinId = coinIds[symbol] || `coingecko:${symbol.toLowerCase()}`;
        const response = await fetch(`https://coins.llama.fi/prices/current/${coinId}`);
        
        if (response.ok) {
            const data = await response.json();
            const price = data.coins[coinId]?.price || 0;
            priceCache[symbol] = { price, timestamp: now };
            return price;
        }
    } catch (error) {
        console.error('Price fetch error:', error);
    }

    // Fallback prices
    const fallbackPrices: Record<string, number> = {
        'ETH': 3500, 'BTC': 95000, 'USDC': 1, 'USDT': 1, 'DAI': 1,
        'MATIC': 0.5, 'BNB': 650, 'WETH': 3500, 'WBTC': 95000
    };
    return fallbackPrices[symbol] || 1;
}

async function fetchLatestBlocks(chain: string, count: number = 5): Promise<any[]> {
    const config = BLOCKCHAIN_CONFIGS[chain];
    if (!config) return [];

    try {
        // Get latest block number
        const blockNumResponse = await fetch(config.rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_blockNumber',
                params: []
            })
        });

        if (!blockNumResponse.ok) return [];
        const blockNumData = await blockNumResponse.json();
        const latestBlock = parseInt(blockNumData.result, 16);

        const blocks = [];
        for (let i = 0; i < count; i++) {
            const blockNum = latestBlock - i;
            const blockResponse = await fetch(config.rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: i + 2,
                    method: 'eth_getBlockByNumber',
                    params: [`0x${blockNum.toString(16)}`, true]
                })
            });

            if (blockResponse.ok) {
                const blockData = await blockResponse.json();
                if (blockData.result) {
                    blocks.push(blockData.result);
                }
            }
        }

        return blocks;
    } catch (error) {
        console.error(`Error fetching blocks for ${chain}:`, error);
        return [];
    }
}

function calculateWhaleScore(valueUsd: number, chain: string): number {
    const config = BLOCKCHAIN_CONFIGS[chain];
    const threshold = config?.whaleThreshold || 100000;
    
    // Score based on how many times above threshold
    const ratio = valueUsd / threshold;
    if (ratio < 1) return 0;
    if (ratio < 2) return 30 + Math.floor(ratio * 10);
    if (ratio < 5) return 50 + Math.floor((ratio - 2) * 5);
    if (ratio < 10) return 65 + Math.floor((ratio - 5) * 3);
    if (ratio < 50) return 80 + Math.floor((ratio - 10) * 0.3);
    return Math.min(100, 92 + Math.floor((ratio - 50) * 0.05));
}

function determineRiskLevel(valueUsd: number, whaleScore: number): string {
    if (whaleScore >= 90 || valueUsd >= 10000000) return 'critical';
    if (whaleScore >= 70 || valueUsd >= 1000000) return 'high';
    if (whaleScore >= 50 || valueUsd >= 500000) return 'medium';
    return 'low';
}

function detectPatternType(tx: any, valueUsd: number): string {
    const toAddress = tx.to?.toLowerCase() || '';
    
    // Known DEX routers
    const dexRouters = [
        '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', // Uniswap V2
        '0xe592427a0aece92de3edee1f18e0157c05861564', // Uniswap V3
        '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f', // SushiSwap
        '0x1111111254fb6c44bac0bed2854e76f90643097d', // 1inch
    ];
    
    // Known bridge contracts
    const bridges = [
        '0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf', // Polygon Bridge
        '0x8315177ab297ba92a06054ce80a67ed4dbd7ed3a', // Arbitrum Bridge
    ];

    if (dexRouters.some(r => toAddress.includes(r.slice(2)))) {
        return 'dex_interaction';
    }
    if (bridges.some(b => toAddress.includes(b.slice(2)))) {
        return 'bridge_transfer';
    }
    if (valueUsd >= 5000000) {
        return 'whale_to_whale';
    }
    return 'large_transfer';
}

async function scanBlockchainForWhales(chain: string, supabaseUrl: string, serviceRoleKey: string): Promise<any[]> {
    const config = BLOCKCHAIN_CONFIGS[chain];
    if (!config) return [];

    const ethPrice = await getTokenPrice(config.nativeCurrency);
    const blocks = await fetchLatestBlocks(chain, 3);
    const whaleTransactions: any[] = [];

    for (const block of blocks) {
        if (!block?.transactions) continue;

        for (const tx of block.transactions) {
            // Skip contract creations
            if (!tx.to) continue;

            // Parse value (in wei)
            const valueWei = parseInt(tx.value, 16);
            const valueEth = valueWei / 1e18;
            const valueUsd = valueEth * ethPrice;

            // Check if qualifies as whale transaction
            if (valueUsd < config.whaleThreshold) continue;

            const whaleScore = calculateWhaleScore(valueUsd, chain);
            const riskLevel = determineRiskLevel(valueUsd, whaleScore);
            const patternType = detectPatternType(tx, valueUsd);

            const transaction = {
                hash: tx.hash,
                from_address: tx.from,
                to_address: tx.to,
                amount: valueEth.toFixed(6),
                value_usd: Math.floor(valueUsd),
                token_symbol: config.nativeCurrency,
                blockchain: chain,
                block_number: parseInt(block.number, 16),
                whale_score: whaleScore,
                risk_level: riskLevel,
                pattern_type: patternType,
                transaction_type: 'transfer',
                timestamp: new Date(parseInt(block.timestamp, 16) * 1000).toISOString()
            };

            whaleTransactions.push(transaction);

            // Insert to database
            try {
                await fetch(`${supabaseUrl}/rest/v1/whale_transactions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=ignore-duplicates'
                    },
                    body: JSON.stringify(transaction)
                });
            } catch (e) {
                // Ignore duplicate errors
            }
        }
    }

    return whaleTransactions;
}

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        // Hardcoded Supabase configuration for production
        const serviceRoleKey = 'sbp_oauth_a6c174b4bd07eff2d55399209425637325bb3bb1';
        const supabaseUrl = 'https://fhwywghnhfrlndivdigl.supabase.co';

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        const { action, blockchain, limit, offset, filters } = await req.json();

        let result;

        switch (action) {
            case 'get_transactions': {
                // Build query for whale transactions
                let queryUrl = `${supabaseUrl}/rest/v1/whale_transactions?order=timestamp.desc,created_at.desc`;
                
                if (blockchain && blockchain !== 'all') {
                    queryUrl += `&blockchain=eq.${blockchain}`;
                }
                
                if (filters?.risk_level) {
                    queryUrl += `&risk_level=eq.${filters.risk_level}`;
                }
                
                if (filters?.min_amount) {
                    queryUrl += `&value_usd=gte.${filters.min_amount}`;
                }
                
                queryUrl += `&limit=${limit || 50}&offset=${offset || 0}`;

                const txResponse = await fetch(queryUrl, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (!txResponse.ok) {
                    throw new Error('Failed to fetch transactions');
                }

                result = await txResponse.json();
                break;
            }

            case 'get_stats': {
                // Get aggregated statistics from database
                const statsResponse = await fetch(`${supabaseUrl}/rest/v1/whale_transactions?select=blockchain,amount,value_usd,risk_level,whale_score`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (!statsResponse.ok) {
                    throw new Error('Failed to fetch stats');
                }

                const transactions = await statsResponse.json();

                // Calculate comprehensive statistics
                const stats = {
                    total_transactions: transactions.length,
                    total_volume_usd: transactions.reduce((sum: number, tx: any) => sum + (tx.value_usd || 0), 0),
                    avg_transaction_usd: 0,
                    avg_whale_score: 0,
                    by_blockchain: {} as Record<string, { count: number; volume: number }>,
                    by_risk_level: { low: 0, medium: 0, high: 0, critical: 0 },
                    top_whales: 0,
                    last_24h_volume: 0
                };

                stats.avg_transaction_usd = stats.total_transactions > 0 
                    ? stats.total_volume_usd / stats.total_transactions 
                    : 0;

                let totalScore = 0;
                transactions.forEach((tx: any) => {
                    // By blockchain
                    if (!stats.by_blockchain[tx.blockchain]) {
                        stats.by_blockchain[tx.blockchain] = { count: 0, volume: 0 };
                    }
                    stats.by_blockchain[tx.blockchain].count++;
                    stats.by_blockchain[tx.blockchain].volume += tx.value_usd || 0;

                    // By risk level
                    if (tx.risk_level && stats.by_risk_level[tx.risk_level as keyof typeof stats.by_risk_level] !== undefined) {
                        stats.by_risk_level[tx.risk_level as keyof typeof stats.by_risk_level]++;
                    }

                    // Whale score
                    totalScore += tx.whale_score || 0;
                    if (tx.whale_score >= 80) stats.top_whales++;
                });

                stats.avg_whale_score = stats.total_transactions > 0 
                    ? Math.floor(totalScore / stats.total_transactions) 
                    : 0;

                result = stats;
                break;
            }

            case 'scan_new': {
                // Scan blockchain for new whale transactions
                const chains = blockchain && blockchain !== 'all' 
                    ? [blockchain] 
                    : Object.keys(BLOCKCHAIN_CONFIGS);
                
                const allTransactions: any[] = [];
                
                for (const chain of chains) {
                    try {
                        const transactions = await scanBlockchainForWhales(chain, supabaseUrl, serviceRoleKey);
                        allTransactions.push(...transactions);
                    } catch (e) {
                        console.error(`Error scanning ${chain}:`, e);
                    }
                }

                result = {
                    scanned_chains: chains,
                    new_transactions: allTransactions.length,
                    transactions: allTransactions.slice(0, 10) // Return top 10
                };
                break;
            }

            case 'get_prices': {
                // Get current token prices
                const tokens = ['ETH', 'BTC', 'USDC', 'USDT', 'MATIC', 'BNB'];
                const prices: Record<string, number> = {};
                
                for (const token of tokens) {
                    prices[token] = await getTokenPrice(token);
                }
                
                result = prices;
                break;
            }

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Whale scanner error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'WHALE_SCANNER_ERROR',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
