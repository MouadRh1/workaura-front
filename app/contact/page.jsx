"use client";
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  User,
  CheckCircle,
  AlertTriangle,
  Loader2,
  MessageSquare,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function Pill({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4620A]/10 border border-[#F4620A]/20 text-[#F4620A] text-xs font-semibold tracking-widest uppercase">
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

function InfoCard({ icon: Icon, title, children, variant = "orange" }) {
  const iconStyles =
    variant === "purple"
      ? "bg-[#C040E0]/10 border-[#C040E0]/20 text-[#C040E0]"
      : "bg-[#F4620A]/10 border-[#F4620A]/20 text-[#F4620A]";
  return (
    <div className="flex items-start gap-4 bg-[#12121A] rounded-2xl border border-[#2A2A3E] p-5">
      <div
        className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconStyles}`}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-white font-semibold text-sm mb-1">{title}</p>
        <div className="text-[#A0A0B8] text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    conditions: false,
  });
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.conditions) {
      setStatus("conditions_error");
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(`${API_URL}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          setErrors(data.errors);
          setStatus("validation_error");
        } else {
          setStatus("error");
        }
        return;
      }

      setStatus("success");
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        conditions: false,
      });
      setTimeout(() => setStatus(null), 6000);
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field) =>
    errors[field] ? (
      <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
        <AlertTriangle size={11} />
        {errors[field][0]}
      </p>
    ) : null;

  const inputBase =
    "w-full bg-[#1A1A26] border border-[#2A2A3E] rounded-xl px-4 py-3 text-white text-sm placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-colors duration-200";

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-0">
      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <Pill icon={MessageSquare}>Contact</Pill>
        <h1 className="text-4xl md:text-5xl font-bold mt-5 mb-4">
          Parlons de votre{" "}
          <span className="bg-gradient-to-r from-[#F4620A] to-[#C040E0] bg-clip-text text-transparent">
            projet
          </span>
        </h1>
        <p className="text-[#A0A0B8] text-lg max-w-xl mx-auto">
          Une question ? Une réservation ? Notre équipe vous répond rapidement.
        </p>
      </section>

      {/* ── CONTENU PRINCIPAL ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* ── Infos de contact ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <InfoCard icon={MapPin} title="Notre adresse">
              Avenue Mohammed V, Centre Ville
              <br />
              Témara, Maroc
            </InfoCard>

            <InfoCard icon={Phone} title="Téléphone" variant="purple">
              <a
                href="tel:+212600000000"
                className="hover:text-[#F4620A] transition-colors"
              >
                +212 6 00 00 00 00
              </a>
            </InfoCard>

            <InfoCard icon={Mail} title="Email">
              <a
                href="mailto:contact@workaura.ma"
                className="hover:text-[#F4620A] transition-colors"
              >
                contact@workaura.ma
              </a>
            </InfoCard>

            {/* Horaires — 7j/7 */}
            <InfoCard
              icon={Clock}
              title="Horaires d'ouverture"
              variant="purple"
            >
              <div className="space-y-1">
                <div className="flex justify-between gap-5">
                  <span>Lundi – dimanche</span>
                  <span className="text-white font-medium">8h30 – 22h00</span>
                </div>
                <div className="pt-1 mt-1 border-t border-white/10">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    Ouvert 7j/7
                  </span>
                </div>
              </div>
            </InfoCard>

            {/* Google Maps embed */}
            <div className="rounded-2xl overflow-hidden border border-[#2A2A3E] h-52">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3310.3572670390363!2d-6.907973325590714!3d33.93193812407532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda713c7816d6f15%3A0xf8c772a4a0734a4d!2sWorkaura!5e0!3m2!1sfr!2sma!4v1780945731062!5m2!1sfr!2sma"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Workaura — Localisation Google Maps"
              />
            </div>
          </div>

          {/* ── Formulaire ── */}
          <div className="lg:col-span-3">
            <div className="bg-[#12121A] rounded-2xl border border-[#2A2A3E] p-8">
              <div className="mb-7">
                <h2 className="text-xl font-bold text-white mb-1">
                  Envoyez-nous un message
                </h2>
                <p className="text-[#A0A0B8] text-sm">
                  Remplissez le formulaire et nous vous répondrons sous 24h.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nom + Prénom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[#A0A0B8] text-xs font-semibold uppercase tracking-wider mb-2">
                      Nom <span className="text-[#F4620A]">*</span>
                    </label>
                    <div className="relative">
                      <User
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F4620A] opacity-60 pointer-events-none"
                      />
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                        placeholder="Votre nom"
                        className={`${inputBase} pl-9 ${errors.nom ? "border-red-500/60" : ""}`}
                      />
                    </div>
                    {fieldError("nom")}
                  </div>

                  <div>
                    <label className="block text-[#A0A0B8] text-xs font-semibold uppercase tracking-wider mb-2">
                      Prénom <span className="text-[#F4620A]">*</span>
                    </label>
                    <div className="relative">
                      <User
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F4620A] opacity-60 pointer-events-none"
                      />
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                        placeholder="Votre prénom"
                        className={`${inputBase} pl-9 ${errors.prenom ? "border-red-500/60" : ""}`}
                      />
                    </div>
                    {fieldError("prenom")}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[#A0A0B8] text-xs font-semibold uppercase tracking-wider mb-2">
                    Email <span className="text-[#F4620A]">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F4620A] opacity-60 pointer-events-none"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="exemple@email.com"
                      className={`${inputBase} pl-9 ${errors.email ? "border-red-500/60" : ""}`}
                    />
                  </div>
                  {fieldError("email")}
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-[#A0A0B8] text-xs font-semibold uppercase tracking-wider mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F4620A] opacity-60 pointer-events-none"
                    />
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      placeholder="+212 6 XX XX XX XX"
                      className={`${inputBase} pl-9 ${errors.telephone ? "border-red-500/60" : ""}`}
                    />
                  </div>
                  {fieldError("telephone")}
                </div>

                {/* Checkbox */}
                <div className="flex items-start gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="conditions"
                    name="conditions"
                    checked={formData.conditions}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 accent-[#F4620A] cursor-pointer flex-shrink-0"
                  />
                  <label
                    htmlFor="conditions"
                    className="text-[#A0A0B8] text-sm leading-relaxed cursor-pointer"
                  >
                    J'accepte les{" "}
                    <a
                      href="/conditions"
                      target="_blank"
                      className="text-[#F4620A] hover:underline font-medium"
                    >
                      conditions générales
                    </a>{" "}
                    d'utilisation du service.
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-medium text-sm transition-all duration-300 ${
                    loading
                      ? "bg-[#2A2A3E] cursor-not-allowed text-[#A0A0B8]"
                      : "bg-gradient-to-r from-[#F4620A] to-[#C040E0] hover:opacity-90 hover:-translate-y-0.5"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Envoyer le message
                    </>
                  )}
                </button>

                {/* Statuts */}
                {status === "success" && (
                  <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <CheckCircle
                      size={18}
                      className="text-emerald-400 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-emerald-400 font-medium text-sm">
                        Message envoyé avec succès !
                      </p>
                      <p className="text-emerald-400/70 text-xs mt-0.5">
                        Un email de confirmation vous a été adressé. Nous vous
                        répondrons sous 24h.
                      </p>
                    </div>
                  </div>
                )}

                {status === "error" && (
                  <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertTriangle
                      size={18}
                      className="text-red-400 shrink-0"
                    />
                    <p className="text-red-400 text-sm">
                      Une erreur est survenue. Veuillez réessayer.
                    </p>
                  </div>
                )}

                {status === "conditions_error" && (
                  <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <AlertTriangle
                      size={18}
                      className="text-yellow-400 shrink-0"
                    />
                    <p className="text-yellow-400 text-sm">
                      Veuillez accepter les conditions générales avant
                      d'envoyer.
                    </p>
                  </div>
                )}
              </form>

              {/* Footer formulaire */}
              <div className="mt-6 pt-5 border-t border-[#2A2A3E] flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded bg-[#F4620A]/10 border border-[#F4620A]/20 flex items-center justify-center">
                  <CheckCircle size={10} className="text-[#F4620A]" />
                </div>
                <p className="text-[#A0A0B8] text-xs">
                  Vos données sont protégées et ne seront jamais partagées avec
                  des tiers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA bas de page ── */}
      <section className="bg-[#12121A] border-t border-[#2A2A3E] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Préférez-vous réserver{" "}
            <span className="bg-gradient-to-r from-[#F4620A] to-[#C040E0] bg-clip-text text-transparent">
              directement ?
            </span>
          </h2>
          <p className="text-[#A0A0B8] text-sm mb-7">
            Parcourez nos espaces et réservez en quelques clics.
          </p>
          <a
            href="/espaces"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all duration-300"
          >
            Voir nos espaces →
          </a>
        </div>
      </section>
    </div>
  );
}
