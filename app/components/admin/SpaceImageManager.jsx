// components/admin/SpaceImagesManager.jsx
'use client';
import { useState, useEffect } from 'react';
import { Upload, Image, Trash2, Star, StarOff, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

export function SpaceImagesManager({ spaceId, onRefresh }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (spaceId) {
      fetchImages();
    }
  }, [spaceId]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/spaces/${spaceId}/images`);
      setImages(response.data.images || []);
    } catch (err) {
      console.error('Erreur chargement images:', err);
      setError('Erreur lors du chargement des images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Format non supporté. Utilisez JPG ou PNG.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 10 Mo.');
      return;
    }
    
    setSelectedFile(file);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      // Envoyer '1' pour true, '0' pour false (string)
      formData.append('is_primary', images.length === 0 ? '1' : '0');
      
      // IMPORTANT: Ne pas définir Content-Type manuellement
      const response = await api.post(`/admin/spaces/${spaceId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.image) {
        await fetchImages();
        setSelectedFile(null);
        
        // Reset file input
        const fileInput = document.getElementById('image-upload-input');
        if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      console.error('Erreur upload:', err);
      // Afficher les détails de l'erreur
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        setError(errors.join(', '));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Erreur lors de l\'upload');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await api.put(`/admin/spaces/${spaceId}/images/${imageId}`, { is_primary: true });
      await fetchImages();
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Supprimer cette image ?')) return;
    
    try {
      await api.delete(`/admin/spaces/${spaceId}/images/${imageId}`);
      await fetchImages();
    } catch (err) {
      console.error('Erreur suppression:', err);
      setError('Erreur lors de la suppression');
    }
  };

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://localhost:8000';

  if (loading) {
    return (
      <div className="bg-white/5 rounded-xl p-6 text-center">
        <div className="w-8 h-8 border-2 border-[#F4620A]/30 border-t-[#F4620A] rounded-full animate-spin mx-auto mb-2" />
        <p className="text-white/50 text-sm">Chargement des images...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl p-6 space-y-4">
      <h3 className="text-white font-semibold flex items-center gap-2">
        <Image size={18} className="text-[#F4620A]" />
        Galerie d'images
        <span className="text-xs text-white/50 ml-2">({images.length} image(s))</span>
      </h3>

      {/* Upload section */}
      <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center">
        <input
          id="image-upload-input"
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleFileSelect}
          className="hidden"
        />
        <label
          htmlFor="image-upload-input"
          className="cursor-pointer inline-flex flex-col items-center"
        >
          <Upload size={32} className="text-white/50 mb-2" />
          <p className="text-white text-sm">Cliquez pour sélectionner une image</p>
          <p className="text-white/30 text-xs">JPG, PNG — max 10 Mo</p>
        </label>
        
        {selectedFile && (
          <div className="mt-3 p-2 bg-white/10 rounded-lg flex items-center justify-between">
            <span className="text-white text-sm truncate max-w-[200px]">{selectedFile.name}</span>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white text-xs font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {uploading ? 'Upload...' : 'Uploader'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 flex items-center gap-2">
          <AlertCircle size={14} className="text-red-400" />
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* Images grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-[#F4620A]/30 transition-all"
            >
              <img
                src={`${BASE_URL}${image.image_path}`}
                alt="Espace"
                className="w-full h-24 object-cover"
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleSetPrimary(image.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    image.is_primary
                      ? 'bg-yellow-500/80 text-yellow-400'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title={image.is_primary ? 'Image principale' : 'Définir comme principale'}
                >
                  {image.is_primary ? <Star size={14} /> : <StarOff size={14} />}
                </button>
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              {image.is_primary && (
                <div className="absolute top-1 left-1 bg-yellow-500/80 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Star size={10} /> Principal
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-white/40 text-sm">Aucune image secondaire</p>
          <p className="text-white/30 text-xs">Ajoutez des images pour compléter la galerie</p>
        </div>
      )}
    </div>
  );
}