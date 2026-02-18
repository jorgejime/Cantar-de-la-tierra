import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Booking {
    id: string;
    created_at: string;
    user_name: string;
    user_email: string;
    user_phone: string;
    booking_date: string;
    time_slot: string;
    num_adults: number;
    num_children: number;
    num_seniors: number;
    guest_services: { guestIndex: number; serviceId: string; serviceName: string; price: number }[];
    total_price: number;
    ticket_code: string;
    status: string;
    notes: string;
}

const formatCOP = (n: number) => new Intl.NumberFormat('es-CO').format(n) + ' COP';

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    confirmed: { label: 'Confirmada', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800', icon: 'check_circle' },
    pending: { label: 'Pendiente', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800', icon: 'schedule' },
    cancelled: { label: 'Cancelada', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800', icon: 'cancel' },
    completed: { label: 'Completada', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800', icon: 'task_alt' },
};

const BookingsManager = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState('');

    const fetchBookings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('booking_date', { ascending: false });

        if (!error && data) {
            setBookings(data as Booking[]);
        }
        setLoading(false);
    };

    useEffect(() => { fetchBookings(); }, []);

    const updateStatus = async (id: string, status: string) => {
        const { error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', id);
        if (!error) fetchBookings();
    };

    /* ── Filtering ──────── */
    const filtered = bookings.filter(b => {
        if (filter !== 'all' && b.status !== filter) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                (b.user_name || '').toLowerCase().includes(q) ||
                (b.user_email || '').toLowerCase().includes(q) ||
                (b.user_phone || '').toLowerCase().includes(q) ||
                (b.ticket_code || '').toLowerCase().includes(q)
            );
        }
        return true;
    });

    /* ── Stats ──────── */
    const stats = {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        pending: bookings.filter(b => b.status === 'pending').length,
        totalGuests: bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + (b.num_adults || 0) + (b.num_children || 0) + (b.num_seniors || 0), 0),
        revenue: bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + (b.total_price || 0), 0),
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-stone-800 dark:text-white">Reservas</h2>
                    <p className="text-sm text-stone-500">{stats.total} reservas · {stats.totalGuests} visitantes · {formatCOP(stats.revenue)} en ingresos</p>
                </div>
                <button onClick={fetchBookings} className="flex items-center gap-1 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition text-sm font-medium">
                    <span className="material-icons-outlined text-base">refresh</span>
                    Actualizar
                </button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
                    <p className="text-xs text-stone-500 uppercase tracking-wider">Total</p>
                    <p className="text-2xl font-bold text-stone-800 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
                    <p className="text-xs text-emerald-600 uppercase tracking-wider">Confirmadas</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.confirmed}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
                    <p className="text-xs text-amber-600 uppercase tracking-wider">Pendientes</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
                    <p className="text-xs text-primary uppercase tracking-wider">Ingresos</p>
                    <p className="text-lg font-bold text-primary">{formatCOP(stats.revenue)}</p>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email, teléfono o ticket..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                    />
                </div>
                <div className="flex gap-1 p-1 bg-white dark:bg-zinc-800 rounded-lg border border-stone-200 dark:border-stone-700">
                    {['all', 'confirmed', 'pending', 'cancelled', 'completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${filter === f ? 'bg-primary text-white' : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700'}`}
                        >
                            {f === 'all' ? 'Todas' : statusConfig[f]?.label || f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bookings list */}
            <div className="space-y-3">
                {filtered.map(booking => {
                    const isExpanded = expandedId === booking.id;
                    const totalGuests = (booking.num_adults || 0) + (booking.num_children || 0) + (booking.num_seniors || 0);
                    const sc = statusConfig[booking.status] || statusConfig.pending;
                    const services = booking.guest_services || [];

                    return (
                        <div key={booking.id} className={`bg-white dark:bg-zinc-800 rounded-xl border transition-all overflow-hidden
                            ${isExpanded ? 'border-primary/40 shadow-lg' : 'border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md'}`}>
                            {/* Summary row */}
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                                className="w-full text-left p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
                            >
                                {/* Status icon */}
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 border ${sc.bg}`}>
                                    <span className={`material-icons-outlined text-lg sm:text-xl ${sc.color}`}>{sc.icon}</span>
                                </div>

                                {/* Main info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-bold text-stone-800 dark:text-stone-100 text-sm sm:text-base truncate">{booking.user_name || 'Sin nombre'}</p>
                                        {booking.ticket_code && (
                                            <span className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] sm:text-xs font-mono font-bold rounded">{booking.ticket_code}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-stone-500 mt-0.5 flex-wrap">
                                        <span className="flex items-center gap-0.5">
                                            <span className="material-icons-outlined text-xs">calendar_today</span>
                                            {formatDate(booking.booking_date)}
                                        </span>
                                        {booking.time_slot && (
                                            <span className="flex items-center gap-0.5">
                                                <span className="material-icons-outlined text-xs">schedule</span>
                                                {booking.time_slot}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-0.5">
                                            <span className="material-icons-outlined text-xs">group</span>
                                            {totalGuests} personas
                                        </span>
                                    </div>
                                </div>

                                {/* Price + expand */}
                                <div className="text-right shrink-0">
                                    <p className="font-bold text-primary text-sm sm:text-base">{formatCOP(booking.total_price || 0)}</p>
                                    <span className={`material-icons-outlined text-stone-400 text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                                </div>
                            </button>

                            {/* Expanded details */}
                            {isExpanded && (
                                <div className="border-t border-stone-200 dark:border-stone-700 p-4 sm:p-6 bg-stone-50 dark:bg-zinc-900/50 space-y-5">
                                    {/* Contact info */}
                                    <div>
                                        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                                            <span className="material-icons-outlined text-sm">person</span>
                                            Datos del Cliente
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 border border-stone-200 dark:border-stone-700">
                                                <p className="text-[10px] text-stone-400 uppercase">Nombre</p>
                                                <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{booking.user_name || '—'}</p>
                                            </div>
                                            <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 border border-stone-200 dark:border-stone-700">
                                                <p className="text-[10px] text-stone-400 uppercase">Email</p>
                                                <a href={`mailto:${booking.user_email}`} className="text-sm font-medium text-primary hover:underline break-all">{booking.user_email || '—'}</a>
                                            </div>
                                            <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 border border-stone-200 dark:border-stone-700">
                                                <p className="text-[10px] text-stone-400 uppercase">Teléfono / WhatsApp</p>
                                                {booking.user_phone ? (
                                                    <a href={`https://wa.me/${booking.user_phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-emerald-600 hover:underline flex items-center gap-1">
                                                        {booking.user_phone}
                                                        <span className="material-icons-outlined text-xs">open_in_new</span>
                                                    </a>
                                                ) : <p className="text-sm text-stone-400">—</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Booking details */}
                                    <div>
                                        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                                            <span className="material-icons-outlined text-sm">confirmation_number</span>
                                            Detalles de la Reserva
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 border border-stone-200 dark:border-stone-700">
                                                <p className="text-[10px] text-stone-400 uppercase">Código Ticket</p>
                                                <p className="text-sm font-mono font-bold text-accent">{booking.ticket_code || '—'}</p>
                                            </div>
                                            <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 border border-stone-200 dark:border-stone-700">
                                                <p className="text-[10px] text-stone-400 uppercase">Fecha</p>
                                                <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{formatDate(booking.booking_date)}</p>
                                            </div>
                                            <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 border border-stone-200 dark:border-stone-700">
                                                <p className="text-[10px] text-stone-400 uppercase">Horario</p>
                                                <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{booking.time_slot || '—'}</p>
                                            </div>
                                            <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 border border-stone-200 dark:border-stone-700">
                                                <p className="text-[10px] text-stone-400 uppercase">Reservado el</p>
                                                <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{formatDate(booking.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Guests breakdown */}
                                    <div>
                                        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                                            <span className="material-icons-outlined text-sm">group</span>
                                            Visitantes ({totalGuests})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {(booking.num_adults || 0) > 0 && (
                                                <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                                    {booking.num_adults} Adulto{booking.num_adults > 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {(booking.num_children || 0) > 0 && (
                                                <span className="px-3 py-1.5 bg-sand/20 text-sand-dark rounded-full text-xs font-medium">
                                                    {booking.num_children} Niño{booking.num_children > 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {(booking.num_seniors || 0) > 0 && (
                                                <span className="px-3 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-medium">
                                                    {booking.num_seniors} Adulto{booking.num_seniors > 1 ? 's' : ''} Mayor{booking.num_seniors > 1 ? 'es' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Services per guest */}
                                    {services.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                                                <span className="material-icons-outlined text-sm">spa</span>
                                                Servicios Contratados
                                            </h4>
                                            <div className="space-y-2">
                                                {services.map((svc, i) => (
                                                    <div key={i} className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-lg p-3 border border-stone-200 dark:border-stone-700">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-icons-outlined text-accent text-base">spa</span>
                                                            <div>
                                                                <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{svc.serviceName}</p>
                                                                <p className="text-[10px] text-stone-400">Visitante {(svc.guestIndex || 0) + 1}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-bold text-accent">{formatCOP(svc.price || 0)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Total */}
                                    <div className="flex items-center justify-between bg-primary/5 rounded-lg p-4 border border-primary/10">
                                        <span className="font-bold text-stone-800 dark:text-stone-100">Total estimado</span>
                                        <span className="font-bold text-xl text-primary">{formatCOP(booking.total_price || 0)}</span>
                                    </div>

                                    {/* Notes */}
                                    {booking.notes && (
                                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                                            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Notas: {booking.notes}</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200 dark:border-stone-700">
                                        <button
                                            onClick={() => updateStatus(booking.id, 'confirmed')}
                                            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium transition
                                                ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'}`}
                                            disabled={booking.status === 'confirmed'}
                                        >
                                            <span className="material-icons-outlined text-sm">check_circle</span>
                                            Confirmar
                                        </button>
                                        <button
                                            onClick={() => updateStatus(booking.id, 'completed')}
                                            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium transition
                                                ${booking.status === 'completed' ? 'bg-blue-100 text-blue-700 cursor-default' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'}`}
                                            disabled={booking.status === 'completed'}
                                        >
                                            <span className="material-icons-outlined text-sm">task_alt</span>
                                            Completada
                                        </button>
                                        <button
                                            onClick={() => updateStatus(booking.id, 'pending')}
                                            className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 transition"
                                        >
                                            <span className="material-icons-outlined text-sm">schedule</span>
                                            Pendiente
                                        </button>
                                        <button
                                            onClick={() => { if (window.confirm('¿Seguro que quieres cancelar esta reserva?')) updateStatus(booking.id, 'cancelled'); }}
                                            className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition ml-auto"
                                        >
                                            <span className="material-icons-outlined text-sm">cancel</span>
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-stone-700">
                        <span className="material-icons-outlined text-5xl text-stone-300 dark:text-stone-600">event_busy</span>
                        <p className="text-stone-500 mt-3 text-sm">
                            {search ? 'No se encontraron reservas con esa búsqueda.' : 'No hay reservas registradas.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingsManager;
