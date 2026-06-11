// components/ui/ReservationModal.jsx
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
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
  Maximize2,
  Loader2,
} from "lucide-react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

// Prix de base journalier pour les salles (fixes)
const ROOM_DAILY_PRICES = { small: 450, large: 600 };

// Multiplicateurs par rapport au prix journalier
// Ex: hourly = prix_jour / 8 heures
const DURATION_MULTIPLIERS = {
  hourly: { label: "À l'heure", icon: Hourglass, factor: 1 / 8, unit: "heure" },
  "2_hours": { label: "2 heures", icon: Hourglass, factor: 2 / 8, unit: "2h" },
  half_day: { label: "Demi-journée", icon: Sun, factor: 1 / 2, unit: "½ jour" },
  daily: { label: "Journée", icon: Sun, factor: 1, unit: "jour" },
  weekly: {
    label: "Semaine",
    icon: CalendarDays,
    factor: null,
    unit: "semaine",
  },
  monthly: { label: "Mois", icon: CalendarDays, factor: null, unit: "mois" },
  yearly: { label: "Année", icon: Star, factor: null, unit: "année" },
};

// Types d'espaces qui ont des options de taille de salle
const ROOM_SIZE_TYPES = ["meeting", "formation"];

// Réduction étudiant disponible uniquement pour ces formules
const STUDENT_DISCOUNT_ALLOWED = ["weekly", "monthly", "yearly"];

// Durées "courtes" (date unique + heure)
const SHORT_DURATIONS = ["hourly", "2_hours", "half_day", "daily"];

