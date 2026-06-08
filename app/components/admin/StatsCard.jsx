// components/admin/StatsCards.jsx
'use client';

export function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-[#F4620A]/30 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center group-hover:shadow-lg transition-all`}>
              <stat.icon size={24} className="text-white" />
            </div>
            <span className="text-green-400 text-sm font-medium">{stat.change}</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
          <p className="text-[#A0A0B8] text-sm">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}