// app/apropos/page.jsx
'use client';
import Link from 'next/link';
import {
  Target,
  Eye,
  Heart,
  Rocket,
  Building2,
  Briefcase,
  GraduationCap,
  UserCheck,
  Presentation,
  Handshake,
  TrendingUp,
  Sparkles,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle,
  Users
} from 'lucide-react';
import Button from '../components/ui/Button';

export default function AproposPage() {
  const targetAudiences = [
    { icon: Briefcase, title: 'Entrepreneurs', description: 'Espace professionnel, réunions et networking' },
    { icon: Users, title: 'Freelances', description: 'Focus, stabilité et environnement productif' },
    { icon: GraduationCap, title: 'Étudiants', description: 'Lieu calme pour étudier et travailler' },
    { icon: UserCheck, title: 'Travailleurs à distance', description: 'Séparation vie pro/perso' },
    { icon: Presentation, title: 'Formateurs & Coachs', description: 'Salle pour animer des ateliers' },
    { icon: Handshake, title: 'Entreprises & Équipes', description: 'Salles de réunion et espaces collaboratifs' },
  ];

  const services = [
    {
      title: 'Bureaux Privés',
      icon: Building2,
      idealFor: ['Entrepreneurs', 'Consultants', 'Petites équipes'],
      benefits: ['Confidentialité', 'Concentration', 'Environnement pro']
    },
    {
      title: 'Espace Coworking',
      icon: Users,
      idealFor: ['Freelances', 'Étudiants', 'Startups'],
      benefits: ['Espace flexible', 'Networking', 'Accès abordable']
    },
    {
      title: 'Salle de Formation',
      icon: Presentation,
      idealFor: ['Formateurs', 'Coachs', 'Ateliers'],
      benefits: ['Présentations pro', 'Cours', 'Événements']
    },
    {
      title: 'Salle de Réunion',
      icon: Handshake,
      idealFor: ['Entreprises', 'Équipes', 'Clients'],
      benefits: ['Réunions clients', 'Réunions équipe', 'Présentations']
    },
  ];

  const brandPersonality = [
    { icon: Heart, title: 'Humaine', description: 'Amicale et accueillante' },
    { icon: Rocket, title: 'Ambitieuse', description: 'Encourage le progrès' },
    { icon: Shield, title: 'Professionnelle', description: 'Premium sans être corporate' },
    { icon: Zap, title: 'Inspirante', description: 'Motivation à l\'action' },
    { icon: TrendingUp, title: 'Moderne', description: 'Entrepreneuriale et dynamique' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-32 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Workaura, <span className="gradient-text">plus qu'un espace de coworking</span>
          </h1>
          <p className="text-[#A0A0B8] max-w-2xl mx-auto">
            Un lieu où la productivité, les opportunités et la communauté se rencontrent.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <Target size={32} className="text-[#F4620A] mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">Notre Mission</h2>
            <p className="text-[#A0A0B8] text-sm leading-relaxed">
              Offrir un environnement professionnel où entrepreneurs, freelances, étudiants et équipes peuvent travailler, apprendre, collaborer et grandir.
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <Eye size={32} className="text-[#F4620A] mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">Notre Vision</h2>
            <p className="text-[#A0A0B8] text-sm leading-relaxed">
              Devenir l'espace de coworking de référence à Témara en créant un écosystème qui aide à devenir plus productif, connecté et performant.
            </p>
          </div>
        </div>

        {/* Brand Promise */}
        <div className="bg-gradient-to-r from-[#F4620A]/10 to-[#C040E0]/10 rounded-2xl border border-[#F4620A]/20 p-6 mb-16 text-center">
          <Sparkles size={24} className="text-[#F4620A] mx-auto mb-3" />
          <p className="text-white font-medium italic">
            "More than a coworking space. A place where productivity, opportunities and community meet."
          </p>
        </div>

        {/* Transformation */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            De l'isolement à la <span className="gradient-text">croissance</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-red-400 text-xs line-through">Travailler seul</p>
              <ArrowRight size={16} className="mx-auto my-1 text-[#F4620A]" />
              <p className="text-green-400 text-xs font-bold">Productivité</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-red-400 text-xs line-through">Travailler chez soi</p>
              <ArrowRight size={16} className="mx-auto my-1 text-[#F4620A]" />
              <p className="text-green-400 text-xs font-bold">Connexions</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-red-400 text-xs line-through">Manque de focus</p>
              <ArrowRight size={16} className="mx-auto my-1 text-[#F4620A]" />
              <p className="text-green-400 text-xs font-bold">Professionnalisme</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-red-400 text-xs line-through">Isolement</p>
              <ArrowRight size={16} className="mx-auto my-1 text-[#F4620A]" />
              <p className="text-green-400 text-xs font-bold">Croissance</p>
            </div>
          </div>
        </div>

        {/* Target Audiences */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Pour <span className="gradient-text">qui ?</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {targetAudiences.map((audience, idx) => (
              <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <audience.icon size={20} className="text-[#F4620A] mb-2" />
                <h3 className="text-white font-semibold text-sm mb-1">{audience.title}</h3>
                <p className="text-[#A0A0B8] text-xs">{audience.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Nos <span className="gradient-text">Espaces</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="bg-white/5 rounded-xl border border-white/10 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <service.icon size={24} className="text-[#F4620A]" />
                  <h3 className="text-lg font-bold text-white">{service.title}</h3>
                </div>
                <div className="mb-3">
                  <p className="text-[#F4620A] text-xs font-medium mb-1">Idéal pour :</p>
                  <div className="flex flex-wrap gap-1">
                    {service.idealFor.map((item, i) => (
                      <span key={i} className="text-xs bg-white/10 text-[#A0A0B8] px-2 py-0.5 rounded-full">{item}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[#F4620A] text-xs font-medium mb-1">Avantages :</p>
                  <div className="flex flex-wrap gap-2">
                    {service.benefits.map((item, i) => (
                      <span key={i} className="text-xs text-[#A0A0B8] flex items-center gap-1">
                        <CheckCircle size={10} className="text-green-400" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Personality */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Notre <span className="gradient-text">Personnalité</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {brandPersonality.map((trait, idx) => (
              <div key={idx} className="bg-white/5 rounded-xl p-3 text-center">
                <trait.icon size={20} className="text-[#F4620A] mx-auto mb-1" />
                <h4 className="text-white font-semibold text-sm">{trait.title}</h4>
                <p className="text-[#A0A0B8] text-xs">{trait.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Globe size={24} className="text-[#F4620A]" />
              <div>
                <h3 className="text-white font-semibold">Situé au cœur de Témara</h3>
                <p className="text-[#A0A0B8] text-sm">Accessible depuis tout Témara</p>
              </div>
            </div>
            <Link href="/contact">
              <Button variant="outline" className="text-sm">
                Nous trouver →
              </Button>
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Prêt à <span className="gradient-text">rejoindre l'aventure ?</span>
          </h2>
          <p className="text-[#A0A0B8] text-sm mb-6">
            Rejoignez une communauté qui vous aide à grandir.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/espaces">
              <Button variant="primary" className="px-6 py-2.5">
                Découvrir nos espaces
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" className="px-6 py-2.5">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}