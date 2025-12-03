'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { InteractiveBackground } from '@/components/InteractiveBackground';
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Zap,
  Moon,
  Sun,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  whale_threshold: number;
  risk_level: string;
  preferred_chains: string[];
  theme: string;
  auto_refresh: boolean;
  refresh_interval: number;
  created_at: string;
  updated_at: string;
}

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  
  // Settings state
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [whaleThreshold, setWhaleThreshold] = useState(100000);
  const [riskLevel, setRiskLevel] = useState('medium');
  const [preferredChains, setPreferredChains] = useState<string[]>(['ethereum', 'polygon', 'arbitrum']);
  const [theme, setTheme] = useState('dark');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
      }
      setEmail(user.email || '');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setMessage({ type: 'error', text: 'Gagal memuat profil' });
    }
  }, [user]);

  // Fetch settings data
  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
        setEmailNotifications(data.email_notifications);
        setPushNotifications(data.push_notifications);
        setWhaleThreshold(data.whale_threshold);
        setRiskLevel(data.risk_level);
        setPreferredChains(data.preferred_chains || ['ethereum']);
        setTheme(data.theme || 'dark');
        setAutoRefresh(data.auto_refresh);
        setRefreshInterval(data.refresh_interval);
      } else {
        // Create default settings if not exists
        await createDefaultSettings();
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setMessage({ type: 'error', text: 'Gagal memuat pengaturan' });
    }
  }, [user]);

  // Create default settings for new users
  const createDefaultSettings = async () => {
    if (!user) return;

    const defaultSettings = {
      user_id: user.id,
      email_notifications: true,
      push_notifications: true,
      whale_threshold: 100000,
      risk_level: 'medium',
      preferred_chains: ['ethereum', 'polygon', 'arbitrum'],
      theme: 'dark',
      auto_refresh: true,
      refresh_interval: 30
    };

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert([defaultSettings])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error creating default settings:', err);
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchSettings()]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user, fetchProfile, fetchSettings]);

  // Save profile
  const saveProfile = async () => {
    if (!user) return;

    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Update email if changed (requires re-auth)
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email
        });

        if (emailError) throw emailError;
      }

      return true;
    } catch (err) {
      console.error('Error saving profile:', err);
      throw err;
    }
  };

  // Save settings
  const saveSettings = async () => {
    if (!user) return;

    try {
      const settingsData = {
        user_id: user.id,
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        whale_threshold: whaleThreshold,
        risk_level: riskLevel,
        preferred_chains: preferredChains,
        theme: theme,
        auto_refresh: autoRefresh,
        refresh_interval: refreshInterval,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert(settingsData, { onConflict: 'user_id' });

      if (error) throw error;

      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      throw err;
    }
  };

  // Handle save all
  const handleSaveAll = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await Promise.all([saveProfile(), saveSettings()]);
      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
      
      // Refresh data
      await Promise.all([fetchProfile(), fetchSettings()]);
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan: ' + (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  // Handle chain selection
  const toggleChain = (chain: string) => {
    if (preferredChains.includes(chain)) {
      if (preferredChains.length > 1) {
        setPreferredChains(preferredChains.filter(c => c !== chain));
      }
    } else {
      setPreferredChains([...preferredChains, chain]);
    }
  };

  const availableChains = [
    { id: 'ethereum', name: 'Ethereum', color: 'blue' },
    { id: 'polygon', name: 'Polygon', color: 'purple' },
    { id: 'arbitrum', name: 'Arbitrum', color: 'cyan' },
    { id: 'optimism', name: 'Optimism', color: 'red' },
    { id: 'bsc', name: 'BSC', color: 'yellow' }
  ];

  const riskLevels = [
    { id: 'low', name: 'Low Risk', description: 'Hanya whale sangat besar (>$1M)' },
    { id: 'medium', name: 'Medium Risk', description: 'Whale menengah dan besar (>$100K)' },
    { id: 'high', name: 'High Risk', description: 'Semua aktivitas whale (>$10K)' }
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
          <Navigation />
          <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-[#01F4D4] animate-spin" />
                <span className="ml-3 text-gray-400">Memuat pengaturan...</span>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navigation />
        <InteractiveBackground />
        
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Pengaturan</h1>
                <p className="text-gray-400">Kelola akun dan preferensi Anda</p>
              </div>
              <button
                onClick={() => { fetchProfile(); fetchSettings(); }}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {/* Status Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                message.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : 'bg-red-500/20 border border-red-500/30 text-red-400'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <div className="space-y-6">
              {/* Profile Settings */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-[#01F4D4]/20 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-[#01F4D4]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Profil</h2>
                    <p className="text-sm text-gray-400">Informasi akun Anda</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Masukkan nama tampilan"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-[#01F4D4] focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-[#01F4D4] focus:outline-none transition-all"
                    />
                    {email !== user?.email && (
                      <p className="mt-2 text-sm text-yellow-400">
                        Mengubah email akan memerlukan verifikasi ulang
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <p className="text-sm text-gray-500">
                      Akun dibuat: {profile?.created_at ? (() => {
                        try {
                          const date = new Date(profile.created_at);
                          if (isNaN(date.getTime())) {
                            return 'Invalid date';
                          }
                          return date.toLocaleDateString('id-ID', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          });
                        } catch (error) {
                          return 'Invalid date';
                        }
                      })() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-[#00FAF4]/20 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-[#00FAF4]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Notifikasi</h2>
                    <p className="text-sm text-gray-400">Atur preferensi notifikasi</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-gray-400">Terima notifikasi via email</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="w-5 h-5 accent-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                    <div>
                      <div className="font-medium">Push Notifications</div>
                      <div className="text-sm text-gray-400">Notifikasi real-time di browser</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={pushNotifications}
                      onChange={(e) => setPushNotifications(e.target.checked)}
                      className="w-5 h-5 accent-blue-500"
                    />
                  </label>
                </div>
              </div>

              {/* Alert Settings */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-[#01F4D4]/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#01F4D4]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Pengaturan Alert</h2>
                    <p className="text-sm text-gray-400">Konfigurasi threshold dan sensitivitas</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Whale Threshold */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Whale Threshold (USD)
                    </label>
                    <input
                      type="number"
                      value={whaleThreshold}
                      onChange={(e) => setWhaleThreshold(parseInt(e.target.value) || 10000)}
                      min="1000"
                      step="10000"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-[#01F4D4] focus:outline-none transition-all"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Transaksi di atas nilai ini akan memicu alert. Minimum: $1,000
                    </p>
                  </div>

                  {/* Risk Level */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Risk Level</label>
                    <div className="space-y-3">
                      {riskLevels.map((level) => (
                        <label
                          key={level.id}
                          className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                            riskLevel === level.id
                              ? 'bg-[#01F4D4]/20 border-2 border-[#01F4D4]'
                              : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                          }`}
                        >
                          <input
                            type="radio"
                            name="riskLevel"
                            value={level.id}
                            checked={riskLevel === level.id}
                            onChange={(e) => setRiskLevel(e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{level.name}</div>
                            <div className="text-sm text-gray-400">{level.description}</div>
                          </div>
                          {riskLevel === level.id && (
                            <CheckCircle className="w-5 h-5 text-[#01F4D4]" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Chains */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Blockchain Networks</label>
                    <div className="flex flex-wrap gap-3">
                      {availableChains.map((chain) => (
                        <button
                          key={chain.id}
                          onClick={() => toggleChain(chain.id)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            preferredChains.includes(chain.id)
                              ? 'bg-[#01F4D4]/20 border border-[#01F4D4] text-[#01F4D4]'
                              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {chain.name}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Pilih blockchain yang ingin Anda pantau. Minimal satu harus dipilih.
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Settings */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-[#01F4D4]/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#01F4D4]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Performa</h2>
                    <p className="text-sm text-gray-400">Optimasi kecepatan dan performa</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                    <div>
                      <div className="font-medium">Auto Refresh</div>
                      <div className="text-sm text-gray-400">Refresh data secara otomatis</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="w-5 h-5 accent-blue-500"
                    />
                  </label>

                  {autoRefresh && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Interval Refresh (detik)
                      </label>
                      <input
                        type="number"
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 30)}
                        min="10"
                        max="300"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-[#01F4D4] focus:outline-none transition-all"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Rentang: 10-300 detik. Interval lebih pendek = data lebih real-time
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Theme Settings */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-[#00FAF4]/20 rounded-lg flex items-center justify-center">
                    <Moon className="w-5 h-5 text-[#00FAF4]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Tema</h2>
                    <p className="text-sm text-gray-400">Sesuaikan tampilan aplikasi</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-[#01F4D4] bg-[#01F4D4]/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <Moon className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Dark</div>
                  </button>

                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'light'
                        ? 'border-[#01F4D4] bg-[#01F4D4]/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <Sun className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Light</div>
                  </button>

                  <button
                    onClick={() => setTheme('auto')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'auto'
                        ? 'border-[#01F4D4] bg-[#01F4D4]/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <SettingsIcon className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Auto</div>
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-[#01F4D4] to-[#00FAF4] text-black rounded-lg font-semibold hover:shadow-xl hover:shadow-[#01F4D4]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Simpan Pengaturan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
