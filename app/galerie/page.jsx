// app/galerie/page.jsx - Version avec next/image
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Maximize2, Image as ImageIcon } from 'lucide-react';
import api from '../lib/api';

export default function GaleriePage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  useEffect(() => {
    fetchGalleryImages();
  }, [selectedCategory]);

  const fetchGalleryImages = async () => {
    setLoading(true);
    try {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await api.get('/gallery', { params });
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

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'space': return '🏢 Espace';
      case 'event': return '🎉 Événement';
      case 'community': return '👥 Communauté';
      default: return category;
    }
  };

  const openLightbox = (image) => {
    setCurrentImage(image);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImage(null);
    document.body.style.overflow = 'auto';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center pt-24">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto text-[#F4620A] animate-spin mb-4" />
          <p className="text-white">Chargement de la galerie...</p>
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
              Galerie
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Notre <span className="gradient-text">Galerie</span>
          </h1>
          <p className="text-[#A0A0B8] text-lg max-w-2xl mx-auto">
            Découvrez notre espace unique à travers nos images
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === cat.value
                  ? 'bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white shadow-lg'
                  : 'bg-white/10 text-[#A0A0B8] hover:bg-white/20 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grille d'images */}
        {images.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon size={48} className="mx-auto text-[#A0A0B8] mb-4" />
            <p className="text-[#A0A0B8]">Aucune image trouvée dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                onClick={() => openLightbox(image)}
                className="group glass-effect rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getImageUrl(image.image_path || image.imageUrl)}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 size={32} className="text-white" />
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs">
                    {getCategoryLabel(image.category)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg mb-1">{image.title}</h3>
                  {image.description && (
                    <p className="text-[#A0A0B8] text-sm line-clamp-2">{image.description}</p>
                  )}
                  <p className="text-[#A0A0B8] text-xs mt-2">
                    Ajoutée le {new Date(image.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistiques */}
        {images.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-[#A0A0B8] text-sm">
              {images.length} image{images.length > 1 ? 's' : ''} disponible{images.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && currentImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <div className="relative max-w-5xl max-h-[90vh] mx-auto p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 p-2 text-white hover:text-[#F4620A] transition-colors"
            >
              ✕ Fermer
            </button>
            <img
              src={getImageUrl(currentImage.image_path || currentImage.imageUrl)}
              alt={currentImage.title}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-semibold">{currentImage.title}</h3>
              {currentImage.description && (
                <p className="text-[#A0A0B8] mt-2">{currentImage.description}</p>
              )}
              <p className="text-[#A0A0B8] text-sm mt-1">
                Catégorie: {getCategoryLabel(currentImage.category)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}