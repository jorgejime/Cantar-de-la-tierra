import React, { useEffect, useState } from 'react';
import { supabase, SiteImage } from '../../lib/supabase';
import { Image as ImageIcon, Upload, Trash2, X, Check, AlertCircle, Plus, Loader2, Sparkles } from 'lucide-react';
import classNames from 'classnames';

const SECTIONS: Record<string, string> = {
    hero: 'Hero / Portada',
    features: 'Características',
    location: 'Ubicación',
    gallery: 'Galería',
    general: 'General',
};

const ImagesPage: React.FC = () => {
    const [images, setImages] = useState<SiteImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null); // ID or 'new'
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<string>('all');
    const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});
    const [editingUrl, setEditingUrl] = useState<string | null>(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImageLabel, setNewImageLabel] = useState('');
    const [newImageSection, setNewImageSection] = useState('gallery');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => { fetchImages(); }, []);

    const fetchImages = async () => {
        setLoading(true);
        const { data } = await supabase.from('site_images').select('*').order('created_at', { ascending: false });
        setImages(data || []);
        setLoading(false);
    };

    const showSuccess = (msg: string) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(null), 3000);
    };

    const showError = (msg: string) => {
        setError(msg);
        setTimeout(() => setError(null), 4000);
    };

    // --- Upload Logic (New & Existing) ---

    const uploadFileToStorage = async (file: File, prefix: string): Promise<{ url: string, path: string }> => {
        const ext = file.name.split('.').pop();
        const path = `site-images/${prefix}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from('site-images')
            .upload(path, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('site-images').getPublicUrl(path);
        return { url: publicUrl, path };
    };

    const handleExistingImageUpload = async (imageId: string, imageKey: string, file: File) => {
        setUploading(imageId);
        try {
            const { url, path } = await uploadFileToStorage(file, imageKey);

            await supabase.from('site_images').update({
                url: url,
                storage_path: path
            }).eq('id', imageId);

            setImages(prev => prev.map(img => img.id === imageId ? { ...img, url, storage_path: path } : img));
            showSuccess('Imagen actualizada correctamente');
        } catch (err: any) {
            showError('Error al subir imagen: ' + err.message);
        }
        setUploading(null);
    };

    const handleAddNewImage = async () => {
        if (!newImageFile && !newImageUrl) {
            showError('Debes seleccionar una imagen o ingresar una URL');
            return;
        }

        setUploading('new');
        try {
            let finalUrl = newImageUrl;
            let finalPath = null;

            if (newImageFile) {
                const { url, path } = await uploadFileToStorage(newImageFile, newImageSection);
                finalUrl = url;
                finalPath = path;
            }

            // Generate a key for filtering/reference
            const key = `${newImageSection}-${Date.now()}`;

            const { data, error: insertError } = await supabase.from('site_images').insert({
                key,
                label: newImageLabel || 'Nueva Imagen',
                url: finalUrl,
                storage_path: finalPath,
                section: newImageSection
            }).select().single();

            if (insertError) throw insertError;

            if (data) setImages([data, ...images]);

            showSuccess('Imagen agregada correctamente');
            setShowModal(false);
            resetModal();

        } catch (err: any) {
            console.error(err);
            showError('Error al crear imagen: ' + err.message);
        }
        setUploading(null);
    };

    const resetModal = () => {
        setNewImageFile(null);
        setNewImageUrl('');
        setNewImageLabel('');
        setNewImageSection(activeSection !== 'all' ? activeSection : 'gallery');
        setPreviewUrl(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewImageFile(file);
            setNewImageUrl(''); // Clear URL if file selected
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    // --- Init Defaults ---

    const handleInitDefaults = async () => {
        const confirmInit = confirm('Esto asegurará que existan las imágenes por defecto del Home (Hero, Circuito, Spa, Gastronomía, Mapa). ¿Continuar?');
        if (!confirmInit) return;

        setLoading(true);
        const INITIAL_IMAGES = [
            { key: 'home_hero', section: 'hero', label: 'Home - Portada Principal', url: 'https://i.ibb.co/m5XN33K2/530225970-1143822651132231-2243828081760603637-n.jpg' },
            { key: 'home_circuit', section: 'features', label: 'Home - Circuito Termal', url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop' },
            { key: 'home_spa', section: 'features', label: 'Home - Spa y Masajes', url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop' },
            { key: 'home_dining', section: 'features', label: 'Home - Gastronomía', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop' },
            { key: 'home_location', section: 'location', label: 'Home - Mapa Ubicación', url: 'https://i.ibb.co/7N6JT4gR/455012325-3828310047406344-4145253964796333914-n.jpg' }
        ];

        let addedCount = 0;
        for (const img of INITIAL_IMAGES) {
            // Check if exists by key (we filter current local state or fetch)
            // Ideally we check DB, but checking local state is faster for feedback if recent
            const exists = images.some(i => i.key === img.key);
            if (!exists) {
                // Double check DB to be sure
                const { data } = await supabase.from('site_images').select('id').eq('key', img.key).maybeSingle();
                if (!data) {
                    await supabase.from('site_images').insert(img);
                    addedCount++;
                }
            }
        }

        await fetchImages();
        showSuccess(addedCount > 0 ? `Se agregaron ${addedCount} imágenes por defecto` : 'Las imágenes ya existen');
        setLoading(false);
    };

    // --- Updates & Deletes ---

    const handleUrlUpdate = async (imageId: string) => {
        const newUrl = urlInputs[imageId];
        if (!newUrl) return;
        try {
            await supabase.from('site_images').update({ url: newUrl, storage_path: null }).eq('id', imageId);
            setImages(prev => prev.map(img => img.id === imageId ? { ...img, url: newUrl } : img));
            setEditingUrl(null);
            showSuccess('URL actualizada correctamente');
        } catch (err: any) {
            showError('Error al actualizar URL');
        }
    };

    const handleDeleteImage = async (image: SiteImage) => {
        const isDynamic = image.section === 'gallery'; // Only gallery images are fully deletable for now
        const message = isDynamic
            ? '¿Estás seguro de ELIMINAR esta imagen? Esta acción no se puede deshacer.'
            : '¿Restablecer esta imagen a la URL por defecto?';

        if (!confirm(message)) return;

        try {
            // Remove from storage if exists
            if (image.storage_path) {
                await supabase.storage.from('site-images').remove([image.storage_path]);
            }

            if (isDynamic) {
                // Hard delete row
                await supabase.from('site_images').delete().eq('id', image.id);
                setImages(prev => prev.filter(img => img.id !== image.id));
                showSuccess('Imagen eliminada permanentemente');
            } else {
                // Reset to default (soft delete sort of)
                const defaultUrl = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073';
                await supabase.from('site_images').update({ url: defaultUrl, storage_path: null }).eq('id', image.id);
                setImages(prev => prev.map(img => img.id === image.id ? { ...img, url: defaultUrl, storage_path: null } : img));
                showSuccess('Imagen restablecida a defecto');
            }
        } catch (err: any) {
            showError('Error al eliminar/restablecer: ' + err.message);
        }
    };

    const filteredImages = activeSection === 'all' ? images : images.filter(img => img.section === activeSection);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Gestión de Imágenes</h1>
                    <p className="text-gray-400 text-sm">Administra la galería y assets del sitio</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleInitDefaults}
                        className="bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors border border-white/10 text-sm"
                        title="Restaurar imágenes del sistema (Home)"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span className="hidden sm:inline">Restaurar Defaults</span>
                    </button>
                    <button
                        onClick={() => { resetModal(); setShowModal(true); }}
                        className="bg-[#3be3d2] hover:bg-[#2dd1c0] text-[#11211f] px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-[#3be3d2]/20"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Imagen
                    </button>
                </div>
            </div>

            {/* Notifications */}
            {success && (
                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 mb-4 text-sm animate-fade-in">
                    <Check className="w-5 h-5 flex-shrink-0" /> {success}
                </div>
            )}
            {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-4 text-sm animate-fade-in">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-2 flex-wrap mb-6">
                <button
                    onClick={() => setActiveSection('all')}
                    className={classNames(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                        activeSection === 'all' ? 'bg-[#3be3d2] text-[#11211f]' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    )}
                >
                    Todas
                </button>
                {Object.entries(SECTIONS).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setActiveSection(key)}
                        className={classNames(
                            "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                            activeSection === key ? 'bg-[#3be3d2] text-[#11211f]' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="p-12 text-center">
                    <div className="w-8 h-8 border-2 border-[#3be3d2]/30 border-t-[#3be3d2] rounded-full animate-spin mx-auto" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredImages.map((image) => (
                        <div key={image.id} className="bg-[#11211f] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-colors">
                            {/* Image Preview */}
                            <div className="relative h-48 bg-black/20 overflow-hidden">
                                <img
                                    src={image.url}
                                    alt={image.label}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Error'; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-3 left-3">
                                    <span className="bg-[#3be3d2]/20 border border-[#3be3d2]/30 text-[#3be3d2] text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                        {SECTIONS[image.section] || image.section}
                                    </span>
                                </div>
                            </div>

                            {/* Actions & Info */}
                            <div className="p-4">
                                <h3 className="text-white font-medium text-sm mb-1 truncate" title={image.label}>{image.label}</h3>
                                <p className="text-gray-500 text-xs font-mono truncate mb-4" title={image.key}>{image.key}</p>

                                {editingUrl === image.id ? (
                                    <div className="mb-3 animate-fade-in">
                                        <input
                                            type="url"
                                            value={urlInputs[image.id] || image.url}
                                            onChange={e => setUrlInputs(prev => ({ ...prev, [image.id]: e.target.value }))}
                                            placeholder="https://..."
                                            className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3be3d2]/50 mb-2"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUrlUpdate(image.id)}
                                                className="flex-1 bg-[#3be3d2]/10 hover:bg-[#3be3d2]/20 border border-[#3be3d2]/30 text-[#3be3d2] text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1"
                                            >
                                                <Check className="w-3 h-3" /> Guardar
                                            </button>
                                            <button
                                                onClick={() => setEditingUrl(null)}
                                                className="px-3 bg-white/5 hover:bg-white/10 text-gray-400 text-xs py-2 rounded-lg transition-all"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="flex gap-2">
                                    {/* Upload Replacement */}
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) handleExistingImageUpload(image.id, image.key, file);
                                            }}
                                        />
                                        <div className={`flex items-center justify-center gap-1.5 bg-[#3be3d2]/10 hover:bg-[#3be3d2]/20 border border-[#3be3d2]/30 text-[#3be3d2] text-xs py-2.5 rounded-xl transition-all ${uploading === image.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {uploading === image.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                            Subir
                                        </div>
                                    </label>

                                    {/* URL Edit */}
                                    <button
                                        onClick={() => {
                                            setEditingUrl(editingUrl === image.id ? null : image.id);
                                            setUrlInputs(prev => ({ ...prev, [image.id]: image.url }));
                                        }}
                                        className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white text-xs py-2.5 px-3 rounded-xl transition-all"
                                        title="Cambiar URL externa"
                                    >
                                        <ImageIcon className="w-3 h-3" />
                                    </button>

                                    {/* Delete/Reset */}
                                    <button
                                        onClick={() => handleDeleteImage(image)}
                                        className="flex items-center justify-center gap-1.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2.5 px-3 rounded-xl transition-all"
                                        title={image.section === 'gallery' ? "Eliminar permanentemente" : "Restablecer a defecto"}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1a2c29] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#11211f]">
                            <h2 className="text-xl font-bold text-white">Agregar Nueva Imagen</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Section Select */}
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Sección</label>
                                <select
                                    value={newImageSection}
                                    onChange={(e) => setNewImageSection(e.target.value)}
                                    className="w-full bg-[#11211f] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3be3d2]"
                                >
                                    {Object.entries(SECTIONS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Label */}
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Etiqueta (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Vista de la piscina principal"
                                    value={newImageLabel}
                                    onChange={e => setNewImageLabel(e.target.value)}
                                    className="w-full bg-[#11211f] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3be3d2]"
                                />
                            </div>

                            <hr className="border-white/5" />

                            {/* File Upload */}
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Subir Imagen</label>
                                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg shadow-lg" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-500">
                                            <Upload className="w-8 h-8 opacity-50" />
                                            <span className="text-sm">Haz clic o arrastra una imagen aquí</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-center text-gray-500 text-xs">- O -</div>

                            {/* URL Input */}
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">URL Externa</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={newImageUrl}
                                    onChange={e => {
                                        setNewImageUrl(e.target.value);
                                        setNewImageFile(null); // Clear file if URL is typed
                                        setPreviewUrl(null);
                                    }}
                                    disabled={!!newImageFile}
                                    className="w-full bg-[#11211f] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3be3d2] disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-[#11211f] flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddNewImage}
                                disabled={uploading === 'new' || (!newImageFile && !newImageUrl)}
                                className="bg-[#3be3d2] hover:bg-[#2dd1c0] text-[#11211f] px-6 py-2 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {uploading === 'new' && <Loader2 className="w-4 h-4 animate-spin" />}
                                Guardar Imagen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImagesPage;
