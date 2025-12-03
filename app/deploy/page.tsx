'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAgents } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { InteractiveBackground } from '@/components/InteractiveBackground';
import { 
  Rocket, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Settings,
  Shield,
  Clock,
  Bell,
  Bot,
  Zap,
  Activity,
  AlertTriangle,
  Eye,
  Lock
} from 'lucide-react';

const agentTypes = [
  { 
    type: 'whale_tracker', 
    name: 'Whale Tracker', 
    description: 'Monitor large whale transactions and track wallet movements',
    icon: Activity,
    color: 'blue'
  },
  { 
    type: 'alert_system', 
    name: 'Alert System', 
    description: 'Send real-time notifications when threshold is reached',
    icon: Bell,
    color: 'yellow'
  },
  { 
    type: 'analyzer', 
    name: 'Pattern Analyzer', 
    description: 'Analyze trading patterns and detect anomalies',
    icon: Eye,
    color: 'purple'
  },
  { 
    type: 'mev_detector', 
    name: 'MEV Detector', 
    description: 'Deteksi aktivitas MEV dan sandwich attack',
    icon: AlertTriangle,
    color: 'red'
  },
  { 
    type: 'bridge_monitor', 
    name: 'Bridge Monitor', 
    description: 'Monitor cross-chain bridge dan liquidity movement',
    icon: Zap,
    color: 'green'
  }
];

const blockchains = [
  { id: 'ethereum', name: 'Ethereum', icon: '/eth.svg' },
  { id: 'polygon', name: 'Polygon', icon: '/polygon.svg' },
  { id: 'arbitrum', name: 'Arbitrum', icon: '/arb.svg' },
  { id: 'optimism', name: 'Optimism', icon: '/op.svg' },
  { id: 'bsc', name: 'BSC', icon: '/bsc.svg' }
];

const thresholds = [
  { value: 100, label: '$100K+ (Frequent alerts)' },
  { value: 500, label: '$500K+ (Standard)' },
  { value: 1000, label: '$1M+ (Large transactions only)' },
  { value: 5000, label: '$5M+ (Whale movements only)' }
];

