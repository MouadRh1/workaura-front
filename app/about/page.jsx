'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Target, Wifi, Coffee, Users, MapPin, Clock,
  Building2, CheckCircle, ArrowRight, Star,
  Eye, Sparkles, Calendar, Loader2,
} from 'lucide-react';
import api from '../lib/api';

/* ── Helpers (copiés depuis espaces/page.jsx) ───────────────────────────── */

const getImageUrl = (path) => {
  if (!path) return '/images/placeholder-space.jpg';
  if (path.startsWith('http')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
  return `${baseUrl}${path}`;
};

const parseAmenities = (amenities) => {
  if (!amenities) return [];
  if (Array.isArray(amenities)) return amenities;
  if (typeof amenities === 'string') {
    try {
      const parsed = JSON.parse(amenities);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

/* ── Features statiques ─────────────────────────────────────────────────── */

const features = [
  { icon: Wifi,      title: 'Internet haut débit',  description: 'Connexion fibre rapide et stable pour travailler sans interruption.' },
  { icon: Building2, title: 'Espaces modernes',      description: 'Des espaces confortables, équipés et pensés pour la performance.' },
  { icon: Coffee,    title: 'Café & détente',        description: "Rechargez-vous dans notre espace détente autour d'un bon café." },
  { icon: Users,     title: 'Communauté active',     description: 'Rencontrez, échangez et collaborez avec des professionnels motivés.' },
  { icon: MapPin,    title: 'Localisation idéale',   description: "Situé à Témara, facile d'accès depuis Rabat et ses environs." },
  { icon: Clock,     title: 'Flexibilité totale',    description: "Réservez à l'heure, à la journée, à la semaine ou au mois." },
];

/* ── Composants UI ──────────────────────────────────────────────────────── */

function Pill({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4620A]/10 border border-[#F4620A]/20 text-[#F4620A] text-xs font-semibold tracking-widest uppercase">
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

function IconBox({ icon: Icon, variant = 'orange', size = 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl';
  const styles =
    variant === 'purple'
      ? 'bg-[#C040E0]/10 border-[#C040E0]/20 text-[#C040E0]'
      : 'bg-[#F4620A]/10 border-[#F4620A]/20 text-[#F4620A]';
  return (
    <div className={`${dim} border flex items-center justify-center flex-shrink-0 ${styles}`}>
      <Icon size={size === 'sm' ? 14 : 18} />
    </div>
  );
}

function BtnGrad({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white text-sm font-medium hover:opacity-90 hover:-translate-y-0.5 transition-all duration-300"
    >
      {children}
    </Link>
  );
}

function BtnOutline({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#2A2A3E] text-white text-sm font-medium hover:bg-white/5 transition-all duration-300"
    >
      {children}
    </Link>
  );
}

/* ── Carte espace identique à espaces/page.jsx ──────────────────────────── */

function SpaceCard({ space }) {
  const amenities = parseAmenities(space.amenities);
  const displayFeatures = amenities.slice(0, 3);

  return (
    <div className="group bg-[#12121A] rounded-[20px] border border-[#2A2A3E] overflow-hidden hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(244,98,10,0.2)] transition-all duration-300">
      {/* Image */}
      <div className="relative h-[180px] overflow-hidden">
        <img
          src={getImageUrl(space.featured_image || space.image)}
          alt={space.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => { e.target.src = '/images/placeholder-space.jpg'; }}
        />
      </div>

      {/* Contenu */}
      <div className="p-5">
        <IconBox icon={Building2} size="sm" />
        <h3 className="text-white font-bold text-sm mt-3 mb-2">{space.name}</h3>
        <p className="text-[#A0A0B8] text-xs mb-3 line-clamp-2">{space.description}</p>

        {/* Amenities */}
        <ul className="space-y-1.5 mb-4">
          {displayFeatures.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-[#A0A0B8] text-xs">
              <CheckCircle size={12} className="text-[#F4620A] shrink-0" />
              {f}
            </li>
          ))}
          {amenities.length > 3 && (
            <li className="text-xs text-[#A0A0B8]">+{amenities.length - 3} équipements</li>
          )}
        </ul>

        {/* Prix + capacité */}
        {/* <div className="flex items-center justify-between mb-4">
          {space.capacity && (
            <div className="flex items-center gap-1.5 text-[#A0A0B8] text-xs">
              <Users size={13} />
              <span>{space.capacity} pers.</span>
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-[#F4620A]">{space.price} MAD</span>
            <span className="text-[#A0A0B8] text-xs">/jour</span>
          </div>
        </div> */}

        {/* CTA */}
        <Link
          href={`/espaces/${space.slug}`}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-[#F4620A] text-[#F4620A] text-sm font-medium hover:bg-gradient-to-r hover:from-[#F4620A] hover:to-[#C040E0] hover:text-white hover:border-transparent transition-all duration-300 group/btn"
        >
          Voir les détails
          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

/* ── Page principale ────────────────────────────────────────────────────── */

export default function AproposPage() {
  const [spaces, setSpaces]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await api.get('/spaces');
        const data = response.data.spaces?.data || response.data.spaces || [];
        setSpaces(data.slice(0, 4)); // 4 espaces max pour la section À propos
      } catch (err) {
        console.error('Erreur chargement espaces:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpaces();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-0">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Pill icon={Target}>À propos</Pill>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mt-5 mb-6">
              Plus qu'un coworking.<br />
              Un lieu où les{' '}
              <span className="bg-gradient-to-r from-[#F4620A] to-[#C040E0] bg-clip-text text-transparent">
                projets avancent.
              </span>
            </h1>
            <p className="text-[#A0A0B8] text-sm leading-relaxed mb-3">
              Situé au cœur de Témara, Workaura est un espace de travail moderne conçu pour les
              entrepreneurs, freelances, étudiants, télétravailleurs et entreprises à la recherche
              d'un cadre professionnel favorisant la concentration, la collaboration et la productivité.
            </p>
            <p className="text-[#A0A0B8] text-sm leading-relaxed mb-10">
              Ici, vous ne louez pas simplement un bureau.<br />
              Vous rejoignez un écosystème.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              {[
                { icon: Users,     value: '150+', label: 'Membres actifs',     star: false },
                { icon: Building2, value: '4',    label: 'Espaces de travail',  star: false },
                { icon: Star,      value: '5/5',  label: 'Note Google',         star: true  },
              ].map(({ icon: Icon, value, label, star }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${star ? 'bg-yellow-400/10 border-yellow-400/20' : 'bg-[#F4620A]/10 border-[#F4620A]/20'}`}>
                    <Icon size={18} className={star ? 'text-yellow-400' : 'text-[#F4620A]'} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg leading-none">{value}</p>
                    <p className="text-[#A0A0B8] text-xs mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden h-72 md:h-96">
            <img
              src="images/placeholder-space.jpg"
              alt="Workaura coworking space"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <div className="border-t border-[#2A2A3E]" />

      {/* ── MISSION + COMMUNAUTÉ ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#12121A] rounded-2xl border border-[#2A2A3E] p-8">
            <IconBox icon={Target} />
            <h2 className="text-xl font-bold mt-5 mb-3">
              Notre <span className="text-[#F4620A]">mission</span>
            </h2>
            <p className="text-[#A0A0B8] text-sm leading-relaxed mb-3">
              Offrir à chaque professionnel, étudiant ou entrepreneur un environnement propice à la réussite.
            </p>
            <p className="text-[#A0A0B8] text-sm leading-relaxed">
              Nous mettons à disposition des espaces flexibles, confortables et accessibles,
              accompagnés d'une communauté dynamique et inspirante.
            </p>
          </div>

          <div className="bg-[#12121A] rounded-2xl border border-[#2A2A3E] p-8">
            <IconBox icon={Users} variant="purple" />
            <h2 className="text-xl font-bold mt-5 mb-3">
              Une communauté qui crée des{' '}
              <span className="text-[#F4620A]">opportunités</span>
            </h2>
            <p className="text-[#A0A0B8] text-sm leading-relaxed mb-3">
              Au-delà d'un espace, Workaura est un réseau de talents. Entrepreneurs, freelances,
              étudiants, créateurs et entreprises se rencontrent, échangent et collaborent.
            </p>
            <p className="text-[#A0A0B8] text-sm leading-relaxed">
              Une simple conversation peut parfois devenir un partenariat, un client ou une nouvelle opportunité.
            </p>
          </div>
        </div>
      </section>

      <div className="border-t border-[#2A2A3E]" />

      {/* ── ESPACES DEPUIS L'API ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <Pill icon={Building2}>Nos espaces</Pill>
            <h2 className="text-3xl md:text-4xl font-bold mt-4">
              Des espaces pensés pour{' '}
              <span className="text-[#F4620A]">chaque objectif</span>
            </h2>
          </div>
          <Link
            href="/espaces"
            className="inline-flex items-center gap-2 text-[#F4620A] text-sm font-medium hover:text-[#C040E0] transition-colors shrink-0"
          >
            Voir tous les espaces <ArrowRight size={16} />
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-16 gap-3">
            <Loader2 size={28} className="text-[#F4620A] animate-spin" />
            <span className="text-[#A0A0B8] text-sm">Chargement des espaces...</span>
          </div>
        )}

        {/* Grille */}
        {!loading && spaces.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {spaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        )}

        {/* Aucun espace */}
        {!loading && spaces.length === 0 && (
          <div className="text-center py-16">
            <Building2 size={48} className="mx-auto text-[#2A2A3E] mb-4" />
            <p className="text-[#A0A0B8] text-sm">Aucun espace disponible pour le moment.</p>
          </div>
        )}
      </section>

      <div className="border-t border-[#2A2A3E]" />

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <Pill icon={Star}>Pourquoi choisir Workaura ?</Pill>
        <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-10">
          Tout ce qu'il vous faut<br />
          pour être <span className="text-[#F4620A]">productif</span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-[#12121A] rounded-2xl border border-[#2A2A3E] p-6 flex flex-col gap-4">
              <IconBox icon={Icon} />
              <h3 className="text-white font-semibold text-sm">{title}</h3>
              <p className="text-[#A0A0B8] text-xs leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#2A2A3E]" />

      {/* ── VISION ──────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Pill icon={Eye}>Notre vision</Pill>
            <h2 className="text-3xl md:text-4xl font-bold leading-snug mt-5 mb-6">
              Devenir la référence du<br />
              coworking à <span className="text-[#F4620A]">Témara</span>
            </h2>
            <p className="text-[#A0A0B8] text-sm leading-relaxed mb-3">
              Nous voulons créer un lieu où chacun peut venir travailler, apprendre, rencontrer et évoluer.
            </p>
            <p className="text-[#A0A0B8] text-sm leading-relaxed mb-8">
              Parce qu'aujourd'hui, réussir ne dépend pas seulement de ce que vous faites,
              mais aussi de l'environnement dans lequel vous le faites.
            </p>
            <BtnGrad href="/espaces">
              Réserver un espace <ArrowRight size={16} />
            </BtnGrad>
          </div>

          <div className="rounded-2xl overflow-hidden h-72 md:h-96">
            <img
              src="images/bureau.png"
              alt="Workaura vision"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#12121A] border-t border-[#2A2A3E] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Pill icon={Sparkles}>Rejoignez-nous</Pill>
          <h2 className="text-3xl md:text-4xl font-bold mt-5 mb-4">
            Prêt à rejoindre{' '}
            <span className="bg-gradient-to-r from-[#F4620A] to-[#C040E0] bg-clip-text text-transparent">
              l'aura ?
            </span>
          </h2>
          <p className="text-[#A0A0B8] text-sm mb-8">
            Réservez votre espace dès aujourd'hui et rejoignez une communauté qui avance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <BtnGrad href="/espaces">
              <Calendar size={16} /> Réserver maintenant
            </BtnGrad>
            <BtnOutline href="/contact">
              <Users size={16} /> Contactez-nous
            </BtnOutline>
          </div>
        </div>
      </section>

    </div>
  );
}