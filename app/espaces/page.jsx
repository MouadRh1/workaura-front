// app/espaces/page.jsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Wifi, Monitor, ArrowRight, Loader2, CheckCircle, Clock, MapPin, Coffee, Maximize, Calendar } from 'lucide-react';
import api from '../lib/api';

export default function EspacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchSpaces();
  }, [filter]);

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const url = filter ? `/spaces?type=${filter}` : '/spaces';
      const response = await api.get(url);
      const spacesData = response.data.spaces?.data || response.data.spaces || [];
      setSpaces(spacesData);
    } catch (err) {
      console.error('Erreur chargement espaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '/images/placeholder-space.jpg';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://localhost:8000';
    return `${baseUrl}${path}`;
  };

  const getTypeLabel = (type) => {
    const types = {
      private: 'Bureau Privé',
      coworking: 'Coworking',
      meeting: 'Salle de Réunion',
      formation: 'Salle de Formation',
      terrace: 'Terrasse',
    };
    return types[type] || type;
  };

  const getStatusLabel = (status) => {
    const statuses = {
      available: { label: 'Disponible', color: 'text-green-400 bg-green-400/10' },
      occupied: { label: 'Occupé', color: 'text-yellow-400 bg-yellow-400/10' },
      maintenance: { label: 'Maintenance', color: 'text-red-400 bg-red-400/10' },
    };
    return statuses[status] || { label: status, color: 'text-gray-400 bg-gray-400/10' };
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

  const filters = [
    { value: '', label: 'Tous' },
    { value: 'private', label: 'Bureau Privé' },
    { value: 'coworking', label: 'Coworking' },
    { value: 'meeting', label: 'Salle de Réunion' },
    { value: 'formation', label: 'Salle de Formation' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Loader2 size={48} className="mx-auto text-[#F4620A] animate-spin mb-4" />
          <p className="text-white">Chargement des espaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4620A]/10 border border-[#F4620A]/20 mb-6">
            <span className="text-xs uppercase tracking-widest text-[#F4620A] font-medium">
              Nos espaces
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Nos <span className="gradient-text">Espaces</span>
          </h1>
          <p className="text-[#A0A0B8] text-lg max-w-2xl mx-auto">
            Trouvez l'espace parfait pour votre travail, que vous soyez en équipe ou en solo
          </p>
        </div>

        {/* Filtres et vue */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div className="flex flex-wrap justify-center gap-3">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  filter === f.value
                    ? 'bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white shadow-lg'
                    : 'bg-white/10 text-[#A0A0B8] hover:bg-white/20 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <div className="flex gap-2 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white'
                  : 'text-[#A0A0B8] hover:text-white'
              }`}
            >
              🖼️ Grille
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white'
                  : 'text-[#A0A0B8] hover:text-white'
              }`}
            >
              📋 Liste
            </button>
          </div>
        </div>

        {/* Statistiques */}
        {spaces.length > 0 && (
          <div className="flex justify-center gap-6 mb-8 text-sm text-[#A0A0B8]">
            <span>🏢 {spaces.length} espaces disponibles</span>
            <span>👥 {spaces.filter(s => s.status === 'available').length} disponibles</span>
          </div>
        )}

        {/* Espaces - Vue Grille */}
        {viewMode === 'grid' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {spaces.map((space) => {
              const amenities = parseAmenities(space.amenities);
              const displayFeatures = amenities.slice(0, 3);
              const status = getStatusLabel(space.status);
              
              return (
                <div
                  key={space.id}
                  className="group bg-[#12121A] rounded-[20px] border border-[#2A2A3E] overflow-hidden hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(244,98,10,0.2)] transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-[220px] overflow-hidden">
                    <img
                      src={getImageUrl(space.featured_image || space.image)}
                      alt={space.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-space.jpg';
                      }}
                    />
                    {/* Type Badge */}
                    {/* <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white text-xs font-medium">
                      {getTypeLabel(space.type)}
                    </div> */}
                    {/* Status Badge */}
                    {/* <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </div> */}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {space.name}
                    </h3>
                    <p className="text-[#A0A0B8] text-sm mb-4 line-clamp-2">
                      {space.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      {displayFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[#A0A0B8] text-xs">
                          <CheckCircle size={12} className="text-[#F4620A]" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {amenities.length > 3 && (
                        <div className="text-xs text-[#A0A0B8]">+{amenities.length - 3}</div>
                      )}
                    </div>

                    {/* Capacity & Price */}
                    <div className="flex items-center justify-between mb-5">
                      {space.capacity && (
                        <div className="flex items-center gap-1.5 text-[#A0A0B8] text-sm">
                          <Users size={16} />
                          <span>{space.capacity}</span>
                        </div>
                      )}
                      {/* <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-[#F4620A]">
                          {space.price} MAD
                        </span>
                        <span className="text-[#A0A0B8] text-sm">/jour</span>
                      </div> */}
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={`/espaces/${space.slug}`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-[#F4620A] text-[#F4620A] font-medium hover:bg-gradient-to-r hover:from-[#F4620A] hover:to-[#C040E0] hover:text-white hover:border-transparent transition-all duration-300 group/btn"
                    >
                      Voir les détails
                      <ArrowRight
                        size={18}
                        className="group-hover/btn:translate-x-1 transition-transform"
                      />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Espaces - Vue Liste */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {spaces.map((space) => {
              const amenities = parseAmenities(space.amenities);
              const status = getStatusLabel(space.status);
              
              return (
                <div
                  key={space.id}
                  className="group bg-[#12121A] rounded-[20px] border border-[#2A2A3E] overflow-hidden hover:shadow-[0_8px_32px_rgba(244,98,10,0.1)] transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    {/* Image */}
                    <div className="relative w-full md:w-64 h-48 md:h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={getImageUrl(space.featured_image || space.image)}
                        alt={space.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = '/images/placeholder-space.jpg';
                        }}
                      />
                      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-white">{space.name}</h3>
                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[#A0A0B8] text-xs">
                              {getTypeLabel(space.type)}
                            </span>
                          </div>
                          <p className="text-[#A0A0B8] text-sm line-clamp-2">
                            {space.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#F4620A]">
                            {space.price} MAD
                          </div>
                          <div className="text-[#A0A0B8] text-xs">/jour</div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        {space.capacity && (
                          <div className="flex items-center gap-1.5 text-[#A0A0B8] text-xs">
                            <Users size={14} />
                            <span>{space.capacity}</span>
                          </div>
                        )}
                        {amenities.slice(0, 4).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[#A0A0B8] text-xs">
                            <CheckCircle size={12} className="text-[#F4620A]" />
                            <span>{feature}</span>
                          </div>
                        ))}
                        {amenities.length > 4 && (
                          <div className="text-xs text-[#A0A0B8]">+{amenities.length - 4}</div>
                        )}
                      </div>

                      {/* CTA */}
                      <Link
                        href={`/espaces/${space.slug}`}
                        className="inline-flex items-center gap-2 text-[#F4620A] hover:text-[#C040E0] font-medium transition-colors"
                      >
                        Voir les détails
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Aucun résultat */}
        {spaces.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏢</div>
            <p className="text-[#A0A0B8] text-lg">Aucun espace trouvé dans cette catégorie</p>
            <button
              onClick={() => setFilter('')}
              className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium hover:shadow-lg transition-all"
            >
              Voir tous les espaces
            </button>
          </div>
        )}
      </div>
    </div>
  );
}