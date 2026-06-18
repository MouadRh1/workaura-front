// components/admin/ContactManager.jsx
'use client';
import { useState, useEffect } from 'react';
import {
  Eye,
  Reply,
  Trash2,
  MessageSquare,
  X,
  Mail,
  Users,
  Search,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import api from '../../lib/api';
import { EmailSender } from './EmailSender';
import { SimpleEmailSender } from './SimpleEmailSender';

export function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailSenderOpen, setIsEmailSenderOpen] = useState(false);
  const [isSimpleEmailOpen, setIsSimpleEmailOpen] = useState(false);
  const [emailContact, setEmailContact] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    read: 0,
    replied: 0,
    today: 0,
  });

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/admin/contacts');
      setContacts(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erreur chargement contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/contacts/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const handleViewContact = async (contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);

    if (contact.status === 'pending') {
      try {
        await api.get(`/admin/contacts/${contact.id}`);
        await fetchContacts();
        await fetchStats();
      } catch (error) {
        console.error('Erreur marquage lu:', error);
      }
    }
  };

  const handleMarkAsReplied = async (id) => {
    if (!confirm('Marquer ce message comme répondu ?')) return;
    try {
      await api.put(`/admin/contacts/${id}/reply`);
      await fetchContacts();
      await fetchStats();
      if (selectedContact?.id === id) {
        setSelectedContact({ ...selectedContact, status: 'replied' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!confirm('Supprimer ce message ?')) return;
    try {
      await api.delete(`/admin/contacts/${id}`);
      await fetchContacts();
      await fetchStats();
      if (selectedContact?.id === id) {
        setIsModalOpen(false);
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleSendEmailToContact = (contact) => {
    setEmailContact(contact);
    setIsSimpleEmailOpen(true);
  };

  const filteredContacts = contacts.filter((contact) => {
    const search = searchTerm.toLowerCase();
    return (
      contact.nom?.toLowerCase().includes(search) ||
      contact.prenom?.toLowerCase().includes(search) ||
      contact.email?.toLowerCase().includes(search) ||
      contact.telephone?.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-yellow-400/10 text-yellow-400">
            ⏳ En attente
          </span>
        );
      case 'read':
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-blue-400/10 text-blue-400">
            👁️ Lu
          </span>
        );
      case 'replied':
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-green-400/10 text-green-400">
            ✓ Répondu
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-gray-400/10 text-gray-400">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 rounded-2xl p-12 text-center">
        <div className="w-8 h-8 border-2 border-[#F4620A]/30 border-t-[#F4620A] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[#A0A0B8]">Chargement des messages...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Messages de contact
            </h1>
            <p className="text-[#A0A0B8]">Gérez les messages de vos visiteurs</p>
          </div>
          <button
            onClick={() => setIsEmailSenderOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white text-sm font-medium hover:shadow-lg transition-all whitespace-nowrap"
          >
            <Mail size={18} />
            Envoyer un email
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-[#A0A0B8] text-xs">Total</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          <p className="text-[#A0A0B8] text-xs">En attente</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.read}</p>
          <p className="text-[#A0A0B8] text-xs">Lus</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.replied}</p>
          <p className="text-[#A0A0B8] text-xs">Répondus</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#F4620A]">{stats.today}</p>
          <p className="text-[#A0A0B8] text-xs">Aujourd'hui</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A]"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0B8]"
          />
        </div>
      </div>

      {/* Table */}
      {filteredContacts.length === 0 ? (
        <div className="bg-white/5 rounded-2xl p-12 text-center">
          <MessageSquare size={48} className="mx-auto text-[#A0A0B8] mb-3" />
          <p className="text-[#A0A0B8]">Aucun message trouvé</p>
        </div>
      ) : (
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left px-6 py-4 text-[#A0A0B8] text-sm font-medium">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-[#A0A0B8] text-sm font-medium">
                    Nom
                  </th>
                  <th className="text-left px-6 py-4 text-[#A0A0B8] text-sm font-medium">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-[#A0A0B8] text-sm font-medium">
                    Téléphone
                  </th>
                  <th className="text-left px-6 py-4 text-[#A0A0B8] text-sm font-medium">
                    Message
                  </th>
                  <th className="text-left px-6 py-4 text-[#A0A0B8] text-sm font-medium">
                    Statut
                  </th>
                  <th className="text-left px-6 py-4 text-[#A0A0B8] text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleViewContact(contact)}
                  >
                    <td className="px-6 py-4 text-white text-sm">
                      {new Date(contact.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white text-sm font-medium">
                        {contact.prenom} {contact.nom}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-white text-sm">
                      {contact.email}
                    </td>
                    <td className="px-6 py-4 text-white text-sm">
                      {contact.telephone}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[#A0A0B8] text-sm line-clamp-2 max-w-xs">
                        {contact.message}
                      </p>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(contact.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleViewContact(contact)}
                          className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                          title="Voir"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleSendEmailToContact(contact)}
                          className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                          title="Envoyer un email"
                        >
                          <Mail size={16} />
                        </button>
                        {contact.status !== 'replied' && (
                          <button
                            onClick={() => handleMarkAsReplied(contact.id)}
                            className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            title="Marquer comme répondu"
                          >
                            <Reply size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
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

      {/* Modal Détail */}
      {isModalOpen && selectedContact && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#F4620A] to-[#C040E0] p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Détail du message</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-white/80"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#A0A0B8] text-xs uppercase tracking-wider">
                    Nom complet
                  </label>
                  <p className="text-white font-medium">
                    {selectedContact.prenom} {selectedContact.nom}
                  </p>
                </div>
                <div>
                  <label className="text-[#A0A0B8] text-xs uppercase tracking-wider">
                    Date d'envoi
                  </label>
                  <p className="text-white">
                    {new Date(selectedContact.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="text-[#A0A0B8] text-xs uppercase tracking-wider">
                    Email
                  </label>
                  <p className="text-white">{selectedContact.email}</p>
                </div>
                <div>
                  <label className="text-[#A0A0B8] text-xs uppercase tracking-wider">
                    Téléphone
                  </label>
                  <p className="text-white">{selectedContact.telephone}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-[#A0A0B8] text-xs uppercase tracking-wider">
                    Statut
                  </label>
                  <div className="mt-1">{getStatusBadge(selectedContact.status)}</div>
                </div>
                <div className="col-span-2">
                  <label className="text-[#A0A0B8] text-xs uppercase tracking-wider">
                    Message
                  </label>
                  <p className="text-white mt-1 bg-white/5 p-4 rounded-xl whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="flex-1 px-4 py-2 text-center rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                >
                  Répondre par email
                </a>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    handleSendEmailToContact(selectedContact);
                  }}
                  className="flex-1 px-4 py-2 text-center rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                >
                  Envoyer un email
                </button>
                {selectedContact.status !== 'replied' && (
                  <button
                    onClick={() => handleMarkAsReplied(selectedContact.id)}
                    className="flex-1 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                  >
                    Marquer comme répondu
                  </button>
                )}
                <button
                  onClick={() => handleDeleteContact(selectedContact.id)}
                  className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Sender (multiple) */}
      {isEmailSenderOpen && (
        <EmailSender
          onClose={() => setIsEmailSenderOpen(false)}
          contacts={contacts}
        />
      )}

      {/* Simple Email Sender (single) */}
      {isSimpleEmailOpen && emailContact && (
        <SimpleEmailSender
          onClose={() => {
            setIsSimpleEmailOpen(false);
            setEmailContact(null);
          }}
          contact={emailContact}
        />
      )}
    </>
  );
}