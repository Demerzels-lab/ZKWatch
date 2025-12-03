'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAgents } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { InteractiveBackground } from '@/components/InteractiveBackground';
import { 
  Rocket, CheckCircle, ArrowRight, ArrowLeft, Settings, 
  Shield, Bell, Bot, Zap, Activity, AlertTriangle, Eye, Lock 
} from 'lucide-react';

const agentTypes = [
  { 
    type: 'whale_tracker', 
    name: 'Whale Tracker', 
    description: 'Monitor large whale transactions and track wallet movements',
    icon: Activity
  },
  { 
    type: 'alert_system', 
    name: 'Alert System', 
    description: 'Send real-time notifications when threshold is reached',
    icon: Bell
  },
  { 
    type: 'analyzer', 
    name: 'Pattern Analyzer', 
    description: 'Analyze trading patterns and detect anomalies',
    icon: Eye
  },
  { 
    type: 'mev_detector', 
    name: 'MEV Detector', 
    description: 'Detect MEV activity and sandwich attacks',
    icon: AlertTriangle
  },
  { 
    type: 'bridge_monitor', 
    name: 'Bridge Monitor', 
    description: 'Monitor cross-chain bridge and liquidity movement',
    icon: Zap
  }
];

const blockchains = [
  { id: 'ethereum', name: 'Ethereum' },
  { id: 'polygon', name: 'Polygon' },
  { id: 'arbitrum', name: 'Arbitrum' },
  { id: 'optimism', name: 'Optimism' },
  { id: 'bsc', name: 'BSC' }
];

export default function DeployPage() {
  return (
    <ProtectedRoute>
      <Navigation />
      <DeployContent />
    </ProtectedRoute>
  );
}

function DeployContent() {
  const router = useRouter();
  const { deployAgent } = useAgents();
  const [step, setStep] = useState(1);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
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
      // Ensure data structure aligns with Backend/supabase/functions/agent-deployment/index.ts
      const agentPayload = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        configuration: {
          blockchains: formData.selectedBlockchains,
          threshold: formData.threshold * 1000, // Convert K to value
          enableAlerts: formData.enableAlerts,
          enableZKProof: formData.enableZKProof
        }
      };

      const { data, error } = await deployAgent(agentPayload);
      
      if (error) {
        throw new Error(error.message);
      } else {
        setDeployed(true);
      }
    } catch (err: any) {
      setError(err.message || 'Deployment failed. Please try again.');
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <InteractiveBackground />
      <div className="max-w-3xl mx-auto">
        {/* Success State */}
        {deployed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-12 text-center border border-primary/20"
          >
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(1,244,212,0.3)]">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white">Agent Deployed Successfully!</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Your <strong>{formData.name}</strong> is now active and monitoring the blockchain using ZK-proof verification.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-all text-white"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push('/agents')}
                className="px-6 py-3 bg-primary text-black rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                View Agents
              </button>
            </div>
          </motion.div>
        ) : (
          /* Form State */
          <>
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-2 text-gradient">Deploy AI Agent</h1>
              <p className="text-gray-400">Configure your autonomous whale monitoring sentinel</p>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center justify-center mb-12">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${
                    s === step ? 'bg-primary border-primary text-black' :
                    s < step ? 'bg-primary/20 border-primary text-primary' :
                    'bg-transparent border-white/20 text-gray-500'
                  }`}>
                    {s < step ? <CheckCircle className="w-5 h-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 h-0.5 mx-2 transition-all ${
                      s < step ? 'bg-primary' : 'bg-white/10'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass rounded-2xl p-8 border border-white/5"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Agent Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ethereum Whale Watcher"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-300">Agent Type</label>
                    <div className="grid gap-3">
                      {agentTypes.map((agent) => {
                        const Icon = agent.icon;
                        const isSelected = formData.type === agent.type;
                        return (
                          <label
                            key={agent.type}
                            className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-primary/10 border-primary'
                                : 'bg-white/5 border-white/5 hover:bg-white/10'
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
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 ${
                              isSelected ? 'bg-primary text-black' : 'bg-white/10 text-gray-400'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className={`font-semibold ${isSelected ? 'text-primary' : 'text-white'}`}>{agent.name}</div>
                              <div className="text-sm text-gray-400">{agent.description}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-300">Target Blockchains</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {blockchains.map((chain) => {
                        const isSelected = formData.selectedBlockchains.includes(chain.id);
                        return (
                          <button
                            key={chain.id}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                selectedBlockchains: isSelected 
                                  ? prev.selectedBlockchains.filter(id => id !== chain.id)
                                  : [...prev.selectedBlockchains, chain.id]
                              }));
                            }}
                            className={`p-4 rounded-xl border text-center transition-all font-medium ${
                              isSelected
                                ? 'bg-primary/20 border-primary text-primary'
                                : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-400'
                            }`}
                          >
                            {chain.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-300">Value Threshold ($USD)</label>
                    <div className="space-y-2">
                      {[100, 500, 1000, 5000].map((val) => (
                        <label key={val} className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                          formData.threshold === val ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/5'
                        }`}>
                          <input
                            type="radio"
                            name="threshold"
                            value={val}
                            checked={formData.threshold === val}
                            onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
                            className="mr-3 accent-primary"
                          />
                          <span className={formData.threshold === val ? 'text-white' : 'text-gray-400'}>
                            ${val}K+ {val >= 1000 ? '(Whale)' : '(Shark)'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                    <Shield className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-bold text-white">Privacy Configuration</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        ZKWatch uses Zero-Knowledge Proofs to verify transaction data validity without exposing the specific wallet addresses publicly unless configured otherwise.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium text-white">Enable ZK-Proof Verification</div>
                          <div className="text-xs text-gray-400">Cryptographically verify whale events</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.enableZKProof}
                        onChange={(e) => setFormData({ ...formData, enableZKProof: e.target.checked })}
                        className="w-5 h-5 accent-primary rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-yellow-400" />
                        <div>
                          <div className="font-medium text-white">Real-time Alerts</div>
                          <div className="text-xs text-gray-400">Push notifications for detections</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.enableAlerts}
                        onChange={(e) => setFormData({ ...formData, enableAlerts: e.target.checked })}
                        className="w-5 h-5 accent-yellow-400 rounded"
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/10">
                {step > 1 ? (
                  <button onClick={() => setStep(step - 1)} className="px-6 py-2 text-gray-400 hover:text-white flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : <div />}

                <button
                  onClick={step === 3 ? handleDeploy : () => setStep(step + 1)}
                  disabled={step === 1 && !formData.name || deploying}
                  className="px-8 py-3 bg-primary text-black rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {deploying ? 'Deploying...' : step === 3 ? 'Deploy Agent' : 'Continue'}
                  {!deploying && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}