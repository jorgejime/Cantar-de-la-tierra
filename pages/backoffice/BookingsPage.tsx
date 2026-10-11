import React, { useEffect, useState, useRef } from 'react';
import { supabase, Booking, BookingStatus } from '../../lib/supabase';
import {
    Search, Filter, CheckCircle, XCircle, Trash2, Eye,
    Clock, ChevronDown, Ticket, Download, X, Phone, Mail,
    Calendar, Users, DollarSign, StickyNote, RefreshCw
} from 'lucide-react';

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string; border: string }> = {
    pending: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
    approved: { label: 'Aprobada', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
    cancelled: { label: 'Cancelada', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
    completed: { label: 'Completada', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
};

const BookingsPage: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filtered, setFiltered] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);
    const ticketRef = useRef<HTMLDivElement>(null);

    useEffect(() => { fetchBookings(); }, []);

    useEffect(() => {
        let result = bookings;
        if (statusFilter !== 'all') result = result.filter(b => b.status === statusFilter);
        if (search) {
            const s = search.toLowerCase();
            result = result.filter(b =>
                b.client_name.toLowerCase().includes(s) ||
                b.ticket_number.toLowerCase().includes(s) ||
                (b.client_email || '').toLowerCase().includes(s)
            );
        }
        setFiltered(result);
    }, [bookings, search, statusFilter]);

    const fetchBookings = async () => {
        setLoading(true);
        const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        setBookings(data || []);
        setLoading(false);
    };

    const updateStatus = async (id: string, status: BookingStatus) => {
        setUpdating(id);
        await supabase.from('bookings').update({ status }).eq('id', id);
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        if (selectedBooking?.id === id) setSelectedBooking(prev => prev ? { ...prev, status } : null);
        setUpdating(null);
    };

    const deleteBooking = async (id: string) => {
        if (!confirm('¿Eliminar esta reserva permanentemente?')) return;
        await supabase.from('bookings').delete().eq('id', id);
        setBookings(prev => prev.filter(b => b.id !== id));
        if (selectedBooking?.id === id) setSelectedBooking(null);
    };

    const printTicket = () => {
        if (!ticketRef.current) return;
        const content = ticketRef.current.innerHTML;
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`
      <html><head><title>Ticket ${selectedBooking?.ticket_number}</title>
      <style>
        body { font-family: 'Georgia', serif; background: white; padding: 20px; }
        .ticket { max-width: 400px; margin: 0 auto; border: 2px dashed #3be3d2; border-radius: 16px; padding: 24px; }
        .header { text-align: center; border-bottom: 1px dashed #ccc; padding-bottom: 16px; margin-bottom: 16px; }
        .logo { font-size: 20px; font-weight: bold; color: #11211f; }
        .ticket-num { font-family: monospace; font-size: 18px; color: #3be3d2; font-weight: bold; margin-top: 8px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .label { color: #666; }
        .value { font-weight: bold; color: #11211f; }
        .total { border-top: 1px dashed #ccc; padding-top: 12px; margin-top: 12px; font-size: 16px; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; background: #d1fae5; color: #065f46; }
        .addons { margin-top: 8px; padding: 8px; background: #f9fafb; border-radius: 8px; }
        .addon-item { font-size: 12px; color: #444; margin-bottom: 4px; }
      </style></head>
      <body><div class="ticket">${content}</div></body></html>
    `);
        win.document.close();
        win.print();
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Reservas</h1>
                    <p className="text-gray-400 text-sm">{filtered.length} reservas encontradas</p>
                </div>
                <button onClick={fetchBookings} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all">
                    <RefreshCw className="w-4 h-4" />
                    Actualizar
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, ticket o email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-[#11211f] border border-white/10 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3be3d2]/30"
                    />
                </div>
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="appearance-none bg-[#11211f] border border-white/10 text-white rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3be3d2]/30 cursor-pointer"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="pending">Pendientes</option>
                        <option value="approved">Aprobadas</option>
                        <option value="cancelled">Canceladas</option>
                        <option value="completed">Completadas</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#11211f] border border-white/5 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-8 h-8 border-2 border-[#3be3d2]/30 border-t-[#3be3d2] rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">Cargando reservas...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Ticket className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No se encontraron reservas</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-white/5">
                                    <th className="px-4 py-3">Ticket</th>
                                    <th className="px-4 py-3">Cliente</th>
                                    <th className="px-4 py-3 hidden md:table-cell">Fecha</th>
                                    <th className="px-4 py-3 hidden lg:table-cell">Servicio</th>
                                    <th className="px-4 py-3 hidden md:table-cell">Total</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map((booking) => {
                                    const sc = STATUS_CONFIG[booking.status];
                                    return (
                                        <tr key={booking.id} className="hover:bg-white/2 transition-colors">
                                            <td className="px-4 py-4 text-[#3be3d2] font-mono text-xs">{booking.ticket_number}</td>
                                            <td className="px-4 py-4">
                                                <p className="text-white text-sm font-medium">{booking.client_name}</p>
                                                {booking.client_email && <p className="text-gray-500 text-xs">{booking.client_email}</p>}
                                            </td>
                                            <td className="px-4 py-4 text-gray-400 text-sm hidden md:table-cell">{booking.date}</td>
                                            <td className="px-4 py-4 text-gray-300 text-sm hidden lg:table-cell">{booking.service_type}</td>
                                            <td className="px-4 py-4 text-gray-300 text-sm hidden md:table-cell">${Number(booking.total_price).toLocaleString()}</td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${sc.bg} ${sc.color} ${sc.border}`}>
                                                    {sc.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setSelectedBooking(booking)}
                                                        className="p-2 text-gray-400 hover:text-[#3be3d2] hover:bg-[#3be3d2]/10 rounded-lg transition-all"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {booking.status === 'pending' && (
                                                        <button
                                                            onClick={() => updateStatus(booking.id, 'approved')}
                                                            disabled={updating === booking.id}
                                                            className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-all"
                                                            title="Aprobar"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {booking.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => updateStatus(booking.id, 'cancelled')}
                                                            disabled={updating === booking.id}
                                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                            title="Cancelar"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteBooking(booking.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#11211f] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#11211f] z-10">
                            <div>
                                <h3 className="text-white font-bold text-lg">Detalle de Reserva</h3>
                                <p className="text-[#3be3d2] font-mono text-sm">{selectedBooking.ticket_number}</p>
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Ticket Content (for printing) */}
                        <div ref={ticketRef} className="p-6 space-y-4">
                            {/* Ticket Header */}
                            <div className="header text-center border-b border-white/10 pb-4">
                                <div className="logo text-white font-bold text-xl">🌿 Cantar de la Tierra</div>
                                <div className="ticket-num text-[#3be3d2] font-mono font-bold text-lg mt-1">{selectedBooking.ticket_number}</div>
                                <div className="mt-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${STATUS_CONFIG[selectedBooking.status].bg} ${STATUS_CONFIG[selectedBooking.status].color} ${STATUS_CONFIG[selectedBooking.status].border}`}>
                                        {STATUS_CONFIG[selectedBooking.status].label}
                                    </span>
                                </div>
                            </div>

                            {/* Client Info */}
                            <div className="space-y-3">
                                <div className="row flex items-center justify-between">
                                    <span className="label text-gray-400 text-sm flex items-center gap-2"><Users className="w-4 h-4" /> Cliente</span>
                                    <span className="value text-white font-medium">{selectedBooking.client_name}</span>
                                </div>
                                {selectedBooking.client_email && (
                                    <div className="row flex items-center justify-between">
                                        <span className="label text-gray-400 text-sm flex items-center gap-2"><Mail className="w-4 h-4" /> Email</span>
                                        <span className="value text-white text-sm">{selectedBooking.client_email}</span>
                                    </div>
                                )}
                                {selectedBooking.client_phone && (
                                    <div className="row flex items-center justify-between">
                                        <span className="label text-gray-400 text-sm flex items-center gap-2"><Phone className="w-4 h-4" /> Teléfono</span>
                                        <span className="value text-white text-sm">{selectedBooking.client_phone}</span>
                                    </div>
                                )}
                                <div className="row flex items-center justify-between">
                                    <span className="label text-gray-400 text-sm flex items-center gap-2"><Calendar className="w-4 h-4" /> Fecha</span>
                                    <span className="value text-white font-medium">{selectedBooking.date}</span>
                                </div>
                                <div className="row flex items-center justify-between">
                                    <span className="label text-gray-400 text-sm">Servicio</span>
                                    <span className="value text-[#3be3d2] font-medium">{selectedBooking.service_type}</span>
                                </div>
                                <div className="row flex items-center justify-between">
                                    <span className="label text-gray-400 text-sm">Adultos / Niños</span>
                                    <span className="value text-white">{selectedBooking.adults} / {selectedBooking.children}</span>
                                </div>
                            </div>

                            {/* Add-ons */}
                            {selectedBooking.addons && selectedBooking.addons.length > 0 && (
                                <div className="addons bg-white/5 rounded-xl p-4">
                                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Servicios Adicionales</p>
                                    {selectedBooking.addons.map((addon, i) => (
                                        <div key={i} className="addon-item flex justify-between text-sm py-1">
                                            <span className="text-gray-300">{addon.name} x{addon.quantity}</span>
                                            <span className="text-white">${(addon.price * addon.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Total */}
                            <div className="total border-t border-white/10 pt-4 flex items-center justify-between">
                                <span className="text-gray-400 font-medium flex items-center gap-2"><DollarSign className="w-4 h-4" /> Total</span>
                                <span className="text-2xl font-bold text-[#3be3d2]">${Number(selectedBooking.total_price).toLocaleString()} COP</span>
                            </div>

                            {selectedBooking.notes && (
                                <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4">
                                    <p className="text-yellow-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><StickyNote className="w-3 h-3" /> Notas</p>
                                    <p className="text-gray-300 text-sm">{selectedBooking.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-white/10 space-y-3">
                            {/* Status Actions */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => updateStatus(selectedBooking.id, 'approved')}
                                    disabled={selectedBooking.status === 'approved' || updating === selectedBooking.id}
                                    className="flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 disabled:opacity-40 disabled:cursor-not-allowed py-2.5 rounded-xl text-sm font-medium transition-all"
                                >
                                    <CheckCircle className="w-4 h-4" /> Aprobar
                                </button>
                                <button
                                    onClick={() => updateStatus(selectedBooking.id, 'completed')}
                                    disabled={selectedBooking.status === 'completed' || updating === selectedBooking.id}
                                    className="flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed py-2.5 rounded-xl text-sm font-medium transition-all"
                                >
                                    <CheckCircle className="w-4 h-4" /> Completar
                                </button>
                                <button
                                    onClick={() => updateStatus(selectedBooking.id, 'cancelled')}
                                    disabled={selectedBooking.status === 'cancelled' || updating === selectedBooking.id}
                                    className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 disabled:opacity-40 disabled:cursor-not-allowed py-2.5 rounded-xl text-sm font-medium transition-all"
                                >
                                    <XCircle className="w-4 h-4" /> Cancelar
                                </button>
                                <button
                                    onClick={printTicket}
                                    className="flex items-center justify-center gap-2 bg-[#3be3d2]/10 hover:bg-[#3be3d2]/20 border border-[#3be3d2]/30 text-[#3be3d2] py-2.5 rounded-xl text-sm font-medium transition-all"
                                >
                                    <Download className="w-4 h-4" /> Imprimir Ticket
                                </button>
                            </div>
                            <button
                                onClick={() => deleteBooking(selectedBooking.id)}
                                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 py-2.5 rounded-xl text-sm font-medium transition-all"
                            >
                                <Trash2 className="w-4 h-4" /> Eliminar Reserva
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingsPage;
