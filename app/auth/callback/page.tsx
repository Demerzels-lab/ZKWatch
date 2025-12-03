'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.hash || window.location.search);
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/login?error=' + encodeURIComponent(error.message));
          return;
        }

        router.push('/dashboard');
      } catch (err) {
        console.error('Unexpected error:', err);
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-gray-400">Memverifikasi akun...</p>
      </div>
    </div>
  );
}
