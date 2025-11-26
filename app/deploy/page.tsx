'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useRouter } from 'next/navigation';
import { 
  Rocket, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Settings,
  Shield,
  Clock,
  Bell
} from 'lucide-react';
import { generateId } from '@/lib/utils';

const tokens = [
  { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000' },
  { symbol: 'USDT', name: 'Tether USD', address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
  { symbol: 'USDC', name: 'USD Coin', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
  { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6b175474e89094c44da98b954eedeac495271d0f' },
  { symbol: 'WETH', name: 'Wrapped Ether', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' }
];

const frequencies = [
  { value: 1, label: '1 minute - Very strict monitoring' },
  { value: 5, label: '5 minutes - Strict monitoring' },
  { value: 15, label: '15 minutes - Standard monitoring' },
  { value: 30, label: '30 minutes - Light monitoring' },
  { value: 60, label: '1 hour - Minimal monitoring' }
];

export default function Deploy() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [agentId, setAgentId] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    token: tokens[0],
    threshold: 100,
    frequency: 5,
    privacy: 'public' as 'public' | 'private',
    description: '',
    enableAlerts: true
  });

  const handleDeploy = async () => {
    setDeploying(true);
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 2000));
    const newAgentId = generateId('agent');
    setAgentId(newAgentId);
    setDeploying(false);
    setDeployed(true);
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
    if (step === 2) return formData.threshold > 0;
    return true;
  };

  if (deployed) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
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
                Your AI agent is now active and starts monitoring whale activity.
              </p>
              <div className="glass rounded-xl p-6 mb-8">
                <div className="text-sm text-gray-400 mb-2">Agent ID</div>
                <div className="text-2xl font-bold font-mono text-blue-400">{agentId}</div>
                <div className="mt-4 text-sm text-gray-400 mb-2">Agent Name</div>
                <div className="text-xl font-semibold">{formData.name}</div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Token</div>
                    <div className="font-medium">{formData.token.symbol}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Threshold</div>
                    <div className="font-medium">{formData.threshold} {formData.token.symbol}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Frequency</div>
                    <div className="font-medium">{formData.frequency} menit</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Privacy</div>
                    <div className="font-medium capitalize">{formData.privacy}</div>
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
                  View Agent
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Deploy AI Agent</h1>
            <p className="text-gray-400">Buat agent monitoring whale dalam beberapa langkah mudah</p>
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
                    <Settings className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Informasi Dasar</h2>
                    <p className="text-gray-400">Atur nama dan token yang akan dimonitor</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Agent Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Ethereum Whale Tracker"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Token</label>
                    <select
                      value={formData.token.symbol}
                      onChange={(e) => {
                        const token = tokens.find(t => t.symbol === e.target.value);
                        if (token) setFormData({ ...formData, token });
                      }}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                    >
                      {tokens.map(token => (
                        <option key={token.symbol} value={token.symbol}>
                          {token.symbol} - {token.name}
                        </option>
                      ))}
                    </select>
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
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Monitoring Configuration</h2>
                    <p className="text-gray-400">Set monitoring threshold and frequency</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Threshold ({formData.token.symbol})
                    </label>
                    <input
                      type="number"
                      value={formData.threshold}
                      onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) || 0 })}
                      placeholder="100"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      Alert will be sent when transaction exceeds this amount
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Monitoring Frequency</label>
                    <div className="space-y-2">
                      {frequencies.map(freq => (
                        <label
                          key={freq.value}
                          className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                            formData.frequency === freq.value
                              ? 'bg-blue-500/20 border-blue-500'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <input
                            type="radio"
                            name="frequency"
                            value={freq.value}
                            checked={formData.frequency === freq.value}
                            onChange={(e) => setFormData({ ...formData, frequency: parseInt(e.target.value) })}
                            className="mr-3"
                          />
                          <span>{freq.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.enableAlerts}
                        onChange={(e) => setFormData({ ...formData, enableAlerts: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <div>
                        <div className="font-medium">Enable Real-time Alerts</div>
                        <div className="text-sm text-gray-400">Receive notifications when threshold is reached</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Privacy */}
            {step === 3 && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Privacy Settings</h2>
                    <p className="text-gray-400">Choose your agent privacy level</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label
                    className={`flex items-start p-6 rounded-lg border cursor-pointer transition-all ${
                      formData.privacy === 'public'
                        ? 'bg-blue-500/20 border-blue-500'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value="public"
                      checked={formData.privacy === 'public'}
                      onChange={(e) => setFormData({ ...formData, privacy: e.target.value as 'public' | 'private' })}
                      className="mr-4 mt-1"
                    />
                    <div>
                      <div className="font-semibold text-lg mb-2">Public Agent</div>
                      <div className="text-sm text-gray-400">
                        Agent can be seen by other users. Transaction data is shared with the community with ZK-proof for verification.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start p-6 rounded-lg border cursor-pointer transition-all ${
                      formData.privacy === 'private'
                        ? 'bg-blue-500/20 border-blue-500'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value="private"
                      checked={formData.privacy === 'private'}
                      onChange={(e) => setFormData({ ...formData, privacy: e.target.value as 'public' | 'private' })}
                      className="mr-4 mt-1"
                    />
                    <div>
                      <div className="font-semibold text-lg mb-2">Private Agent</div>
                      <div className="text-sm text-gray-400">
                        Only you can see the agent and its data. All information is encrypted with zero-knowledge proof.
                      </div>
                    </div>
                  </label>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <strong>Zero-Knowledge Technology:</strong> Regardless of privacy choice, all transactions are verified with ZK-proof to ensure maximum security and privacy.
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
                  <span>Back</span>
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
                    <span>Continue</span>
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
    </div>
  );
}
