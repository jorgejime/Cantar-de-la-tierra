import React, { useEffect, useState } from 'react';
import { supabase, Service } from '../../lib/supabase';
import { Tag, Save, AlertCircle, Check, RefreshCw } from 'lucide-react';

const PricesPage: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [edits, setEdits] = useState<Record<string, { price_adult: number; price_child: number }>>({});
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        setLoading(true);
        const { data } = await supabase.from('services').select('*').order('sort_order');
        if (data) {
            setServices(data);
            const initialEdits: Record<string, { price_adult: number; price_child: number }> = {};
            data.forEach(s => { initialEdits[s.id] = { price_adult: s.price_adult, price_child: s.price_child }; });
            setEdits(initialEdits);
        }
        setLoading(false);
    };

    const handleSave = async (serviceId: string) => {
        setSaving(serviceId);
        const edit = edits[serviceId];
        const { error } = await supabase.from('services').update({
            price_adult: edit.price_adult,
            price_child: edit.price_child
        }).eq('id', serviceId);

        if (error) {
            setError('Error al guardar precio');
            setTimeout(() => setError(''), 3000);
        } else {
            setServices(prev => prev.map(s => s.id === serviceId ? { ...s, ...edit } : s));
            setSuccess('Precio actualizado correctamente');
            setTimeout(() => setSuccess(''), 3000);
        }
        setSaving(null);
    };

    const handleSaveAll = async () => {
        setSaving('all');
        const updates = Object.entries(edits).map(([id, prices]) =>
            supabase.from('services').update(prices).eq('id', id)
        );
        await Promise.all(updates);
        setSuccess('Todos los precios actualizados');
        setTimeout(() => setSuccess(''), 3000);
        fetchServices();
        setSaving(null);
    };

    const CATEGORY_LABELS: Record<string, string> = {
        main: 'Servicios Principales',
        package: 'Paquetes',
        addon: 'Servicios Adicionales'
    };

    const grouped = services.reduce((acc, s) => {
        if (!acc[s.category]) acc[s.category] = [];
        acc[s.category].push(s);
        return acc;
    }, {} as Record<string, Service[]>);

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Gestión de Precios</h1>
                    <p className="text-gray-400 text-sm">Actualiza los precios de todos los servicios</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchServices} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleSaveAll}
                        disabled={saving === 'all'}
                        className="flex items-center gap-2 bg-[#3be3d2] hover:bg-[#2ccbb6] disabled:opacity-50 text-[#11211f] font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#3be3d2]/20"
                    >
                        {saving === 'all' ? <div className="w-4 h-4 border-2 border-[#11211f]/30 border-t-[#11211f] rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar Todo
                    </button>
                </div>
            </div>

            {success && <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-3 mb-4 text-sm"><Check className="w-4 h-4" />{success}</div>}
            {error && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-4 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}

            {loading ? (
                <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-[#3be3d2]/30 border-t-[#3be3d2] rounded-full animate-spin mx-auto" /></div>
            ) : (
                <div className="space-y-8">
                    {['main', 'package', 'addon'].map(category => {
                        const categoryServices = grouped[category] || [];
                        if (categoryServices.length === 0) return null;
                        return (
                            <div key={category}>
                                <h2 className="text-[#3be3d2] text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    {CATEGORY_LABELS[category]}
                                </h2>
                                <div className="space-y-3">
                                    {categoryServices.map(service => {
                                        const edit = edits[service.id] || { price_adult: service.price_adult, price_child: service.price_child };
                                        const hasChanged = edit.price_adult !== service.price_adult || edit.price_child !== service.price_child;
                                        return (
                                            <div key={service.id} className="bg-[#11211f] border border-white/5 rounded-2xl p-4 md:p-5">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-white font-medium">{service.name_es}</h3>
                                                        <p className="text-gray-500 text-sm">{service.name_en}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        {/* Adult Price */}
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Adulto (COP)</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                                                <input
                                                                    type="number"
                                                                    value={edit.price_adult}
                                                                    onChange={e => setEdits(prev => ({
                                                                        ...prev,
                                                                        [service.id]: { ...prev[service.id], price_adult: Number(e.target.value) }
                                                                    }))}
                                                                    className="w-32 bg-white/5 border border-white/10 text-white text-sm rounded-xl pl-7 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3be3d2]/30"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Child Price */}
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Niño (COP)</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                                                <input
                                                                    type="number"
                                                                    value={edit.price_child}
                                                                    onChange={e => setEdits(prev => ({
                                                                        ...prev,
                                                                        [service.id]: { ...prev[service.id], price_child: Number(e.target.value) }
                                                                    }))}
                                                                    className="w-32 bg-white/5 border border-white/10 text-white text-sm rounded-xl pl-7 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3be3d2]/30"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Save Button */}
                                                        <div className="flex items-end">
                                                            <button
                                                                onClick={() => handleSave(service.id)}
                                                                disabled={!hasChanged || saving === service.id}
                                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${hasChanged
                                                                        ? 'bg-[#3be3d2]/10 hover:bg-[#3be3d2]/20 border border-[#3be3d2]/30 text-[#3be3d2]'
                                                                        : 'bg-white/5 border border-white/5 text-gray-600 cursor-not-allowed'
                                                                    }`}
                                                            >
                                                                {saving === service.id
                                                                    ? <div className="w-4 h-4 border-2 border-[#3be3d2]/30 border-t-[#3be3d2] rounded-full animate-spin" />
                                                                    : <Save className="w-4 h-4" />}
                                                                Guardar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PricesPage;
