import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const SettingsManager = () => {
    const [config, setConfig] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saved, setSaved] = useState(false);

    const fetchConfig = async () => {
        const { data } = await supabase.from('site_config').select('*');
        if (data) {
            const configObj = data.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
            setConfig(configObj);
        }
        setLoading(false);
    };

    useEffect(() => { fetchConfig(); }, []);

    const handleUploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = event.target.files?.[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `logo.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file, { upsert: true });
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('images').getPublicUrl(fileName);
            await supabase.from('site_config').upsert({ key: 'logo_url', value: data.publicUrl });
            setConfig({ ...config, logo_url: data.publicUrl });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error(error);
            alert('Error al actualizar logo');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateTitle = async (title: string) => {
        await supabase.from('site_config').upsert({ key: 'site_title', value: title });
        setConfig({ ...config, site_title: title });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Configuración del Sitio</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Configura el logotipo y nombre que aparecen en la barra de navegación.</p>
                </div>
                {saved && (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <span className="material-icons-outlined text-sm">check_circle</span>
                        Guardado
                    </span>
                )}
            </div>

            {/* Navbar preview */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-zinc-750 px-5 py-3 border-b border-gray-200 dark:border-zinc-700 flex items-center gap-2">
                    <span className="material-icons-outlined text-gray-400 text-sm">visibility</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Vista previa — Barra de Navegación</span>
                </div>
                <div className="p-4">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg px-6 py-3 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            {config.logo_url ? (
                                <img src={config.logo_url} alt="Logo" className="h-8 w-auto object-contain" />
                            ) : (
                                <div className="w-8 h-8 bg-gray-200 dark:bg-zinc-700 rounded flex items-center justify-center">
                                    <span className="material-icons-outlined text-gray-400 text-sm">image</span>
                                </div>
                            )}
                            <span className="font-display font-bold text-sm text-gray-800 dark:text-white">
                                {config.site_title || 'Cantar de la Tierra'}
                            </span>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-400">
                            <span>Inicio</span>
                            <span>Servicios</span>
                            <span>Galería</span>
                            <span>Contacto</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings form */}
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-zinc-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Logo */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="material-icons-outlined text-primary text-lg">image</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Logotipo</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-600 flex items-center justify-center bg-gray-50 dark:bg-zinc-700 overflow-hidden">
                                {config.logo_url ? (
                                    <img src={config.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <span className="material-icons-outlined text-gray-300 text-3xl">add_photo_alternate</span>
                                )}
                            </div>
                            <div>
                                <label className="cursor-pointer inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition shadow-sm">
                                    <span className="material-icons-outlined text-lg">upload</span>
                                    {uploading ? 'Subiendo...' : 'Cambiar Logo'}
                                    <input type="file" onChange={handleUploadLogo} disabled={uploading} className="hidden" accept="image/*" />
                                </label>
                                <p className="text-xs text-gray-400 mt-2">PNG o SVG recomendado. Max 500x500.</p>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="material-icons-outlined text-primary text-lg">title</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Nombre del Sitio</h3>
                        </div>
                        <input
                            type="text"
                            value={config.site_title || ''}
                            onChange={(e) => setConfig({ ...config, site_title: e.target.value })}
                            onBlur={(e) => handleUpdateTitle(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 p-3 dark:bg-zinc-700 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-lg"
                            placeholder="Cantar de la Tierra"
                        />
                        <p className="text-xs text-gray-400">Este nombre aparece en la barra de navegación junto al logo.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsManager;
