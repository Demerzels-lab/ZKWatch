'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { 
  Activity, 
  Shield, 
  TrendingUp, 
  Zap, 
  Eye, 
  Lock, 
  ArrowRight, 
  CheckCircle2,
  BarChart3,
  Bell,
  Users,
  Globe,
  UserPlus,
  Settings,
  LineChart,
  AlertCircle,
  Rocket
} from 'lucide-react';
import { mockStatistics } from '@/Backend/lib/mockData';
import { formatNumber, formatCurrency } from '@/Backend/lib/utils';

const features = [
  {
    icon: Activity,
    title: 'Real-time Tracking',
    description: 'Monitor whale activity in real-time with low latency and high accuracy'
  },
  {
    icon: Shield,
    title: 'Zero-Knowledge Privacy',
    description: 'ZK-proof technology ensures privacy and verification without revealing sensitive data'
  },
  {
    icon: Zap,
    title: 'AI-Enhanced Detection',
    description: 'AI machine learning detects patterns and anomalies in whale transactions'
  },
  {
    icon: Eye,
    title: 'Multi-Chain Support',
    description: 'Support for Ethereum, Polygon, Arbitrum, Optimism, and other blockchains'
  },
  {
    icon: Bell,
    title: 'Instant Alerts',
    description: 'Real-time notifications when thresholds are reached or suspicious activity detected'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Comprehensive dashboard with performance metrics and data visualization'
  }
];

const benefits = [
  'Deploy AI agent in minutes',
  '24/7 non-stop monitoring',
  'Privacy guaranteed with ZK-proof',
  'Custom alerts as needed',
  'Deep analytics for smart decisions',
  'Unlimited multi-chain support'
];

const howItWorksSteps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Create Account & Connect',
    description: 'Quick registration process with secure wallet connection. Get started in under 2 minutes.',
    features: ['Email registration', 'Wallet integration', 'Secure authentication']
  },
  {
    icon: Settings,
    step: '02',
    title: 'Configure Your Agent',
    description: 'Select blockchain networks, set threshold amounts, and customize alert preferences.',
    features: ['Choose blockchains', 'Set thresholds', 'Alert customization']
  },
  {
    icon: Rocket,
    step: '03',
    title: 'Deploy & Monitor',
    description: 'One-click deployment with real-time monitoring dashboard and instant notifications.',
    features: ['One-click deploy', 'Real-time dashboard', 'Instant alerts']
  },
  {
    icon: LineChart,
    step: '04',
    title: 'Get Insights & Act',
    description: 'Access detailed analytics, identify profit opportunities, and receive risk alerts.',
    features: ['Deep analytics', 'Profit insights', 'Risk management']
  }
];

export default function Home() {
  const [stats, setStats] = useState(mockStatistics);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simulate real-time stats update
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        dailyTransactions: prev.dailyTransactions + Math.floor(Math.random() * 5),
        zkProofs: prev.zkProofs + Math.floor(Math.random() * 3)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 lg:pt-48 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full glass mb-8">
              <Lock className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-300 whitespace-nowrap">Powered by Zero-Knowledge Technology</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                ZKWatch
              </span>
              <br />
              <span className="text-white">AI-Powered Whale</span>
              <br />
              <span className="text-white">Tracking Platform</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl lg:max-w-4xl mx-auto mb-10 leading-relaxed px-2 sm:px-4">
              Monitor and analyze crypto whale activity with AI technology and zero-knowledge proof. Get real-time insights with guaranteed privacy.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mt-2">
              <Link
                href="/deploy"
                className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-base hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center space-x-2 group active:scale-95 hover:scale-105"
              >
                <Zap className="w-5 h-5" />
                <span>Deploy Agent Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 glass rounded-xl font-semibold text-base hover:bg-white/10 transition-all duration-300 active:scale-95 hover:scale-105 flex items-center justify-center space-x-2"
              >
                <BarChart3 className="w-5 h-5" />
                <span>View Dashboard</span>
              </Link>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-16 sm:mt-20 lg:mt-24"
          >
            <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                {mounted ? formatNumber(stats.totalAgents) : '1.25K'}
              </div>
              <div className="text-gray-400 mt-2 text-sm sm:text-base">Total Agents</div>
            </div>
            <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-400">
                {mounted ? formatNumber(stats.activeAgents) : '892'}
              </div>
              <div className="text-gray-400 mt-2 text-sm sm:text-base">Active Agents</div>
            </div>
            <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-400">
                {mounted ? formatNumber(stats.monitoredWhales) : '3.46K'}
              </div>
              <div className="text-gray-400 mt-2 text-sm sm:text-base">Monitored Whales</div>
            </div>
            <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-orange-400">
                {mounted ? formatNumber(stats.zkProofs) : '15.68K'}
              </div>
              <div className="text-gray-400 mt-2 text-sm sm:text-base">ZK Proofs</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
              Get started with ZKWatch in 4 simple steps and start tracking whale activity within minutes
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {howItWorksSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative glass rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-300 group card-hover"
                >
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/30">
                    {step.step}
                  </div>

                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold mb-3 leading-tight">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm mb-4">{step.description}</p>

                  <div className="space-y-2">
                    {step.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-xs text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Arrow connector (hidden on mobile, last item) */}
                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-blue-400/30" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">Key Features</h2>
            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
              Complete platform for monitoring and analyzing whale activity
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-300 group card-hover"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 leading-tight">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
                Why Choose <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">ZKWatch</span>?
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 leading-relaxed">
                The most advanced whale monitoring platform with AI technology and zero-knowledge proof for maximum privacy.
              </p>
              <div className="space-y-3 sm:space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-3"
                  >
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm sm:text-base">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6 sm:p-8"
            >
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="text-center p-4 sm:p-6 bg-white/5 rounded-xl">
                  <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold">5+</div>
                  <div className="text-xs sm:text-sm text-gray-400">Blockchains</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-white/5 rounded-xl">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold">{formatNumber(stats.activeAgents)}</div>
                  <div className="text-xs sm:text-sm text-gray-400">Active Agents</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-white/5 rounded-xl">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.totalValue, 0)}</div>
                  <div className="text-xs sm:text-sm text-gray-400">Total Value</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-white/5 rounded-xl">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold">100%</div>
                  <div className="text-xs sm:text-sm text-gray-400">Private</div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/20">
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Zero-Knowledge Technology</h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Every transaction is verified with ZK-proof, ensuring validity without revealing sensitive information.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center glass rounded-2xl p-8 sm:p-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
            Ready to Start Monitoring Whales?
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 leading-relaxed">
            Deploy your first AI agent and start tracking whale activity within minutes.
          </p>
          <Link
            href="/deploy"
            className="inline-flex items-center space-x-2 px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 group active:scale-95 text-base"
          >
            <span>Deploy Agent Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm sm:text-base">
          <p>2025 ZKWatch. AI-Based Whale Tracking Platform.</p>
        </div>
      </footer>
    </div>
  );
}
