'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Zap,
  Moon,
  Sun,
  Save,
  CheckCircle
} from 'lucide-react';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    // Profile
    displayName: 'Whale Hunter',
    email: 'user@zkwatch.io',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    alertThreshold: true,
    weeklyReport: true,
    
    // Privacy
    profileVisibility: 'public' as 'public' | 'private',
    shareAnalytics: false,
    zkProofValidation: true,
    
    // Performance
    autoRefresh: true,
    refreshInterval: 30,
    maxDisplayTransactions: 50,
    
    // Theme
    theme: 'dark' as 'dark' | 'light' | 'auto'
  });

  const handleSave = () => {
    // Simulate save
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Pengaturan</h1>
            <p className="text-gray-400">Kelola preferensi dan konfigurasi akun Anda</p>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Profil</h2>
                  <p className="text-sm text-gray-400">Informasi akun Anda</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Tampilan</label>
                  <input
                    type="text"
                    value={settings.displayName}
                    onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-400" />
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
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-gray-400">Notifikasi browser real-time</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                  <div>
                    <div className="font-medium">Alert Threshold</div>
                    <div className="text-sm text-gray-400">Notifikasi saat threshold tercapai</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.alertThreshold}
                    onChange={(e) => setSettings({ ...settings, alertThreshold: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                  <div>
                    <div className="font-medium">Weekly Report</div>
                    <div className="text-sm text-gray-400">Laporan mingguan via email</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.weeklyReport}
                    onChange={(e) => setSettings({ ...settings, weeklyReport: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Privasi & Keamanan</h2>
                  <p className="text-sm text-gray-400">Kontrol data dan privasi Anda</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Visibilitas Profil</label>
                  <select
                    value={settings.profileVisibility}
                    onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value as 'public' | 'private' })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                  >
                    <option value="public">Public - Terlihat oleh semua</option>
                    <option value="private">Private - Hanya Anda</option>
                  </select>
                </div>

                <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                  <div>
                    <div className="font-medium">Share Analytics</div>
                    <div className="text-sm text-gray-400">Bagikan analytics dengan komunitas</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.shareAnalytics}
                    onChange={(e) => setSettings({ ...settings, shareAnalytics: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg cursor-pointer">
                  <div>
                    <div className="font-medium">ZK-Proof Validation</div>
                    <div className="text-sm text-gray-400">Aktifkan validasi zero-knowledge (Disarankan)</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.zkProofValidation}
                    onChange={(e) => setSettings({ ...settings, zkProofValidation: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </div>

            {/* Performance Settings */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-400" />
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
                    <div className="text-sm text-gray-400">Refresh data otomatis</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={(e) => setSettings({ ...settings, autoRefresh: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>

                {settings.autoRefresh && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Interval Refresh (detik)
                    </label>
                    <input
                      type="number"
                      value={settings.refreshInterval}
                      onChange={(e) => setSettings({ ...settings, refreshInterval: parseInt(e.target.value) || 30 })}
                      min="10"
                      max="300"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Maksimal Transaksi Ditampilkan
                  </label>
                  <input
                    type="number"
                    value={settings.maxDisplayTransactions}
                    onChange={(e) => setSettings({ ...settings, maxDisplayTransactions: parseInt(e.target.value) || 50 })}
                    min="10"
                    max="100"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <Moon className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Tema</h2>
                  <p className="text-sm text-gray-400">Sesuaikan tampilan aplikasi</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setSettings({ ...settings, theme: 'dark' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.theme === 'dark'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Moon className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Dark</div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, theme: 'light' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.theme === 'light'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Sun className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Light</div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, theme: 'auto' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.theme === 'auto'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <SettingsIcon className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Auto</div>
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saved}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {saved ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Tersimpan!</span>
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
  );
}