export default function ReservationModal({
  isOpen,
  onClose,
  spaceId,
  spaceName,
  spaceType,
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
    room_size: "small",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [step, setStep] = useState(1);
  const [bookingResult, setBookingResult] = useState(null);
  const [pricingOptions, setPricingOptions] = useState([]);
  const [selectedPriceOption, setSelectedPriceOption] = useState(null);

  // L'espace a-t-il le choix de taille de salle ?
  const hasRoomSizeOption = useMemo(
    () => ROOM_SIZE_TYPES.includes(spaceType),
    [spaceType],
  );

  // ─── Prix de base unitaire selon la formule choisie ──────────────────────────
  const getUnitPrice = useCallback(
    (durationType = formData.duration_type, roomSize = formData.room_size) => {
      if (hasRoomSizeOption) {
        // Pour les salles : on part du prix journalier fixe puis on applique le facteur
        const dailyBase =
          roomSize === "small"
            ? ROOM_DAILY_PRICES.small
            : ROOM_DAILY_PRICES.large;
        const mult = DURATION_MULTIPLIERS[durationType];
        if (!mult) return dailyBase;
        if (mult.factor !== null) return Math.round(dailyBase * mult.factor);
        // weekly / monthly / yearly → on renvoie le prix journalier (la totalisation se fera ensuite)
        return dailyBase;
      }

      // Pour les autres espaces : on utilise le prix provenant de l'API
      if (SHORT_DURATIONS.includes(durationType)) {
        // Recalcul depuis le prix journalier de l'API
        const dailyOption = pricingOptions.find(
          (o) => o.duration_type === "daily",
        );
        const dailyBase = dailyOption?.price ?? spacePrice ?? 0;
        const mult = DURATION_MULTIPLIERS[durationType];
        if (mult?.factor !== null && mult?.factor != null) {
          return Math.round(dailyBase * mult.factor);
        }
      }
      return selectedPriceOption?.price ?? spacePrice ?? 0;
    },
    [
      hasRoomSizeOption,
      formData.duration_type,
      formData.room_size,
      pricingOptions,
      selectedPriceOption,
      spacePrice,
    ],
  );

  // ─── Calcul du prix total ─────────────────────────────────────────────────────
  const calculateTotalPrice = useCallback(() => {
    const durationType = formData.duration_type;
    const unitPrice = getUnitPrice(durationType, formData.room_size);

    if (unitPrice === 0) {
      setOriginalPrice(0);
      setTotalPrice(0);
      return;
    }

    let total = unitPrice;

    if (["weekly", "monthly", "yearly"].includes(durationType)) {
      if (formData.start_date && formData.end_date) {
        const start = new Date(formData.start_date);
        const end = new Date(formData.end_date);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        if (durationType === "weekly") {
          // Prix semaine = prix journalier × 7 × nombre de semaines
          const dailyPrice = hasRoomSizeOption
            ? formData.room_size === "small"
              ? ROOM_DAILY_PRICES.small
              : ROOM_DAILY_PRICES.large
            : (pricingOptions.find((o) => o.duration_type === "daily")?.price ??
              spacePrice ??
              unitPrice);
          const weeklyRate = selectedPriceOption?.price ?? dailyPrice * 7;
          const weeks = Math.ceil(days / 7);
          total = weeklyRate * weeks;
        } else if (durationType === "monthly") {
          const monthlyRate = selectedPriceOption?.price ?? unitPrice * 30;
          const months = Math.ceil(days / 30);
          total = monthlyRate * months;
        } else if (durationType === "yearly") {
          const yearlyRate = selectedPriceOption?.price ?? unitPrice * 365;
          const years = Math.ceil(days / 365);
          total = yearlyRate * years;
        }
      }
      // Pas de dates → on affiche juste le prix de la formule
      else {
        total = selectedPriceOption?.price ?? unitPrice;
      }
    }
    // Pour les formules courtes, unitPrice est déjà le bon montant
    // (hourly/2h/half_day/daily : pas de multiplication supplémentaire)

    setOriginalPrice(Math.round(total));

    if (
      formData.student_discount &&
      STUDENT_DISCOUNT_ALLOWED.includes(durationType)
    ) {
      total = total * 0.8;
    }

    setTotalPrice(Math.round(total));
  }, [
    formData.duration_type,
    formData.start_date,
    formData.end_date,
    formData.student_discount,
    formData.room_size,
    getUnitPrice,
    hasRoomSizeOption,
    pricingOptions,
    selectedPriceOption,
    spacePrice,
  ]);

  // ─── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && spaceId) fetchPricingOptions();
  }, [isOpen, spaceId]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        guest_name: isAuthenticated && user ? user.name || "" : "",
        guest_email: isAuthenticated && user ? user.email || "" : "",
        guest_phone: isAuthenticated && user ? user.phone || "" : "",
        duration_type: "daily",
        booking_date: "",
        start_date: "",
        end_date: "",
        start_time: "09:00",
        notes: "",
        student_discount: false,
        room_size: "small",
      });
      setErrors({});
      setStep(1);
      setBookingResult(null);
      setSelectedPriceOption(null);
    }
  }, [isOpen, isAuthenticated, user]);

  useEffect(() => {
    calculateTotalPrice();
  }, [calculateTotalPrice]);

  // ─── API ──────────────────────────────────────────────────────────────────────
  const fetchPricingOptions = async () => {
    try {
      const response = await api.get(`/spaces/${spaceId}/pricing`);
      const options = response.data.pricing_options || [];
      setPricingOptions(options);

      const defaultOption =
        options.find((o) => o.duration_type === "daily") || options[0];
      if (defaultOption) {
        setSelectedPriceOption(defaultOption);
        setFormData((prev) => ({
          ...prev,
          duration_type: defaultOption.duration_type,
        }));
      }
    } catch (error) {
      console.error("Erreur chargement tarifs:", error);
    }
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRoomSizeChange = (size) => {
    setFormData((prev) => ({ ...prev, room_size: size }));
  };

  const handleDurationChange = (option) => {
    const isLong = STUDENT_DISCOUNT_ALLOWED.includes(option.duration_type);
    setSelectedPriceOption(option);
    setFormData((prev) => ({
      ...prev,
      duration_type: option.duration_type,
      student_discount: isLong ? prev.student_discount : false,
    }));
  };

  const handleDiscountToggle = () => {
    if (!STUDENT_DISCOUNT_ALLOWED.includes(formData.duration_type)) return;
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

    if (SHORT_DURATIONS.includes(formData.duration_type)) {
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
        room_size: hasRoomSizeOption ? formData.room_size : undefined,
      };

      if (SHORT_DURATIONS.includes(formData.duration_type)) {
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
      if (error.response?.data?.errors) setErrors(error.response.data.errors);
      else if (error.response?.data?.message)
        alert(error.response.data.message);
      else alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const getTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 19; i++)
      slots.push(`${i.toString().padStart(2, "0")}:00`);
    return slots;
  };

  const getDurationLabel = () =>
    DURATION_MULTIPLIERS[formData.duration_type]?.label ||
    formData.duration_type;

  const getDurationIcon = () => {
    const Icon = DURATION_MULTIPLIERS[formData.duration_type]?.icon;
    return Icon ? <Icon size={20} /> : <Calendar size={20} />;
  };

  const isDiscountAllowed = STUDENT_DISCOUNT_ALLOWED.includes(
    formData.duration_type,
  );

  // Prix affiché sur le bouton de formule (en tenant compte de la taille de salle)
  const getDisplayPrice = (option) => {
    if (hasRoomSizeOption) {
      return getUnitPrice(option.duration_type, formData.room_size);
    }
    return option.price;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-[#0A0A0F] to-[#12121A] border border-white/10 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
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

        {/* ── STEP 1 : Formulaire ── */}
        {step === 1 ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Résumé espace */}
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
                <div className="text-right">
                  <p className="text-[#A0A0B8] text-xs">
                    Tarif {DURATION_MULTIPLIERS[formData.duration_type]?.unit}
                  </p>
                  <p className="text-[#F4620A] text-2xl font-bold">
                    {getUnitPrice()} MAD
                  </p>
                </div>
              </div>
            </div>

            {/* Sélection taille de salle */}
            {hasRoomSizeOption && (
              <div>
                <label className="block text-white text-sm font-medium mb-3 flex items-center gap-2">
                  <Maximize2 size={16} className="text-[#F4620A]" />
                  Choisissez la taille de la salle
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      key: "small",
                      emoji: "🏠",
                      label: "Petite salle",
                      capacity: "4–8 personnes",
                      price: ROOM_DAILY_PRICES.small,
                    },
                    {
                      key: "large",
                      emoji: "🏛️",
                      label: "Grande salle",
                      capacity: "12–20 personnes",
                      price: ROOM_DAILY_PRICES.large,
                    },
                  ].map(({ key, emoji, label, capacity, price }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleRoomSizeChange(key)}
                      className={`p-4 rounded-xl text-center transition-all border ${
                        formData.room_size === key
                          ? "bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white border-transparent shadow-lg scale-105"
                          : "bg-white/10 text-[#A0A0B8] border-white/10 hover:bg-white/20"
                      }`}
                    >
                      <div className="text-2xl mb-2">{emoji}</div>
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs mt-1">{capacity}</div>
                      <div className="text-sm font-bold mt-2">
                        {price} MAD / jour
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sélection durée */}
            <div>
              <label className="block text-white text-sm font-medium mb-3 flex items-center gap-2">
                <Clock size={16} className="text-[#F4620A]" />
                Choisissez votre formule
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {pricingOptions.map((option) => {
                  const Icon =
                    DURATION_MULTIPLIERS[option.duration_type]?.icon ||
                    Calendar;
                  const displayPrice = getDisplayPrice(option);
                  const unitLabel =
                    DURATION_MULTIPLIERS[option.duration_type]?.unit || "";
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
                        {DURATION_MULTIPLIERS[option.duration_type]?.label ||
                          option.duration_type}
                      </div>
                      <div className="text-xs font-bold mt-1">
                        {displayPrice} MAD
                      </div>
                      {unitLabel && (
                        <div className="text-[10px] opacity-70 mt-0.5">
                          / {unitLabel}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date / Heure */}
            {SHORT_DURATIONS.includes(formData.duration_type) ? (
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
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all ${
                      errors.booking_date ? "border-red-500" : "border-white/10"
                    }`}
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
                    className="w-full px-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all appearance-none cursor-pointer"
                  >
                    {getTimeSlots().map((slot) => (
                      <option
                        key={slot}
                        value={slot}
                        className="bg-[#1A1A2E] text-white"
                      >
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "start_date", label: "Date de début" },
                  { name: "end_date", label: "Date de fin" },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar size={16} className="text-[#F4620A]" />
                      {label} *
                    </label>
                    <input
                      type="date"
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      min={
                        name === "end_date"
                          ? formData.start_date ||
                            new Date().toISOString().split("T")[0]
                          : new Date().toISOString().split("T")[0]
                      }
                      className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all ${
                        errors[name] ? "border-red-500" : "border-white/10"
                      }`}
                    />
                    {errors[name] && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors[name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Réduction étudiant */}
            <div
              className={`rounded-xl p-4 transition-all ${
                isDiscountAllowed
                  ? "bg-white/5"
                  : "bg-white/[0.02] opacity-50 cursor-not-allowed"
              }`}
            >
              <label
                className={`flex items-center justify-between ${
                  isDiscountAllowed ? "cursor-pointer" : "cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap
                    size={24}
                    className={
                      isDiscountAllowed ? "text-[#F4620A]" : "text-[#A0A0B8]"
                    }
                  />
                  <div>
                    <p className="text-white font-medium flex items-center gap-2">
                      Réduction étudiant
                      {!isDiscountAllowed && (
                        <span className="text-[10px] bg-white/10 text-[#A0A0B8] px-2 py-0.5 rounded-full">
                          Semaine / Mois / An uniquement
                        </span>
                      )}
                    </p>
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
                    disabled={!isDiscountAllowed}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-11 h-6 rounded-full peer transition-all
                    ${
                      isDiscountAllowed
                        ? "bg-white/10 peer-checked:bg-gradient-to-r peer-checked:from-[#F4620A] peer-checked:to-[#C040E0]"
                        : "bg-white/5"
                    }
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full`}
                  />
                </div>
              </label>
            </div>

            {/* Coordonnées */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Users size={18} className="text-[#F4620A]" />
                Vos coordonnées
              </h4>

              {[
                {
                  name: "guest_name",
                  type: "text",
                  icon: User,
                  label: "Nom complet",
                  placeholder: "Mouad Rahmouni",
                  disabled: isAuthenticated,
                },
                {
                  name: "guest_email",
                  type: "email",
                  icon: Mail,
                  label: "Email",
                  placeholder: "mouad@email.com",
                  disabled: isAuthenticated,
                },
                {
                  name: "guest_phone",
                  type: "tel",
                  icon: Phone,
                  label: "Téléphone",
                  placeholder: "+212 6XX XXX XXX",
                  disabled: false,
                },
              ].map(
                ({ name, type, icon: Icon, label, placeholder, disabled }) => (
                  <div key={name}>
                    <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                      <Icon size={16} className="text-[#F4620A]" />
                      {label} *
                    </label>
                    <input
                      type={type}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      disabled={disabled}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-all ${
                        errors[name] ? "border-red-500" : "border-white/10"
                      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                    {errors[name] && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors[name]}
                      </p>
                    )}
                  </div>
                ),
              )}

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

            {/* Récapitulatif */}
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
                {hasRoomSizeOption && (
                  <div className="flex justify-between">
                    <span className="text-[#A0A0B8]">Taille de salle</span>
                    <span className="text-white">
                      {formData.room_size === "small"
                        ? "Petite salle (4–8 pers.)"
                        : "Grande salle (12–20 pers.)"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#A0A0B8]">
                    Prix /{" "}
                    {DURATION_MULTIPLIERS[formData.duration_type]?.unit ||
                      "unité"}
                  </span>
                  <span className="text-white">{getUnitPrice()} MAD</span>
                </div>
                {formData.student_discount && isDiscountAllowed && (
                  <div className="flex justify-between">
                    <span className="text-green-400">
                      Réduction étudiant (−20%)
                    </span>
                    <span className="text-green-400">
                      −{Math.round(originalPrice - totalPrice)} MAD
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
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Confirmation...</span>
                  </>
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
          /* ── STEP 2 : Confirmation ── */
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
                  {hasRoomSizeOption && (
                    <div className="flex justify-between">
                      <span className="text-[#A0A0B8]">Taille</span>
                      <span className="text-white">
                        {formData.room_size === "small"
                          ? "Petite salle"
                          : "Grande salle"}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#A0A0B8]">Formule</span>
                    <span className="text-white flex items-center gap-1">
                      {getDurationIcon()}
                      {getDurationLabel()}
                    </span>
                  </div>
                  {SHORT_DURATIONS.includes(formData.duration_type) ? (
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
                  )}
                  {formData.student_discount && isDiscountAllowed && (
                    <div className="flex justify-between">
                      <span className="text-green-400">Réduction étudiant</span>
                      <span className="text-green-400">−20%</span>
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
