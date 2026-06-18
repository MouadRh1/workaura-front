// components/admin/EmailSender.jsx
'use client';
import { useState, useEffect } from 'react';
import {
  X,
  Send,
  Mail,
  Users,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Paperclip,
  AtSign,
  MessageSquare,
  UserPlus,
} from 'lucide-react';
import api from '../../lib/api';

export function EmailSender({ onClose, contacts = [] }) {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      const filtered = contacts.filter(c =>
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchTerm, contacts]);

  const toggleContact = (contact) => {
    if (selectedContacts.find(c => c.id === contact.id)) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts);
    }
    setSelectAll(!selectAll);
  };

  const removeContact = (id) => {
    setSelectedContacts(selectedContacts.filter(c => c.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedContacts.length === 0) {
      setStatus({ type: 'error', message: 'Veuillez sélectionner au moins un destinataire' });
      return;
    }
    if (!subject.trim()) {
      setStatus({ type: 'error', message: 'Veuillez saisir un objet' });
      return;
    }
    if (!message.trim()) {
      setStatus({ type: 'error', message: 'Veuillez saisir un message' });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      await api.post('/admin/send-email', {
        recipients: selectedContacts.map(c => c.email),
        subject,
        message,
        cc: null,
        bcc: null,
      });
      setStatus({ type: 'success', message: 'Email envoyé avec succès !' });
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Erreur envoi email:', error);
      setStatus({ type: 'error', message: 'Erreur lors de l\'envoi de l\'email' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#0A0A0F] to-[#12121A] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">

        {/* Header */}
        <div className="relative h-28 bg-gradient-to-r from-[#F4620A] to-[#C040E0] flex-shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all">
            <X size={20} />
          </button>
          <div className="absolute bottom-4 left-6">
            <div className="flex items-center gap-2">
              <Mail size={20} className="text-white" />
              <h3 className="text-2xl font-bold text-white">Envoyer un email</h3>
            </div>
            <p className="text-white/70 text-sm">Envoyez un email à vos contacts</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Status */}
            {status && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${
                status.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <p>{status.message}</p>
              </div>
            )}

            {/* Sélection des contacts */}
            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Users size={16} className="text-[#F4620A]" />
                Destinataires
                <span className="text-[#A0A0B8] text-xs ml-2">
                  ({selectedContacts.length} sélectionné{selectedContacts.length > 1 ? 's' : ''})
                </span>
              </label>

              {/* Contacts sélectionnés */}
              {selectedContacts.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedContacts.map((contact) => (
                    <span
                      key={contact.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm"
                    >
                      {contact.prenom} {contact.nom}
                      <button
                        type="button"
                        onClick={() => removeContact(contact.id)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Recherche et liste des contacts */}
              <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="relative p-3 border-b border-white/10">
                  <input
                    type="text"
                    placeholder="Rechercher un contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] text-sm"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="w-full text-left px-3 py-2 text-sm text-[#A0A0B8] hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="rounded border-white/20 bg-white/5 text-[#F4620A] focus:ring-[#F4620A]"
                      />
                      Tout sélectionner
                    </button>
                  </div>
                  {filteredContacts.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!selectedContacts.find(c => c.id === contact.id)}
                        onChange={() => toggleContact(contact)}
                        className="rounded border-white/20 bg-white/5 text-[#F4620A] focus:ring-[#F4620A]"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          {contact.prenom} {contact.nom}
                        </p>
                        <p className="text-[#A0A0B8] text-xs">{contact.email}</p>
                      </div>
                    </label>
                  ))}
                  {filteredContacts.length === 0 && (
                    <div className="p-4 text-center text-[#A0A0B8] text-sm">
                      Aucun contact trouvé
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Objet */}
            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <AtSign size={16} className="text-[#F4620A]" />
                Objet
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Objet de l'email..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-all"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <MessageSquare size={16} className="text-[#F4620A]" />
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                placeholder="Écrivez votre message..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-all resize-none"
                required
              />
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
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Envoyer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}