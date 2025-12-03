// ===========================
// Statistical Helper Functions
// ===========================

interface Transaction {
    id: string;
    from_address: string;
    to_address: string;
    value_usd: number;
    blockchain: string;
    created_at: string;
    whale_score?: number;
    risk_level?: string;
}

interface WalletBehavior {
    address: string;
    txCount: number;
    totalVolume: number;
    avgVolume: number;
    frequency: number;
    timeSpread: number;
}

// Menghitung moving average
function movingAverage(data: number[], window: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
        if (i < window - 1) {
            result.push(data.slice(0, i + 1).reduce((a, b) => a + b, 0) / (i + 1));
        } else {
            const slice = data.slice(i - window + 1, i + 1);
            result.push(slice.reduce((a, b) => a + b, 0) / window);
        }
    }
    return result;
}

// Menghitung standard deviation
function standardDeviation(data: number[]): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
}

// Menghitung z-score untuk anomaly detection
function zScore(value: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
}

// Menghitung correlation coefficient
function correlation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < n; i++) {
        const diffX = x[i] - meanX;
        const diffY = y[i] - meanY;
        numerator += diffX * diffY;
        denomX += diffX * diffX;
        denomY += diffY * diffY;
    }
    
    const denominator = Math.sqrt(denomX * denomY);
    return denominator === 0 ? 0 : numerator / denominator;
}

// Exponential Moving Average untuk trend detection
function exponentialMovingAverage(data: number[], alpha: number = 0.3): number[] {
    const result: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
        result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
    }
    return result;
}

// ===========================
// Pattern Analysis Functions
// ===========================

// Deteksi pola whale behavior berdasarkan historical data
function detectWhalePatterns(transactions: Transaction[]): any {
    const patterns = {
        accumulation: [],
        distribution: [],
        rotation: [],
        wash_trading: []
    };
    
    // Group transactions by address
    const addressMap = new Map<string, Transaction[]>();
    transactions.forEach(tx => {
        if (!addressMap.has(tx.from_address)) {
            addressMap.set(tx.from_address, []);
        }
        addressMap.get(tx.from_address)!.push(tx);
    });
    
    // Analyze each whale's behavior
    addressMap.forEach((txs, address) => {
        if (txs.length < 3) return; // Need minimum data
        
        const volumes = txs.map(tx => tx.value_usd);
        const timestamps = txs.map(tx => new Date(tx.created_at).getTime());
        
        // Sort by time
        const sorted = txs.map((tx, i) => ({ tx, vol: volumes[i], time: timestamps[i] }))
            .sort((a, b) => a.time - b.time);
        
        const sortedVols = sorted.map(s => s.vol);
        
        // Detect accumulation pattern (increasing volumes)
        const ma = movingAverage(sortedVols, Math.min(3, sortedVols.length));
        const trend = ma[ma.length - 1] - ma[0];
        
        if (trend > 0 && sortedVols.length >= 5) {
            patterns.accumulation.push({
                address,
                confidence: Math.min(0.95, 0.6 + (trend / ma[0]) * 0.3),
                volume_trend: trend,
                transaction_count: txs.length
            });
        } else if (trend < 0 && sortedVols.length >= 5) {
            patterns.distribution.push({
                address,
                confidence: Math.min(0.95, 0.6 + (Math.abs(trend) / ma[0]) * 0.3),
                volume_trend: trend,
                transaction_count: txs.length
            });
        }
        
        // Detect wash trading (rapid back-and-forth transactions)
        const timeGaps = [];
        for (let i = 1; i < timestamps.length; i++) {
            timeGaps.push(timestamps[i] - timestamps[i - 1]);
        }
        const avgGap = timeGaps.reduce((a, b) => a + b, 0) / timeGaps.length;
        
        if (avgGap < 3600000 && txs.length >= 4) { // Less than 1 hour average
            patterns.wash_trading.push({
                address,
                confidence: 0.7,
                avg_time_gap_minutes: avgGap / 60000,
                transaction_count: txs.length
            });
        }
    });
    
    return patterns;
}

