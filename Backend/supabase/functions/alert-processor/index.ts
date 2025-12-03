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

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        const { action, alertId, alertData, filters } = await req.json();

        let result;

        switch (action) {
            case 'get_alerts': {
                // Get user alerts
                let queryUrl = `${supabaseUrl}/rest/v1/alerts?user_id=eq.${userId}&order=created_at.desc`;
                
                if (filters?.is_read !== undefined) {
                    queryUrl += `&is_read=eq.${filters.is_read}`;
                }
                
                if (filters?.type) {
                    queryUrl += `&type=eq.${filters.type}`;
                }
                
                if (filters?.severity) {
                    queryUrl += `&severity=eq.${filters.severity}`;
                }
                
                queryUrl += `&limit=${filters?.limit || 50}`;

                const alertsResponse = await fetch(queryUrl, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (!alertsResponse.ok) {
                    throw new Error('Failed to fetch alerts');
                }

                result = await alertsResponse.json();
                break;
            }

            case 'mark_read': {
                // Mark alert as read
                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/alerts?id=eq.${alertId}&user_id=eq.${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({ is_read: true })
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to mark alert as read');
                }

                result = await updateResponse.json();
                break;
            }

            case 'mark_all_read': {
                // Mark all alerts as read
                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/alerts?user_id=eq.${userId}&is_read=eq.false`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({ is_read: true })
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to mark all alerts as read');
                }

                result = { success: true, message: 'All alerts marked as read' };
                break;
            }

            case 'create_alert': {
                // Create a new alert (typically called by agents or system)
                const insertResponse = await fetch(`${supabaseUrl}/rest/v1/alerts`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        agent_id: alertData.agent_id,
                        title: alertData.title,
                        message: alertData.message,
                        type: alertData.type || 'whale_transaction',
                        severity: alertData.severity || 'info',
                        metadata: alertData.metadata || {}
                    })
                });

                if (!insertResponse.ok) {
                    throw new Error('Failed to create alert');
                }

                result = await insertResponse.json();
                break;
            }

            case 'delete_alert': {
                // Delete an alert
                const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/alerts?id=eq.${alertId}&user_id=eq.${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (!deleteResponse.ok) {
                    throw new Error('Failed to delete alert');
                }

                result = { success: true, message: 'Alert deleted' };
                break;
            }

            case 'get_unread_count': {
                // Get unread alert count
                const countResponse = await fetch(`${supabaseUrl}/rest/v1/alerts?user_id=eq.${userId}&is_read=eq.false&select=id`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Prefer': 'count=exact'
                    }
                });

                const count = countResponse.headers.get('content-range');
                const unreadCount = count ? parseInt(count.split('/')[1]) : 0;

                result = { unread_count: unreadCount };
                break;
            }

            case 'generate_test_alerts': {
                // Generate test alerts for demo purposes
                const alertTypes = ['whale_transaction', 'pattern_detected', 'threshold_breach', 'agent_status'];
                const severities = ['info', 'warning', 'critical'];
                const testAlerts = [];

                for (let i = 0; i < 5; i++) {
                    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
                    const severity = severities[Math.floor(Math.random() * severities.length)];
                    
                    testAlerts.push({
                        user_id: userId,
                        title: `[${type.toUpperCase()}] Alert ${i + 1}`,
                        message: `Demo alert generated at ${new Date().toISOString()}`,
                        type,
                        severity,
                        metadata: {
                            source: 'test_generator',
                            blockchain: ['ethereum', 'polygon', 'arbitrum'][Math.floor(Math.random() * 3)]
                        }
                    });
                }

                const insertResponse = await fetch(`${supabaseUrl}/rest/v1/alerts`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(testAlerts)
                });

                if (!insertResponse.ok) {
                    throw new Error('Failed to generate test alerts');
                }

                result = await insertResponse.json();
                break;
            }

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Alert processor error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'ALERT_PROCESSOR_ERROR',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
