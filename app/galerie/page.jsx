// app/galerie/page.jsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Loader2,
  Maximize2,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Heart,
  Calendar,
  Tag,
  Info,
} from 'lucide-react';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function GaleriePage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);

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
    { value: 'all', label: 'Tous', icon: '🖼️' },
    { value: 'space', label: 'Espaces', icon: '🏢' },
    { value: 'event', label: 'Événements', icon: '🎉' },
    { value: 'community', label: 'Communauté', icon: '👥' },
  ];

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'space': return { label: 'Espace', icon: '🏢', color: 'from-blue-500 to-cyan-500' };
      case 'event': return { label: 'Événement', icon: '🎉', color: 'from-purple-500 to-pink-500' };
      case 'community': return { label: 'Communauté', icon: '👥', color: 'from-green-500 to-emerald-500' };
      default: return { label: category, icon: '📷', color: 'from-gray-500 to-gray-600' };
    }
  };

  const openLightbox = (image, index) => {
    setCurrentImage(image);
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImage(null);
    document.body.style.overflow = 'auto';
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentImage(images[currentIndex - 1]);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentImage(images[currentIndex + 1]);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDownload = async () => {
    if (!currentImage) return;
    const imageUrl = getImageUrl(currentImage.image_path || currentImage.imageUrl);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentImage.title || 'image';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur téléchargement:', err);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentImage?.title,
          text: currentImage?.description,
          url: url,
        });
      } catch (err) {
        console.log('Partage annulé');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Lien copié dans le presse-papier !');
    }
  };

  const handleKeyDown = useCallback((e) => {
    if (!lightboxOpen) return;
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') closeLightbox();
  }, [lightboxOpen, currentIndex, images]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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

  const categoryInfo = currentImage ? getCategoryLabel(currentImage.category) : null;

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
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
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                selectedCategory === cat.value
                  ? 'bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white shadow-lg'
                  : 'bg-white/10 text-[#A0A0B8] hover:bg-white/20 hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Grille d'images */}
        {images.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <ImageIcon size={48} className="mx-auto text-[#A0A0B8] mb-4" />
            <p className="text-[#A0A0B8]">Aucune image trouvée dans cette catégorie</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {images.map((image, idx) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                onClick={() => openLightbox(image, idx)}
                className="group glass-effect rounded-2xl overflow-hidden cursor-pointer relative"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getImageUrl(image.image_path || image.imageUrl)}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{image.title}</h3>
                      <p className="text-white/70 text-sm">{getCategoryLabel(image.category).label}</p>
                    </div>
                    <Maximize2 size={24} className="text-white" />
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs">
                    {getCategoryLabel(image.category).icon} {getCategoryLabel(image.category).label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Statistiques */}
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 text-center"
          >
            <p className="text-[#A0A0B8] text-sm">
              {images.length} image{images.length > 1 ? 's' : ''} disponible{images.length > 1 ? 's' : ''}
            </p>
          </motion.div>
        )}
      </div>

      {/* Lightbox Modal Moderne */}
      <AnimatePresence>
        {lightboxOpen && currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Bouton fermer */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <X size={24} />
            </button>

            {/* Navigation précédente */}
            {currentIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all group"
              >
                <ChevronLeft size={32} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Navigation suivante */}
            {currentIndex < images.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all group"
              >
                <ChevronRight size={32} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Contenu principal */}
            <div className="relative max-w-6xl max-h-[90vh] mx-auto p-4" onClick={(e) => e.stopPropagation()}>
              {/* Image */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                className="relative"
              >
                <img
                  src={getImageUrl(currentImage.image_path || currentImage.imageUrl)}
                  alt={currentImage.title}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg"
                />
                
                {/* Indicateur de progression */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              </motion.div>

              {/* Panneau d'informations */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-4 bg-black/60 backdrop-blur-md rounded-xl p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${categoryInfo.color} text-white`}>
                        {categoryInfo.icon} {categoryInfo.label}
                      </span>
                      <span className="text-xs text-white/50">
                        <Calendar size={12} className="inline mr-1" />
                        {new Date(currentImage.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{currentImage.title}</h3>
                    {currentImage.description && (
                      <p className="text-white/70 text-sm mt-1">{currentImage.description}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLiked(!liked)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    >
                      <Heart size={20} className={liked ? 'fill-red-500 text-red-500' : 'text-white'} />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    >
                      <Download size={20} className="text-white" />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    >
                      <Share2 size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Indicateur de navigation clavier */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs flex gap-4">
              <span>← → pour naviguer</span>
              <span>ESC pour fermer</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .gradient-text {
          background: linear-gradient(135deg, #F4620A, #9B1FD4);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>
    </div>
  );
}