// Risk Scoring Algorithm
function calculateRiskScore(transactions: Transaction[], address?: string): any {
    let relevantTxs = transactions;
    
    if (address) {
        relevantTxs = transactions.filter(tx => 
            tx.from_address === address || tx.to_address === address
        );
    }
    
    if (relevantTxs.length === 0) {
        return {
            overall_score: 0,
            risk_level: 'low',
            factors: {}
        };
    }
    
    const volumes = relevantTxs.map(tx => tx.value_usd);
    const timestamps = relevantTxs.map(tx => new Date(tx.created_at).getTime());
    
    // Factor 1: Volume Risk (based on size and variance)
    const totalVolume = volumes.reduce((a, b) => a + b, 0);
    const avgVolume = totalVolume / volumes.length;
    const volumeStdDev = standardDeviation(volumes);
    const volumeVariance = volumeStdDev / (avgVolume || 1);
    
    const volumeRisk = Math.min(100, (avgVolume / 1000000) * 20 + volumeVariance * 30);
    
    // Factor 2: Frequency Risk (rapid transactions)
    const timeSpan = Math.max(...timestamps) - Math.min(...timestamps);
    // Minimum 1 hour timespan to avoid infinity
    const safeTimeSpan = Math.max(timeSpan, 3600000); // 1 hour minimum
    const frequencyPerDay = (relevantTxs.length / (safeTimeSpan / 86400000));
    const frequencyRisk = Math.min(100, frequencyPerDay * 10);
    
    // Factor 3: Velocity Risk (sudden changes in behavior)
    const recentTxs = relevantTxs.slice(-10);
    const olderTxs = relevantTxs.slice(0, -10);
    
    const recentAvg = recentTxs.reduce((sum, tx) => sum + tx.value_usd, 0) / recentTxs.length;
    const olderAvg = olderTxs.length > 0 
        ? olderTxs.reduce((sum, tx) => sum + tx.value_usd, 0) / olderTxs.length 
        : recentAvg;
    
    const velocityChange = Math.abs((recentAvg - olderAvg) / (olderAvg || 1));
    const velocityRisk = Math.min(100, velocityChange * 50);
    
    // Factor 4: Blockchain Diversity Risk
    const blockchains = new Set(relevantTxs.map(tx => tx.blockchain));
    const diversityRisk = blockchains.size > 3 ? 30 : blockchains.size * 10;
    
    // Calculate weighted overall score
    const overallScore = Math.floor(
        volumeRisk * 0.35 +
        frequencyRisk * 0.25 +
        velocityRisk * 0.30 +
        diversityRisk * 0.10
    );
    
    return {
        overall_score: Math.min(100, overallScore),
        risk_level: overallScore > 70 ? 'high' : overallScore > 40 ? 'medium' : 'low',
        factors: {
            volume_risk: {
                score: Math.floor(volumeRisk),
                avg_volume_usd: Math.floor(avgVolume),
                variance: volumeVariance.toFixed(2)
            },
            frequency_risk: {
                score: Math.floor(frequencyRisk),
                transactions_per_day: frequencyPerDay.toFixed(2)
            },
            velocity_risk: {
                score: Math.floor(velocityRisk),
                change_percentage: (velocityChange * 100).toFixed(2)
            },
            diversity_risk: {
                score: Math.floor(diversityRisk),
                blockchain_count: blockchains.size
            }
        }
    };
}

