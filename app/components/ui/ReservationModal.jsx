// components/ui/ReservationModal.jsx
"use client";
import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  CreditCard,
  CheckCircle,
  GraduationCap,
  Sparkles,
  Hourglass,
  Sun,
  CalendarDays,
  Star,
  Building2,
  Users,
  Info,
  Tag,
  ShieldCheck,
} from "lucide-react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

// Types de durée disponibles avec icônes Lucide
const DURATION_TYPES = {
  hourly: { label: "À l'heure", icon: Hourglass, duration: "1 heure" },
  "2_hours": { label: "2 heures", icon: Hourglass, duration: "2 heures" },
  half_day: { label: "Demi-journée", icon: Sun, duration: "4 heures" },
  daily: { label: "Journée", icon: Sun, duration: "8 heures" },
  weekly: { label: "Semaine", icon: CalendarDays, duration: "7 jours" },
  monthly: { label: "Mois", icon: CalendarDays, duration: "30 jours" },
  yearly: { label: "Année", icon: Star, duration: "365 jours" },
};

export default function ReservationModal({
  isOpen,
  onClose,
  spaceId,
  spaceName,
  spacePrice,
}) {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    duration_type: "daily",
    booking_date: "",
    start_date: "",
    end_date: "",
    start_time: "09:00",
    notes: "",
    student_discount: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [step, setStep] = useState(1);
  const [bookingResult, setBookingResult] = useState(null);
  const [pricingOptions, setPricingOptions] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [selectedPriceOption, setSelectedPriceOption] = useState(null);

  // Charger les options de prix et disponibilités
  useEffect(() => {
    if (isOpen && spaceId) {
      fetchPricingOptions();
    }
  }, [isOpen, spaceId]);

  useEffect(() => {
    if (isOpen) {
      if (isAuthenticated && user) {
        setFormData((prev) => ({
          ...prev,
          guest_name: user.name || "",
          guest_email: user.email || "",
          guest_phone: user.phone || "",
          booking_date: "",
          start_date: "",
          end_date: "",
          start_time: "09:00",
          notes: "",
          duration_type: "daily",
          student_discount: false,
        }));
      } else {
        setFormData({
          guest_name: "",
          guest_email: "",
          guest_phone: "",
          duration_type: "daily",
          booking_date: "",
          start_date: "",
          end_date: "",
          start_time: "09:00",
          notes: "",
          student_discount: false,
        });
      }
      setErrors({});
      setStep(1);
      setBookingResult(null);
      setSelectedPriceOption(null);
    }
  }, [isOpen, isAuthenticated, user]);

  // Calculer le prix total quand les options changent
  useEffect(() => {
    calculateTotalPrice();
  }, [
    formData.duration_type,
    formData.booking_date,
    formData.start_date,
    formData.end_date,
    formData.start_time,
    formData.student_discount,
    selectedPriceOption,
  ]);

  const fetchPricingOptions = async () => {
    try {
      const response = await api.get(`/spaces/${spaceId}/pricing`);
      setPricingOptions(response.data.pricing_options || []);
      setAvailability(response.data.availability || []);

      // Sélectionner l'option par défaut (daily si disponible)
      const defaultOption = response.data.pricing_options?.find(
        (opt) => opt.duration_type === "daily",
      );
      if (defaultOption) {
        setSelectedPriceOption(defaultOption);
        setFormData((prev) => ({
          ...prev,
          duration_type: defaultOption.duration_type,
        }));
      } else if (response.data.pricing_options?.length > 0) {
        setSelectedPriceOption(response.data.pricing_options[0]);
        setFormData((prev) => ({
          ...prev,
          duration_type: response.data.pricing_options[0].duration_type,
        }));
      }
    } catch (error) {
      console.error("Erreur chargement tarifs:", error);
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedPriceOption) return;

    let total = selectedPriceOption.price;

    // Pour les réservations longues durée, calculer selon le nombre de jours
    if (
      ["weekly", "monthly", "yearly"].includes(formData.duration_type) &&
      formData.start_date &&
      formData.end_date
    ) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      if (formData.duration_type === "weekly") {
        const weeks = Math.ceil(days / 7);
        total = selectedPriceOption.price * weeks;
      } else if (formData.duration_type === "monthly") {
        const months = Math.ceil(days / 30);
        total = selectedPriceOption.price * months;
      } else if (formData.duration_type === "yearly") {
        const years = Math.ceil(days / 365);
        total = selectedPriceOption.price * years;
      }
    }

    setOriginalPrice(total);

    // Appliquer réduction étudiant (-20%)
    if (formData.student_discount) {
      total = total * 0.8;
    }

    setTotalPrice(Math.round(total));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDurationChange = (option) => {
    setSelectedPriceOption(option);
    setFormData((prev) => ({ ...prev, duration_type: option.duration_type }));
  };

  const handleDiscountToggle = () => {
    setFormData((prev) => ({
      ...prev,
      student_discount: !prev.student_discount,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.guest_name?.trim())
      newErrors.guest_name = "Le nom est requis";
    if (!formData.guest_email?.trim())
      newErrors.guest_email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.guest_email))
      newErrors.guest_email = "Email invalide";
    if (!formData.guest_phone?.trim())
      newErrors.guest_phone = "Le téléphone est requis";

    if (
      ["hourly", "2_hours", "half_day", "daily"].includes(
        formData.duration_type,
      )
    ) {
      if (!formData.booking_date)
        newErrors.booking_date = "La date est requise";
      if (!formData.start_time)
        newErrors.start_time = "L'heure de début est requise";
    } else {
      if (!formData.start_date)
        newErrors.start_date = "La date de début est requise";
      if (!formData.end_date) newErrors.end_date = "La date de fin est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getAvailableSlotsForDate = (date) => {
    const availabilityForDate = availability.find((a) => a.date === date);
    return (
      availabilityForDate?.available_slots?.filter((slot) => slot.available) ||
      []
    );
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 19; i++) {
      slots.push(`${i.toString().padStart(2, "0")}:00`);
    }
    return slots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        space_id: spaceId,
        duration_type: formData.duration_type,
        guest_name: formData.guest_name,
        guest_email: formData.guest_email,
        guest_phone: formData.guest_phone,
        notes: formData.notes,
        student_discount: formData.student_discount,
      };

      if (
        ["hourly", "2_hours", "half_day", "daily"].includes(
          formData.duration_type,
        )
      ) {
        payload.booking_date = formData.booking_date;
        payload.start_time = formData.start_time;
      } else {
        payload.start_date = formData.start_date;
        payload.end_date = formData.end_date;
      }

      const response = await api.post("/bookings", payload);
      setBookingResult(response.data);
      setStep(2);
    } catch (error) {
      console.error("Erreur réservation:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getDurationLabel = () => {
    return (
      DURATION_TYPES[formData.duration_type]?.label || formData.duration_type
    );
  };

  const getDurationIcon = () => {
    const Icon = DURATION_TYPES[formData.duration_type]?.icon;
    return Icon ? <Icon size={20} /> : <Calendar size={20} />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-[#0A0A0F] to-[#12121A] border border-white/10 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header avec gradient */}
        <div className="relative h-32 bg-gradient-to-r from-[#F4620A] to-[#C040E0] sticky top-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all z-10"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-4 left-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-yellow-300" />
              <h3 className="text-2xl font-bold text-white">
                {step === 1 ? "Réserver un espace" : "Confirmation"}
              </h3>
            </div>
            <p className="text-white/80 text-sm">
              {step === 1 ? spaceName : "Votre réservation est confirmée"}
            </p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Résumé de l'espace */}
            <div className="bg-gradient-to-r from-[#F4620A]/10 to-[#C040E0]/10 rounded-xl p-4 border border-[#F4620A]/20">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Building2 size={18} className="text-[#F4620A]" />
                Informations sur l'espace
              </h4>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white text-lg font-medium">{spaceName}</p>
                  <p className="text-[#A0A0B8] text-sm">Capacité flexible</p>
                </div>
                {selectedPriceOption && (
                  <div className="text-right">
                    <p className="text-[#A0A0B8] text-xs">
                      Tarif {getDurationLabel()}
                    </p>
                    <p className="text-[#F4620A] text-2xl font-bold">
                      {selectedPriceOption.price} MAD
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sélection de la durée */}
            <div>
              <label className="block text-white text-sm font-medium mb-3 flex items-center gap-2">
                <Clock size={16} className="text-[#F4620A]" />
                Choisissez votre formule
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {pricingOptions.map((option) => {
                  const Icon =
                    DURATION_TYPES[option.duration_type]?.icon || Calendar;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleDurationChange(option)}
                      className={`p-3 rounded-xl text-center transition-all ${
                        selectedPriceOption?.id === option.id
                          ? "bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white shadow-lg scale-105"
                          : "bg-white/10 text-[#A0A0B8] hover:bg-white/20"
                      }`}
                    >
                      <Icon size={24} className="mx-auto mb-1" />
                      <div className="text-sm font-medium">
                        {DURATION_TYPES[option.duration_type]?.label ||
                          option.duration_type}
                      </div>
                      <div className="text-xs font-bold mt-1">
                        {option.price} MAD
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section Date selon le type de durée */}
            {["hourly", "2_hours", "half_day", "daily"].includes(
              formData.duration_type,
            ) ? (
              <>
                <div>
                  <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-[#F4620A]" />
                    Date de réservation *
                  </label>
                  <input
                    type="date"
                    name="booking_date"
                    value={formData.booking_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all ${errors.booking_date ? "border-red-500" : "border-white/10"}`}
                  />
                  {errors.booking_date && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.booking_date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-[#F4620A]" />
                    Heure de début *
                  </label>
                  <select
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
                  >
                    {getTimeSlots().map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-[#F4620A]" />
                    Date de début *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all ${errors.start_date ? "border-red-500" : "border-white/10"}`}
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-[#F4620A]" />
                    Date de fin *
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    min={
                      formData.start_date ||
                      new Date().toISOString().split("T")[0]
                    }
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all ${errors.end_date ? "border-red-500" : "border-white/10"}`}
                  />
                </div>
              </div>
            )}

            {/* Réduction étudiant */}
            <div className="bg-white/5 rounded-xl p-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <GraduationCap size={24} className="text-[#F4620A]" />
                  <div>
                    <p className="text-white font-medium">Réduction étudiant</p>
                    <p className="text-[#A0A0B8] text-xs">
                      -20% sur votre réservation
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.student_discount}
                    onChange={handleDiscountToggle}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-gradient-to-r from-[#F4620A] to-[#C040E0] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </div>
              </label>
            </div>

            {/* Informations client */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Users size={18} className="text-[#F4620A]" />
                Vos coordonnées
              </h4>

              <div>
                <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                  <User size={16} className="text-[#F4620A]" />
                  Nom complet *
                </label>
                <input
                  type="text"
                  name="guest_name"
                  value={formData.guest_name}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  disabled={isAuthenticated}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-all ${errors.guest_name ? "border-red-500" : "border-white/10"} ${isAuthenticated ? "opacity-60 cursor-not-allowed" : ""}`}
                />
                {errors.guest_name && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.guest_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-[#F4620A]" />
                  Email *
                </label>
                <input
                  type="email"
                  name="guest_email"
                  value={formData.guest_email}
                  onChange={handleChange}
                  placeholder="jean@email.com"
                  disabled={isAuthenticated}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-all ${errors.guest_email ? "border-red-500" : "border-white/10"} ${isAuthenticated ? "opacity-60 cursor-not-allowed" : ""}`}
                />
                {errors.guest_email && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.guest_email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-[#F4620A]" />
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="guest_phone"
                  value={formData.guest_phone}
                  onChange={handleChange}
                  placeholder="+212 6XX XXX XXX"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-all"
                />
                {errors.guest_phone && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.guest_phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                  <MessageSquare size={16} className="text-[#F4620A]" />
                  Notes (optionnel)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-all resize-none"
                  placeholder="Informations supplémentaires..."
                />
              </div>
            </div>

            {/* Récapitulatif et prix */}
            <div className="bg-gradient-to-r from-[#F4620A]/20 to-[#C040E0]/20 rounded-xl p-4 border border-[#F4620A]/30">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Tag size={18} className="text-[#F4620A]" />
                Récapitulatif
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#A0A0B8]">Formule choisie</span>
                  <span className="text-white font-medium flex items-center gap-1">
                    {getDurationIcon()}
                    {getDurationLabel()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A0A0B8]">Prix unitaire</span>
                  <span className="text-white">
                    {selectedPriceOption?.price} MAD
                  </span>
                </div>
                {formData.student_discount && (
                  <div className="flex justify-between">
                    <span className="text-green-400">
                      Réduction étudiant (-20%)
                    </span>
                    <span className="text-green-400">
                      -{Math.round(originalPrice - totalPrice)} MAD
                    </span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-white font-bold">Total à payer</span>
                    <span className="text-[#F4620A] text-2xl font-bold">
                      {totalPrice} MAD
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard size={18} />
                    Confirmer la réservation
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          // Étape 2: Confirmation
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle size={40} className="text-green-400" />
            </div>

            <h4 className="text-2xl font-bold text-white mb-2">
              Réservation confirmée !
            </h4>
            <p className="text-[#A0A0B8] mb-6">
              Votre réservation a été créée avec succès. Un email de
              confirmation a été envoyé à {formData.guest_email}.
            </p>

            {bookingResult && (
              <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
                <p className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Info size={18} className="text-[#F4620A]" />
                  Détails de la réservation :
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#A0A0B8]">Espace</span>
                    <span className="text-white">{spaceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A0A0B8]">Formule</span>
                    <span className="text-white flex items-center gap-1">
                      {getDurationIcon()}
                      {getDurationLabel()}
                    </span>
                  </div>
                  {["hourly", "2_hours", "half_day", "daily"].includes(
                    formData.duration_type,
                  ) ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#A0A0B8]">Date</span>
                        <span className="text-white">
                          {new Date(formData.booking_date).toLocaleDateString(
                            "fr-FR",
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A0A0B8]">Horaire</span>
                        <span className="text-white">
                          {formData.start_time}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#A0A0B8]">Période</span>
                        <span className="text-white">
                          Du{" "}
                          {new Date(formData.start_date).toLocaleDateString(
                            "fr-FR",
                          )}{" "}
                          au{" "}
                          {new Date(formData.end_date).toLocaleDateString(
                            "fr-FR",
                          )}
                        </span>
                      </div>
                    </>
                  )}
                  {formData.student_discount && (
                    <div className="flex justify-between">
                      <span className="text-green-400">Réduction étudiant</span>
                      <span className="text-green-400">-20%</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-white font-bold">Total payé</span>
                      <span className="text-[#F4620A] text-xl font-bold">
                        {totalPrice} MAD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck size={18} />
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
