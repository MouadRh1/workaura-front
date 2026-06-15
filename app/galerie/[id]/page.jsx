// app/galerie/[slug]/page.jsx (renommez le dossier [id] en [slug])
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Calendar,
  Tag,
  Heart,
  Loader2,
} from 'lucide-react';
import api from '../../lib/api';

export default function GalerieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [allImages, setAllImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchCurrentImage();
      fetchAllImages();
    }
  }, [params.slug]);

  const fetchCurrentImage = async () => {
    try {
      // Utiliser le slug directement
      const response = await api.get(`/gallery/${params.slug}`);
      setImage(response.data);
    } catch (err) {
      console.error('Erreur chargement image:', err);
      setError('Image non trouvée');
      setLoading(false);
    }
  };

  const fetchAllImages = async () => {
    try {
      const response = await api.get('/gallery');
      const images = response.data.data || response.data.galleries?.data || response.data || [];
      setAllImages(images);
      const index = images.findIndex(img => img.slug === params.slug);
      setCurrentIndex(index !== -1 ? index : 0);
    } catch (err) {
      console.error('Erreur chargement liste:', err);
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

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'space': return { label: 'Espace', icon: '🏢', color: 'bg-blue-500/20 text-blue-400' };
      case 'event': return { label: 'Événement', icon: '🎉', color: 'bg-purple-500/20 text-purple-400' };
      case 'community': return { label: 'Communauté', icon: '👥', color: 'bg-green-500/20 text-green-400' };
      default: return { label: category, icon: '📷', color: 'bg-gray-500/20 text-gray-400' };
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevImage = allImages[currentIndex - 1];
      router.push(`/galerie/${prevImage.slug}`);
    }
  };

  const goToNext = () => {
    if (currentIndex < allImages.length - 1) {
      const nextImage = allImages[currentIndex + 1];
      router.push(`/galerie/${nextImage.slug}`);
    }
  };

  const handleDownload = async () => {
    if (!image) return;
    const imageUrl = getImageUrl(image.image_path || image.imageUrl);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.title || 'image';
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
          title: image?.title,
          text: image?.description,
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

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') router.push('/galerie');
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, allImages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center pt-24">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto text-[#F4620A] animate-spin mb-4" />
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="text-6xl mb-4">🖼️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Image non trouvée</h2>
          <p className="text-[#A0A0B8] mb-6">L'image que vous recherchez n'existe pas ou a été supprimée.</p>
          <Link href="/galerie" className="px-6 py-3 rounded-full bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium hover:shadow-lg transition-all">
            Retour à la galerie
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryLabel(image.category);
  const imageUrl = getImageUrl(image.image_path || image.imageUrl);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allImages.length - 1;

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/galerie"
            className="inline-flex items-center gap-2 text-[#A0A0B8] hover:text-white transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Retour à la galerie
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-white/10 text-[#A0A0B8] px-3 py-1 rounded-full">
              {currentIndex + 1} / {allImages.length}
            </span>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image principale */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              {hasPrevious && (
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all group"
                >
                  <ChevronLeft size={28} />
                </button>
              )}
              
              <div className="relative h-[500px] md:h-[600px]">
                <img
                  src={imageUrl}
                  alt={image.title}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {hasNext && (
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all group"
                >
                  <ChevronRight size={28} />
                </button>
              )}
            </div>

            {/* Miniatures */}
            {allImages.length > 1 && (
              <div className="mt-4 flex justify-center gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => router.push(`/galerie/${img.slug}`)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      currentIndex === idx
                        ? 'border-[#F4620A] shadow-lg scale-105'
                        : 'border-white/20 hover:border-[#F4620A]/50'
                    }`}
                  >
                    <img
                      src={getImageUrl(img.image_path || img.imageUrl)}
                      alt={img.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm ${categoryInfo.color}`}>
                {categoryInfo.icon} {categoryInfo.label}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {image.title}
            </h1>

            {image.description && (
              <div className="bg-white/5 rounded-xl p-6">
                <p className="text-[#A0A0B8] leading-relaxed">
                  {image.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-[#A0A0B8] bg-white/5 rounded-xl p-3">
                <Calendar size={18} className="text-[#F4620A]" />
                <div>
                  <p className="text-xs">Ajoutée le</p>
                  <p className="text-white text-sm font-medium">
                    {new Date(image.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-[#A0A0B8] bg-white/5 rounded-xl p-3">
                <Tag size={18} className="text-[#F4620A]" />
                <div>
                  <p className="text-xs">Catégorie</p>
                  <p className="text-white text-sm font-medium">{categoryInfo.label}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all"
              >
                <Download size={18} />
                Télécharger
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all"
              >
                <Share2 size={18} />
                Partager
              </button>
              <button
                onClick={() => setLiked(!liked)}
                className="px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all"
              >
                <Heart size={18} className={liked ? 'fill-red-500 text-red-500' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}