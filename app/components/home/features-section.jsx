// components/home/FeaturesSection.jsx
import { Wifi, Briefcase, MapPin, Users, TrendingUp, Rocket } from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    { icon: Wifi, title: 'Internet Haut Débit', description: 'Connexion fibre rapide et stable' },
    { icon: Briefcase, title: 'Espaces Professionnels', description: 'Bureaux privés, open space, salle de réunion et salle de formation' },
    { icon: MapPin, title: 'Localisation Stratégique', description: 'Situé au cœur de Témara' },
    { icon: Users, title: 'Communauté Active', description: 'Entrepreneurs, freelances, étudiants et porteurs de projets' },
    { icon: TrendingUp, title: 'Ambiance Productive', description: 'Pensée pour la concentration et la progression' },
    { icon: Rocket, title: 'Croissance Accélérée', description: 'Boostez votre activité grâce à notre réseau' },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-[#0A0A0F] to-[#0F0F1A]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4620A]/10 border border-[#F4620A]/20 mb-6">
            <span className="text-xs uppercase tracking-widest text-[#F4620A] font-medium">
              WHY CHOOSE WORKAURA
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            L'environnement qui <span className="gradient-text">boost votre productivité</span>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-[#F4620A]/30 hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-[#F4620A]/20 to-[#C040E0]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="text-[#F4620A]" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-[#A0A0B8] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}