'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Activity, 
  LayoutDashboard, 
  Rocket, 
  Users, 
  TrendingUp, 
  Settings, 
  Menu, 
  X,
  Bell,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useAlerts } from '@/lib/hooks';

const navItems = [
  { name: 'Home', href: '/', icon: Activity, protected: false },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, protected: true },
  { name: 'Deploy Agent', href: '/deploy', icon: Rocket, protected: true },
  { name: 'My Agents', href: '/agents', icon: Users, protected: true },
  { name: 'Monitoring', href: '/monitoring', icon: TrendingUp, protected: true },
  { name: 'Settings', href: '/settings', icon: Settings, protected: true },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useAlerts();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const visibleNavItems = navItems.filter(item => !item.protected || user);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#01F4D4]/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#01F4D4] to-[#00FAF4] rounded-xl flex items-center justify-center shadow-lg shadow-[#01F4D4]/30 group-hover:shadow-[#01F4D4]/50 transition-all duration-300 overflow-hidden">
              <img src="/logo.jpeg" alt="ZKWatch Logo" className="w-8 h-8 object-cover rounded-lg" />
            </div>
            <span className="text-2xl font-bold glow-text">
              ZKWatch
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-[#01F4D4]/15 text-[#01F4D4] border border-[#01F4D4]/30'
                      : 'text-gray-400 hover:bg-[#01F4D4]/10 hover:text-[#01F4D4]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-[#01F4D4]/10 transition-all duration-300"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-[#01F4D4] to-[#00FAF4] rounded-full flex items-center justify-center shadow-lg shadow-[#01F4D4]/30">
                      <User className="w-5 h-5 text-black" />
                    </div>
                    <span className="hidden sm:block text-sm text-gray-300 max-w-[120px] truncate">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-60 glass rounded-2xl shadow-2xl border border-[#01F4D4]/20 overflow-hidden"
                      >
                        <div className="px-4 py-4 border-b border-[#01F4D4]/10 bg-gradient-to-r from-[#01F4D4]/5 to-transparent">
                          <p className="text-sm font-semibold text-white truncate">
                            {profile?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                        </div>
                        <div className="py-2">
                          <Link
                            href="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-[#01F4D4]/10 hover:text-[#01F4D4] transition-all duration-300"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all duration-300"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-[#01F4D4] transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#01F4D4] to-[#00FAF4] text-black rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#01F4D4]/50 transition-all duration-300 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl hover:bg-[#01F4D4]/10 transition-all duration-300"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[#01F4D4]" />
              ) : (
                <Menu className="w-6 h-6 text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#01F4D4]/10 glass"
          >
            <div className="px-4 py-4 space-y-2">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-[#01F4D4]/15 text-[#01F4D4] border border-[#01F4D4]/30'
                        : 'text-gray-300 hover:bg-[#01F4D4]/10 hover:text-[#01F4D4]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              
              {!user && (
                <div className="pt-4 space-y-2 border-t border-[#01F4D4]/10">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3.5 text-center text-gray-300 hover:text-[#01F4D4] transition-all duration-300 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3.5 text-center bg-gradient-to-r from-[#01F4D4] to-[#00FAF4] text-black rounded-xl font-semibold"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {user && (
                <div className="pt-4 border-t border-[#01F4D4]/10">
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