// Trend Detection untuk price predictions
function detectTrends(transactions: Transaction[]): any {
    if (transactions.length < 10) {
        return {
            trend: 'insufficient_data',
            confidence: 0,
            predictions: []
        };
    }
    
    // Sort by time
    const sorted = transactions
        .map(tx => ({ ...tx, timestamp: new Date(tx.created_at).getTime() }))
        .sort((a, b) => a.timestamp - b.timestamp);
    
    const volumes = sorted.map(tx => tx.value_usd);
    
    // Calculate moving averages
    const shortMA = movingAverage(volumes, 5);
    const longMA = movingAverage(volumes, 10);
    const ema = exponentialMovingAverage(volumes, 0.3);
    
    // Detect trend direction
    const shortCurrent = shortMA[shortMA.length - 1];
    const longCurrent = longMA[longMA.length - 1];
    const emaCurrent = ema[ema.length - 1];
    
    let trend = 'neutral';
    let confidence = 0;
    
    if (shortCurrent > longCurrent && emaCurrent > longCurrent) {
        trend = 'bullish';
        confidence = Math.min(0.95, 0.6 + ((shortCurrent - longCurrent) / longCurrent));
    } else if (shortCurrent < longCurrent && emaCurrent < longCurrent) {
        trend = 'bearish';
        confidence = Math.min(0.95, 0.6 + ((longCurrent - shortCurrent) / longCurrent));
    } else {
        trend = 'neutral';
        confidence = 0.5;
    }
    
    // Generate predictions
    const predictions = [];
    const lastVolume = volumes[volumes.length - 1];
    const avgChange = (emaCurrent - ema[0]) / ema.length;
    
    for (let i = 1; i <= 3; i++) {
        const predictedVolume = lastVolume + (avgChange * i);
        predictions.push({
            timeframe: i === 1 ? '1h' : i === 2 ? '4h' : '24h',
            predicted_volume_usd: Math.max(0, Math.floor(predictedVolume)),
            trend_direction: trend,
            confidence: (confidence * (1 - i * 0.1)).toFixed(2)
        });
    }
    
    return {
        trend,
        confidence: confidence.toFixed(2),
        short_ma: Math.floor(shortCurrent),
        long_ma: Math.floor(longCurrent),
        ema: Math.floor(emaCurrent),
        predictions
    };
}

// Anomaly Detection menggunakan z-scores
function detectAnomalies(transactions: Transaction[]): any {
    if (transactions.length < 5) {
        return { anomalies: [], threshold_used: 0 };
    }
    
    const volumes = transactions.map(tx => tx.value_usd);
    const mean = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const stdDev = standardDeviation(volumes);
    
    const anomalies = [];
    const threshold = 2.5; // Z-score threshold for anomalies
    
    transactions.forEach((tx, index) => {
        const z = zScore(tx.value_usd, mean, stdDev);
        
        if (Math.abs(z) > threshold) {
            anomalies.push({
                transaction_id: tx.id,
                address: tx.from_address,
                value_usd: tx.value_usd,
                z_score: z.toFixed(2),
                severity: Math.abs(z) > 3 ? 'high' : 'medium',
                deviation_from_mean: ((tx.value_usd - mean) / mean * 100).toFixed(2) + '%',
                timestamp: tx.created_at
            });
        }
    });
    
    return {
        anomalies: anomalies.slice(0, 20), // Limit to top 20
        total_anomalies: anomalies.length,
        threshold_used: threshold,
        mean_volume: Math.floor(mean),
        std_deviation: Math.floor(stdDev)
    };
}