function DeployContent() {
  const router = useRouter();
  const { deployAgent } = useAgents();
  const [step, setStep] = useState(1);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [deployedAgent, setDeployedAgent] = useState<any>(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'whale_tracker',
    description: '',
    selectedBlockchains: ['ethereum'],
    threshold: 500,
    enableAlerts: true,
    enableZKProof: true
  });

  const handleDeploy = async () => {
    setDeploying(true);
    setError('');
    
    try {
      const agentData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        configuration: {
          blockchains: formData.selectedBlockchains,
          threshold: formData.threshold,
          enableAlerts: formData.enableAlerts,
          enableZKProof: formData.enableZKProof
        }
      };

      const { data, error } = await deployAgent(agentData);
      
      if (error) {
        setError(error.message);
      } else {
        setDeployedAgent(data?.[0] || data);
        setDeployed(true);
      }
    } catch (err) {
      setError('Gagal deploy agent. Silakan coba lagi.');
    } finally {
      setDeploying(false);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleDeploy();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    if (step === 1) return formData.name.trim().length > 0;
    if (step === 2) return formData.selectedBlockchains.length > 0;
    return true;
  };

  const toggleBlockchain = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedBlockchains: prev.selectedBlockchains.includes(id)
        ? prev.selectedBlockchains.filter(b => b !== id)
        : [...prev.selectedBlockchains, id]
    }));
  };

  if (deployed && deployedAgent) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-12 text-center"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Agent Successfully Deployed!</h2>
            <p className="text-gray-400 mb-6">
              Your AI agent is now active and starting to monitor whale activity.
            </p>
            <div className="glass rounded-xl p-6 mb-8 text-left">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">Agent Name</div>
                  <div className="font-medium">{deployedAgent.name}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Type</div>
                  <div className="font-medium capitalize">{deployedAgent.type.replace('_', ' ')}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Status</div>
                  <div className="font-medium text-green-400 capitalize">{deployedAgent.status}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Region</div>
                  <div className="font-medium">{deployedAgent.deployment_info?.region || 'us-east-1'}</div>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-6 py-3 glass rounded-lg font-semibold hover:bg-white/10 transition-all"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push('/agents')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                View Agents
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <InteractiveBackground />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Deploy AI Agent</h1>
          <p className="text-gray-400">Create a whale monitoring agent in a few easy steps</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                s === step ? 'bg-blue-500 text-white' :
                s < step ? 'bg-green-500 text-white' :
                'bg-white/10 text-gray-400'
              }`}>
                {s < step ? <CheckCircle className="w-6 h-6" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-20 h-1 mx-2 transition-all ${
                  s < step ? 'bg-green-500' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass rounded-2xl p-8"
        >
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Informasi Dasar</h2>
                  <p className="text-gray-400">Pilih tipe agent dan beri nama</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Agent</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Ethereum Whale Tracker"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Tipe Agent</label>
                  <div className="grid gap-3">
                    {agentTypes.map((agent) => {
                      const Icon = agent.icon;
                      const isSelected = formData.type === agent.type;
                      return (
                        <label
                          key={agent.type}
                          className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-500/20 border-blue-500'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <input
                            type="radio"
                            name="agentType"
                            value={agent.type}
                            checked={isSelected}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="sr-only"
                          />
                          <div className={`w-10 h-10 bg-${agent.color}-500/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0`}>
                            <Icon className={`w-5 h-5 text-${agent.color}-400`} />
                          </div>
                          <div>
                            <div className="font-semibold">{agent.name}</div>
                            <div className="text-sm text-gray-400">{agent.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Deskripsi (Opsional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Jelaskan tujuan agent ini..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configuration */}
          {step === 2 && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Konfigurasi Monitoring</h2>
                  <p className="text-gray-400">Pilih blockchain dan threshold</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Blockchain (Pilih satu atau lebih)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {blockchains.map((chain) => {
                      const isSelected = formData.selectedBlockchains.includes(chain.id);
                      return (
                        <button
                          key={chain.id}
                          type="button"
                          onClick={() => toggleBlockchain(chain.id)}
                          className={`p-4 rounded-lg border text-center transition-all ${
                            isSelected
                              ? 'bg-blue-500/20 border-blue-500'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="font-medium">{chain.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Threshold Transaksi (USD)</label>
                  <div className="space-y-2">
                    {thresholds.map((t) => (
                      <label
                        key={t.value}
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                          formData.threshold === t.value
                            ? 'bg-blue-500/20 border-blue-500'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <input
                          type="radio"
                          name="threshold"
                          value={t.value}
                          checked={formData.threshold === t.value}
                          onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) })}
                          className="mr-3"
                        />
                        <span>{t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer p-4 bg-white/5 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.enableAlerts}
                      onChange={(e) => setFormData({ ...formData, enableAlerts: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <Bell className="w-4 h-4 text-yellow-400" />
                        Enable Real-time Alerts
                      </div>
                      <div className="text-sm text-gray-400">Terima notifikasi saat threshold tercapai</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Privacy & Review */}
          {step === 3 && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Review & Deploy</h2>
                  <p className="text-gray-400">Periksa konfigurasi dan deploy agent</p>
                </div>
              </div>

              {/* Summary */}
              <div className="glass rounded-xl p-6 mb-6">
                <h3 className="font-semibold mb-4">Ringkasan Konfigurasi</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">Nama Agent</div>
                    <div className="font-medium">{formData.name}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Tipe</div>
                    <div className="font-medium capitalize">{formData.type.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Blockchain</div>
                    <div className="font-medium">{formData.selectedBlockchains.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Threshold</div>
                    <div className="font-medium">${formData.threshold}K+</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Alerts</div>
                    <div className="font-medium">{formData.enableAlerts ? 'Active' : 'Inactive'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">ZK-Proof</div>
                    <div className="font-medium">{formData.enableZKProof ? 'Active' : 'Inactive'}</div>
                  </div>
                </div>
              </div>

              {/* ZK-Proof Option */}
              <div className="mb-6">
                <label className="flex items-center space-x-3 cursor-pointer p-4 bg-white/5 rounded-lg border border-white/10">
                  <input
                    type="checkbox"
                    checked={formData.enableZKProof}
                    onChange={(e) => setFormData({ ...formData, enableZKProof: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-green-400" />
                      Enable Zero-Knowledge Proof
                    </div>
                    <div className="text-sm text-gray-400">Verifikasi transaksi dengan ZK-proof untuk privasi maksimal</div>
                  </div>
                </label>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <strong>Zero-Knowledge Technology:</strong> Agent akan menggunakan teknologi ZK-proof untuk memverifikasi transaksi tanpa mengungkap data sensitif.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/10">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="px-6 py-3 glass rounded-lg font-semibold hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Kembali</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              disabled={!canProceed() || deploying}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {deploying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deploying...</span>
                </>
              ) : step < 3 ? (
                <>
                  <span>Lanjut</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  <span>Deploy Agent</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function DeployPage() {
  return (
    <ProtectedRoute>
      <Navigation />
      <DeployContent />
    </ProtectedRoute>
  );
}
