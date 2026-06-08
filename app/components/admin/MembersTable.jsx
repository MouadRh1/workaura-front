// components/admin/MembersTable.jsx
'use client';

export function MembersTable({ members }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">Liste des membres</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left px-6 py-4 text-[#A0A0B8] text-sm font-medium">Nom</th>
              <th className="text-left px-6 py-4 text-[#A0A0B8] text-sm font-medium">Email</th>
              <th className="text-left px-6 py-4 text-[#A0A0B8] text-sm font-medium">Téléphone</th>
              <th className="text-left px-6 py-4 text-[#A0A0B8] text-sm font-medium">Type</th>
              <th className="text-left px-6 py-4 text-[#A0A0B8] text-sm font-medium">Total dépensé</th>
              <th className="text-left px-6 py-4 text-[#A0A0B8] text-sm font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-white text-sm font-medium">{member.name}</td>
                <td className="px-6 py-4 text-white text-sm">{member.email}</td>
                <td className="px-6 py-4 text-white text-sm">{member.phone}</td>
                <td className="px-6 py-4 text-white text-sm">{member.membershipType}</td>
                <td className="px-6 py-4 text-white text-sm font-medium">{member.totalSpent} MAD</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${member.status === 'active' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                    {member.status === 'active' ? '🟢 Actif' : '🔴 Inactif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}