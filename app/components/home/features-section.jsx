// components/home/FeaturesSection.jsx (version avec Localisation enrichie)
import { 
  Wifi, 
  Briefcase, 
  MapPin, 
  Users, 
  TrendingUp, 
  Rocket,
  ParkingCircle,
  Printer,
  Tv,
  Clipboard,
  Thermometer,
  Coffee,
  Clock,
  Shield
} from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    { 
      icon: Wifi, 
      title: 'Internet Haut Débit', 
      description: 'Connexion fibre rapide et stable',
      color: 'from-[#F4620A] to-[#F4620A]'
    },
    { 
      icon: Briefcase, 
      title: 'Espaces Professionnels', 
      description: 'Bureaux privés, open space, salle de réunion et salle de formation',
      color: 'from-[#F4620A] to-[#C040E0]'
    },
    { 
      icon: MapPin, 
      title: 'Localisation Stratégique', 
      description: 'Situé au cœur de Témara avec tous les équipements nécessaires',
      equipments: ['Parking gratuit', 'Imprimante / Scanner', 'Écran 4K 55"', 'Tableau blanc interactif', 'Climatisation réversible'],
      color: 'from-[#C040E0] to-[#9B1FD4]'
    },
    { 
      icon: Users, 
      title: 'Communauté Active', 
      description: 'Entrepreneurs, freelances, étudiants et porteurs de projets',
      color: 'from-[#00B4D8] to-[#0077B6]'
    },
    { 
      icon: TrendingUp, 
      title: 'Ambiance Productive', 
      description: 'Pensée pour la concentration et la progression',
      color: 'from-[#4CAF50] to-[#2E7D32]'
    },
    { 
      icon: Rocket, 
      title: 'Croissance Accélérée', 
      description: 'Boostez votre activité grâce à notre réseau',
      color: 'from-[#FF6B6B] to-[#C92A2A]'
    },
  ];

  const getEquipmentIcon = (equipment) => {
    if (equipment.includes('Parking')) return <ParkingCircle size={14} className="text-[#F4620A]" />;
    if (equipment.includes('Imprimante')) return <Printer size={14} className="text-[#F4620A]" />;
    if (equipment.includes('Écran')) return <Tv size={14} className="text-[#F4620A]" />;
    if (equipment.includes('Tableau')) return <Clipboard size={14} className="text-[#F4620A]" />;
    if (equipment.includes('Climatisation')) return <Thermometer size={14} className="text-[#F4620A]" />;
    return <Shield size={14} className="text-[#F4620A]" />;
  };

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
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} bg-opacity-20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-[#A0A0B8] leading-relaxed">{feature.description}</p>
              
              {/* Affichage des équipements pour la carte Localisation */}
              {feature.equipments && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-[#F4620A] text-xs font-medium mb-2">✓ Équipements inclus :</p>
                  <div className="flex flex-wrap gap-2">
                    {feature.equipments.map((equip, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-xs bg-white/10 text-[#A0A0B8] px-2 py-1 rounded-full">
                        {getEquipmentIcon(equip)}
                        {equip}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}