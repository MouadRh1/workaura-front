// components/admin/SimpleEmailSender.jsx
'use client';
import { useState } from 'react';
import { X, Send, Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

export function SimpleEmailSender({ onClose, contact }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setStatus({ type: 'error', message: 'Veuillez remplir tous les champs' });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      await api.post('/admin/send-email', {
        recipients: [contact.email],
        subject,
        message,
      });
      setStatus({ type: 'success', message: 'Email envoyé avec succès !' });
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Erreur envoi email:', error);
      setStatus({ type: 'error', message: 'Erreur lors de l\'envoi' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#12121A] border border-white/10 rounded-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Mail size={20} className="text-[#F4620A]" />
            <h3 className="text-xl font-bold text-white">Envoyer un email</h3>
          </div>
          <button onClick={onClose} className="text-[#A0A0B8] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <p className="text-[#A0A0B8] text-sm mb-4">
          À : <span className="text-white">{contact?.email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {status && (
            <div className={`p-3 rounded-xl flex items-center gap-2 ${
              status.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <p className="text-sm">{status.message}</p>
            </div>
          )}

          <div>
            <label className="block text-white text-sm font-medium mb-2">Objet</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Objet de l'email..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A]"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Écrivez votre message..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  Envoyer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}