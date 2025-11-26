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
  Globe
} from 'lucide-react';
import { mockStatistics } from '@/lib/mockData';
import { formatNumber, formatCurrency } from '@/lib/utils';

const features = [
  {
    icon: Activity,
    title: 'Pelacakan Real-time',
    description: 'Monitor aktivitas whale secara real-time dengan latensi rendah dan akurasi tinggi'
  },
  {
    icon: Shield,
    title: 'Zero-Knowledge Privacy',
    description: 'Teknologi ZK-proof memastikan privasi dan verifikasi tanpa mengungkap data sensitif'
  },
  {
    icon: Zap,
    title: 'AI-Enhanced Detection',
    description: 'AI machine learning mendeteksi pola dan anomali dalam transaksi whale'
  },
  {
    icon: Eye,
    title: 'Multi-Chain Support',
    description: 'Dukungan untuk Ethereum, Polygon, Arbitrum, Optimism, dan blockchain lainnya'
  },
  {
    icon: Bell,
    title: 'Alert Instan',
    description: 'Notifikasi real-time ketika threshold tercapai atau aktivitas mencurigakan terdeteksi'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Dashboard komprehensif dengan metrik performa dan visualisasi data'
  }
];

const benefits = [
  'Deploy agent AI dalam hitungan menit',
  'Monitoring 24/7 tanpa henti',
  'Privasi terjamin dengan ZK-proof',
  'Alert custom sesuai kebutuhan',
  'Analytics mendalam untuk keputusan smart',
  'Multi-chain support tanpa batas'
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

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass mb-6">
              <Lock className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Powered by Zero-Knowledge Technology</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                ZKWatch
              </span>
              <br />
              <span className="text-white">Platform Pelacakan Whale</span>
              <br />
              <span className="text-white">Berbasis AI</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
              Monitor dan analisis aktivitas whale crypto dengan teknologi AI dan zero-knowledge proof. 
              Dapatkan insight real-time dengan privasi terjamin.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/deploy"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 flex items-center space-x-2 group"
              >
                <span>Deploy Agent Sekarang</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 glass rounded-lg font-semibold hover:bg-white/10 transition-all duration-200"
              >
                Lihat Dashboard
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
          >
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {formatNumber(stats.totalAgents)}
              </div>
              <div className="text-gray-400 mt-2">Total Agent</div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                {formatNumber(stats.activeAgents)}
              </div>
              <div className="text-gray-400 mt-2">Agent Aktif</div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                {formatNumber(stats.monitoredWhales)}
              </div>
              <div className="text-gray-400 mt-2">Whale Terpantau</div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                {formatNumber(stats.zkProofs)}
              </div>
              <div className="text-gray-400 mt-2">ZK Proof</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Fitur Unggulan</h2>
            <p className="text-xl text-gray-400">
              Platform lengkap untuk monitoring dan analisis aktivitas whale
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Mengapa Memilih <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">ZKWatch</span>?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Platform monitoring whale paling advanced dengan teknologi AI dan zero-knowledge proof untuk privasi maksimal.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white/5 rounded-xl">
                  <Globe className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">5+</div>
                  <div className="text-sm text-gray-400">Blockchain</div>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-xl">
                  <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{formatNumber(stats.activeAgents)}</div>
                  <div className="text-sm text-gray-400">Agent Aktif</div>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalValue, 0)}</div>
                  <div className="text-sm text-gray-400">Total Value</div>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-xl">
                  <Shield className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-gray-400">Private</div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/20">
                <h4 className="font-semibold mb-2">Teknologi Zero-Knowledge</h4>
                <p className="text-sm text-gray-400">
                  Setiap transaksi diverifikasi dengan ZK-proof, memastikan validitas tanpa mengungkap informasi sensitif.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center glass rounded-2xl p-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            Siap Memulai Monitoring Whale?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Deploy AI agent pertama Anda dan mulai tracking aktivitas whale dalam hitungan menit.
          </p>
          <Link
            href="/deploy"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 group"
          >
            <span>Deploy Agent Sekarang</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>2025 ZKWatch. Platform Pelacakan Whale Berbasis AI.</p>
        </div>
      </footer>
    </div>
  );
}
