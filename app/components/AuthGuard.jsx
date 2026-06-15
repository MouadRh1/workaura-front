// components/AuthGuard.jsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Rediriger selon le rôle
      if (user?.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/');
      }
    }
  }, [isAuthenticated, loading, user, router]);

  // Afficher un loader pendant la vérification
  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F4620A] animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}