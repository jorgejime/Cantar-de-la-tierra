import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface SectionImage {
    id: string;
    section_key: string;
    image_url: string;
    video_url: string;
    label: string;
    description: string;
    updated_at: string;
}

const SECTION_ORDER = ['hero_bg', 'experience_main', 'treatments_main', 'video_bg', 'footer_map'];

const SECTION_ICONS: Record<string, string> = {
    hero_bg: 'home',
    experience_main: 'spa',
    treatments_main: 'face',
    video_bg: 'play_circle',
    footer_map: 'map',
};

const SectionImagesManager = () => {
    const [sections, setSections] = useState<SectionImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingKey, setUploadingKey] = useState<string | null>(null);
    const [successKey, setSuccessKey] = useState<string | null>(null);
    // Video management
    const [videoInput, setVideoInput] = useState('');
    const [videoMode, setVideoMode] = useState<'link' | 'upload'>('link');
    const [videoUploading, setVideoUploading] = useState(false);

    const fetchSections = async () => {
        const { data } = await supabase
            .from('section_images')
            .select('*')
            .order('section_key');
        if (data) {
            const sorted = SECTION_ORDER.map(key => data.find(s => s.section_key === key)).filter(Boolean) as SectionImage[];
            setSections(sorted);
            // Initialize video input with current value
            const videoSection = sorted.find(s => s.section_key === 'video_bg');
            if (videoSection?.video_url) {
                setVideoInput(videoSection.video_url);
                // Detect mode
                if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(videoSection.video_url)) {
                    setVideoMode('upload');
                } else {
                    setVideoMode('link');
                }
            }
        }
        setLoading(false);
    };

    useEffect(() => { fetchSections(); }, []);

    const handleImageChange = async (sectionKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploadingKey(sectionKey);
            setSuccessKey(null);
            const file = event.target.files?.[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `sections/${sectionKey}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('images').getPublicUrl(fileName);

            await supabase
                .from('section_images')
                .update({ image_url: data.publicUrl, updated_at: new Date().toISOString() })
                .eq('section_key', sectionKey);

            setSuccessKey(sectionKey);
            setTimeout(() => setSuccessKey(null), 3000);
            fetchSections();
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Error al subir la imagen');
        } finally {
            setUploadingKey(null);
        }
    };

    /* ── Video URL save (link mode) ── */
    const handleSaveVideoUrl = async () => {
        try {
            setVideoUploading(true);
            await supabase
                .from('section_images')
                .update({ video_url: videoInput.trim(), updated_at: new Date().toISOString() })
                .eq('section_key', 'video_bg');
            setSuccessKey('video_url');
            setTimeout(() => setSuccessKey(null), 3000);
            fetchSections();
        } catch {
            alert('Error al guardar el enlace del video');
        } finally {
            setVideoUploading(false);
        }
    };

    /* ── Video file upload ── */
    const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setVideoUploading(true);
            const file = event.target.files?.[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('video/')) {
                alert('Por favor selecciona un archivo de video (MP4, WebM, etc.)');
                return;
            }

            // Validate file size (max 100MB)
            if (file.size > 100 * 1024 * 1024) {
                alert('El video debe pesar menos de 100MB. Para videos más grandes, usa un enlace de YouTube.');
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `videos/video_banner_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('images').getPublicUrl(fileName);

            await supabase
                .from('section_images')
                .update({ video_url: data.publicUrl, updated_at: new Date().toISOString() })
                .eq('section_key', 'video_bg');

            setVideoInput(data.publicUrl);
            setSuccessKey('video_url');
            setTimeout(() => setSuccessKey(null), 3000);
            fetchSections();
        } catch (error) {
            console.error('Error uploading video:', error);
            alert('Error al subir el video. Intenta con un archivo más pequeño o usa un enlace de YouTube.');
        } finally {
            setVideoUploading(false);
        }
    };

    /* ── Delete video ── */
    const handleDeleteVideo = async () => {
        if (!window.confirm('¿Seguro que quieres eliminar el video? El botón de play se deshabilitará en la página.')) return;
        try {
            setVideoUploading(true);
            await supabase
                .from('section_images')
                .update({ video_url: '', updated_at: new Date().toISOString() })
                .eq('section_key', 'video_bg');
            setVideoInput('');
            setSuccessKey('video_delete');
            setTimeout(() => setSuccessKey(null), 3000);
            fetchSections();
        } catch {
            alert('Error al eliminar el video');
        } finally {
            setVideoUploading(false);
        }
    };

    /* ── Detect YouTube ── */
    const getYouTubeId = (url: string): string | null => {
        const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-gray-500">Cargando secciones...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold dark:text-white">Imágenes del Sitio</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Administra las imágenes de cada sección de la página web. Cada tarjeta muestra la ubicación exacta donde aparece la imagen.</p>
            </div>

            <div className="space-y-6">
                {sections.map((section, index) => (
                    <div key={section.id} className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-zinc-700 transition-all hover:shadow-lg">
                        <div className="flex flex-col md:flex-row">
                            {/* Thumbnail */}
                            <div className="md:w-80 flex-shrink-0 relative group">
                                <img
                                    src={section.image_url}
                                    alt={section.label}
                                    className="w-full h-52 md:h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                    <label className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-100">
                                        <span className="material-icons-outlined text-lg">photo_camera</span>
                                        Cambiar Imagen
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageChange(section.section_key, e)}
                                            disabled={uploadingKey === section.section_key}
                                        />
                                    </label>
                                </div>
                                {uploadingKey === section.section_key && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="bg-white rounded-lg px-4 py-3 flex items-center gap-3">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                            <span className="text-sm font-medium">Subiendo...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <span className="material-icons-outlined text-primary">{SECTION_ICONS[section.section_key] || 'image'}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{section.label}</h3>
                                            <span className="text-xs text-gray-400 uppercase tracking-wider">Sección {index + 1} de {sections.length}</span>
                                        </div>
                                    </div>
                                    {successKey === section.section_key && (
                                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                                            <span className="material-icons-outlined text-sm">check_circle</span>
                                            Guardado
                                        </span>
                                    )}
                                </div>

                                <p className="text-gray-600 dark:text-gray-300 mt-3 text-sm leading-relaxed">
                                    {section.description}
                                </p>

                                <div className="mt-4 flex items-center gap-4">
                                    <label className="cursor-pointer inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition shadow-sm">
                                        <span className="material-icons-outlined text-lg">upload</span>
                                        {uploadingKey === section.section_key ? 'Subiendo...' : 'Subir Nueva Imagen'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageChange(section.section_key, e)}
                                            disabled={uploadingKey === section.section_key}
                                        />
                                    </label>
                                    <span className="text-xs text-gray-400">
                                        Actualizado: {new Date(section.updated_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                {/* ═══ VIDEO MANAGEMENT (only for video_bg) ═══ */}
                                {section.section_key === 'video_bg' && (
                                    <div className="mt-6 pt-5 border-t border-gray-200 dark:border-zinc-700">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="material-icons-outlined text-accent text-lg">videocam</span>
                                            <h4 className="font-bold text-gray-800 dark:text-white text-sm">Video del Banner</h4>
                                            {successKey === 'video_url' && (
                                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-auto">
                                                    <span className="material-icons-outlined text-xs">check_circle</span>
                                                    Guardado
                                                </span>
                                            )}
                                            {successKey === 'video_delete' && (
                                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-auto">
                                                    <span className="material-icons-outlined text-xs">delete</span>
                                                    Eliminado
                                                </span>
                                            )}
                                        </div>

                                        {/* Mode toggle */}
                                        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-zinc-700 rounded-lg mb-4 w-fit">
                                            <button
                                                onClick={() => setVideoMode('link')}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${videoMode === 'link' ? 'bg-white dark:bg-zinc-600 shadow text-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <span className="material-icons-outlined text-sm">link</span>
                                                Enlace de YouTube
                                            </button>
                                            <button
                                                onClick={() => setVideoMode('upload')}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${videoMode === 'upload' ? 'bg-white dark:bg-zinc-600 shadow text-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <span className="material-icons-outlined text-sm">cloud_upload</span>
                                                Subir Video
                                            </button>
                                        </div>

                                        {/* Link mode */}
                                        {videoMode === 'link' && (
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="url"
                                                        placeholder="https://www.youtube.com/watch?v=..."
                                                        value={videoInput}
                                                        onChange={e => setVideoInput(e.target.value)}
                                                        className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                                                    />
                                                    <button
                                                        onClick={handleSaveVideoUrl}
                                                        disabled={videoUploading || !videoInput.trim()}
                                                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-40 flex items-center gap-1"
                                                    >
                                                        <span className="material-icons-outlined text-sm">save</span>
                                                        {videoUploading ? 'Guardando...' : 'Guardar'}
                                                    </button>
                                                </div>

                                                {/* YouTube Preview */}
                                                {videoInput && getYouTubeId(videoInput) && (
                                                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-600 bg-black">
                                                        <div className="relative aspect-video max-w-sm">
                                                            <img
                                                                src={`https://img.youtube.com/vi/${getYouTubeId(videoInput)}/mqdefault.jpg`}
                                                                alt="Vista previa YouTube"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                                                                    <span className="material-icons-outlined text-white text-xl ml-0.5">play_arrow</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="px-3 py-2 bg-gray-50 dark:bg-zinc-700 flex items-center justify-between">
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                                <span className="material-icons-outlined text-xs text-red-500">smart_display</span>
                                                                YouTube · ID: {getYouTubeId(videoInput)}
                                                            </span>
                                                            <a href={videoInput} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                                                                Abrir <span className="material-icons-outlined text-xs">open_in_new</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}

                                                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                                    <span className="material-icons-outlined text-xs">info</span>
                                                    Formatos soportados: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...
                                                </p>
                                            </div>
                                        )}

                                        {/* Upload mode */}
                                        {videoMode === 'upload' && (
                                            <div className="space-y-3">
                                                <label className={`flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed transition cursor-pointer
                                                    ${videoUploading ? 'border-primary/30 bg-primary/5' : 'border-gray-300 dark:border-zinc-600 hover:border-primary hover:bg-primary/5'}`}>
                                                    {videoUploading ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                            <span className="text-sm text-gray-500">Subiendo video...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-icons-outlined text-3xl text-gray-400">cloud_upload</span>
                                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Seleccionar archivo de video</span>
                                                            <span className="text-[11px] text-gray-400">MP4, WebM, OGG · Máximo 100MB</span>
                                                        </>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="video/mp4,video/webm,video/ogg"
                                                        className="hidden"
                                                        onChange={handleVideoUpload}
                                                        disabled={videoUploading}
                                                    />
                                                </label>

                                                {/* Current uploaded video preview */}
                                                {videoInput && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(videoInput) && (
                                                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-600 bg-black">
                                                        <video src={videoInput} className="w-full max-w-sm aspect-video object-cover" muted />
                                                        <div className="px-3 py-2 bg-gray-50 dark:bg-zinc-700 flex items-center justify-between">
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                                <span className="material-icons-outlined text-xs text-primary">movie</span>
                                                                Video subido
                                                            </span>
                                                            <a href={videoInput} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                                                                Abrir <span className="material-icons-outlined text-xs">open_in_new</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}

                                                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                                    <span className="material-icons-outlined text-xs">info</span>
                                                    Para videos grandes, recomendamos subirlos a YouTube y usar el enlace.
                                                </p>
                                            </div>
                                        )}

                                        {/* Delete video button */}
                                        {section.video_url && (
                                            <button
                                                onClick={handleDeleteVideo}
                                                className="mt-3 flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition"
                                            >
                                                <span className="material-icons-outlined text-sm">delete_outline</span>
                                                Eliminar video actual
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SectionImagesManager;
