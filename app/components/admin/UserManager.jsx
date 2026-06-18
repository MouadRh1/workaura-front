// components/admin/UserManager.jsx
'use client';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Users,
  Search,
  Edit,
  Trash2,
  Download,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
  User,
  Crown,
  Save,
  Loader2,
  Mail,
} from 'lucide-react';
import api from '../../lib/api';
import { SimpleEmailSender } from './SimpleEmailSender';

const ROLES = [
  { value: 'admin', label: 'Administrateur', icon: Crown, color: 'text-yellow-400 bg-yellow-400/10' },
  { value: 'user', label: 'Utilisateur', icon: User, color: 'text-blue-400 bg-blue-400/10' },
];

const ROLE_LABELS = {
  admin: 'Administrateur',
  user: 'Utilisateur',
};

function getRoleBadge(role) {
  const r = ROLES.find((r) => r.value === role) || ROLES[2];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.color} flex items-center gap-1 w-fit`}>
      <r.icon size={11} />
      {r.label}
    </span>
  );
}

// ─── Export Excel avec xlsx ──────────────────────────────────────────────
function exportToExcel(users) {
  if (!users.length) {
    alert('Aucun utilisateur à exporter.');
    return;
  }

  const rows = users.map((u) => ({
    ID: u.id,
    'Nom complet': u.name || '',
    Email: u.email || '',
    Rôle: ROLE_LABELS[u.role] || u.role || 'Utilisateur',
    'Date d\'inscription': u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—',
    'Email vérifié': u.email_verified_at ? '✓ Oui' : '✗ Non',
    'Dernière connexion': u.last_login_at ? new Date(u.last_login_at).toLocaleString('fr-FR') : '—',
  }));

  // Créer la feuille de calcul
  const ws = XLSX.utils.json_to_sheet(rows);
  
  // Ajuster la largeur des colonnes
  ws['!cols'] = Object.keys(rows[0]).map(() => ({ wch: 22 }));

  // Créer le classeur
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Utilisateurs');

  // Exporter le fichier
  XLSX.writeFile(wb, `utilisateurs_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({ total: 0, admins: 0, users: 0 });
  
  // Email sender state
  const [isEmailSenderOpen, setIsEmailSenderOpen] = useState(false);
  const [emailUser, setEmailUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      const data = res.data.data || res.data || [];
      setUsers(data);
      setStats({
        total: data.length,
        admins: data.filter((u) => u.role === 'admin').length,
        users: data.filter((u) => u.role === 'user').length,
      });
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
      showToast('error', 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user) => {
    setEditingUser(user);
    setSelectedRole(user.role);
  };

  const handleSaveRole = async () => {
    if (!editingUser || selectedRole === editingUser.role) {
      setEditingUser(null);
      return;
    }
    setSaving(true);
    try {
      await api.put(`/admin/users/${editingUser.id}/role`, { role: selectedRole });
      
      const updatedUsers = users.map((u) => 
        u.id === editingUser.id ? { ...u, role: selectedRole } : u
      );
      setUsers(updatedUsers);
      
      setStats({
        total: updatedUsers.length,
        admins: updatedUsers.filter((u) => u.role === 'admin').length,
        users: updatedUsers.filter((u) => u.role === 'user').length,
      });
      
      showToast('success', `Rôle mis à jour pour ${editingUser.name}`);
      setEditingUser(null);
    } catch (err) {
      console.error('Erreur mise à jour rôle:', err);
      showToast('error', 'Erreur lors de la mise à jour du rôle');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`Supprimer l'utilisateur "${user.name}" ? Cette action est irréversible.`)) return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      const updated = users.filter((u) => u.id !== user.id);
      setUsers(updated);
      setStats({
        total: updated.length,
        admins: updated.filter((u) => u.role === 'admin').length,
        users: updated.filter((u) => u.role === 'user').length,
      });
      showToast('success', 'Utilisateur supprimé');
    } catch (err) {
      console.error('Erreur suppression:', err);
      showToast('error', 'Erreur lors de la suppression');
    }
  };

  const handleSendEmailToUser = (user) => {
    setEmailUser(user);
    setIsEmailSenderOpen(true);
  };

  const filtered = users.filter((u) => {
    const s = searchTerm.toLowerCase();
    return u.name?.toLowerCase().includes(s) || 
           u.email?.toLowerCase().includes(s) || 
           u.role?.toLowerCase().includes(s);
  });

  if (loading) {
    return (
      <div className="bg-white/5 rounded-2xl p-12 text-center">
        <div className="w-8 h-8 border-2 border-[#F4620A]/30 border-t-[#F4620A] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[#A0A0B8]">Chargement des utilisateurs...</p>
      </div>
    );
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all ${
          toast.type === 'success'
            ? 'bg-green-900/90 border-green-500/30 text-green-300'
            : 'bg-red-900/90 border-red-500/30 text-red-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Utilisateurs</h1>
            <p className="text-[#A0A0B8]">Gérez les comptes et les rôles</p>
          </div>
          <button
            onClick={() => exportToExcel(filtered)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white text-sm font-medium hover:shadow-lg transition-all whitespace-nowrap"
          >
            <Download size={18} />
            Exporter Excel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Admins', value: stats.admins, color: 'text-yellow-400' },
          { label: 'Utilisateurs', value: stats.users, color: 'text-blue-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[#A0A0B8] text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par nom, email ou rôle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A]"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0B8]" />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white/5 rounded-2xl p-12 text-center">
          <Users size={48} className="mx-auto text-[#A0A0B8] mb-3" />
          <p className="text-[#A0A0B8]">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  {['#', 'Utilisateur', 'Email', 'Rôle', 'Inscription', 'Statut', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-[#A0A0B8] text-sm font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-[#A0A0B8] text-sm">{user.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F4620A] to-[#9B1FD4] flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <p className="text-white text-sm font-medium">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white text-sm">{user.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-[#A0A0B8] text-sm">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      {user.email_verified_at ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-400/10 text-green-400">✓ Vérifié</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-400/10 text-gray-400">Non vérifié</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRole(user)}
                          className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          title="Modifier le rôle"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleSendEmailToUser(user)}
                          className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                          title="Envoyer un email"
                        >
                          <Mail size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Modifier le rôle</h3>
              <button onClick={() => setEditingUser(null)} className="text-[#A0A0B8] hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl mb-6">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#F4620A] to-[#9B1FD4] flex items-center justify-center">
                <span className="text-white font-bold">{editingUser.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div>
                <p className="text-white font-medium">{editingUser.name}</p>
                <p className="text-[#A0A0B8] text-sm">{editingUser.email}</p>
              </div>
            </div>

            {/* Role selector */}
            <div className="space-y-3 mb-6">
              <p className="text-[#A0A0B8] text-sm mb-3">Sélectionnez un rôle :</p>
              {ROLES.map((role) => (
                <label
                  key={role.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedRole === role.value
                      ? 'border-[#F4620A]/50 bg-[#F4620A]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={selectedRole === role.value}
                    onChange={() => setSelectedRole(role.value)}
                    className="accent-[#F4620A]"
                  />
                  <role.icon size={18} className={role.color.split(' ')[0]} />
                  <div>
                    <p className="text-white text-sm font-medium">{role.label}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveRole}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Email Sender */}
      {isEmailSenderOpen && emailUser && (
        <SimpleEmailSender
          onClose={() => {
            setIsEmailSenderOpen(false);
            setEmailUser(null);
          }}
          contact={{
            id: emailUser.id,
            email: emailUser.email,
            nom: emailUser.name?.split(' ').slice(1).join(' ') || '',
            prenom: emailUser.name?.split(' ')[0] || '',
          }}
        />
      )}
    </>
  );
}