// components/admin/BookingModal.jsx
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Save, Calendar, Clock, User, Mail, Building2, DollarSign, Tag, Phone, FileText, Maximize2 } from 'lucide-react';

export function BookingModal({ isOpen, onClose, onSave, editingItem, spaces = [] }) {
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    space_id: '',
    booking_date: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    duration_type: 'daily',
    room_size: 'small',
    status: 'pending',
    total_amount: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [isLongDuration, setIsLongDuration] = useState(false);

  // Types d'espaces qui ont des options de taille
  const ROOM_SIZE_TYPES = useMemo(() => ['meeting', 'formation'], []);

  // Utiliser useMemo pour stabiliser spaces
  const spacesList = useMemo(() => spaces, [spaces]);

  // Réinitialiser le formulaire quand le modal s'ouvre/ferme ou quand editingItem change
  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      const isLong = ['weekly', 'monthly', 'yearly'].includes(editingItem.duration_type);
      setIsLongDuration(isLong);
      
      setFormData({
        guest_name: editingItem.guest_name || editingItem.user?.name || '',
        guest_email: editingItem.guest_email || editingItem.user?.email || '',
        guest_phone: editingItem.guest_phone || '',
        space_id: editingItem.space_id || editingItem.space?.id || '',
        booking_date: editingItem.booking_date || '',
        start_date: editingItem.start_date || '',
        end_date: editingItem.end_date || '',
        start_time: editingItem.start_time?.substring(0,5) || '',
        end_time: editingItem.end_time?.substring(0,5) || '',
        duration_type: editingItem.duration_type || 'daily',
        room_size: editingItem.room_size || 'small',
        status: editingItem.status || 'pending',
        total_amount: editingItem.total_amount || 0,
        notes: editingItem.notes || ''
      });
      
      // Trouver l'espace sélectionné
      const space = spacesList.find(s => s.id === (editingItem.space_id || editingItem.space?.id));
      setSelectedSpace(space || null);
    } else {
      setIsLongDuration(false);
      setFormData({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        space_id: '',
        booking_date: '',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        duration_type: 'daily',
        room_size: 'small',
        status: 'pending',
        total_amount: 0,
        notes: ''
      });
      setSelectedSpace(null);
    }
  }, [isOpen, editingItem, spacesList]); // Ne dépend que de isOpen, editingItem et spacesList

  // Mettre à jour selectedSpace quand space_id change
  useEffect(() => {
    if (formData.space_id) {
      const space = spacesList.find(s => s.id === parseInt(formData.space_id));
      setSelectedSpace(space || null);
    } else {
      setSelectedSpace(null);
    }
  }, [formData.space_id, spacesList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = { ...formData };
      
      // Pour les réservations longue durée, utiliser start_date et end_date
      if (isLongDuration) {
        submitData.booking_date = formData.start_date;
        submitData.end_date = formData.end_date;
      }
      // Supprimer les champs non nécessaires
      delete submitData.start_date;
      delete submitData.end_date;
      
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpaceChange = (e) => {
    const spaceId = e.target.value;
    setFormData(prev => ({ ...prev, space_id: spaceId }));
  };

  const handleDurationChange = (e) => {
    const value = e.target.value;
    setIsLongDuration(['weekly', 'monthly', 'yearly'].includes(value));
    setFormData(prev => ({ ...prev, duration_type: value }));
  };

  const hasRoomSizeOption = selectedSpace && ROOM_SIZE_TYPES.includes(selectedSpace.type);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-[#0A0A0F] to-[#12121A] border border-white/10 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative h-28 bg-gradient-to-r from-[#F4620A] to-[#C040E0] sticky top-0">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all">
            <X size={20} />
          </button>
          <div className="absolute bottom-4 left-6">
            <h3 className="text-2xl font-bold text-white">
              {editingItem ? 'Modifier la réservation' : 'Nouvelle réservation'}
            </h3>
            <p className="text-white/70 text-sm">
              {editingItem ? 'Modifiez les détails de la réservation' : 'Ajoutez une nouvelle réservation'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Informations client */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm border-b border-white/10 pb-2">Informations client</h4>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <User size={16} className="text-[#F4620A]" />
                Nom complet *
              </label>
              <input
                type="text"
                name="guest_name"
                value={formData.guest_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-all"
                placeholder="Jean Dupont"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Mail size={16} className="text-[#F4620A]" />
                Email *
              </label>
              <input
                type="email"
                name="guest_email"
                value={formData.guest_email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-all"
                placeholder="jean@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Phone size={16} className="text-[#F4620A]" />
                Téléphone
              </label>
              <input
                type="tel"
                name="guest_phone"
                value={formData.guest_phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-all"
                placeholder="+212 6XX XXX XXX"
              />
            </div>
          </div>

          {/* Détails réservation */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm border-b border-white/10 pb-2">Détails de la réservation</h4>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Building2 size={16} className="text-[#F4620A]" />
                Espace *
              </label>
              <select
                name="space_id"
                value={formData.space_id}
                onChange={handleSpaceChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
                required
              >
                <option value="">Sélectionner un espace</option>
                {spacesList.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.name} {space.type === 'meeting' ? '(Salle de réunion)' : space.type === 'formation' ? '(Salle de formation)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection de la taille de salle (uniquement pour meeting/formation) */}
            {hasRoomSizeOption && (
              <div>
                <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                  <Maximize2 size={16} className="text-[#F4620A]" />
                  Taille de la salle
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, room_size: 'small' }))}
                    className={`p-3 rounded-xl text-center transition-all border ${
                      formData.room_size === 'small'
                        ? 'bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white border-transparent shadow-lg'
                        : 'bg-white/10 text-[#A0A0B8] border-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-lg mb-1">🏠</div>
                    <div className="text-sm font-medium">Petite salle</div>
                    <div className="text-xs opacity-80">4-8 personnes</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, room_size: 'large' }))}
                    className={`p-3 rounded-xl text-center transition-all border ${
                      formData.room_size === 'large'
                        ? 'bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white border-transparent shadow-lg'
                        : 'bg-white/10 text-[#A0A0B8] border-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-lg mb-1">🏛️</div>
                    <div className="text-sm font-medium">Grande salle</div>
                    <div className="text-xs opacity-80">12-20 personnes</div>
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Tag size={16} className="text-[#F4620A]" />
                Type de durée
              </label>
              <select
                name="duration_type"
                value={formData.duration_type}
                onChange={handleDurationChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
              >
                <option value="hourly">À l'heure</option>
                <option value="2_hours">2 heures</option>
                <option value="half_day">Demi-journée</option>
                <option value="daily">Journée</option>
                <option value="weekly">Semaine</option>
                <option value="monthly">Mois</option>
                <option value="yearly">Année</option>
              </select>
            </div>

            {/* Date selon le type de durée */}
            {!isLongDuration ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-[#F4620A]" />
                    Date *
                  </label>
                  <input
                    type="date"
                    name="booking_date"
                    value={formData.booking_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-[#F4620A]" />
                    Heure début
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-[#F4620A]" />
                    Date de début *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-[#F4620A]" />
                    Date de fin *
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <DollarSign size={16} className="text-[#F4620A]" />
                Montant total (MAD) *
              </label>
              <input
                type="number"
                name="total_amount"
                value={formData.total_amount}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Tag size={16} className="text-[#F4620A]" />
                Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
              >
                <option value="pending">⏳ En attente</option>
                <option value="confirmed">✅ Confirmé</option>
                <option value="cancelled">❌ Annulé</option>
              </select>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <FileText size={16} className="text-[#F4620A]" />
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-all resize-none"
                placeholder="Informations supplémentaires..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all font-medium">
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  {editingItem ? 'Mettre à jour' : 'Ajouter'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}