// Wallet Clustering Analysis menggunakan simple k-means alternative
function clusterWallets(transactions: Transaction[], k: number = 3): any {
    // Extract wallet behaviors
    const walletMap = new Map<string, WalletBehavior>();
    
    transactions.forEach(tx => {
        const addr = tx.from_address;
        if (!walletMap.has(addr)) {
            walletMap.set(addr, {
                address: addr,
                txCount: 0,
                totalVolume: 0,
                avgVolume: 0,
                frequency: 0,
                timeSpread: 0
            });
        }
        
        const wallet = walletMap.get(addr)!;
        wallet.txCount++;
        wallet.totalVolume += tx.value_usd;
    });
    
    // Calculate derived metrics
    const wallets: WalletBehavior[] = Array.from(walletMap.values());
    wallets.forEach(w => {
        w.avgVolume = w.totalVolume / w.txCount;
    });
    
    if (wallets.length < k) {
        k = Math.max(1, wallets.length);
    }
    
    // Simple clustering based on volume and frequency
    // Normalize features
    const volumes = wallets.map(w => w.avgVolume);
    const counts = wallets.map(w => w.txCount);
    
    const maxVol = Math.max(...volumes);
    const maxCount = Math.max(...counts);
    
    const normalized = wallets.map(w => ({
        wallet: w,
        features: [
            w.avgVolume / maxVol,
            w.txCount / maxCount
        ]
    }));
    
    // Initialize centroids (evenly spaced)
    const centroids = [];
    for (let i = 0; i < k; i++) {
        const ratio = i / (k - 1 || 1);
        centroids.push([ratio, ratio]);
    }
    
    // Simple k-means iterations (5 iterations)
    for (let iter = 0; iter < 5; iter++) {
        // Assign to nearest centroid
        const clusters: any[] = Array.from({ length: k }, () => []);
        
        normalized.forEach(item => {
            let minDist = Infinity;
            let clusterIdx = 0;
            
            centroids.forEach((centroid, idx) => {
                const dist = Math.sqrt(
                    Math.pow(item.features[0] - centroid[0], 2) +
                    Math.pow(item.features[1] - centroid[1], 2)
                );
                
                if (dist < minDist) {
                    minDist = dist;
                    clusterIdx = idx;
                }
            });
            
            clusters[clusterIdx].push(item);
        });
        
        // Update centroids
        clusters.forEach((cluster, idx) => {
            if (cluster.length > 0) {
                const sumFeatures = cluster.reduce((sum: number[], item: any) => {
                    sum[0] += item.features[0];
                    sum[1] += item.features[1];
                    return sum;
                }, [0, 0]);
                
                centroids[idx] = [
                    sumFeatures[0] / cluster.length,
                    sumFeatures[1] / cluster.length
                ];
            }
        });
    }
    
    // Final assignment
    const finalClusters: any[] = Array.from({ length: k }, () => ({ wallets: [], characteristics: {} }));
    
    normalized.forEach(item => {
        let minDist = Infinity;
        let clusterIdx = 0;
        
        centroids.forEach((centroid, idx) => {
            const dist = Math.sqrt(
                Math.pow(item.features[0] - centroid[0], 2) +
                Math.pow(item.features[1] - centroid[1], 2)
            );
            
            if (dist < minDist) {
                minDist = dist;
                clusterIdx = idx;
            }
        });
        
        finalClusters[clusterIdx].wallets.push({
            address: item.wallet.address,
            avg_volume: Math.floor(item.wallet.avgVolume),
            transaction_count: item.wallet.txCount,
            total_volume: Math.floor(item.wallet.totalVolume)
        });
    });
    
    // Calculate cluster characteristics
    finalClusters.forEach((cluster, idx) => {
        if (cluster.wallets.length > 0) {
            const avgVol = cluster.wallets.reduce((sum: number, w: any) => sum + w.avg_volume, 0) / cluster.wallets.length;
            const avgTxCount = cluster.wallets.reduce((sum: number, w: any) => sum + w.transaction_count, 0) / cluster.wallets.length;
            
            // Classify cluster type
            let type = 'medium_activity';
            if (avgVol > maxVol * 0.6 || avgTxCount > maxCount * 0.6) {
                type = 'high_activity_whales';
            } else if (avgVol < maxVol * 0.3 && avgTxCount < maxCount * 0.3) {
                type = 'low_activity_participants';
            }
            
            cluster.characteristics = {
                type,
                avg_volume_usd: Math.floor(avgVol),
                avg_transaction_count: Math.floor(avgTxCount),
                wallet_count: cluster.wallets.length
            };
        }
    });
    
    return {
        clusters: finalClusters.filter(c => c.wallets.length > 0),
        total_wallets_analyzed: wallets.length,
        cluster_count: k
    };
}

// ===========================
// Main Edge Function
// ===========================

