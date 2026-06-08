// components/admin/GalleryModal.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Upload,
  Tag,
  FileText,
  AlertCircle,
  Image,
} from "lucide-react";

export function GalleryModal({ isOpen, onClose, onSave, editingItem }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "space",
    sort_order: 0,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState(null); // fichier sélectionné
  const [imagePreview, setImagePreview] = useState(""); // aperçu local
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Remplir le formulaire en mode édition
  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || "",
        description: editingItem.description || "",
        category: editingItem.category || "space",
        sort_order: editingItem.sort_order || 0,
        is_active: editingItem.is_active ?? true,
      });
      // Afficher l'image existante comme aperçu
      if (editingItem.image_path) {
        const base =
          process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
          "https://localhost:8000";
        setImagePreview(
          editingItem.image_path.startsWith("http")
            ? editingItem.image_path
            : `${base}${editingItem.image_path}`,
        );
      }
    } else {
      setFormData({
        title: "",
        description: "",
        category: "space",
        sort_order: 0,
        is_active: true,
      });
      setImagePreview("");
    }
    setImageFile(null);
    setError("");
  }, [editingItem, isOpen]);

  // Quand l'utilisateur choisit un fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifications côté client
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setError("Format non supporté. Utilisez JPG ou PNG.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file)); // aperçu immédiat
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.title) {
      setError("Le titre est requis.");
      return;
    }
    if (!editingItem && !imageFile) {
      setError("Veuillez sélectionner une image.");
      return;
    }

    // Construire le FormData pour l'upload multipart
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description || "");
    data.append("category", formData.category);
    data.append("sort_order", formData.sort_order);
    data.append("is_active", formData.is_active ? "1" : "0");
    if (imageFile) data.append("image", imageFile);

    // Laravel ne supporte pas PUT avec FormData → on utilise POST + _method spoofing
    if (editingItem) data.append("_method", "PUT");

    setIsLoading(true);
    try {
      await onSave(data, editingItem);
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-[#0A0A0F] to-[#12121A] border border-white/10 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-[#F4620A] to-[#C040E0] flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-4 left-6">
            <h3 className="text-2xl font-bold text-white">
              {editingItem ? "Modifier l'image" : "Ajouter une image"}
            </h3>
            <p className="text-white/70 text-sm">
              {editingItem
                ? "Modifiez les détails"
                : "Ajoutez une image à la galerie"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Erreur globale */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Titre */}
          <div>
            <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
              <Tag size={16} className="text-[#F4620A]" /> Titre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-all"
              placeholder="Titre de l'image"
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
              <FileText size={16} className="text-[#F4620A]" /> Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-all resize-none"
              placeholder="Description de l'image..."
              disabled={isLoading}
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
              <Tag size={16} className="text-[#F4620A]" /> Catégorie
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-[#0A0A0F] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
              disabled={isLoading}
            >
              <option value="space">🏢 Espace</option>
              <option value="event">🎉 Événement</option>
              <option value="community">👥 Communauté</option>
            </select>
          </div>

          {/* Ordre d'affichage */}
          <div>
            <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
              Ordre d'affichage
            </label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sort_order: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F4620A] transition-all"
              min="0"
              disabled={isLoading}
            />
          </div>

          {/* Upload image */}
          <div>
            <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
              <Upload size={16} className="text-[#F4620A]" />
              Image {!editingItem && "*"}
              {editingItem && (
                <span className="text-[#A0A0B8] text-xs">
                  (laisser vide pour garder l'actuelle)
                </span>
              )}
            </label>

            {/* Zone de drop / click */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-white/20 hover:border-[#F4620A]/50 rounded-xl p-6 text-center cursor-pointer transition-all group"
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
                <div className="py-4">
                  <Image size={40} className="mx-auto text-[#A0A0B8] mb-3" />
                  <p className="text-white text-sm font-medium">
                    Cliquez pour sélectionner
                  </p>
                  <p className="text-[#A0A0B8] text-xs mt-1">
                    JPG, PNG — max 5 Mo
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />

            {imageFile && (
              <p className="text-green-400 text-xs mt-1">✓ {imageFile.name}</p>
            )}
          </div>

          {/* Statut actif */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, is_active: !formData.is_active })
              }
              className={`relative w-11 h-6 rounded-full transition-colors ${formData.is_active ? "bg-[#F4620A]" : "bg-white/20"}`}
              disabled={isLoading}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_active ? "left-6" : "left-1"}`}
              />
            </button>
            <span className="text-white text-sm">Image active</span>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all font-medium disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
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
        </form>
      </div>
    </div>
  );
}
