import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Service {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    created_at: string;
}

const CATEGORIES = [
    { value: 'general', label: 'Entrada General', icon: 'confirmation_number' },
    { value: 'treatment', label: 'Tratamiento', icon: 'spa' },
    { value: 'lodging', label: 'Hospedaje', icon: 'hotel' },
];

const formatCOP = (price: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'decimal' }).format(price) + ' COP';
};

const ServicesManager = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newService, setNewService] = useState({ title: '', description: '', price: 0, category: 'general', image_url: '' });
    const [uploading, setUploading] = useState(false);

    const fetchServices = async () => {
        const { data } = await supabase.from('services').select('*').order('created_at');
        if (data) setServices(data as Service[]);
        setLoading(false);
    };

    useEffect(() => { fetchServices(); }, []);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => {
        try {
            setUploading(true);
            const file = event.target.files?.[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `services/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('images').getPublicUrl(fileName);

            if (isNew) {
                setNewService(prev => ({ ...prev, image_url: data.publicUrl }));
            } else if (editingService) {
                setEditingService({ ...editingService, image_url: data.publicUrl });
            }
        } catch (error) {
            alert('Error al subir imagen');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (service: any, isNew: boolean) => {
        if (!service.title.trim()) { alert('El título es obligatorio'); return; }
        if (service.id) {
            await supabase.from('services').update(service).eq('id', service.id);
        } else {
            await supabase.from('services').insert([service]);
        }
        setEditingService(null);
        setShowNewForm(false);
        setNewService({ title: '', description: '', price: 0, category: 'general', image_url: '' });
        fetchServices();
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar este servicio? Esta acción no se puede deshacer.')) {
            await supabase.from('services').delete().eq('id', id);
            fetchServices();
        }
    };

    const getCategoryInfo = (cat: string) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[0];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-gray-500">Cargando servicios...</span>
            </div>
        );
    }

    const renderForm = (service: any, isNew: boolean) => (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-zinc-700 mb-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-icons-outlined text-primary text-lg">{isNew ? 'add_circle' : 'edit'}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{isNew ? 'Nuevo Servicio' : 'Editar Servicio'}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                    <input
                        type="text" placeholder="Ej: Circuito Termal"
                        value={service.title}
                        onChange={(e) => isNew ? setNewService({ ...service, title: e.target.value }) : setEditingService({ ...service, title: e.target.value })}
                        className="border border-gray-300 dark:border-zinc-600 p-2.5 rounded-lg w-full dark:bg-zinc-700 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio (COP)</label>
                    <input
                        type="number" placeholder="75000"
                        value={service.price}
                        onChange={(e) => isNew ? setNewService({ ...service, price: parseFloat(e.target.value) || 0 }) : setEditingService({ ...service, price: parseFloat(e.target.value) || 0 })}
                        className="border border-gray-300 dark:border-zinc-600 p-2.5 rounded-lg w-full dark:bg-zinc-700 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                    <select
                        value={service.category}
                        onChange={(e) => isNew ? setNewService({ ...service, category: e.target.value }) : setEditingService({ ...service, category: e.target.value })}
                        className="border border-gray-300 dark:border-zinc-600 p-2.5 rounded-lg w-full dark:bg-zinc-700 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Imagen (opcional)</label>
                    <input
                        type="file" accept="image/*"
                        onChange={(e) => handleImageUpload(e, isNew)}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500 border border-gray-300 dark:border-zinc-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-zinc-700 dark:text-gray-400 p-2"
                    />
                    {uploading && <p className="text-sm text-blue-500 mt-1">Subiendo...</p>}
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                    <textarea
                        placeholder="Descripción del servicio..."
                        value={service.description}
                        onChange={(e) => isNew ? setNewService({ ...service, description: e.target.value }) : setEditingService({ ...service, description: e.target.value })}
                        className="border border-gray-300 dark:border-zinc-600 p-2.5 rounded-lg w-full dark:bg-zinc-700 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                        rows={2}
                    />
                </div>
                {service.image_url && (
                    <div className="col-span-1 md:col-span-2">
                        <img src={service.image_url} alt="Preview" className="h-24 w-auto object-cover rounded-lg border" />
                    </div>
                )}
            </div>
            <div className="mt-5 flex gap-3">
                <button onClick={() => handleSave(service, isNew)} disabled={uploading}
                    className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition shadow-sm flex items-center gap-2">
                    <span className="material-icons-outlined text-lg">save</span>
                    Guardar
                </button>
                <button onClick={() => { isNew ? setShowNewForm(false) : setEditingService(null); }}
                    className="bg-gray-200 dark:bg-zinc-600 text-gray-700 dark:text-gray-200 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-zinc-500 transition">
                    Cancelar
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Servicios y Precios</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Estos servicios aparecen en la sección "Menú de Servicios" de la web.</p>
                </div>
                {!showNewForm && !editingService && (
                    <button onClick={() => setShowNewForm(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition shadow-sm flex items-center gap-2">
                        <span className="material-icons-outlined text-lg">add</span>
                        Nuevo Servicio
                    </button>
                )}
            </div>

            {/* Preview de cómo se ve en la web */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-zinc-750 px-5 py-3 border-b border-gray-200 dark:border-zinc-700 flex items-center gap-2">
                    <span className="material-icons-outlined text-gray-400 text-sm">visibility</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Vista previa — Menú de Servicios</span>
                </div>
                <div className="p-6 max-w-lg mx-auto">
                    <h3 className="font-display text-2xl text-center text-gray-800 dark:text-white mb-1">Menú de Servicios</h3>
                    <div className="w-10 h-0.5 bg-primary mx-auto mb-5 rounded-full"></div>
                    <div className="space-y-3">
                        {services.map((s, i) => (
                            <div key={s.id} className={`flex justify-between items-baseline ${i !== services.length - 1 ? 'border-b border-dashed border-gray-300 dark:border-zinc-600' : ''} pb-2`}>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{s.title}</span>
                                <span className="font-bold text-primary text-sm">{formatCOP(s.price)}</span>
                            </div>
                        ))}
                        {services.length === 0 && (
                            <p className="text-center text-gray-400 text-sm py-4">No hay servicios creados aún.</p>
                        )}
                    </div>
                </div>
            </div>

            {showNewForm && renderForm(newService, true)}
            {editingService && renderForm(editingService, false)}

            {/* Service cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(service => {
                    const catInfo = getCategoryInfo(service.category);
                    return (
                        <div key={service.id} className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
                            {service.image_url && (
                                <img src={service.image_url} alt={service.title} className="w-full h-36 object-cover" />
                            )}
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-icons-outlined text-primary text-sm">{catInfo.icon}</span>
                                    <span className="text-xs text-gray-400 uppercase tracking-wider">{catInfo.label}</span>
                                </div>
                                <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1">{service.title}</h3>
                                {service.description && (
                                    <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-3">{service.description}</p>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-zinc-700">
                                    <span className="text-lg font-bold text-primary">{formatCOP(service.price)}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingService(service); setShowNewForm(false); }}
                                            className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded-lg transition">
                                            <span className="material-icons-outlined text-lg">edit</span>
                                        </button>
                                        <button onClick={() => handleDelete(service.id)}
                                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition">
                                            <span className="material-icons-outlined text-lg">delete</span>
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
};

export default ServicesManager;
