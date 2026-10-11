import React, { useEffect, useState } from 'react';
import { supabase, Service } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Check, X, ToggleLeft, ToggleRight, Wrench, AlertCircle } from 'lucide-react';

const CATEGORIES = { main: 'Servicio Principal', addon: 'Adicional', package: 'Paquete' };

const emptyService: Omit<Service, 'id' | 'created_at' | 'updated_at'> = {
    name_es: '', name_en: '', description_es: '', description_en: '',
    price_adult: 0, price_child: 0, category: 'main', is_active: true, sort_order: 0
};

const ServicesPage: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(emptyService);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        setLoading(true);
        const { data } = await supabase.from('services').select('*').order('sort_order');
        setServices(data || []);
        setLoading(false);
    };

    const showMsg = (type: 'success' | 'error', msg: string) => {
        if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
        else { setError(msg); setTimeout(() => setError(''), 4000); }
    };

    const handleSave = async () => {
        if (!formData.name_es || !formData.name_en) {
            showMsg('error', 'El nombre en español e inglés son obligatorios');
            return;
        }
        setSaving(true);
        if (editingId) {
            const { error } = await supabase.from('services').update(formData).eq('id', editingId);
            if (error) showMsg('error', 'Error al actualizar');
            else { showMsg('success', 'Servicio actualizado'); fetchServices(); setEditingId(null); setShowForm(false); }
        } else {
            const { error } = await supabase.from('services').insert(formData);
            if (error) showMsg('error', 'Error al crear servicio');
            else { showMsg('success', 'Servicio creado'); fetchServices(); setShowForm(false); setFormData(emptyService); }
        }
        setSaving(false);
    };

    const handleEdit = (service: Service) => {
        setFormData({
            name_es: service.name_es, name_en: service.name_en,
            description_es: service.description_es || '', description_en: service.description_en || '',
            price_adult: service.price_adult, price_child: service.price_child,
            category: service.category, is_active: service.is_active, sort_order: service.sort_order
        });
        setEditingId(service.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este servicio?')) return;
        await supabase.from('services').delete().eq('id', id);
        setServices(prev => prev.filter(s => s.id !== id));
        showMsg('success', 'Servicio eliminado');
    };

    const toggleActive = async (service: Service) => {
        await supabase.from('services').update({ is_active: !service.is_active }).eq('id', service.id);
        setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: !s.is_active } : s));
    };

    const InputField = ({ label, value, onChange, type = 'text', placeholder = '' }: any) => (
        <div>
            <label className="block text-xs text-gray-400 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3be3d2]/30 placeholder-gray-600"
            />
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Servicios</h1>
                    <p className="text-gray-400 text-sm">Gestiona los servicios y paquetes disponibles</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyService); }}
                    className="flex items-center gap-2 bg-[#3be3d2] hover:bg-[#2ccbb6] text-[#11211f] font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#3be3d2]/20"
                >
                    <Plus className="w-4 h-4" /> Nuevo Servicio
                </button>
            </div>

            {success && <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-3 mb-4 text-sm"><Check className="w-4 h-4" />{success}</div>}
            {error && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-4 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#11211f] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#11211f]">
                            <h3 className="text-white font-bold">{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Nombre (Español) *" value={formData.name_es} onChange={(v: string) => setFormData(p => ({ ...p, name_es: v }))} placeholder="Circuito Termal" />
                                <InputField label="Nombre (Inglés) *" value={formData.name_en} onChange={(v: string) => setFormData(p => ({ ...p, name_en: v }))} placeholder="Thermal Circuit" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Descripción (Español)</label>
                                    <textarea value={formData.description_es} onChange={e => setFormData(p => ({ ...p, description_es: e.target.value }))} rows={3} className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3be3d2]/30 resize-none" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Descripción (Inglés)</label>
                                    <textarea value={formData.description_en} onChange={e => setFormData(p => ({ ...p, description_en: e.target.value }))} rows={3} className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3be3d2]/30 resize-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <InputField label="Precio Adulto (COP)" value={formData.price_adult} onChange={(v: number) => setFormData(p => ({ ...p, price_adult: v }))} type="number" />
                                <InputField label="Precio Niño (COP)" value={formData.price_child} onChange={(v: number) => setFormData(p => ({ ...p, price_child: v }))} type="number" />
                                <InputField label="Orden" value={formData.sort_order} onChange={(v: number) => setFormData(p => ({ ...p, sort_order: v }))} type="number" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Categoría</label>
                                    <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value as any }))} className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3be3d2]/30">
                                        {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k} className="bg-[#11211f]">{v}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <button type="button" onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}>
                                            {formData.is_active
                                                ? <ToggleRight className="w-8 h-8 text-[#3be3d2]" />
                                                : <ToggleLeft className="w-8 h-8 text-gray-500" />}
                                        </button>
                                        <span className="text-sm text-gray-300">Activo</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 flex gap-3">
                            <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#3be3d2] hover:bg-[#2ccbb6] disabled:opacity-50 text-[#11211f] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                                {saving ? <div className="w-4 h-4 border-2 border-[#11211f]/30 border-t-[#11211f] rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                                {editingId ? 'Actualizar' : 'Crear Servicio'}
                            </button>
                            <button onClick={() => setShowForm(false)} className="px-6 bg-white/5 hover:bg-white/10 text-gray-300 font-medium py-3 rounded-xl transition-all">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Services List */}
            {loading ? (
                <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-[#3be3d2]/30 border-t-[#3be3d2] rounded-full animate-spin mx-auto" /></div>
            ) : (
                <div className="space-y-3">
                    {services.map(service => (
                        <div key={service.id} className={`bg-[#11211f] border rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all ${service.is_active ? 'border-white/5' : 'border-white/5 opacity-60'}`}>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="text-white font-semibold">{service.name_es}</h3>
                                    <span className="text-gray-500 text-sm">/ {service.name_en}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${service.category === 'main' ? 'bg-[#3be3d2]/10 text-[#3be3d2]' :
                                            service.category === 'package' ? 'bg-purple-500/10 text-purple-400' :
                                                'bg-orange-500/10 text-orange-400'
                                        }`}>{CATEGORIES[service.category]}</span>
                                    {!service.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500">Inactivo</span>}
                                </div>
                                {service.description_es && <p className="text-gray-500 text-sm truncate">{service.description_es}</p>}
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="text-right">
                                    <p className="text-[#3be3d2] font-bold">${Number(service.price_adult).toLocaleString()}</p>
                                    {service.price_child > 0 && <p className="text-gray-500 text-xs">${Number(service.price_child).toLocaleString()} niño</p>}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => toggleActive(service)} className="p-2 text-gray-400 hover:text-[#3be3d2] hover:bg-[#3be3d2]/10 rounded-lg transition-all" title={service.is_active ? 'Desactivar' : 'Activar'}>
                                        {service.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                    </button>
                                    <button onClick={() => handleEdit(service)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(service.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ServicesPage;