Deno.serve(async (req: Request) => {
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

        const { action, timeframe, blockchain, address, limit } = await req.json();

        // Fetch historical transactions for analysis
        let queryUrl = `${supabaseUrl}/rest/v1/whale_transactions?order=created_at.desc&limit=${limit || 500}`;
        
        if (blockchain) {
            queryUrl += `&blockchain=eq.${blockchain}`;
        }

        const txResponse = await fetch(queryUrl, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        let transactions: Transaction[] = [];
        if (txResponse.ok) {
            transactions = await txResponse.json();
        }

        let result;

        switch (action) {
            case 'analyze_patterns': {
                // Historical pattern analysis untuk whale behavior
                const patterns = detectWhalePatterns(transactions);
                
                result = {
                    patterns,
                    analyzed_transactions: transactions.length,
                    timeframe: timeframe || 'all',
                    analysis_timestamp: new Date().toISOString()
                };
                break;
            }

            case 'calculate_risk': {
                // Risk scoring algorithm
                const riskAssessment = calculateRiskScore(transactions, address);
                
                result = {
                    ...riskAssessment,
                    address: address || 'all',
                    transactions_analyzed: transactions.length,
                    timestamp: new Date().toISOString()
                };
                break;
            }

            case 'predict_trends': {
                // Trend detection untuk predictions
                const trendAnalysis = detectTrends(transactions);
                
                result = {
                    ...trendAnalysis,
                    blockchain: blockchain || 'all',
                    data_points: transactions.length,
                    timestamp: new Date().toISOString()
                };
                break;
            }

            case 'detect_anomalies': {
                // Anomaly detection untuk suspicious activities
                const anomalyAnalysis = detectAnomalies(transactions);
                
                result = {
                    ...anomalyAnalysis,
                    blockchain: blockchain || 'all',
                    timestamp: new Date().toISOString()
                };
                break;
            }

            case 'cluster_wallets': {
                // Wallet clustering analysis
                const clusterCount = 3; // Default 3 clusters
                const clusterAnalysis = clusterWallets(transactions, clusterCount);
                
                result = {
                    ...clusterAnalysis,
                    blockchain: blockchain || 'all',
                    timestamp: new Date().toISOString()
                };
                break;
            }

            case 'comprehensive_analysis': {
                // All analyses combined
                const patterns = detectWhalePatterns(transactions);
                const risk = calculateRiskScore(transactions);
                const trends = detectTrends(transactions);
                const anomalies = detectAnomalies(transactions);
                const clusters = clusterWallets(transactions);
                
                result = {
                    patterns,
                    risk_assessment: risk,
                    trend_analysis: trends,
                    anomaly_detection: anomalies,
                    wallet_clusters: clusters,
                    total_transactions: transactions.length,
                    timestamp: new Date().toISOString()
                };
                break;
            }

            case 'dashboard_stats': {
                // Get comprehensive dashboard statistics (backwards compatibility)
                result = {
                    overview: {
                        total_transactions: transactions.length,
                        total_volume_usd: transactions.reduce((sum, tx) => sum + (tx.value_usd || 0), 0),
                        unique_whales: new Set(transactions.map(tx => tx.from_address)).size,
                        avg_whale_score: transactions.length > 0 
                            ? Math.floor(transactions.reduce((sum, tx) => sum + (tx.whale_score || 0), 0) / transactions.length)
                            : 0
                    },
                    blockchain_distribution: transactions.reduce((acc: any, tx) => {
                        acc[tx.blockchain] = (acc[tx.blockchain] || 0) + 1;
                        return acc;
                    }, {}),
                    risk_distribution: transactions.reduce((acc: any, tx) => {
                        acc[tx.risk_level] = (acc[tx.risk_level] || 0) + 1;
                        return acc;
                    }, {})
                };
                break;
            }

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Analytics engine error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        return new Response(JSON.stringify({
            error: {
                code: 'ANALYTICS_ENGINE_ERROR',
                message: errorMessage
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
