"use client";
import { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Building2,
  Users,
  DollarSign,
  Tag,
  FileText,
  Upload,
  Image,
  AlertCircle,
  Check,
} from "lucide-react";
import { SpaceImagesManager } from "./SpaceImageManager";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://localhost:8000"
).replace("/api", "");

export function SpaceModal({ isOpen, onClose, onSave, editingItem }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "coworking",
    capacity: "",
    price: "",
    status: "available",
    description: "",
    amenities: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Reset à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setError("");
    }
  }, [isOpen]);

  // Pré-remplir quand editingItem change
  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      setFormData({
        name: editingItem.name || "",
        type: editingItem.type || "coworking",
        capacity: editingItem.capacity || "",
        price: editingItem.price !== undefined ? String(editingItem.price) : "",
        status: editingItem.status || "available",
        description: editingItem.description || "",
        amenities: Array.isArray(editingItem.amenities)
          ? editingItem.amenities.join(", ")
          : editingItem.amenities || "",
      });
      if (editingItem.featured_image) {
        setImagePreview(
          editingItem.featured_image.startsWith("http")
            ? editingItem.featured_image
            : `${BASE_URL}${editingItem.featured_image}`,
        );
      } else {
        setImagePreview("");
      }
    } else {
      setFormData({
        name: "",
        type: "coworking",
        capacity: "",
        price: "",
        status: "available",
        description: "",
        amenities: "",
      });
      setImagePreview("");
      setImageFile(null);
    }
  }, [editingItem, isOpen]);

  // Gestion fichier image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setError("Format non supporté. Utilisez JPG ou PNG.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 10 Mo.");
      return;
    }
    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Validation du formulaire
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Le nom est requis.");
      return false;
    }
    if (!formData.description.trim()) {
      setError("La description est requise.");
      return false;
    }
    if (!formData.capacity.trim()) {
      setError("La capacité est requise.");
      return false;
    }
    if (formData.price === "" || isNaN(Number(formData.price))) {
      setError("Le prix est requis et doit être un nombre.");
      return false;
    }
    const amenitiesArray = formData.amenities
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    if (amenitiesArray.length === 0) {
      setError("Ajoutez au moins un équipement.");
      return false;
    }
    if (!editingItem && !imageFile) {
      setError("Veuillez sélectionner une image.");
      return false;
    }
    setError("");
    return true;
  };

  // Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const amenitiesArray = formData.amenities
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("type", formData.type);
    data.append("capacity", formData.capacity.trim());
    data.append("price", Number(formData.price));
    data.append("status", formData.status);
    data.append("description", formData.description.trim());
    amenitiesArray.forEach((a) => data.append("amenities[]", a));
    if (imageFile) data.append("featured_image", imageFile);
    if (editingItem) data.append("_method", "PUT");

    setIsLoading(true);
    try {
      await onSave(data);
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const typeLabel = {
    private: "Bureau Privé",
    coworking: "Espace ouvert",
    formation: "Salle de Formation",
    meeting: "Salle de Réunion",
    terrace: "Terrasse",
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#0A0A0F] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
        {/* Header */}
        <div className="relative h-28 bg-gradient-to-r from-[#F4620A] to-[#C040E0] flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-4 left-6">
            <h3 className="text-xl font-bold text-white">
              {editingItem ? "Modifier l'espace" : "Nouvel espace"}
            </h3>
            <p className="text-white/70 text-sm">
              {editingItem
                ? "Modifiez les détails de l'espace"
                : "Ajoutez un nouvel espace de travail"}
            </p>
          </div>
        </div>

        {/* Formulaire - Scrollable */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto custom-scrollbar"
        >
          <div className="p-6 space-y-5">
            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Nom */}
            <div>
              <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                <Building2 size={16} className="text-[#F4620A]" />
                Nom de l'espace *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#F4620A] transition-all"
                placeholder="Ex: Bureau Executive"
                disabled={isLoading}
              />
            </div>

            {/* Type */}
            <div>
              <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                <Tag size={16} className="text-[#F4620A]" />
                Type d'espace
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(typeLabel).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: value })}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      formData.type === value
                        ? "bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white"
                        : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                <FileText size={16} className="text-[#F4620A]" />
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#F4620A] transition-all resize-none"
                placeholder="Décrivez votre espace..."
                disabled={isLoading}
              />
            </div>

            {/* Capacité et Prix */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                  <Users size={16} className="text-[#F4620A]" />
                  Capacité *
                </label>
                <input
                  type="text"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#F4620A] transition-all"
                  placeholder="2-4 pers."
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                  <DollarSign size={16} className="text-[#F4620A]" />
                  Prix (MAD/jour) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#F4620A] transition-all"
                  placeholder="250"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Statut */}
            <div>
              <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                <Tag size={16} className="text-[#F4620A]" />
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
                disabled={isLoading}
              >
                <option value="available">🟢 Disponible</option>
                <option value="occupied">🟡 Occupé</option>
                <option value="maintenance">🔴 Maintenance</option>
              </select>
            </div>

            {/* Équipements */}
            <div>
              <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                <Tag size={16} className="text-[#F4620A]" />
                Équipements * (séparés par des virgules)
              </label>
              <input
                type="text"
                value={formData.amenities}
                onChange={(e) =>
                  setFormData({ ...formData, amenities: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#F4620A] transition-all"
                placeholder="WiFi, Climatisation, Parking"
                disabled={isLoading}
              />
              {formData.amenities && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.amenities.split(",").map(
                    (a, i) =>
                      a.trim() && (
                        <span
                          key={i}
                          className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full"
                        >
                          {a.trim()}
                        </span>
                      ),
                  )}
                </div>
              )}
            </div>

            {/* Image */}
            <div>
              <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                <Upload size={16} className="text-[#F4620A]" />
                Image {!editingItem && "*"}
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />

              <div
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                    fileInputRef.current.click();
                  }
                }}
                className="w-full border-2 border-dashed border-white/20 hover:border-[#F4620A]/50 rounded-xl p-4 text-center cursor-pointer transition-all group"
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <p className="text-white text-sm font-medium">
                        Changer l'image
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-6">
                    <Image size={36} className="mx-auto text-white/50 mb-2" />
                    <p className="text-white text-sm font-medium">
                      Cliquez pour sélectionner
                    </p>
                    <p className="text-white/30 text-xs mt-1">
                      JPG, PNG — max 10 Mo
                    </p>
                  </div>
                )}
              </div>

              {imageFile && (
                <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                  <Check size={12} /> {imageFile.name}
                </p>
              )}
              {editingItem && !imageFile && imagePreview && (
                <p className="text-white/40 text-xs mt-2">
                  Laissez vide pour conserver l'image actuelle.
                </p>
              )}
            </div>
            {editingItem && editingItem.id && (
              <div className="mt-4">
                <SpaceImagesManager
                  spaceId={editingItem.id}
                  onRefresh={() => {}}
                />
              </div>
            )}
            {/* Aperçu */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/40 text-xs mb-2">Aperçu</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    {formData.name || "Nouvel espace"}
                  </p>
                  <p className="text-white/40 text-xs">
                    {typeLabel[formData.type]} ·{" "}
                    {formData.capacity || "Capacité"}
                  </p>
                </div>
                <p className="text-[#F4620A] font-bold">
                  {formData.price !== "" ? `${formData.price} MAD` : "— MAD"}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-white/5 flex-shrink-0">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition-all font-medium disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {editingItem ? "Mettre à jour" : "Ajouter"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
