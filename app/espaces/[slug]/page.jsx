// app/espaces/[slug]/page.jsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  Wifi,
  Coffee,
  Maximize,
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Award,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Mail,
  Navigation,
} from "lucide-react";
import api from "../../lib/api";
import Button from "../../components/ui/Button";
import Link from "next/link";
import ReservationModal from "../../components/ui/ReservationModal";

export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [space, setSpace] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setBaseUrl(
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
        "https://localhost:8000",
    );
  }, []);

  useEffect(() => {
    if (params.slug) {
      fetchSpaceDetails();
    }
  }, [params.slug]);

  const fetchSpaceDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/spaces/${params.slug}`);
      setSpace(response.data.space);
      setAvailabilities(response.data.availabilities || []);
      setGalleryImages(response.data.space?.images || []);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  // Parser les amenities (JSON string ou tableau)
  const amenities = useMemo(() => {
    if (!space?.amenities) return [];
    if (Array.isArray(space.amenities)) return space.amenities;
    if (typeof space.amenities === "string") {
      try {
        const parsed = JSON.parse(space.amenities);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }, [space?.amenities]);

  const handleBooking = () => {
    if (!space) return;
    setIsReservationModalOpen(true);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath || imageError) {
      return "/images/placeholder-space.jpg";
    }
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    let cleanPath = imagePath;
    if (cleanPath.startsWith("/api")) {
      cleanPath = cleanPath.substring(4);
    }
    if (!cleanPath.startsWith("/")) {
      cleanPath = "/" + cleanPath;
    }
    return `${baseUrl}${cleanPath}`;
  };

  // Lightbox functions
  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "auto";
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length,
    );
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen]);

  const typeLabel =
    {
      private: "Bureau Privé",
      coworking: "Coworking",
      meeting: "Salle de Réunion",
      formation: "Salle de Formation",
      terrace: "Terrasse",
    }[space?.type] ||
    space?.type ||
    "Espace";

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes("wifi") || amenityLower.includes("fibre"))
      return <Wifi size={18} className="text-[#F4620A]" />;
    if (amenityLower.includes("café") || amenityLower.includes("coffee"))
      return <Coffee size={18} className="text-[#F4620A]" />;
    if (amenityLower.includes("climatisation"))
      return <Maximize size={18} className="text-[#F4620A]" />;
    if (amenityLower.includes("parking") || amenityLower.includes("voiture"))
      return <MapPin size={18} className="text-[#F4620A]" />;
    if (amenityLower.includes("écran") || amenityLower.includes("vidéo"))
      return <Award size={18} className="text-[#F4620A]" />;
    if (amenityLower.includes("sécurité") || amenityLower.includes("sécurisé"))
      return <Shield size={18} className="text-[#F4620A]" />;
    return <CheckCircle size={18} className="text-[#F4620A]" />;
  };

  // Toutes les images (principale + gallery)
  const allImages = useMemo(() => {
    const images = [];
    if (space?.featured_image) {
      images.push({ path: space.featured_image, isPrimary: true });
    }
    if (galleryImages.length > 0) {
      galleryImages.forEach((img) => {
        images.push({ path: img.image_path, isPrimary: false, id: img.id });
      });
    }
    return images;
  }, [space?.featured_image, galleryImages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F4620A]/30 border-t-[#F4620A] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Espace non trouvé</p>
          <Link href="/espaces">
            <Button>Retour aux espaces</Button>
          </Link>
        </div>
      </div>
    );
  }

  const mainImageUrl = getImageUrl(space.featured_image);

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/espaces"
          className="inline-flex items-center gap-2 text-[#A0A0B8] hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Retour aux espaces
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne gauche - Images et description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image principale avec galerie */}
            <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              <div
                className="relative cursor-pointer group"
                onClick={() => openLightbox(0)}
              >
                <img
                  src={mainImageUrl}
                  alt={space.name}
                  className="w-full h-[400px] object-cover"
                  onError={() => setImageError(true)}
                />
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                    <span>📷</span>
                    <span>1/{allImages.length}</span>
                  </div>
                )}
              </div>

              {/* Miniatures des images de la galerie */}
              {allImages.length > 1 && (
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => openLightbox(idx)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          idx === 0
                            ? "border-[#F4620A]"
                            : "border-white/10 hover:border-[#F4620A]/50"
                        }`}
                      >
                        <img
                          src={getImageUrl(img.path)}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description et équipements */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm bg-white/10 text-[#A0A0B8] px-3 py-1 rounded-full">
                  {typeLabel}
                </span>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    space.status === "available"
                      ? "bg-green-400/10 text-green-400"
                      : space.status === "occupied"
                        ? "bg-yellow-400/10 text-yellow-400"
                        : "bg-red-400/10 text-red-400"
                  }`}
                >
                  {space.status === "available"
                    ? "✓ Disponible"
                    : space.status === "occupied"
                      ? "⏳ Occupé"
                      : "🔧 Maintenance"}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">
                {space.name}
              </h1>
              <p className="text-[#A0A0B8] leading-relaxed mb-6">
                {space.description}
              </p>

              {/* Caractéristiques principales */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {space.capacity && (
                  <div className="flex items-center gap-3 text-[#A0A0B8] bg-white/5 rounded-xl p-3">
                    <Users size={20} className="text-[#F4620A]" />
                    <div>
                      <p className="text-xs text-[#A0A0B8]">Capacité</p>
                      <p className="text-white font-medium">{space.capacity}</p>
                    </div>
                  </div>
                )}

                {space.price && (
                  <div className="flex items-center gap-3 text-[#A0A0B8] bg-white/5 rounded-xl p-3">
                    <Clock size={20} className="text-[#F4620A]" />
                    <div>
                      <p className="text-xs text-[#A0A0B8]">Tarif</p>
                      <p className="text-white font-medium">
                        {space.price} MAD
                        <span className="text-xs text-[#A0A0B8]">/jour</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-[#A0A0B8] bg-white/5 rounded-xl p-3">
                  <Calendar size={20} className="text-[#F4620A]" />
                  <div>
                    <p className="text-xs text-[#A0A0B8]">Disponibilité</p>
                    <p className="text-white font-medium">Aujourd'hui</p>
                  </div>
                </div>
              </div>

              {/* Équipements */}
              {amenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    📋 Équipements inclus
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {amenities.map((amenity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-[#A0A0B8] bg-white/5 rounded-lg p-2"
                      >
                        {getAmenityIcon(amenity)}
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section Localisation et Carte */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] flex items-center justify-center">
                  <MapPin size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Localisation
                </h3>
              </div>

              <p className="text-[#A0A0B8] mb-4">
                Centre Témara, Maroc - À proximité de toutes les commodités
              </p>

              {/* Google Maps Embed */}
              <div className="rounded-xl overflow-hidden border border-white/10">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3310.3572670390363!2d-6.907973325590739!3d33.93193812407532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda713c7816d6f15%3A0xf8c772a4a0734a4d!2sWorkaura!5e0!3m2!1sfr!2sma!4v1780586811239!5m2!1sfr!2sma"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                  title="Carte Workaura"
                />
              </div>

              {/* Bouton Itinéraire */}
              <a
                href="https://maps.google.com/?q=Workaura+Témara"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg border border-[#F4620A] text-[#F4620A] hover:bg-gradient-to-r hover:from-[#F4620A] hover:to-[#C040E0] hover:text-white transition-all duration-300"
              >
                <Navigation size={16} />
                Obtenir l'itinéraire
              </a>
            </div>

            {/* Section Contact Rapide */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Phone size={18} className="text-[#F4620A]" />
                Besoin d'informations ?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-[#A0A0B8] bg-white/5 rounded-xl p-3">
                  <Phone size={18} className="text-[#F4620A]" />
                  <div>
                    <p className="text-xs text-[#A0A0B8]">Téléphone</p>
                    <p className="text-white font-medium">+212 5XX XXX XXX</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[#A0A0B8] bg-white/5 rounded-xl p-3">
                  <Mail size={18} className="text-[#F4620A]" />
                  <div>
                    <p className="text-xs text-[#A0A0B8]">Email</p>
                    <p className="text-white font-medium">
                      contact@workaura.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite - Réservation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Carte de réservation */}
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="text-center mb-6">
                  <p className="text-[#A0A0B8] text-sm mb-2">
                    Prix à partir de
                  </p>
                  <p className="text-4xl font-bold gradient-text">
                    {space.price} MAD
                  </p>
                  <p className="text-[#A0A0B8] text-xs">par jour</p>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Sélecteur de date */}
                  {/* <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      📅 Sélectionnez une date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div> */}

                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-[#A0A0B8]">Prix journalier</span>
                      <span className="text-white">{space.price} MAD</span>
                    </div>
                    <div className="border-t border-white/10 my-2"></div>
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Total</span>
                      <span className="gradient-text text-xl">
                        {space.price} MAD
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={space.status !== "available"}
                  className="w-full py-3 text-base"
                >
                  {space.status === "available"
                    ? "📝 Réserver maintenant"
                    : "❌ Indisponible"}
                </Button>

                <div className="mt-4 text-center">
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-[#A0A0B8]">
                    <span>✓ Réservation sécurisée</span>
                    <span>✓ Paiement sécurisé</span>
                    <span>✓ Annulation gratuite</span>
                  </div>
                </div>
              </div>

              {/* Carte d'aide */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F4620A] to-[#C040E0] flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-xl">💬</span>
                </div>
                <h3 className="text-white font-semibold mb-2">
                  Besoin d'aide ?
                </h3>
                <p className="text-[#A0A0B8] text-sm mb-4">
                  Notre équipe est là pour vous aider à choisir l'espace parfait
                  et répondre à vos questions.
                </p>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full text-sm">
                    📞 Nous contacter
                  </Button>
                  <p className="text-xs text-[#A0A0B8]">
                    Réponse sous 24h | 7j/7
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
          >
            <X size={24} />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <ChevronRight size={32} />
          </button>

          <div className="max-w-4xl max-h-[80vh] mx-auto">
            <img
              src={getImageUrl(allImages[currentImageIndex]?.path)}
              alt={`Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="text-center mt-4 text-white/70 text-sm">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}

      {/* Modal de réservation */}
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        spaceId={space.id}
        spaceName={space.name}
        spacePrice={space.price}
      />
    </div>
  );
}
