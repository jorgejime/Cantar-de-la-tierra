import React, { useEffect, useState } from 'react';
import { supabase, SiteConfig } from '../../lib/supabase';
import { Settings, Save, Upload, Check, AlertCircle, Image, Link, Phone, MapPin, Mail, MessageSquare } from 'lucide-react';

const ALL_CONFIGS = [
    { key: 'whatsapp_number', label: 'Número de WhatsApp (ej: 573001234567)' },
    { key: 'phone_display', label: 'Teléfono Visible (ej: +57 300 123 4567)' },
    { key: 'email', label: 'Correo Electrónico' },
    { key: 'address', label: 'Dirección' },
    { key: 'city', label: 'Ciudad' },
    { key: 'instagram_url', label: 'Instagram URL' },
    { key: 'facebook_url', label: 'Facebook URL' },
    { key: 'google_maps_url', label: 'Google Maps URL' },
];

const CONFIG_ICONS: Record<string, React.ReactNode> = {
    whatsapp_number: <MessageSquare className="w-4 h-4" />,
    phone_display: <Phone className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    address: <MapPin className="w-4 h-4" />,
    city: <MapPin className="w-4 h-4" />,
    instagram_url: <Link className="w-4 h-4" />,
    facebook_url: <Link className="w-4 h-4" />,
    google_maps_url: <Link className="w-4 h-4" />,
    logo_url: <Image className="w-4 h-4" />,
};

const SettingsPage: React.FC = () => {
    const [configs, setConfigs] = useState<SiteConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [values, setValues] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => { fetchConfigs(); }, []);

    const fetchConfigs = async () => {
        setLoading(true);
        const { data } = await supabase.from('site_config').select('*');
        if (data) {
            setConfigs(data);
            const vals: Record<string, string> = {};
            data.forEach(c => { vals[c.key] = c.value || ''; });
            setValues(vals);
        }
        setLoading(false);
    };

    const showMsg = (type: 'success' | 'error', msg: string) => {
        if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
        else { setError(msg); setTimeout(() => setError(''), 4000); }
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            const updates = ALL_CONFIGS.map(config => ({
                key: config.key,
                value: values[config.key] || '',
                label: config.label,
                type: 'text',
                updated_at: new Date().toISOString()
            }));

            // We perform upsert to handle new keys that might not exist in DB yet
            const { error: upsertError } = await supabase.from('site_config').upsert(updates, { onConflict: 'key' });

            if (upsertError) throw upsertError;

            // Also check if logo_url needs saving specifically if it's not in ALL_CONFIGS but handled separately?
            // logo_url is usually updated immediately on upload, but if user edited the text input:
            if (values.logo_url) {
                await supabase.from('site_config').upsert({
                    key: 'logo_url',
                    value: values.logo_url,
                    label: 'Logo URL',
                    type: 'image',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' });
            }

            // Refresh configs to get new IDs etc if needed, though mostly we just need values
            await fetchConfigs();
            showMsg('success', 'Configuración guardada correctamente');
        } catch (err: any) {
            console.error(err);
            showMsg('error', 'Error al guardar: ' + err.message);
        }
        setSaving(false);
    };

    const handleLogoUpload = async (file: File) => {
        setUploadingLogo(true);
        try {
            const ext = file.name.split('.').pop();
            const path = `logo/logo-${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage.from('site-images').upload(path, file, { upsert: true });
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('site-images').getPublicUrl(path);

            // Update explicitly/immediately
            await supabase.from('site_config').upsert({
                key: 'logo_url',
                value: publicUrl,
                label: 'Logo URL',
                type: 'image',
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });

            setValues(prev => ({ ...prev, logo_url: publicUrl }));
            showMsg('success', 'Logo actualizado correctamente');
        } catch (err: any) {
            showMsg('error', 'Error al subir logo: ' + err.message);
        }
        setUploadingLogo(false);
    };

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Configuración</h1>
                    <p className="text-gray-400 text-sm">Ajustes generales del sitio web</p>
                </div>
                <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="flex items-center gap-2 bg-[#3be3d2] hover:bg-[#2ccbb6] disabled:opacity-50 text-[#11211f] font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#3be3d2]/20"
                >
                    {saving ? <div className="w-4 h-4 border-2 border-[#11211f]/30 border-t-[#11211f] rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Cambios
                </button>
            </div>

            {success && <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-3 mb-4 text-sm animate-fade-in"><Check className="w-4 h-4" />{success}</div>}
            {error && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-4 text-sm animate-fade-in"><AlertCircle className="w-4 h-4" />{error}</div>}

            {loading ? (
                <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-[#3be3d2]/30 border-t-[#3be3d2] rounded-full animate-spin mx-auto" /></div>
            ) : (
                <div className="space-y-4">
                    {/* Logo Section */}
                    <div className="bg-[#11211f] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Image className="w-5 h-5 text-[#3be3d2]" /> Logo del Sitio
                        </h2>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {values.logo_url && (
                                <div className="w-20 h-20 bg-white/5 rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                                    <img src={values.logo_url} alt="Logo" className="w-full h-full object-contain p-2" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                </div>
                            )}
                            <div className="flex-1 space-y-2">
                                <input
                                    type="url"
                                    value={values.logo_url || ''}
                                    onChange={e => setValues(prev => ({ ...prev, logo_url: e.target.value }))}
                                    placeholder="https://... o sube un archivo"
                                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3be3d2]/30 placeholder-gray-600"
                                />
                                <label className="cursor-pointer inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm px-4 py-2.5 rounded-xl transition-all">
                                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
                                    {uploadingLogo ? <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                                    Subir Logo
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Other Settings */}
                    <div className="bg-[#11221f] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-[#3be3d2]" /> Información General
                        </h2>
                        <div className="space-y-4">
                            {ALL_CONFIGS.map(config => (
                                <div key={config.key}>
                                    <label className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
                                        {CONFIG_ICONS[config.key] || <Settings className="w-4 h-4" />}
                                        {config.label}
                                    </label>
                                    <input
                                        type="text"
                                        value={values[config.key] || ''}
                                        onChange={e => setValues(prev => ({ ...prev, [config.key]: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3be3d2]/30 placeholder-gray-600"
                                        placeholder={config.key === 'whatsapp_number' ? '573105026547' : 'https://...'}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
