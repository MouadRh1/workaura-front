"use client";
import {
  Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const DURATION_LABELS = {
  hourly:    "À l'heure",
  "2_hours": "2 heures",
  half_day:  "Demi-journée",
  daily:     "Journée",
  weekly:    "Semaine",
  monthly:   "Mois",
  yearly:    "Année",
};

const SHORT_DURATIONS = ["hourly", "2_hours", "half_day", "daily"];

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR") : null;

// Fonction corrigée pour afficher l'heure
const formatTime = (time) => {
  if (!time) return null;
  // Si time est déjà au format HH:MM:SS ou HH:MM
  if (typeof time === "string") {
    return time.substring(0, 5);
  }
  return null;
};

// Affiche l'heure uniquement pour les courtes durées
const shouldShowTime = (booking) => {
  if (!SHORT_DURATIONS.includes(booking.duration_type)) return false;
  if (!booking.start_time) return false;
  return true;
};

export function BookingsTable({
  bookings,
  searchTerm,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
  onStatusChange,
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "text-green-400";
      case "pending":   return "text-yellow-400";
      case "cancelled": return "text-red-400";
      default:          return "text-[#A0A0B8]";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "confirmed": return "✅ Confirmé";
      case "pending":   return "⏳ En attente";
      case "cancelled": return "❌ Annulé";
      default:          return status;
    }
  };

  const getRoomSizeLabel = (roomSize) => {
    if (!roomSize) return null;
    return roomSize === "small"
      ? { label: "Petite salle", icon: "🏠", color: "bg-blue-400/10 text-blue-400" }
      : { label: "Grande salle", icon: "🏛️", color: "bg-purple-400/10 text-purple-400" };
  };

  const getDurationLabel = (durationType) => {
    return DURATION_LABELS[durationType] || durationType || "Non spécifié";
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-10 h-10 border-4 border-[#F4620A]/30 border-t-[#F4620A] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A0A0B8]">Chargement des réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">

      {/* ── Header ── */}
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Réservations</h2>
            <p className="text-[#A0A0B8] text-sm mt-1">
              Total : {bookings.length} réservation(s)
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0B8]" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] text-sm w-64"
              />
            </div>
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white text-sm font-medium hover:shadow-lg transition-all"
            >
              <Plus size={18} /> Nouvelle réservation
            </button>
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-[#A0A0B8]">Aucune réservation trouvée</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  {["Client", "Espace", "Formule", "Taille", "Date / Heure", "Durée", "Montant", "Statut", "Actions"].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-[#A0A0B8] text-sm font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {bookings.map((booking) => {
                  const roomSizeInfo = getRoomSizeLabel(booking.room_size);
                  const isLong = !SHORT_DURATIONS.includes(booking.duration_type);
                  const showTime = shouldShowTime(booking);
                  const startDateFmt = formatDate(booking.booking_date);
                  const endDateFmt = formatDate(booking.end_date);
                  const startTimeFmt = formatTime(booking.start_time);
                  const endTimeFmt = formatTime(booking.end_time);

                  return (
                    <tr key={booking.id} className="hover:bg-white/5 transition-colors group">

                      {/* Client */}
                      <td className="px-6 py-4">
                        <p className="text-white text-sm font-medium">
                          {booking.guest_name || booking.user?.name || "Client inconnu"}
                        </p>
                        <p className="text-[#A0A0B8] text-xs">
                          {booking.guest_email || booking.user?.email || "Email non renseigné"}
                        </p>
                        {booking.guest_phone && (
                          <p className="text-[#A0A0B8] text-xs mt-1">📞 {booking.guest_phone}</p>
                        )}
                      </td>

                      {/* Espace */}
                      <td className="px-6 py-4">
                        <p className="text-white text-sm">
                          {booking.space?.name || "Espace inconnu"}
                        </p>
                      </td>

                      {/* Formule (duration_type) */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/10 text-white">
                          {getDurationLabel(booking.duration_type)}
                        </span>
                      </td>

                      {/* Taille de salle */}
                      <td className="px-6 py-4">
                        {roomSizeInfo ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${roomSizeInfo.color}`}>
                            {roomSizeInfo.icon} {roomSizeInfo.label}
                          </span>
                        ) : (
                          <span className="text-[#A0A0B8] text-xs">—</span>
                        )}
                      </td>

                      {/* Date / Heure */}
                      <td className="px-6 py-4">
                        {isLong ? (
                          // Longue durée : afficher la plage de dates
                          <>
                            <p className="text-white text-sm">{startDateFmt ?? "Date inconnue"}</p>
                            {endDateFmt && endDateFmt !== startDateFmt && (
                              <p className="text-[#A0A0B8] text-xs">→ {endDateFmt}</p>
                            )}
                          </>
                        ) : (
                          // Courte durée : date + heure
                          <>
                            <p className="text-white text-sm">{startDateFmt ?? "Date inconnue"}</p>
                            {showTime && (
                              <p className="text-[#F4620A] text-xs font-medium">
                                🕐 {startTimeFmt}
                                {endTimeFmt && endTimeFmt !== "00:00" && ` → ${endTimeFmt}`}
                              </p>
                            )}
                          </>
                        )}
                      </td>

                      {/* Durée détaillée */}
                      <td className="px-6 py-4">
                        {booking.duration_value && booking.duration_unit ? (
                          <span className="text-white text-sm">
                            {booking.duration_value} {booking.duration_unit === "days" ? "jour(s)" : booking.duration_unit}
                          </span>
                        ) : (
                          <span className="text-[#A0A0B8] text-xs">—</span>
                        )}
                      </td>

                      {/* Montant */}
                      <td className="px-6 py-4">
                        <p className="text-white text-sm font-medium">{booking.total_amount} MAD</p>
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-4">
                        <select
                          value={booking.status}
                          onChange={(e) => onStatusChange?.(booking.id, e.target.value)}
                          className={`bg-white/5 border border-white/10 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:border-[#F4620A] ${getStatusColor(booking.status)}`}
                        >
                          <option value="pending">⏳ En attente</option>
                          <option value="confirmed">✅ Confirmé</option>
                          <option value="cancelled">❌ Annulé</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEdit(booking)}
                            className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => onDelete(booking.id)}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={16} /> Précédent
              </button>
              <span className="text-[#A0A0B8] text-sm">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                Suivant <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}