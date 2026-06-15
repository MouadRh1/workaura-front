"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users,
  Wifi,
  Monitor,
  ArrowRight,
  ChevronRight,
  LayoutGrid, // Tous
  Lock, // Bureau Privé
  Armchair, // Espace ouvert
  PresentationIcon, // Salle de Réunion — pas dispo, on utilise :
  Presentation, // lucide-react v0.383
  GraduationCap, // Salle de Formation
  CheckCircle, // feature fallback
} from "lucide-react";
import api from "../../lib/api";
import { useLoading } from "../ui/LoadingContext";

export default function SpacesGrid() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const { markDone } = useLoading();
  const initialFetchDone = useRef(false);

  useEffect(() => {
    fetchSpaces();
  }, [filter]);

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const url = filter ? `/spaces?type=${filter}` : "/spaces";
      const response = await api.get(url);
      const spacesData =
        response.data.spaces?.data || response.data.spaces || [];
      setSpaces(spacesData.slice(0, 3));
    } catch (err) {
      console.error("Erreur chargement espaces:", err);
    } finally {
      setLoading(false);
      if (!initialFetchDone.current) {
        initialFetchDone.current = true;
        markDone("spaces");
      }
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "/images/placeholder-space.jpg";
    if (path.startsWith("http")) return path;
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
      "https://localhost:8000";
    return `${baseUrl}${path}`;
  };

  const getFeatureIcon = (feature) => {
    const f = feature.toLowerCase();
    if (f.includes("wifi") || f.includes("fibre"))
      return <Wifi size={14} aria-hidden="true" />;
    if (f.includes("écran") || f.includes("monitor"))
      return <Monitor size={14} aria-hidden="true" />;
    if (f.includes("café") || f.includes("coffee"))
      return <Coffee size={14} aria-hidden="true" />;
    if (f.includes("parking") || f.includes("voiture"))
      return <Car size={14} aria-hidden="true" />;
    if (f.includes("climatisation") || f.includes("clim"))
      return <Wind size={14} aria-hidden="true" />;
    if (f.includes("sécurité") || f.includes("sécurisé"))
      return <ShieldCheck size={14} aria-hidden="true" />;
    if (f.includes("imprimante") || f.includes("print"))
      return <Printer size={14} aria-hidden="true" />;
    return <CheckCircle size={14} aria-hidden="true" />;
  };

  const filters = [
    {
      value: "",
      label: "Tous",
      icon: <LayoutGrid size={15} aria-hidden="true" />,
    },
    {
      value: "private",
      label: "Bureau Privé",
      icon: <Lock size={15} aria-hidden="true" />,
    },
    {
      value: "coworking",
      label: "Espace ouvert",
      icon: <Armchair size={15} aria-hidden="true" />,
    },
    {
      value: "meeting",
      label: "Salle de Réunion",
      icon: <Presentation size={15} aria-hidden="true" />,
    },
    {
      value: "formation",
      label: "Salle de Formation",
      icon: <GraduationCap size={15} aria-hidden="true" />,
    },
  ];

  const parseAmenities = (amenities) => {
    if (!amenities) return [];
    if (Array.isArray(amenities)) return amenities;
    if (typeof amenities === "string") {
      try {
        const parsed = JSON.parse(amenities);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Skeleton pendant le chargement initial (le splash screen global masque tout)
  if (loading && spaces.length === 0) {
    return (
      <section className="py-24 px-6 bg-[#0A0A0F]">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="text-center mb-16 space-y-4">
            <div className="w-24 h-6 bg-white/5 rounded-full mx-auto animate-pulse" />
            <div className="w-96 h-10 bg-white/5 rounded-xl mx-auto animate-pulse" />
            <div className="w-72 h-4 bg-white/5 rounded-lg mx-auto animate-pulse" />
          </div>
          {/* Cards skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#12121A] rounded-[20px] border border-[#2A2A3E] overflow-hidden animate-pulse"
              >
                <div className="h-[220px] bg-white/5" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-white/5 rounded w-2/3" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-4/5" />
                  <div className="h-10 bg-white/5 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Spinner discret pour les changements de filtre (après le chargement initial)
  const showFilterLoader = loading && spaces.length > 0;

  return (
    <section className=" px-6 bg-[#0A0A0F]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4620A]/10 border border-[#F4620A]/20 mb-6">
            <span className="text-xs uppercase tracking-widest text-[#F4620A] font-medium">
              Nos espaces
            </span>
          </div>
          <h2 className="text-5xl font-bold text-white leading-tight">
            Choisissez votre{" "}
            <span className="bg-gradient-to-r from-[#F4620A] to-[#9B1FD4] bg-clip-text text-transparent">
              espace idéal
            </span>
          </h2>
          <p className="text-[#A0A0B8] mt-4 max-w-2xl mx-auto">
            Des solutions adaptées à tous vos besoins, que vous soyez freelance,
            entrepreneur ou équipe
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              disabled={loading}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === f.value
                  ? "bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white shadow-lg"
                  : "bg-white/10 text-[#A0A0B8] hover:bg-white/20 hover:text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        {/* Spaces Grid */}
        <div
          className={`transition-opacity duration-300 ${showFilterLoader ? "opacity-40 pointer-events-none" : "opacity-100"}`}
        >
          {spaces.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#A0A0B8]">
                Aucun espace disponible pour le moment.
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {spaces.map((space) => {
                  const amenities = parseAmenities(space.amenities);
                  const displayFeatures = amenities.slice(0, 3);

                  return (
                    <div
                      key={space.id}
                      className="group bg-[#12121A] rounded-[20px] border border-[#2A2A3E] overflow-hidden hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(244,98,10,0.2)] transition-all duration-300"
                    >
                      <div className="relative h-[220px] overflow-hidden">
                        <img
                          src={getImageUrl(space.featured_image || space.image)}
                          alt={space.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = "/images/placeholder-space.jpg";
                          }}
                        />
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {space.name}
                        </h3>
                        <p className="text-[#A0A0B8] text-sm mb-4 line-clamp-2">
                          {space.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-[#A0A0B8]">
                          {displayFeatures.map((feature, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5"
                            >
                              {getFeatureIcon(feature)}
                              <span className="text-xs">{feature}</span>
                            </div>
                          ))}
                          {amenities.length > 3 && (
                            <span className="text-xs text-[#A0A0B8]">
                              +{amenities.length - 3}
                            </span>
                          )}
                        </div>

                        {space.capacity && (
                          <div className="flex items-center gap-1.5 mb-3 text-xs text-[#A0A0B8]">
                            <Users size={14} />
                            <span>Capacité: {space.capacity}</span>
                          </div>
                        )}

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

              <div className="text-center mt-12">
                <Link
                  href="/espaces"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium hover:shadow-lg transition-all duration-300 group"
                >
                  <span>Voir tous les espaces</span>
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
