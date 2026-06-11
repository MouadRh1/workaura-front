'use client'
import Link from 'next/link'
import { ChevronDown, Image } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/videos/hero.mkv" type="video/mp4" />
        </video>
        
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60 z-10" />
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/30 to-[#0A0A0F]/90 z-10" />

      {/* Animated Background Mesh */}
      <div className="absolute inset-0 z-10">
        <div className="absolute top-20 left-20 w-[600px] h-[600px] rounded-full bg-[#F4620A]/20 blur-[150px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-[600px] h-[600px] rounded-full bg-[#9B1FD4]/20 blur-[150px] animate-pulse delay-700" />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-[1440px] mx-auto px-6 text-center">
        {/* Main Heading */}
        <h1 className="mb-6">
          <span className="block text-[56px] md:text-[72px] lg:text-[80px] font-bold leading-[1.1] text-white drop-shadow-2xl">
            Travaillez Sans
          </span>
          <span className="block text-[56px] md:text-[72px] lg:text-[80px] font-bold leading-[1.1] bg-gradient-to-r from-[#F4620A] to-[#9B1FD4] bg-clip-text text-transparent drop-shadow-2xl">
            Limites.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-[580px] mx-auto text-base md:text-lg text-white/80 mb-10 drop-shadow-lg">
          Bureaux privés, espaces coworking, salles de formation & salles de réunion premium à Témara.
          Rejoignez une communauté d'entrepreneurs ambitieux.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/espaces"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium hover:shadow-[0_8px_32px_rgba(244,98,10,0.4)] transition-all duration-300 hover:scale-105"
          >
            Découvrir les espaces →
          </Link>
          <Link 
            href="/galerie" 
            className="px-8 py-4 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-white font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
          >
            <Image size={18} /> 
            Voir galerie
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-center">
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#F4620A] to-[#9B1FD4] bg-clip-text text-transparent">
              150+
            </span>
            <span className="text-sm text-white/70">Membres</span>
          </div>
          <div className="w-px h-12 bg-white/20" />
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#F4620A] to-[#9B1FD4] bg-clip-text text-transparent">
              12
            </span>
            <span className="text-sm text-white/70">Bureaux</span>
          </div>
          <div className="w-px h-12 bg-white/20" />
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#F4620A] to-[#9B1FD4] bg-clip-text text-transparent">
              3
            </span>
            <span className="text-sm text-white/70">Types d'espaces</span>
          </div>
          <div className="w-px h-12 bg-white/20" />
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#F4620A] to-[#9B1FD4] bg-clip-text text-transparent">
              5★
            </span>
            <span className="text-sm text-white/70">Google</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 animate-bounce">
        <span className="text-xs uppercase tracking-widest text-white/60">Découvrir</span>
        <ChevronDown size={20} className="text-white/60" />
      </div>
    </section>
  );
}