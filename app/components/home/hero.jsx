'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link'
import { ChevronDown, Image } from 'lucide-react';

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background - Optimisé pour mobile */}
      <div className="absolute inset-0 w-full h-full">
        {!videoError ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/images/hero-poster.png"
            className="absolute top-0 left-0 w-full h-full object-cover"
            onError={() => setVideoError(true)}
          >
            {/* Format MKV */}
            <source src="/videos/hero.mkv" type="video/x-matroska" />
            {/* Fallback image si la vidéo ne charge pas */}
            <img src="/images/hero-poster.png" alt="Workaura" className="w-full h-full object-cover" />
          </video>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0F] to-[#1A1A2E]" />
        )}
        
        {/* Dark Overlay - plus léger sur mobile */}
        <div className={`absolute inset-0 z-10 ${isMobile ? 'bg-black/70' : 'bg-black/60'}`} />
      </div>

      {/* Background Gradient - réduit sur mobile */}
      <div className={`absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/30 to-[#0A0A0F]/90 z-10 ${isMobile ? 'opacity-80' : ''}`} />

      {/* Animated Background Mesh - réduit/désactivé sur mobile */}
      {!isMobile && (
        <div className="absolute inset-0 z-10">
          <div className="absolute top-20 left-20 w-[400px] h-[400px] rounded-full bg-[#F4620A]/15 blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-[400px] h-[400px] rounded-full bg-[#9B1FD4]/15 blur-[120px] animate-pulse-slow delay-1000" />
        </div>
      )}

      {/* Content - Ajusté pour mobile */}
      <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 text-center">
        {/* Main Heading - Tailles réduites sur mobile */}
        <h1 className="mb-4 sm:mb-6">
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-white drop-shadow-2xl">
            Travaillez Sans
          </span>
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] bg-gradient-to-r from-[#F4620A] to-[#9B1FD4] bg-clip-text text-transparent drop-shadow-2xl">
            Limites.
          </span>
        </h1>

        {/* Subtitle - Texte plus petit sur mobile */}
        <p className="max-w-[90%] sm:max-w-[580px] mx-auto text-sm sm:text-base md:text-lg text-white/80 mb-6 sm:mb-10 drop-shadow-lg px-2">
          Bureaux privés, espaces coworking, salles de formation & salles de réunion premium à Témara.
          Rejoignez une communauté d'entrepreneurs ambitieux.
        </p>

        {/* CTA Buttons - Réduits sur mobile */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16">
          <Link
            href="/espaces"
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium text-sm sm:text-base hover:shadow-[0_8px_32px_rgba(244,98,10,0.4)] transition-all duration-300 hover:scale-105 w-full sm:w-auto text-center"
          >
            Découvrir les espaces →
          </Link>
          <Link 
            href="/galerie" 
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-white font-medium text-sm sm:text-base hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Image size={18} /> 
            Voir galerie
          </Link>
        </div>

        {/* Stats - Grille responsive */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-4 sm:gap-8 text-center">
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">
              150+
            </span>
            <span className="text-xs sm:text-sm text-white/70">Membres</span>
          </div>
          <div className="hidden sm:block w-px h-8 sm:h-12 bg-white/20" />
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">
              12
            </span>
            <span className="text-xs sm:text-sm text-white/70">Bureaux</span>
          </div>
          <div className="hidden sm:block w-px h-8 sm:h-12 bg-white/20" />
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">
              4
            </span>
            <span className="text-xs sm:text-sm text-white/70">Types d'espaces</span>
          </div>
          <div className="hidden sm:block w-px h-8 sm:h-12 bg-white/20" />
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">
              5★
            </span>
            <span className="text-xs sm:text-sm text-white/70">Google</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Plus petit sur mobile */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 sm:gap-2 z-20 animate-bounce">
        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/60">Découvrir</span>
        <ChevronDown size={16} className="sm:w-5 sm:h-5 text-white/60" />
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .gradient-text {
          background: linear-gradient(135deg, #F4620A, #9B1FD4);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>
    </section>
  );
}