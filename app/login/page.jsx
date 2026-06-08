// app/login/page.jsx - Version corrigée
'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, updateUser } = useAuth(); // ✅ on récupère aussi updateUser
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const submittedRef = useRef(false);

  // ❌ Supprimé : le useEffect qui causait router.replace('/') au mauvais moment
  // et provoquait un rechargement + conflit avec la redirection du handleSubmit

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (submittedRef.current || isLoading) return;

    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    submittedRef.current = true;
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // ✅ Mettre à jour le contexte explicitement (au cas où login() ne le fait pas)
        if (result.data?.user) {
          updateUser(result.data.user);
        }

        // ✅ Redirection sans rechargement
        if (result.data?.user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setError(result.error || 'Email ou mot de passe incorrect');
        submittedRef.current = false;
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Une erreur est survenue');
      submittedRef.current = false;
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (type) => {
    setFormData({
      email: type === 'admin' ? 'admin@workaura.com' : 'user@workaura.com',
      password: 'password123'
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4 py-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#F4620A]/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#9B1FD4]/20 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F4620A] to-[#9B1FD4] flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">WA</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Bienvenue</h2>
          <p className="text-[#A0A0B8]">Connectez-vous à votre espace de travail</p>
        </div>

        <div className="glass-effect rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-white text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0B8] w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] focus:ring-1 focus:ring-[#F4620A] transition-all"
                  placeholder="votre@email.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0B8] w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] focus:ring-1 focus:ring-[#F4620A] transition-all"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0B8] hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-[#F4620A] hover:text-[#C040E0] transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              <p className="text-[#A0A0B8] text-xs text-center">Comptes de démonstration :</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('admin')}
                  className="flex-1 text-xs px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  Admin: admin@workaura.com
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('user')}
                  className="flex-1 text-xs px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  User: user@workaura.com
                </button>
              </div>
              <p className="text-[#A0A0B8] text-xs text-center">
                Mot de passe: <span className="text-white">password123</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-[#A0A0B8] text-sm">
              Pas encore de compte ?{' '}
              <Link href="/register" className="text-[#F4620A] hover:text-[#C040E0] font-medium transition-colors">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}