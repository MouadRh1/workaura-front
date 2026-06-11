import { Wifi, Coffee, Clock, Users } from "lucide-react";
// ❌ Supprimez cet import
// import about from '../../../public/about.png'

export default function AboutSection() {
  const features = [
    { icon: <Wifi size={20} />, text: "WiFi Fibre" },
    { icon: <Clock size={20} />, text: "12h/7j Access" },
    { icon: <Users size={20} />, text: "Communauté active d'entrepreneurs" },
  ];

  return (
    <section id="apropos" className="py-24 px-6 bg-[#0A0A0F]">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Column - Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4620A]/10 border border-[#F4620A]/20 mb-6">
              <span className="text-xs uppercase tracking-widest text-[#F4620A] font-medium">
                À propos
              </span>
            </div>

            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Pas juste un bureau.{" "}
              <span className="bg-gradient-to-r from-[#F4620A] to-[#9B1FD4] bg-clip-text text-transparent">
                Une communauté.
              </span>
            </h2>

            <p className="text-[#A0A0B8] leading-relaxed mb-6">
              Workaura est un espace de coworking à Témara conçu pour les
              entrepreneurs, freelances, étudiants, télétravailleurs et équipes
              qui souhaitent évoluer dans un environnement professionnel et
              stimulant.
            </p>

            <p className="text-[#A0A0B8] leading-relaxed mb-8">
              Que vous recherchiez un bureau privé, un open space, une salle de
              réunion ou une salle de formation, Workaura vous offre les outils,
              les espaces et la communauté nécessaires pour avancer plus vite.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F4620A]/20 to-[#9B1FD4]/20 flex items-center justify-center text-white">
                    {feature.icon}
                  </div>
                  <span className="text-white">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Link */}
            {/* <a
              href="#"
              className="inline-flex items-center gap-2 text-[#F4620A] hover:text-[#9B1FD4] transition-colors font-medium group"
            >
              Notre histoire
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </a> */}
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="rounded-[20px] overflow-hidden">
              {/* ✅ Utilisez le chemin public directement */}
              <img
                src="/images/placeholder-space.jpg"
                alt="Espace Workaura"
                className="w-full h-[500px] object-cover"
              />
            </div>

            {/* Floating Card - Bottom Left */}
            <div className="absolute -bottom-6 -left-6 px-6 py-4 rounded-2xl bg-[#12121A] border border-[#2A2A3E] shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F4620A] to-[#9B1FD4] border-2 border-[#12121A]" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9B1FD4] to-[#F4620A] border-2 border-[#12121A]" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F4620A] to-[#C040E0] border-2 border-[#12121A]" />
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#F4620A]">
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-white font-medium">150+ membres actifs</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
