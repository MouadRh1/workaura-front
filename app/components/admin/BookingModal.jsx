'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  X, Save, Calendar, Clock, User, Mail,
  Building2, DollarSign, Tag, Phone, FileText, Maximize2
} from 'lucide-react';

export function BookingModal({ isOpen, onClose, onSave, editingItem, spaces = [] }) {
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    space_id: '',
    booking_date: '',
    start_date: '',
    end_date: '',
    start_time: '09:00',   // ← valeur par défaut
    end_time: '',
    duration_type: 'daily',
    room_size: 'small',
    status: 'pending',
    total_amount: 0,
    notes: '',
  });
  const [loading, setLoading]       = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);

  const ROOM_SIZE_TYPES = ['meeting', 'formation'];
  const spacesList      = useMemo(() => spaces, [spaces]);

  // Durées disponibles selon le type d'espace
  const availableDurations = useMemo(() => {
    const all = [
      { value: 'hourly',   label: "À l'heure"    },
      { value: '2_hours',  label: '2 heures'      },
      { value: 'half_day', label: 'Demi-journée'  },
      { value: 'daily',    label: 'Journée'       },
      { value: 'weekly',   label: 'Semaine'       },
      { value: 'monthly',  label: 'Mois'          },
      { value: 'yearly',   label: 'Année'         },
    ];
    // Les salles n'acceptent que les courtes durées
    if (selectedSpace && ROOM_SIZE_TYPES.includes(selectedSpace.type)) {
      return all.filter(d => ['hourly', '2_hours', 'half_day', 'daily'].includes(d.value));
    }
    return all;
  }, [selectedSpace]);

  const isLongDuration   = ['weekly', 'monthly', 'yearly'].includes(formData.duration_type);
  const hasRoomSizeOption = selectedSpace && ROOM_SIZE_TYPES.includes(selectedSpace.type);

  // Reset à l'ouverture
  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      setFormData({
        guest_name:    editingItem.guest_name    || editingItem.user?.name  || '',
        guest_email:   editingItem.guest_email   || editingItem.user?.email || '',
        guest_phone:   editingItem.guest_phone   || '',
        space_id:      editingItem.space_id      || editingItem.space?.id   || '',
        booking_date:  editingItem.booking_date  || '',
        start_date:    editingItem.booking_date  || '',   // pour l'affichage longue durée
        end_date:      editingItem.end_date      || '',
        start_time:    editingItem.start_time?.substring(0, 5) || '09:00',
        end_time:      editingItem.end_time?.substring(0, 5)   || '',
        duration_type: editingItem.duration_type || 'daily',
        room_size:     editingItem.room_size     || 'small',
        status:        editingItem.status        || 'pending',
        total_amount:  editingItem.total_amount  || 0,
        notes:         editingItem.notes         || '',
      });
    } else {
      setFormData({
        guest_name: '', guest_email: '', guest_phone: '',
        space_id: '', booking_date: '', start_date: '', end_date: '',
        start_time: '09:00', end_time: '',
        duration_type: 'daily', room_size: 'small',
        status: 'pending', total_amount: 0, notes: '',
      });
    }
  }, [isOpen, editingItem]);

  // Sync selectedSpace quand space_id change
  useEffect(() => {
    const space = spacesList.find(s => s.id === parseInt(formData.space_id)) || null;
    setSelectedSpace(space);

    // Si l'espace devient une salle et la durée choisie est longue → reset à daily
    if (space && ROOM_SIZE_TYPES.includes(space.type)) {
      if (['weekly', 'monthly', 'yearly'].includes(formData.duration_type)) {
        setFormData(prev => ({ ...prev, duration_type: 'daily' }));
      }
    }
  }, [formData.space_id, spacesList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = { ...formData };

      if (isLongDuration) {
        // Longue durée : booking_date = start_date, pas d'heure
        submitData.booking_date = formData.start_date;
        submitData.start_time   = '00:00';
        submitData.end_time     = '23:59';
      } else {
        // Courte durée : pas de end_date
        submitData.end_date = null;
      }

      // Nettoyer les champs temporaires du formulaire
      delete submitData.start_date;

      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-[#0A0A0F] to-[#12121A] border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="relative h-28 bg-gradient-to-r from-[#F4620A] to-[#C040E0] sticky top-0 rounded-t-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all">
            <X size={20} />
          </button>
          <div className="absolute bottom-4 left-6">
            <h3 className="text-2xl font-bold text-white">
              {editingItem ? 'Modifier la réservation' : 'Nouvelle réservation'}
            </h3>
            <p className="text-white/70 text-sm">
              {editingItem ? 'Modifiez les détails' : 'Ajoutez une nouvelle réservation'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* ── Informations client ── */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm border-b border-white/10 pb-2">
              Informations client
            </h4>

            {[
              { name: 'guest_name',  type: 'text',  icon: User,  label: 'Nom complet',  placeholder: 'Jean Dupont',        required: true  },
              { name: 'guest_email', type: 'email', icon: Mail,  label: 'Email',         placeholder: 'jean@email.com',     required: true  },
              { name: 'guest_phone', type: 'tel',   icon: Phone, label: 'Téléphone',     placeholder: '+212 6XX XXX XXX',   required: false },
            ].map(({ name, type, icon: Icon, label, placeholder, required }) => (
              <div key={name}>
                <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                  <Icon size={16} className="text-[#F4620A]" />
                  {label} {required && '*'}
                </label>
                <input
                  type={type} name={name} value={formData[name]}
                  onChange={handleChange} placeholder={placeholder} required={required}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-all"
                />
              </div>
            ))}
          </div>

          {/* ── Détails réservation ── */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm border-b border-white/10 pb-2">
              Détails de la réservation
            </h4>

            {/* Espace */}
            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Building2 size={16} className="text-[#F4620A]" /> Espace *
              </label>
              <select
                name="space_id" value={formData.space_id}
                onChange={handleChange} required
                className="w-full px-4 py-2.5 bg-[#1A1A2E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
              >
                <option value="">Sélectionner un espace</option>
                {spacesList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.type === 'meeting'   ? ' (Salle de réunion)'   : ''}
                    {s.type === 'formation' ? ' (Salle de formation)'  : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Taille de salle (meeting / formation uniquement) */}
            {hasRoomSizeOption && (
              <div>
                <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                  <Maximize2 size={16} className="text-[#F4620A]" /> Taille de la salle
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'small', icon: '🏠', label: 'Petite salle', sub: '4-8 personnes'   },
                    { key: 'large', icon: '🏛️', label: 'Grande salle', sub: '12-20 personnes' },
                  ].map(({ key, icon, label, sub }) => (
                    <button
                      key={key} type="button"
                      onClick={() => setFormData(p => ({ ...p, room_size: key }))}
                      className={`p-3 rounded-xl text-center transition-all border ${
                        formData.room_size === key
                          ? 'bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white border-transparent shadow-lg'
                          : 'bg-white/10 text-[#A0A0B8] border-white/10 hover:bg-white/20'
                      }`}
                    >
                      <div className="text-lg mb-1">{icon}</div>
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs opacity-80">{sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Type de durée — filtré selon l'espace */}
            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Tag size={16} className="text-[#F4620A]" /> Type de durée
              </label>
              <select
                name="duration_type" value={formData.duration_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#1A1A2E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
              >
                {availableDurations.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Dates selon durée */}
            {!isLongDuration ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-[#F4620A]" /> Date *
                  </label>
                  <input
                    type="date" name="booking_date" value={formData.booking_date}
                    onChange={handleChange} required
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-[#F4620A]" /> Heure de début *
                  </label>
                  <select
                    name="start_time" value={formData.start_time}
                    onChange={handleChange} required
                    className="w-full px-4 py-2.5 bg-[#1A1A2E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = (i + 8).toString().padStart(2, '0');
                      return <option key={h} value={`${h}:00`}>{h}:00</option>;
                    })}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'start_date', label: 'Date de début' },
                  { name: 'end_date',   label: 'Date de fin'   },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar size={16} className="text-[#F4620A]" /> {label} *
                    </label>
                    <input
                      type="date" name={name} value={formData[name]}
                      onChange={handleChange} required
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Montant */}
            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <DollarSign size={16} className="text-[#F4620A]" /> Montant total (MAD) *
              </label>
              <input
                type="number" name="total_amount" value={formData.total_amount}
                onChange={handleChange} placeholder="0" required min="0"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
              />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Tag size={16} className="text-[#F4620A]" /> Statut
              </label>
              <select
                name="status" value={formData.status} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#1A1A2E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
              >
                <option value="pending">⏳ En attente</option>
                <option value="confirmed">✅ Confirmé</option>
                <option value="cancelled">❌ Annulé</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <FileText size={16} className="text-[#F4620A]" /> Notes
              </label>
              <textarea
                name="notes" value={formData.notes} onChange={handleChange} rows={3}
                placeholder="Informations supplémentaires..."
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-all resize-none"
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all font-medium">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Save size={18} /> {editingItem ? 'Mettre à jour' : 'Ajouter'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}