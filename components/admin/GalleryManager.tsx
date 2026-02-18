import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface GalleryImage {
    id: string;
    url: string;
    category: string;
    description: string;
    created_at: string;
}

const GalleryManager = () => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [uploading, setUploading] = useState(false);
    const [category, setCategory] = useState('general');
    const [dragOver, setDragOver] = useState(false);

    const fetchImages = async () => {
        const { data } = await supabase.from('gallery_images').select('*').order('created_at', { ascending: false });
        if (data) setImages(data as GalleryImage[]);
    };

    useEffect(() => { fetchImages(); }, []);

    const uploadFile = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `gallery/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('images').getPublicUrl(fileName);

        await supabase.from('gallery_images').insert([{
            url: data.publicUrl,
            category: category,
            description: file.name.replace(/\.[^/.]+$/, '')
        }]);
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const files = event.target.files;
            if (!files || files.length === 0) return;

            for (let i = 0; i < files.length; i++) {
                await uploadFile(files[i]);
            }
            fetchImages();
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Error al subir imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        try {
            setUploading(true);
            const files = e.dataTransfer.files;
            for (let i = 0; i < files.length; i++) {
                if (files[i].type.startsWith('image/')) {
                    await uploadFile(files[i]);
                }
            }
            fetchImages();
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Error al subir imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta imagen de la galería?')) return;
        await supabase.from('gallery_images').delete().eq('id', id);
        fetchImages();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold dark:text-white">Galería de Imágenes</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Estas imágenes aparecen en la sección "Fauna del Santuario" de la web. Se muestran en una cuadrícula de 4 columnas.</p>
            </div>

            {/* Preview de la galería en la web */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-zinc-750 px-5 py-3 border-b border-gray-200 dark:border-zinc-700 flex items-center gap-2">
                    <span className="material-icons-outlined text-gray-400 text-sm">visibility</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Vista previa — Galería en la web</span>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5">
                        {images.slice(0, 8).map((img, i) => (
                            <div key={img.id} className="aspect-square rounded overflow-hidden relative">
                                <img src={img.url} alt={img.description} className="w-full h-full object-cover" />
                                <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-tl">{i + 1}</span>
                            </div>
                        ))}
                        {images.length < 8 && Array.from({ length: 8 - images.length }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square rounded bg-gray-100 dark:bg-zinc-700 flex items-center justify-center">
                                <span className="material-icons-outlined text-gray-300 dark:text-zinc-500 text-lg">add_photo_alternate</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-2">{images.length} imagen{images.length !== 1 ? 'es' : ''} en la galería</p>
                </div>
            </div>

            {/* Upload zone */}
            <div
                className={`bg-white dark:bg-zinc-800 rounded-xl shadow-md border-2 border-dashed transition-all ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-zinc-600'}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                <div className="p-8 text-center">
                    <span className="material-icons-outlined text-4xl text-gray-300 dark:text-zinc-500 mb-3 block">cloud_upload</span>
                    <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">
                        {uploading ? 'Subiendo imágenes...' : 'Arrastra imágenes aquí o haz clic para seleccionar'}
                    </p>
                    <p className="text-gray-400 text-xs mb-4">Puedes subir múltiples imágenes a la vez</p>
                    <div className="flex items-center justify-center gap-4">
                        <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Categoría:</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="ml-2 text-sm border border-gray-300 dark:border-zinc-600 rounded-lg p-1.5 dark:bg-zinc-700 dark:text-white"
                            >
                                <option value="general">General</option>
                                <option value="interior">Interiores</option>
                                <option value="exterior">Exteriores</option>
                                <option value="activities">Actividades</option>
                                <option value="fauna">Fauna</option>
                            </select>
                        </div>
                        <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition shadow-sm flex items-center gap-2">
                            <span className="material-icons-outlined text-lg">add_photo_alternate</span>
                            Seleccionar Imágenes
                            <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} className="hidden" />
                        </label>
                    </div>
                    {uploading && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                            <span className="text-sm text-primary font-medium">Subiendo...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Image grid with management */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img, index) => (
                    <div key={img.id} className="relative group bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
                        <div className="aspect-square">
                            <img src={img.url} alt={img.description} className="w-full h-full object-cover" />
                        </div>
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                            <button
                                onClick={() => handleDelete(img.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700"
                            >
                                <span className="material-icons-outlined">delete</span>
                            </button>
                        </div>
                        {/* Info bar */}
                        <div className="p-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="inline-block bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">{img.category}</span>
                                <span className="text-xs text-gray-400 truncate">{img.description}</span>
                            </div>
                            <span className="text-[10px] text-gray-300 flex-shrink-0">#{index + 1}</span>
                        </div>
                    </div>
                ))}
            </div>

            {images.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700">
                    <span className="material-icons-outlined text-5xl text-gray-300 dark:text-zinc-600 mb-3 block">collections</span>
                    <p className="text-gray-500 dark:text-gray-400">No hay imágenes en la galería.</p>
                    <p className="text-gray-400 text-sm">Sube imágenes usando el área de arriba.</p>
                </div>
            )}
        </div>
    );
};

export default GalleryManager;
