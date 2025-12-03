import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase configuration for production
const supabaseUrl = 'https://fhwywghnhfrlndivdigl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZod3l3Z2huaGZybG5kaXZkaWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzU4NDksImV4cCI6MjA4MDI1MTg0OX0.lYQf_KplLp8X6d9SYS_WnUxZ95umcpnKZOFjGw_8Fm4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signInWithWallet = async (address: string) => {
  // In real implementation, this would handle wallet authentication
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${address}@zkwatch.local`,
    password: 'dummy-password'
  });

  if (error && error.message.includes('Invalid login credentials')) {
    // Try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: `${address}@zkwatch.local`,
      password: 'dummy-password',
      options: {
        data: {
          wallet_address: address
        }
      }
    });
    return { data: signUpData, error: signUpError };
  }

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Database helpers
export const saveAgent = async (agentData: any) => {
  const { data, error } = await supabase
    .from('agents')
    .insert([agentData]);

  return { data, error };
};

export const getAgents = async (userId: string) => {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', userId);

  return { data, error };
};

export const updateAgent = async (agentId: string, updates: any) => {
  const { data, error } = await supabase
    .from('agents')
    .update(updates)
    .eq('id', agentId);

  return { data, error };
};