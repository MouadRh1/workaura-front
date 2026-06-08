// components/home/SpaceCard.jsx
'use client';
import Link from "next/link";
import { useState } from "react";
import Button from "../ui/Button";

export default function SpaceCard({ space, baseUrl }) {
  const [imageError, setImageError] = useState(false);

  // Gestion de l'image
  const imageUrl = space.featured_image
    ? space.featured_image.startsWith("http")
      ? space.featured_image
      : `${baseUrl}${space.featured_image}`
    : "/images/placeholder-space.jpg";

  // Type d'espace
  const typeLabel = {
    private: "Bureau Privé",
    coworking: "Espace ouvert",
    meeting: "Salle de Réunion",
    terrace: "Terrasse",
  }[space.type] || space.type;

  // Parse amenities (qui peut être un tableau ou une chaîne JSON)
  const getAmenities = () => {
    if (!space.amenities) return [];
    
    // Si c'est déjà un tableau
    if (Array.isArray(space.amenities)) {
      return space.amenities;
    }
    
    // Si c'est une chaîne JSON
    if (typeof space.amenities === 'string') {
      try {
        const parsed = JSON.parse(space.amenities);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Erreur parsing amenities:', e);
        return [];
      }
    }
    
    return [];
  };

  const amenities = getAmenities();

  return (
    <div className="glass-effect rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 hover:border-[#F4620A]/30">
      <div className="h-48 overflow-hidden">
        <img
          src={imageError ? "/images/placeholder-space.jpg" : imageUrl}
          alt={space.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-white/10 text-[#A0A0B8] px-2 py-1 rounded-full">
            {typeLabel}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              space.status === "available"
                ? "bg-green-400/10 text-green-400"
                : space.status === "occupied"
                ? "bg-yellow-400/10 text-yellow-400"
                : "bg-red-400/10 text-red-400"
            }`}
          >
            {space.status === "available"
              ? "Disponible"
              : space.status === "occupied"
              ? "Occupé"
              : "Maintenance"}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{space.name}</h3>
        <p className="text-[#A0A0B8] text-sm mb-4 line-clamp-2">
          {space.description}
        </p>

        {/* Capacité */}
        {space.capacity && (
          <p className="text-[#A0A0B8] text-xs mb-3">
            Capacité: {space.capacity}
          </p>
        )}

        {/* Amenities depuis l'API */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {amenities.slice(0, 3).map((feature, idx) => (
              <span
                key={idx}
                className="text-xs bg-white/10 text-[#A0A0B8] px-2 py-1 rounded-full"
              >
                ✓ {typeof feature === 'string' ? feature : feature.name || feature}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="text-xs text-[#A0A0B8] bg-white/10 px-2 py-1 rounded-full">
                +{amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold gradient-text">
              {space.price} MAD
            </span>
            <span className="text-[#A0A0B8] text-sm">/jour</span>
          </div>
          <Link href={`/espaces/${space.slug}`}>
            <Button variant="outline" className="px-4 py-2 text-sm">
              Voir détails →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}