
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

        const { action, agentId, agentData } = await req.json();

        let result;

        switch (action) {
            case 'deploy': {
                // Deploy a new agent or start existing agent
                if (agentId) {
                    // Start existing agent
                    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/agents?id=eq.${agentId}&user_id=eq.${userId}`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify({
                            status: 'running',
                            deployment_info: {
                                deployed_at: new Date().toISOString(),
                                instance_id: crypto.randomUUID(),
                                region: 'us-east-1'
                            },
                            last_activity: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                    });

                    if (!updateResponse.ok) {
                        throw new Error('Failed to deploy agent');
                    }

                    result = await updateResponse.json();
                } else {
                    // Create and deploy new agent
                    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/agents`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify({
                            user_id: userId,
                            name: agentData.name,
                            type: agentData.type || 'whale_tracker',
                            description: agentData.description,
                            status: 'running',
                            configuration: agentData.configuration || {},
                            deployment_info: {
                                deployed_at: new Date().toISOString(),
                                instance_id: crypto.randomUUID(),
                                region: 'us-east-1'
                            },
                            metrics: {
                                transactions_scanned: 0,
                                alerts_generated: 0,
                                uptime_seconds: 0
                            },
                            last_activity: new Date().toISOString()
                        })
                    });

                    if (!insertResponse.ok) {
                        const errorText = await insertResponse.text();
                        throw new Error(`Failed to create agent: ${errorText}`);
                    }

                    result = await insertResponse.json();
                }
                break;
            }

            case 'stop': {
                // Stop an agent
                const stopResponse = await fetch(`${supabaseUrl}/rest/v1/agents?id=eq.${agentId}&user_id=eq.${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        status: 'stopped',
                        updated_at: new Date().toISOString()
                    })
                });

                if (!stopResponse.ok) {
                    throw new Error('Failed to stop agent');
                }

                result = await stopResponse.json();
                break;
            }

            case 'delete': {
                // Delete an agent
                const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/agents?id=eq.${agentId}&user_id=eq.${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (!deleteResponse.ok) {
                    throw new Error('Failed to delete agent');
                }

                result = { success: true, message: 'Agent deleted' };
                break;
            }

            case 'status': {
                // Get agent status with metrics
                const statusResponse = await fetch(`${supabaseUrl}/rest/v1/agents?id=eq.${agentId}&user_id=eq.${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (!statusResponse.ok) {
                    throw new Error('Failed to get agent status');
                }

                const agents = await statusResponse.json();
                if (agents.length === 0) {
                    throw new Error('Agent not found');
                }

                // Simulate metrics update for running agents
                const agent = agents[0];
                if (agent.status === 'running') {
                    const deployedAt = new Date(agent.deployment_info?.deployed_at || agent.created_at);
                    const uptimeSeconds = Math.floor((Date.now() - deployedAt.getTime()) / 1000);
                    
                    agent.metrics = {
                        ...agent.metrics,
                        uptime_seconds: uptimeSeconds,
                        transactions_scanned: (agent.metrics?.transactions_scanned || 0) + Math.floor(Math.random() * 100),
                        alerts_generated: agent.metrics?.alerts_generated || Math.floor(Math.random() * 10)
                    };
                }

                result = agent;
                break;
            }

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Agent deployment error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'AGENT_DEPLOYMENT_ERROR',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
