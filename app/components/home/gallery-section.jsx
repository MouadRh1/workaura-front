// components/home/GallerySection.jsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Maximize2, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export function GallerySection() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      const response = await api.get('/gallery');
      const galleryData = response.data.data || response.data.galleries?.data || response.data || [];
      setImages(galleryData);
    } catch (error) {
      console.error('Erreur chargement galerie:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '/images/placeholder-gallery.webp';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://localhost:8000';
    return `${baseUrl}${path}`;
  };

  const categories = [
    { value: 'all', label: 'Tous' },
    { value: 'space', label: 'Espaces' },
    { value: 'event', label: 'Événements' },
    { value: 'community', label: 'Communauté' },
  ];

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  const largeImage = filteredImages[0];
  const smallImages = filteredImages.slice(1, 5);

  if (loading) {
    return (
      <section id="galerie" className="py-24 px-6 bg-[#0A0A0F]">
        <div className="max-w-[1440px] mx-auto text-center">
          <Loader2 size={48} className="mx-auto text-[#F4620A] animate-spin mb-4" />
          <p className="text-white">Chargement de la galerie...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="galerie" className="py-24 px-6 bg-[#0A0A0F]">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4620A]/10 border border-[#F4620A]/20 mb-6">
            <span className="text-xs uppercase tracking-widest text-[#F4620A] font-medium">
              Galerie
            </span>
          </div>
          <h2 className="text-5xl font-bold text-white leading-tight">
            Découvrez notre{' '}
            <span className="bg-gradient-to-r from-[#F4620A] to-[#9B1FD4] bg-clip-text text-transparent">
              espace unique
            </span>
          </h2>
          <p className="text-[#A0A0B8] mt-4 max-w-2xl mx-auto">
            Explorez nos espaces modernes et inspirants à travers notre galerie d'images
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-5 py-2 rounded-full transition-all duration-300 ${
                selectedCategory === cat.value
                  ? 'bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white'
                  : 'bg-white/10 text-[#A0A0B8] hover:bg-white/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[240px]">
            {/* Large Image */}
            {largeImage && (
              <Link 
                href={`/galerie/${largeImage.id || largeImage.slug}`}
                className="relative col-span-2 row-span-2 group rounded-[20px] overflow-hidden cursor-pointer block"
              >
                <div className="relative w-full h-full min-h-[500px]">
                  <img
                    src={getImageUrl(largeImage.image_path || largeImage.imageUrl)}
                    alt={largeImage.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center">
                    <Maximize2 size={32} className="text-white mb-2 mx-auto" />
                    <span className="text-white text-sm font-medium block">{largeImage.title}</span>
                    <span className="text-white/70 text-xs">
                      {largeImage.category === 'space' ? 'Espace' : largeImage.category === 'event' ? 'Événement' : 'Communauté'}
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Small Images */}
            {smallImages.map((image) => (
              <Link
                key={image.id}
                href={`/galerie/${image.id || image.slug}`}
                className="relative group rounded-[20px] overflow-hidden h-[240px] cursor-pointer block"
              >
                <div className="relative w-full h-full">
                  <img
                    src={getImageUrl(image.image_path || image.imageUrl)}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center">
                    <Maximize2 size={24} className="text-white mb-2 mx-auto" />
                    <span className="text-white text-sm font-medium block">{image.title}</span>
                    <span className="text-white/70 text-xs">
                      {image.category === 'space' ? 'Espace' : image.category === 'event' ? 'Événement' : 'Communauté'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#A0A0B8]">Aucune image trouvée dans cette catégorie</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/galerie"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#F4620A] text-[#F4620A] hover:bg-gradient-to-r hover:from-[#F4620A] hover:to-[#C040E0] hover:text-white hover:border-transparent transition-all duration-300 font-medium"
          >
            Voir toute la galerie →
          </Link>
        </div>
      </div>
    </section>
  );
}