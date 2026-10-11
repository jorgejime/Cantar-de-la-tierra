import React, { useEffect, useState } from 'react';
import { supabase, Booking, BookingStatus } from '../../lib/supabase';
import { CalendarCheck, Clock, CheckCircle, XCircle, TrendingUp, Users, DollarSign, Ticket } from 'lucide-react';

interface Stats {
    total: number;
    pending: number;
    approved: number;
    cancelled: number;
    revenue: number;
}

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, cancelled: 0, revenue: 0 });
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: bookings } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (bookings) {
            const total = bookings.length;
            const pending = bookings.filter(b => b.status === 'pending').length;
            const approved = bookings.filter(b => b.status === 'approved').length;
            const cancelled = bookings.filter(b => b.status === 'cancelled').length;
            const revenue = bookings
                .filter(b => b.status === 'approved' || b.status === 'completed')
                .reduce((sum, b) => sum + Number(b.total_price), 0);

            setStats({ total, pending, approved, cancelled, revenue });
            setRecentBookings(bookings.slice(0, 5));
        }
        setLoading(false);
    };

    const statusConfig: Record<BookingStatus, { label: string; color: string; bg: string }> = {
        pending: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        approved: { label: 'Aprobada', color: 'text-green-400', bg: 'bg-green-400/10' },
        cancelled: { label: 'Cancelada', color: 'text-red-400', bg: 'bg-red-400/10' },
        completed: { label: 'Completada', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    };

    const statCards = [
        { label: 'Total Reservas', value: stats.total, icon: Ticket, color: 'text-[#3be3d2]', bg: 'bg-[#3be3d2]/10' },
        { label: 'Pendientes', value: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        { label: 'Aprobadas', value: stats.approved, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
        { label: 'Ingresos (COP)', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-[#8D4E3C]', bg: 'bg-[#8D4E3C]/10' },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Dashboard</h1>
                <p className="text-gray-400 text-sm">Resumen general del negocio</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-[#11211f] border border-white/5 rounded-2xl p-5">
                        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <p className="text-gray-400 text-xs mb-1">{label}</p>
                        <p className={`text-xl md:text-2xl font-bold ${color}`}>{loading ? '—' : value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Bookings */}
            <div className="bg-[#11211f] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-white font-semibold flex items-center gap-2">
                        <CalendarCheck className="w-5 h-5 text-[#3be3d2]" />
                        Reservas Recientes
                    </h2>
                    <a href="#/backoffice/bookings" className="text-[#3be3d2] text-sm hover:underline">Ver todas →</a>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-2 border-[#3be3d2]/30 border-t-[#3be3d2] rounded-full animate-spin mx-auto" />
                    </div>
                ) : recentBookings.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No hay reservas aún</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-3">Ticket</th>
                                    <th className="px-6 py-3">Cliente</th>
                                    <th className="px-6 py-3 hidden md:table-cell">Fecha</th>
                                    <th className="px-6 py-3 hidden md:table-cell">Total</th>
                                    <th className="px-6 py-3">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentBookings.map((booking) => {
                                    const sc = statusConfig[booking.status];
                                    return (
                                        <tr key={booking.id} className="hover:bg-white/2 transition-colors">
                                            <td className="px-6 py-4 text-[#3be3d2] font-mono text-sm">{booking.ticket_number}</td>
                                            <td className="px-6 py-4 text-white text-sm font-medium">{booking.client_name}</td>
                                            <td className="px-6 py-4 text-gray-400 text-sm hidden md:table-cell">{booking.date}</td>
                                            <td className="px-6 py-4 text-gray-300 text-sm hidden md:table-cell">${Number(booking.total_price).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.color}`}>
                                                    {sc.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
