"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  Settings,
  LogOut,
  TrendingUp,
  Building2,
  Image as ImageIcon,
  X,
  Plus,
  Menu,
  Star,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
  Phone,
  Mail,
  MapPin,
  Home,
  BarChart3,
  CalendarDays,
  ImagePlus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { StatsCards } from "../../components/admin/StatsCard";
import { BookingModal } from "../../components/admin/BookingModal";
import { SpaceModal } from "../../components/admin/SpaceModal";
import { GalleryModal } from "../../components/admin/GalleryModal";
import { BookingsTable } from "../../components/admin/BookingTable";

// ─── Constantes ───────────────────────────────────────────────────────────────
const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://localhost:8000/api"
).replace("/api", "");

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:8000/api";

function getImageUrl(path) {
  if (!path) return "/images/placeholder-space.jpg";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const {
    user,
    logout,
    isAuthenticated,
    isAdmin,
    loading: authLoading,
  } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Data
  const [bookings, setBookings] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [stats, setStats] = useState({
    total_bookings: 0,
    total_members: 0,
    total_spaces: 0,
    total_gallery: 0,
  });

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editingSpace, setEditingSpace] = useState(null);
  const [editingGallery, setEditingGallery] = useState(null);

  // UI
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ── Auth guard avec gestion du chargement ──────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isAdmin) {
      router.push("/");
      return;
    }
    fetchData();
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // ── Fetch all data ──────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, spacesRes, galleryRes, statsRes] = await Promise.all([
        api.get("/admin/bookings"),
        api.get("/admin/spaces"),
        api.get("/admin/gallery"),
        api.get("/admin/dashboard/stats"),
      ]);
      setBookings(bookingsRes.data.data || bookingsRes.data || []);
      setSpaces(spacesRes.data.data || spacesRes.data || []);
      setGallery(galleryRes.data.data || galleryRes.data || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Erreur chargement données:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // ── Helper : fetch natif pour FormData ──────────────────────────────────────
  const fetchWithFormData = async (url, formData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}${url}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: formData,
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (errData?.errors) {
        const first = Object.values(errData.errors)[0];
        throw new Error(Array.isArray(first) ? first[0] : first);
      }
      throw new Error(
        errData?.message || `Erreur serveur (${response.status})`,
      );
    }
    return response.json();
  };

  // ── GALLERY CRUD ────────────────────────────────────────────────────────────
  const handleGallerySave = async (formData, editingItem) => {
    const url = editingItem
      ? `/admin/gallery/${editingItem.id}`
      : `/admin/gallery`;
    await fetchWithFormData(url, formData);
    await fetchData();
    setIsGalleryModalOpen(false);
    setEditingGallery(null);
  };

  const handleDeleteImage = async (id) => {
    if (!confirm("Supprimer cette image ?")) return;
    try {
      await api.delete(`/admin/gallery/${id}`);
      await fetchData();
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("Erreur lors de la suppression");
    }
  };

  // ── SPACES CRUD ─────────────────────────────────────────────────────────────
  const handleSpaceSave = async (formData, editingItem) => {
    const url = editingItem
      ? `/admin/spaces/${editingItem.id}`
      : `/admin/spaces`;
    await fetchWithFormData(url, formData);
    await fetchData();
    setIsSpaceModalOpen(false);
    setEditingSpace(null);
  };

  const handleSpaceSaveCallback = useCallback(
    (formData) => handleSpaceSave(formData, editingSpace),
    [editingSpace],
  );

  const handleDeleteSpace = async (id) => {
    if (!confirm("Supprimer cet espace ?")) return;
    try {
      await api.delete(`/admin/spaces/${id}`);
      await fetchData();
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("Erreur lors de la suppression");
    }
  };

  // ── BOOKINGS CRUD ───────────────────────────────────────────────────────────
  const handleAddBooking = (data) => {
    setBookings([{ id: Date.now(), ...data }, ...bookings]);
    setIsBookingModalOpen(false);
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setIsBookingModalOpen(true);
  };

  const handleUpdateBooking = (data) => {
    setBookings(
      bookings.map((b) => (b.id === editingBooking.id ? { ...b, ...data } : b)),
    );
    setIsBookingModalOpen(false);
    setEditingBooking(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/bookings/${id}`, { status: newStatus });
      setBookings(
        bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
      );
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!confirm("Supprimer cette réservation ?")) return;
    try {
      await api.delete(`/admin/bookings/${id}`);
      setBookings(bookings.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  // ── Pagination bookings ─────────────────────────────────────────────────────
  const filteredBookings = bookings.filter((b) => {
    const name = (b.guest_name || b.user?.name || "").toLowerCase();
    const email = (b.guest_email || b.user?.email || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || email.includes(term);
  });
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ── Stats cards ─────────────────────────────────────────────────────────────
  const statsCards = [
    {
      label: "Réservations",
      value: stats.total_bookings?.toString() || "0",
      icon: Calendar,
      change: "+8%",
      color: "from-[#00B4D8] to-[#0077B6]",
    },
    {
      label: "Membres",
      value: stats.total_members?.toString() || "0",
      icon: Users,
      change: "+12%",
      color: "from-[#F4620A] to-[#C040E0]",
    },
    {
      label: "Espaces",
      value: stats.total_spaces?.toString() || "0",
      icon: Building2,
      change: "+2",
      color: "from-[#4CAF50] to-[#2E7D32]",
    },
    {
      label: "Galerie",
      value: stats.total_gallery?.toString() || "0",
      icon: ImageIcon,
      change: "+4",
      color: "from-[#FF6B6B] to-[#C92A2A]",
    },
  ];

  const tabs = [
    { id: "dashboard", label: "Tableau de bord", icon: BarChart3 },
    { id: "bookings", label: "Réservations", icon: CalendarDays },
    { id: "spaces", label: "Espaces", icon: Building2 },
    { id: "gallery", label: "Galerie", icon: ImagePlus },
    // { id: "settings", label: "Paramètres", icon: Settings },
  ];

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F4620A]/30 border-t-[#F4620A] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">
            {authLoading ? "Vérification..." : "Chargement..."}
          </p>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#0A0A0F]/95 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-40 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div
              className={`flex items-center gap-3 ${
                !isSidebarOpen && "justify-center"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F4620A] to-[#9B1FD4] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">WA</span>
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm">WORKAURA</span>
                  <span className="text-[#A0A0B8] text-xs">Admin</span>
                </div>
              )}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#F4620A]/20 to-[#C040E0]/20 border border-[#F4620A]/30 text-white"
                    : "text-[#A0A0B8] hover:bg-white/5 hover:text-white"
                }`}
              >
                <tab.icon size={20} className="flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="text-sm font-medium">{tab.label}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all duration-200"
            >
              <LogOut size={20} className="flex-shrink-0" />
              {isSidebarOpen && (
                <span className="text-sm font-medium">Déconnexion</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0A0A0F]/85 backdrop-blur-[20px] border-b border-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white hover:text-[#F4620A] transition-colors"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white text-sm font-medium">{user?.name}</p>
                <p className="text-[#A0A0B8] text-xs">Administrateur</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F4620A] to-[#9B1FD4] flex items-center justify-center">
                <span className="text-white font-bold">
                  {user?.name?.charAt(0) || "A"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* ── TAB: Dashboard ── */}
          {activeTab === "dashboard" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Tableau de bord
                </h1>
                <p className="text-[#A0A0B8]">
                  Gérez votre espace de coworking
                </p>
              </div>
              <StatsCards stats={statsCards} />
            </>
          )}

          {/* ── TAB: Réservations ── */}
          {activeTab === "bookings" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Réservations
                </h1>
                <p className="text-[#A0A0B8]">
                  Gérez les réservations de votre espace
                </p>
              </div>
              <BookingsTable
                bookings={paginatedBookings}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAdd={() => {
                  setEditingBooking(null);
                  setIsBookingModalOpen(true);
                }}
                onEdit={handleEditBooking}
                onDelete={handleDeleteBooking}
                onStatusChange={handleStatusChange}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}

          {/* ── TAB: Espaces ── */}
          {activeTab === "spaces" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Espaces</h1>
                <p className="text-[#A0A0B8]">Gérez vos espaces de coworking</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">
                    Gestion des espaces
                  </h2>
                  <button
                    onClick={() => {
                      setEditingSpace(null);
                      setIsSpaceModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white text-sm font-medium hover:shadow-lg transition-all"
                  >
                    <Plus size={18} /> Ajouter un espace
                  </button>
                </div>

                {spaces.length === 0 ? (
                  <div className="text-center py-16">
                    <Building2
                      size={48}
                      className="mx-auto text-[#A0A0B8] mb-3"
                    />
                    <p className="text-[#A0A0B8] mb-4">Aucun espace créé</p>
                    <button
                      onClick={() => {
                        setEditingSpace(null);
                        setIsSpaceModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white text-sm"
                    >
                      Créer votre premier espace
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                    {spaces.map((space) => {
                      const getAmenitiesList = (amenities) => {
                        if (!amenities) return [];
                        if (Array.isArray(amenities)) return amenities;
                        if (typeof amenities === "string") {
                          try {
                            const parsed = JSON.parse(amenities);
                            return Array.isArray(parsed) ? parsed : [];
                          } catch (e) {
                            return [];
                          }
                        }
                        return [];
                      };
                      const amenitiesList = getAmenitiesList(space.amenities);

                      return (
                        <div
                          key={space.id}
                          className="group bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-[#F4620A]/30 transition-all hover:scale-[1.02]"
                        >
                          {/* Image */}
                          <div className="h-48 overflow-hidden bg-white/5">
                            <img
                              src={getImageUrl(
                                space.featured_image || space.image,
                              )}
                              alt={space.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = "/images/placeholder-space.jpg";
                              }}
                            />
                          </div>

                          <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="text-lg font-bold text-white">
                                  {space.name}
                                </h3>
                                <p className="text-[#A0A0B8] text-sm">
                                  {space.type === "private"
                                    ? "Bureau Privé"
                                    : space.type === "coworking"
                                      ? "Espace ouvert"
                                      : space.type === "meeting"
                                        ? "Salle de Réunion"
                                        : space.type === "terrace"
                                          ? "Terrasse"
                                          : space.type}
                                  {" · "}Capacité : {space.capacity}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs flex-shrink-0 ${
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

                            <p className="text-white/70 text-sm mb-3 line-clamp-2">
                              {space.description}
                            </p>

                            {amenitiesList.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {amenitiesList.slice(0, 3).map((a, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-white/10 text-[#A0A0B8] px-2 py-0.5 rounded-full"
                                  >
                                    <CheckCircle
                                      size={10}
                                      className="inline mr-1"
                                    />
                                    {typeof a === "string" ? a : a.name || a}
                                  </span>
                                ))}
                                {amenitiesList.length > 3 && (
                                  <span className="text-xs text-[#A0A0B8]">
                                    +{amenitiesList.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[#F4620A] text-2xl font-bold">
                                  {space.price} MAD
                                </p>
                                <p className="text-[#A0A0B8] text-xs">/jour</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingSpace(space);
                                    setIsSpaceModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm transition-colors"
                                >
                                  <Edit size={14} className="inline mr-1" />
                                  Modifier
                                </button>
                                <button
                                  onClick={() => handleDeleteSpace(space.id)}
                                  className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm transition-colors"
                                >
                                  <Trash2 size={14} className="inline mr-1" />
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── TAB: Galerie ── */}
          {activeTab === "gallery" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Galerie</h1>
                <p className="text-[#A0A0B8]">
                  Gérez les images de votre galerie
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">
                    Galerie d'images
                  </h2>
                  <button
                    onClick={() => {
                      setEditingGallery(null);
                      setIsGalleryModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white text-sm font-medium hover:shadow-lg transition-all"
                  >
                    <Plus size={18} /> Ajouter une image
                  </button>
                </div>

                {gallery.length === 0 ? (
                  <div className="text-center py-16">
                    <ImageIcon
                      size={48}
                      className="mx-auto text-[#A0A0B8] mb-3"
                    />
                    <p className="text-[#A0A0B8] mb-4">
                      Aucune image dans la galerie
                    </p>
                    <button
                      onClick={() => setIsGalleryModalOpen(true)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white text-sm"
                    >
                      Ajouter votre première image
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {gallery.map((image) => (
                      <div
                        key={image.id}
                        className="group bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-[#F4620A]/30 transition-all"
                      >
                        <div className="h-48 overflow-hidden relative bg-white/5">
                          <img
                            src={getImageUrl(image.image_path)}
                            alt={image.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = "/images/placeholder.jpg";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                              onClick={() => {
                                setEditingGallery(image);
                                setIsGalleryModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteImage(image.id)}
                              className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-semibold mb-1">
                            {image.title}
                          </h3>
                          <p className="text-[#A0A0B8] text-sm line-clamp-2">
                            {image.description}
                          </p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-[#A0A0B8]">
                              {image.category === "space"
                                ? "Espace"
                                : image.category === "event"
                                  ? "🎉 Événement"
                                  : "👥 Communauté"}
                            </span>
                            <p className="text-[#A0A0B8] text-xs">
                              {new Date(image.created_at).toLocaleDateString(
                                "fr-FR",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── TAB: Paramètres ── */}
          {/* {activeTab === "settings" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Paramètres
                </h1>
                <p className="text-[#A0A0B8]">
                  Configurez votre espace de coworking
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Paramètres généraux
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        <Home
                          size={16}
                          className="inline mr-2 text-[#F4620A]"
                        />
                        Nom de l'espace
                      </label>
                      <input
                        type="text"
                        defaultValue="WORKAURA"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        <Mail
                          size={16}
                          className="inline mr-2 text-[#F4620A]"
                        />
                        Email de contact
                      </label>
                      <input
                        type="email"
                        defaultValue="contact@workaura.com"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        <Phone
                          size={16}
                          className="inline mr-2 text-[#F4620A]"
                        />
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        defaultValue="+212 5XX XXX XXX"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        <MapPin
                          size={16}
                          className="inline mr-2 text-[#F4620A]"
                        />
                        Adresse
                      </label>
                      <textarea
                        rows={3}
                        defaultValue="Centre Témara, Maroc"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-colors"
                      />
                    </div>
                    <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      <Save size={18} />
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              </div>
            </>
          )} */}
        </main>
      </div>

      {/* ── Modals ── */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setEditingBooking(null);
        }}
        onSave={editingBooking ? handleUpdateBooking : handleAddBooking}
        editingItem={editingBooking}
      />

      <SpaceModal
        isOpen={isSpaceModalOpen}
        onClose={() => {
          setIsSpaceModalOpen(false);
          setEditingSpace(null);
        }}
        onSave={handleSpaceSaveCallback}
        editingItem={editingSpace}
      />

      <GalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => {
          setIsGalleryModalOpen(false);
          setEditingGallery(null);
        }}
        onSave={handleGallerySave}
        editingItem={editingGallery}
      />
    </div>
  );
}
