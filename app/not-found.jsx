// app/not-found.jsx - Version avec animations
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, AlertTriangle, Building2, Users, Calendar } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  const suggestions = [
    { icon: Building2, text: "Nos espaces de coworking", href: "/espaces" },
    { icon: Users, text: "La communauté Workaura", href: "/about" },
    { icon: Calendar, text: "Réservations et tarifs", href: "/espaces" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4 py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-72 h-72 bg-[#F4620A]/10 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#9B1FD4]/10 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Code erreur animé */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-xs uppercase tracking-widest text-red-400 font-medium">
              Erreur 404
            </span>
          </div>
          
          <motion.h1 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="text-8xl md:text-9xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-[#F4620A] to-[#9B1FD4] bg-clip-text text-transparent">
              404
            </span>
          </motion.h1>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Page non trouvée
          </h2>
          
          <p className="text-[#A0A0B8] text-lg max-w-md mx-auto">
            Oups ! La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8 text-left"
        >
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Search size={18} className="text-[#F4620A]" />
            Vous cherchez peut-être ?
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {suggestions.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <item.icon size={16} className="text-[#F4620A] group-hover:scale-110 transition-transform" />
                <span className="text-[#A0A0B8] group-hover:text-white text-sm transition-colors">
                  {item.text}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Boutons d'action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all duration-300"
          >
            <ArrowLeft size={18} />
            Page précédente
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <Home size={18} />
            Accueil
          </Link>
        </motion.div>

        {/* Contact rapide */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 pt-6 border-t border-white/10"
        >
          <p className="text-[#A0A0B8] text-sm">
            Besoin d'aide ?{' '}
            <Link href="/contact" className="text-[#F4620A] hover:text-[#C040E0] transition-colors">
              Contactez-nous
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}