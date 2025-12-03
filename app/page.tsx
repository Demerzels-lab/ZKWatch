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
  Rocket,
  Calendar,
  Target,
  Twitter,
  Github
} from 'lucide-react';
import { mockStatistics } from '@/lib/mockData';
import { formatNumber, formatCurrency } from '@/lib/utils';

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

const roadmapItems = [
  {
    quarter: 'Q4 2025',
    title: 'Platform Foundation',
    description: 'Core whale tracking platform with ZK-proof technology, real-time monitoring, and basic analytics dashboard.',
    status: 'complete',
    features: ['Real-time whale tracking', 'ZK-proof verification', 'Basic analytics', 'Multi-chain support'],
    icon: CheckCircle2,
    progress: 100
  },
  {
    quarter: 'Q1 2026',
    title: 'AI Enhancement',
    description: 'Advanced AI algorithms for predictive analysis, enhanced machine learning models, and automated trading signals.',
    status: 'progress',
    features: ['AI-powered predictions', 'Machine learning models', 'Trading signals', 'Risk assessment'],
    icon: Zap,
    progress: 65
  },
  {
    quarter: 'Q2 2026',
    title: 'Enterprise Features',
    description: 'Enterprise-grade features including API access, white-label solutions, advanced security, and team collaboration tools.',
    status: 'planned',
    features: ['REST API access', 'White-label platform', 'Team collaboration', 'Advanced security'],
    icon: Target,
    progress: 0
  },
  {
    quarter: 'Q3 2026',
    title: 'Global Expansion',
    description: 'Global scale with mobile applications, advanced analytics, cross-platform integration, and institutional partnerships.',
    status: 'planned',
    features: ['Mobile applications', 'Advanced analytics', 'Platform integrations', 'Institutional partnerships'],
    icon: Globe,
    progress: 0
  }
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
        {/* Background Effects - Green Glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#01F4D4]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#00FAF4]/15 rounded-full blur-[100px] animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#01F4D4]/5 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full glass border border-[#01F4D4]/30 mb-8 animate-glow-pulse">
              <Lock className="w-4 h-4 text-[#01F4D4] flex-shrink-0" />
              <span className="text-sm font-medium text-gray-300 whitespace-nowrap">Powered by Zero-Knowledge Technology</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              <span className="glow-text">
                ZKWatch
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#01F4D4] via-[#00FAF4] to-[#01F4D4] bg-clip-text text-transparent animate-pulse">
                Multi-Chain Whale Monitoring Engine
              </span>
              <br />
              <span className="bg-gradient-to-r bg-clip-text">
                with Zero-Knowledge Privacy Layer
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl lg:max-w-4xl mx-auto mb-10 leading-relaxed px-2 sm:px-4">
              Monitor large on-chain movements with AI-driven detection, encrypted analytics, and real-time alerts. All protected by zero-knowledge proof to keep your trading strategies fully confidential.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mt-2">
              <Link
                href="/deploy"
                className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-gradient-to-r from-[#01F4D4] to-[#00FAF4] text-black rounded-xl font-bold text-base hover:shadow-2xl hover:shadow-[#01F4D4]/50 transition-all duration-300 flex items-center justify-center space-x-2 group active:scale-95 hover:scale-105"
              >
                <Zap className="w-5 h-5" />
                <span>Deploy Agent Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 sm:px-10 py-4 glass border border-[#01F4D4]/30 rounded-xl font-semibold text-base text-[#01F4D4] hover:bg-[#01F4D4]/10 transition-all duration-300 active:scale-95 hover:scale-105 flex items-center justify-center space-x-2"
              >
                <BarChart3 className="w-5 h-5" />
                <span>View Dashboard</span>
              </Link>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center gap-6 mt-8"
          >
            <a
              href="https://x.com/ZKWatch_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 glass border border-[#01F4D4]/30 rounded-lg text-[#01F4D4] hover:bg-[#01F4D4]/10 transition-all duration-300 group"
            >
              <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Follow us</span>
            </a>
            <a
              href="https://github.com/Demerzels-lab/ZKWatch"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 glass border border-[#01F4D4]/30 rounded-lg text-[#01F4D4] hover:bg-[#01F4D4]/10 transition-all duration-300 group"
            >
              <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">View Source</span>
            </a>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-16 sm:mt-20 lg:mt-24"
          >
            <div className="glass rounded-2xl p-5 sm:p-6 text-center border border-[#01F4D4]/20 hover:border-[#01F4D4]/40 transition-all duration-300 card-hover">
              <div className="text-3xl sm:text-4xl font-bold text-[#01F4D4] glow-text">
                {mounted ? formatNumber(stats.totalAgents) : '1.25K'}
              </div>
              <div className="text-gray-400 mt-2 text-sm sm:text-base">Total Agents</div>
            </div>
            <div className="glass rounded-2xl p-5 sm:p-6 text-center border border-[#01F4D4]/20 hover:border-[#01F4D4]/40 transition-all duration-300 card-hover">
              <div className="text-3xl sm:text-4xl font-bold text-emerald-400">
                {mounted ? formatNumber(stats.activeAgents) : '892'}
              </div>
              <div className="text-gray-400 mt-2 text-sm sm:text-base">Active Agents</div>
            </div>
            <div className="glass rounded-2xl p-5 sm:p-6 text-center border border-[#01F4D4]/20 hover:border-[#01F4D4]/40 transition-all duration-300 card-hover">
              <div className="text-3xl sm:text-4xl font-bold text-[#00FAF4]">
                {mounted ? formatNumber(stats.monitoredWhales) : '3.46K'}
              </div>
              <div className="text-gray-400 mt-2 text-sm sm:text-base">Monitored Whales</div>
            </div>
            <div className="glass rounded-2xl p-5 sm:p-6 text-center border border-[#01F4D4]/20 hover:border-[#01F4D4]/40 transition-all duration-300 card-hover">
              <div className="text-3xl sm:text-4xl font-bold text-cyan-400">
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
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#01F4D4]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#00FAF4]/10 rounded-full blur-[100px]" />
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
              How It <span className="glow-text">Works</span>
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
                  className="relative glass rounded-2xl p-6 sm:p-8 border border-[#01F4D4]/20 hover:border-[#01F4D4]/40 hover:bg-[#01F4D4]/5 transition-all duration-300 group card-hover"
                >
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-[#01F4D4] to-[#00FAF4] rounded-full flex items-center justify-center font-bold text-lg text-black shadow-lg shadow-[#01F4D4]/30">
                    {step.step}
                  </div>

                  <div className="w-14 h-14 bg-gradient-to-br from-[#01F4D4] to-[#00FAF4] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#01F4D4]/30">
                    <Icon className="w-7 h-7 text-black" />
                  </div>

                  <h3 className="text-xl font-semibold mb-3 leading-tight text-white">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm mb-4">{step.description}</p>

                  <div className="space-y-2">
                    {step.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-[#01F4D4] flex-shrink-0" />
                        <span className="text-xs text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Arrow connector (hidden on mobile, last item) */}
                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-[#01F4D4]/30" />
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Key <span className="glow-text">Features</span>
            </h2>
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
                  className="glass rounded-2xl p-6 sm:p-8 border border-[#01F4D4]/20 hover:border-[#01F4D4]/40 hover:bg-[#01F4D4]/5 transition-all duration-300 group card-hover"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#01F4D4] to-[#00FAF4] rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#01F4D4]/30">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 leading-tight text-white">{feature.title}</h3>
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
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#01F4D4]/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#00FAF4]/10 rounded-full blur-[100px]" />
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
                Why Choose <span className="glow-text">ZKWatch</span>?
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
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#01F4D4] flex-shrink-0 mt-1" />
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
              className="glass rounded-2xl p-6 sm:p-8 border border-[#01F4D4]/20"
            >
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="text-center p-4 sm:p-6 bg-[#01F4D4]/5 rounded-xl border border-[#01F4D4]/20">
                  <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-[#01F4D4] mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-white">5+</div>
                  <div className="text-xs sm:text-sm text-gray-400">Blockchains</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-[#01F4D4]/5 rounded-xl border border-[#01F4D4]/20">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#00FAF4] mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-white">{formatNumber(stats.activeAgents)}</div>
                  <div className="text-xs sm:text-sm text-gray-400">Active Agents</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-[#01F4D4]/5 rounded-xl border border-[#01F4D4]/20">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-white">{formatCurrency(stats.totalValue)}</div>
                  <div className="text-xs sm:text-sm text-gray-400">Total Value</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-[#01F4D4]/5 rounded-xl border border-[#01F4D4]/20">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-white">100%</div>
                  <div className="text-xs sm:text-sm text-gray-400">Private</div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-[#01F4D4]/10 to-[#00FAF4]/10 rounded-xl border border-[#01F4D4]/20">
                <h4 className="font-semibold mb-2 text-sm sm:text-base text-white">Zero-Knowledge Technology</h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Every transaction is verified with ZK-proof, ensuring validity without revealing sensitive information.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#01F4D4]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00FAF4]/10 rounded-full blur-[100px]" />
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
              Platform <span className="glow-text">Roadmap</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
              Our journey to revolutionize whale tracking and crypto analytics with cutting-edge technology
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#01F4D4]/30 via-[#00FAF4]/30 to-[#01F4D4]/30 transform -translate-x-1/2" />
            
            <div className="space-y-8 sm:space-y-12">
              {roadmapItems.map((item, index) => {
                const Icon = item.icon;
                const isLeft = index % 2 === 0;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className={`relative flex items-center ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                  >
                    {/* Content */}
                    <div className={`w-full lg:w-5/12 ${isLeft ? 'lg:pr-8' : 'lg:pl-8'}`}>
                      <div className="glass rounded-2xl p-6 sm:p-8 border border-[#01F4D4]/20 hover:border-[#01F4D4]/40 hover:bg-[#01F4D4]/5 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              item.status === 'complete' ? 'bg-emerald-500/20 text-emerald-400' :
                              item.status === 'progress' ? 'bg-[#01F4D4]/20 text-[#01F4D4]' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-lg sm:text-xl font-bold text-white">{item.title}</h3>
                              <p className="text-sm text-gray-400">{item.quarter}</p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === 'complete' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            item.status === 'progress' ? 'bg-[#01F4D4]/20 text-[#01F4D4] border border-[#01F4D4]/30' :
                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {item.status === 'complete' ? 'Complete' :
                             item.status === 'progress' ? 'In Progress' : 'Planned'}
                          </div>
                        </div>

                        <p className="text-gray-300 mb-6 leading-relaxed">{item.description}</p>

                        {/* Progress Bar (for in-progress items) */}
                        {item.status === 'progress' && (
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-400">Progress</span>
                              <span className="text-sm font-medium text-[#01F4D4]">{item.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${item.progress}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                viewport={{ once: true }}
                                className="bg-gradient-to-r from-[#01F4D4] to-[#00FAF4] h-2 rounded-full shadow-lg shadow-[#01F4D4]/30"
                              />
                            </div>
                          </div>
                        )}

                        {/* Features */}
                        <div className="space-y-2">
                          {item.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <CheckCircle2 className={`w-4 h-4 ${
                                item.status === 'complete' ? 'text-emerald-400' :
                                item.status === 'progress' ? 'text-[#01F4D4]' :
                                'text-gray-500'
                              }`} />
                              <span className={`text-sm ${
                                item.status === 'complete' ? 'text-gray-300' :
                                item.status === 'progress' ? 'text-gray-300' :
                                'text-gray-500'
                              }`}>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Node (center for desktop) */}
                    <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center w-8 h-8">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        item.status === 'complete' ? 'border-emerald-400 bg-emerald-500/20' :
                        item.status === 'progress' ? 'border-[#01F4D4] bg-[#01F4D4]/20 animate-pulse' :
                        'border-gray-400 bg-gray-500/20'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === 'complete' ? 'bg-emerald-400' :
                          item.status === 'progress' ? 'bg-[#01F4D4]' :
                          'bg-gray-400'
                        }`} />
                      </div>
                    </div>

                    {/* Spacer for the other half */}
                    <div className="hidden lg:block w-5/12" />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-12 sm:mt-16"
          >
            <div className="glass rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto border border-[#01F4D4]/20">
              <Calendar className="w-12 h-12 text-[#01F4D4] mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white">Be Part of Our Journey</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Join thousands of traders and institutions already using ZKWatch to stay ahead of whale movements.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#01F4D4] to-[#00FAF4] text-black rounded-xl font-bold hover:shadow-lg hover:shadow-[#01F4D4]/50 transition-all duration-300 group"
              >
                <span>Start Today</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center glass rounded-2xl p-8 sm:p-12 border border-[#01F4D4]/20 relative overflow-hidden"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#01F4D4]/10 via-transparent to-[#00FAF4]/10" />
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 leading-tight text-white">
              Ready to Start Monitoring Whales?
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 leading-relaxed">
              Deploy your first AI agent and start tracking whale activity within minutes.
            </p>
            <Link
              href="/deploy"
              className="inline-flex items-center space-x-2 px-8 sm:px-10 py-4 bg-gradient-to-r from-[#01F4D4] to-[#00FAF4] text-black rounded-xl font-bold hover:shadow-xl hover:shadow-[#01F4D4]/50 transition-all duration-300 group active:scale-95 text-base"
            >
              <span>Deploy Agent Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#01F4D4]/10 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm sm:text-base">
          <p>2025 ZKWatch. AI-Based Whale Tracking Platform.</p>
        </div>
      </footer>
    </div>
  );
}
