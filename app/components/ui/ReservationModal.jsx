// components/ui/ReservationModal.jsx
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  X, Calendar, Clock, User, Mail, Phone, MessageSquare,
  CreditCard, CheckCircle, GraduationCap, Sparkles, Hourglass,
  Sun, CalendarDays, Star, Building2, Users, Info, Tag,
  ShieldCheck, Maximize2, Loader2, ChevronRight, ChevronLeft,
} from "lucide-react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

// ─── Prix fixes pour les salles (réunion & formation) ────────────────────────
// Ces espaces n'ont PAS de pricing dans la BDD — les prix sont calculés ici.
const ROOM_PRICES = {
  small: { hourly: 100, "2_hours": 200, half_day: 250, daily: 450 },
  large: { hourly: 150, "2_hours": 300, half_day: 350, daily: 600 },
};

// Types d'espaces avec choix de taille de salle
const ROOM_SIZE_TYPES = ["meeting", "formation"];

// Formules avec réduction étudiant possible
const STUDENT_DISCOUNT_ALLOWED = ["weekly", "monthly", "yearly"];

// Formules "courtes" (date unique + heure de début)
const SHORT_DURATIONS = ["hourly", "2_hours", "half_day", "daily"];

const DURATION_META = {
  hourly:    { label: "À l'heure",     icon: Hourglass,    unit: "heure"   },
  "2_hours": { label: "2 heures",      icon: Hourglass,    unit: "2h"      },
  half_day:  { label: "Demi-journée",  icon: Sun,          unit: "½ jour"  },
  daily:     { label: "Journée",       icon: Sun,          unit: "jour"    },
  weekly:    { label: "Semaine",       icon: CalendarDays, unit: "semaine" },
  monthly:   { label: "Mois",          icon: CalendarDays, unit: "mois"    },
  yearly:    { label: "Année",         icon: Star,         unit: "année"   },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR") : "—";

const TIME_SLOTS = Array.from({ length: 12 }, (_, i) =>
  `${(i + 8).toString().padStart(2, "0")}:00`
);

// ─── Composant ────────────────────────────────────────────────────────────────
export default function ReservationModal({
  isOpen,
  onClose,
  spaceId,
  spaceName,
  spaceType,   // "meeting" | "formation" | "open" | "private_office" | ...
  spacePrice,  // prix de base journalier venant de l'API (utilisé pour les espaces sans BDD pricing)
}) {
  const { user, isAuthenticated } = useAuth();

  const hasRoomSizeOption = useMemo(
    () => ROOM_SIZE_TYPES.includes(spaceType),
    [spaceType]
  );

  // ── State principal ──────────────────────────────────────────────────────────
  const [step, setStep] = useState(1); // 1 = taille (si applicable) ou formule, 2 = infos + recap, 3 = confirmation
  const [roomSize, setRoomSize] = useState("small");

  const [selectedOption, setSelectedOption] = useState(null); // PricingOption from API
  const [pricingOptions, setPricingOptions] = useState([]);

  const [formData, setFormData] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    booking_date: "",
    start_date: "",
    end_date: "",
    start_time: "09:00",
    notes: "",
    student_discount: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [bookingResult, setBookingResult] = useState(null);

  // ── Prix calculé ─────────────────────────────────────────────────────────────
  const unitPrice = useMemo(() => {
    if (!selectedOption) return 0;
    if (hasRoomSizeOption) {
      return ROOM_PRICES[roomSize]?.[selectedOption.duration_type] ?? 0;
    }
    return selectedOption.price ?? 0;
  }, [selectedOption, roomSize, hasRoomSizeOption]);

  const { originalPrice, totalPrice } = useMemo(() => {
    if (!selectedOption || unitPrice === 0) return { originalPrice: 0, totalPrice: 0 };

    const dt = selectedOption.duration_type;
    let total = unitPrice;

    if (["weekly", "monthly", "yearly"].includes(dt)) {
      if (formData.start_date && formData.end_date) {
        const days =
          Math.ceil(
            (new Date(formData.end_date) - new Date(formData.start_date)) /
              86400000
          ) + 1;
        if (dt === "weekly")       total = unitPrice * Math.ceil(days / 7);
        else if (dt === "monthly") total = unitPrice * Math.ceil(days / 30);
        else if (dt === "yearly")  total = unitPrice * Math.ceil(days / 365);
      }
    }

    const orig = Math.round(total);
    const disc =
      formData.student_discount && STUDENT_DISCOUNT_ALLOWED.includes(dt)
        ? Math.round(total * 0.8)
        : orig;

    return { originalPrice: orig, totalPrice: disc };
  }, [selectedOption, unitPrice, formData.start_date, formData.end_date, formData.student_discount]);

  // ── Reset à l'ouverture ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setStep(hasRoomSizeOption ? 1 : 2); // skip étape taille si pas de salle
    setRoomSize("small");
    setSelectedOption(null);
    setErrors({});
    setBookingResult(null);
    setFormData({
      guest_name:  isAuthenticated && user ? user.name  ?? "" : "",
      guest_email: isAuthenticated && user ? user.email ?? "" : "",
      guest_phone: isAuthenticated && user ? user.phone ?? "" : "",
      booking_date: "",
      start_date: "",
      end_date: "",
      start_time: "09:00",
      notes: "",
      student_discount: false,
    });
  }, [isOpen, isAuthenticated, user, hasRoomSizeOption]);

  // ── Chargement pricing (uniquement pour espaces non-salle) ───────────────────
  useEffect(() => {
    if (!isOpen || !spaceId) return;
    if (hasRoomSizeOption) {
      // Pas d'appel API — on construit les options depuis ROOM_PRICES
      const options = Object.entries(ROOM_PRICES.small).map(([dt], i) => ({
        id: i,
        duration_type: dt,
        price: ROOM_PRICES.small[dt], // on recalculera selon roomSize dans unitPrice
      }));
      setPricingOptions(options);
      setSelectedOption(options.find((o) => o.duration_type === "daily") ?? options[0]);
    } else {
      api
        .get(`/spaces/${spaceId}/pricing`)
        .then(({ data }) => {
          const opts = data.pricing_options ?? [];
          setPricingOptions(opts);
          const def = opts.find((o) => o.duration_type === "daily") ?? opts[0];
          if (def) setSelectedOption(def);
        })
        .catch((e) => console.error("Erreur tarifs:", e));
    }
  }, [isOpen, spaceId, hasRoomSizeOption]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const toggleDiscount = () => {
    if (!STUDENT_DISCOUNT_ALLOWED.includes(selectedOption?.duration_type)) return;
    setFormData((p) => ({ ...p, student_discount: !p.student_discount }));
  };

  const isDiscountAllowed = STUDENT_DISCOUNT_ALLOWED.includes(
    selectedOption?.duration_type
  );

  // ── Validation ────────────────────────────────────────────────────────────────
  const validateStep2 = () => {
    const e = {};
    if (!formData.guest_name?.trim())  e.guest_name  = "Le nom est requis";
    if (!formData.guest_email?.trim()) e.guest_email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.guest_email))
      e.guest_email = "Email invalide";
    if (!formData.guest_phone?.trim()) e.guest_phone = "Le téléphone est requis";

    const dt = selectedOption?.duration_type;
    if (SHORT_DURATIONS.includes(dt)) {
      if (!formData.booking_date) e.booking_date = "La date est requise";
      if (!formData.start_time)   e.start_time   = "L'heure est requise";
    } else {
      if (!formData.start_date) e.start_date = "Date de début requise";
      if (!formData.end_date)   e.end_date   = "Date de fin requise";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const payload = {
        space_id: spaceId,
        duration_type: selectedOption.duration_type,
        guest_name:  formData.guest_name,
        guest_email: formData.guest_email,
        guest_phone: formData.guest_phone,
        notes:       formData.notes,
        student_discount: formData.student_discount,
        ...(hasRoomSizeOption ? { room_size: roomSize } : {}),
        ...(SHORT_DURATIONS.includes(selectedOption.duration_type)
          ? { booking_date: formData.booking_date, start_time: formData.start_time }
          : { start_date: formData.start_date, end_date: formData.end_date }),
      };
      const { data } = await api.post("/bookings", payload);
      setBookingResult(data);
      setStep(3);
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else alert(err.response?.data?.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  // ── Navigation des étapes ────────────────────────────────────────────────────
  // Étape 1 : choix taille (seulement si hasRoomSizeOption)
  // Étape 2 : choix formule + infos personnelles + dates
  // Étape 3 : confirmation finale
  const stepLabel = () => {
    if (step === 3) return "Réservation confirmée";
    if (step === 1) return "Choisissez votre salle";
    return "Votre réservation";
  };

  if (!isOpen) return null;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-[#0A0A0F] to-[#12121A] border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="relative h-28 bg-gradient-to-r from-[#F4620A] to-[#C040E0] sticky top-0 z-10 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all"
          >
            <X size={20} />
          </button>

          {/* Indicateur d'étapes */}
          {step < 3 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {(hasRoomSizeOption ? [1, 2] : [2]).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s
                        ? "bg-white text-[#F4620A]"
                        : step > s
                        ? "bg-white/60 text-white"
                        : "bg-white/20 text-white/60"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i === 0 && hasRoomSizeOption && (
                    <div className="w-8 h-px bg-white/40" />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="absolute bottom-4 left-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-yellow-300" />
              <h3 className="text-xl font-bold text-white">{stepLabel()}</h3>
            </div>
            <p className="text-white/75 text-sm">{spaceName}</p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            ÉTAPE 1 — Choix de la taille de salle
        ════════════════════════════════════════════════════════════════════════*/}
        {step === 1 && hasRoomSizeOption && (
          <div className="p-6 space-y-6">
            <p className="text-[#A0A0B8] text-sm">
              Sélectionnez la taille de salle adaptée à votre groupe. Le tarif s'ajustera automatiquement.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  key: "small",
                  emoji: "🏠",
                  label: "Petite salle",
                  capacity: "6 – 10 personnes",
                  priceRef: ROOM_PRICES.small.daily,
                  features: ["Tableau blanc", "Écran HD", "Climatisation"],
                },
                {
                  key: "large",
                  emoji: "🏛️",
                  label: "Grande salle",
                  capacity: "12 – 20 personnes",
                  priceRef: ROOM_PRICES.large.daily,
                  features: ["Vidéoprojecteur", "Système audio", "Climatisation"],
                },
              ].map(({ key, emoji, label, capacity, priceRef, features }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRoomSize(key)}
                  className={`p-5 rounded-2xl text-left transition-all border-2 ${
                    roomSize === key
                      ? "border-[#F4620A] bg-gradient-to-br from-[#F4620A]/15 to-[#C040E0]/10 shadow-lg"
                      : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
                  }`}
                >
                  <div className="text-3xl mb-3">{emoji}</div>
                  <div className="font-semibold text-white text-base mb-1">{label}</div>
                  <div className="flex items-center gap-1 text-[#A0A0B8] text-sm mb-3">
                    <Users size={14} />
                    {capacity}
                  </div>
                  <ul className="space-y-1 mb-4">
                    {features.map((f) => (
                      <li key={f} className="text-xs text-[#A0A0B8] flex items-center gap-2">
                        <CheckCircle size={12} className="text-[#F4620A]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="text-[#F4620A] font-bold text-lg">
                    À partir de {priceRef} MAD
                    <span className="text-xs text-[#A0A0B8] font-normal ml-1">/ jour</span>
                  </div>
                  {roomSize === key && (
                    <div className="mt-2 text-xs text-[#F4620A] font-medium flex items-center gap-1">
                      <CheckCircle size={12} /> Sélectionnée
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.01] transition-all"
            >
              Choisir la formule
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            ÉTAPE 2 — Formule + Infos + Dates
        ════════════════════════════════════════════════════════════════════════*/}
        {step === 2 && (
          <div className="p-6 space-y-6">

            {/* Bouton retour (si salle) */}
            {hasRoomSizeOption && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-[#A0A0B8] hover:text-white text-sm transition-colors"
              >
                <ChevronLeft size={16} />
                Changer la taille de salle
                <span className="ml-1 px-2 py-0.5 rounded-full bg-white/10 text-white text-xs">
                  {roomSize === "small" ? "🏠 Petite salle" : "🏛️ Grande salle"}
                </span>
              </button>
            )}

            {/* Résumé espace */}
            <div className="bg-gradient-to-r from-[#F4620A]/10 to-[#C040E0]/10 rounded-xl p-4 border border-[#F4620A]/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{spaceName}</p>
                  {hasRoomSizeOption && (
                    <p className="text-[#A0A0B8] text-sm">
                      {roomSize === "small" ? "Petite salle — 4 à 8 pers." : "Grande salle — 12 à 20 pers."}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[#A0A0B8] text-xs">
                    / {DURATION_META[selectedOption?.duration_type]?.unit ?? "unité"}
                  </p>
                  <p className="text-[#F4620A] text-2xl font-bold">{unitPrice} MAD</p>
                </div>
              </div>
            </div>

            {/* Sélection formule */}
            <div>
              <label className="block text-white text-sm font-medium mb-3 flex items-center gap-2">
                <Clock size={16} className="text-[#F4620A]" />
                Choisissez votre formule
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {pricingOptions.map((option) => {
                  const meta = DURATION_META[option.duration_type];
                  const Icon = meta?.icon ?? Calendar;
                  const price = hasRoomSizeOption
                    ? ROOM_PRICES[roomSize]?.[option.duration_type] ?? 0
                    : option.price;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSelectedOption(option);
                        if (!STUDENT_DISCOUNT_ALLOWED.includes(option.duration_type)) {
                          setFormData((p) => ({ ...p, student_discount: false }));
                        }
                      }}
                      className={`p-3 rounded-xl text-center transition-all border ${
                        selectedOption?.id === option.id
                          ? "bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white border-transparent shadow-lg scale-105"
                          : "bg-white/5 text-[#A0A0B8] border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <Icon size={22} className="mx-auto mb-1" />
                      <div className="text-xs font-medium leading-tight">{meta?.label ?? option.duration_type}</div>
                      <div className="text-sm font-bold mt-1">{price} MAD</div>
                      {meta?.unit && (
                        <div className="text-[10px] opacity-70 mt-0.5">/ {meta.unit}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date(s) */}
            {selectedOption && (
              SHORT_DURATIONS.includes(selectedOption.duration_type) ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar size={16} className="text-[#F4620A]" />
                      Date *
                    </label>
                    <input
                      type="date"
                      name="booking_date"
                      value={formData.booking_date}
                      onChange={handleChange}
                      min={today()}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all ${
                        errors.booking_date ? "border-red-500" : "border-white/10"
                      }`}
                    />
                    {errors.booking_date && (
                      <p className="text-red-400 text-xs mt-1">{errors.booking_date}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                      <Clock size={16} className="text-[#F4620A]" />
                      Heure *
                    </label>
                    <select
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
                    >
                      {TIME_SLOTS.map((s) => (
                        <option key={s} value={s} className="bg-[#1A1A2E]">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "start_date", label: "Date de début" },
                    { name: "end_date",   label: "Date de fin"   },
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
                            ? formData.start_date || today()
                            : today()
                        }
                        className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all ${
                          errors[name] ? "border-red-500" : "border-white/10"
                        }`}
                      />
                      {errors[name] && (
                        <p className="text-red-400 text-xs mt-1">{errors[name]}</p>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Réduction étudiant */}
            <div
              className={`rounded-xl p-4 transition-all border ${
                isDiscountAllowed
                  ? "bg-white/5 border-white/10 cursor-pointer"
                  : "bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed"
              }`}
              onClick={isDiscountAllowed ? toggleDiscount : undefined}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GraduationCap size={22} className={isDiscountAllowed ? "text-[#F4620A]" : "text-[#A0A0B8]"} />
                  <div>
                    <p className="text-white font-medium text-sm flex items-center gap-2">
                      Réduction étudiant
                      {!isDiscountAllowed && (
                        <span className="text-[10px] bg-white/10 text-[#A0A0B8] px-2 py-0.5 rounded-full">
                          Semaine / Mois / An uniquement
                        </span>
                      )}
                    </p>
                    <p className="text-[#A0A0B8] text-xs">−20% sur votre réservation</p>
                  </div>
                </div>
                <div className="relative pointer-events-none">
                  <input type="checkbox" checked={formData.student_discount} readOnly className="sr-only peer" />
                  <div className={`w-11 h-6 rounded-full transition-all
                    ${isDiscountAllowed
                      ? "bg-white/10 peer-checked:bg-gradient-to-r peer-checked:from-[#F4620A] peer-checked:to-[#C040E0]"
                      : "bg-white/5"}
                    ${formData.student_discount ? "bg-gradient-to-r from-[#F4620A] to-[#C040E0]" : ""}
                    relative after:content-[''] after:absolute after:top-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                    ${formData.student_discount ? "after:left-[22px]" : "after:left-[2px]"}`}
                  />
                </div>
              </div>
            </div>

            {/* Coordonnées */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Users size={18} className="text-[#F4620A]" />
                Vos coordonnées
              </h4>

              {[
                { name: "guest_name",  type: "text",  icon: User,  label: "Nom complet",  placeholder: "Nom complet",       disabled: isAuthenticated },
                { name: "guest_email", type: "email", icon: Mail,  label: "Email",         placeholder: "workaura@email.com",      disabled: isAuthenticated },
                { name: "guest_phone", type: "tel",   icon: Phone, label: "Téléphone",     placeholder: "+212 6XX XXX XXX",     disabled: false           },
              ].map(({ name, type, icon: Icon, label, placeholder, disabled }) => (
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
                    <p className="text-red-400 text-xs mt-1">{errors[name]}</p>
                  )}
                </div>
              ))}

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

            {/* Récapitulatif prix */}
            <div className="bg-gradient-to-r from-[#F4620A]/20 to-[#C040E0]/20 rounded-xl p-4 border border-[#F4620A]/30">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Tag size={18} className="text-[#F4620A]" />
                Récapitulatif
              </h4>
              <div className="space-y-2 text-sm">
                {hasRoomSizeOption && (
                  <div className="flex justify-between">
                    <span className="text-[#A0A0B8]">Salle</span>
                    <span className="text-white">
                      {roomSize === "small" ? "🏠 Petite salle" : "🏛️ Grande salle"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#A0A0B8]">Formule</span>
                  <span className="text-white">
                    {DURATION_META[selectedOption?.duration_type]?.label ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A0A0B8]">
                    Prix / {DURATION_META[selectedOption?.duration_type]?.unit ?? "unité"}
                  </span>
                  <span className="text-white">{unitPrice} MAD</span>
                </div>
                {formData.student_discount && isDiscountAllowed && (
                  <div className="flex justify-between">
                    <span className="text-green-400">Réduction étudiant (−20%)</span>
                    <span className="text-green-400">−{originalPrice - totalPrice} MAD</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-[#F4620A] text-2xl font-bold">{totalPrice} MAD</span>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all font-medium"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !selectedOption}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Confirmation...</>
                ) : (
                  <><CreditCard size={18} /> Confirmer la réservation</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            ÉTAPE 3 — Confirmation
        ════════════════════════════════════════════════════════════════════════*/}
        {step === 3 && (
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={42} className="text-green-400" />
            </div>

            <h4 className="text-2xl font-bold text-white mb-2">Réservation confirmée !</h4>
            <p className="text-[#A0A0B8] mb-6 text-sm">
              Un email de confirmation a été envoyé à{" "}
              <span className="text-white font-medium">{formData.guest_email}</span>.
            </p>

            {bookingResult && (
              <div className="bg-white/5 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
                <p className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Info size={16} className="text-[#F4620A]" />
                  Détails
                </p>
                <div className="flex justify-between">
                  <span className="text-[#A0A0B8]">Espace</span>
                  <span className="text-white">{spaceName}</span>
                </div>
                {hasRoomSizeOption && (
                  <div className="flex justify-between">
                    <span className="text-[#A0A0B8]">Salle</span>
                    <span className="text-white">
                      {roomSize === "small" ? "Petite salle" : "Grande salle"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#A0A0B8]">Formule</span>
                  <span className="text-white">
                    {DURATION_META[selectedOption?.duration_type]?.label ?? "—"}
                  </span>
                </div>
                {SHORT_DURATIONS.includes(selectedOption?.duration_type) ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#A0A0B8]">Date</span>
                      <span className="text-white">{formatDate(formData.booking_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A0A0B8]">Horaire</span>
                      <span className="text-white">{formData.start_time}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-[#A0A0B8]">Période</span>
                    <span className="text-white">
                      Du {formatDate(formData.start_date)} au {formatDate(formData.end_date)}
                    </span>
                  </div>
                )}
                {formData.student_discount && isDiscountAllowed && (
                  <div className="flex justify-between">
                    <span className="text-green-400">Réduction étudiant</span>
                    <span className="text-green-400">−20%</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 flex justify-between">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-[#F4620A] text-xl font-bold">{totalPrice} MAD</span>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
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