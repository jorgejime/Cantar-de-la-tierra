import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, Users, ChevronDown, Plus, Minus, ArrowRight } from 'lucide-react';

interface SlotInfo { time_slot: string; booked_count: number; max_capacity: number }

const DEFAULT_SLOTS = [
    '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00',
];

const toDateStr = (d: Date) => d.toISOString().split('T')[0];

const QuickBookingBar: React.FC = () => {
    const navigate = useNavigate();
    const today = new Date();
    const [date, setDate] = useState(toDateStr(today));
    const [slot, setSlot] = useState('');
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [slots, setSlots] = useState<SlotInfo[]>([]);
    const [showPeople, setShowPeople] = useState(false);

    useEffect(() => {
        if (!date) return;
        supabase
            .from('daily_capacity')
            .select('time_slot, booked_count, max_capacity')
            .eq('booking_date', date)
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setSlots(data);
                    const first = data.find(s => s.booked_count < s.max_capacity);
                    setSlot(first?.time_slot || data[0].time_slot);
                } else {
                    const def = DEFAULT_SLOTS.map(ts => ({ time_slot: ts, booked_count: 0, max_capacity: 30 }));
                    setSlots(def);
                    setSlot(DEFAULT_SLOTS[0]);
                }
            });
    }, [date]);

    const totalPeople = adults + children;

    const handleReservar = () => {
        navigate({
            pathname: '/servicios',
            search: `?date=${date}&slot=${encodeURIComponent(slot)}&adults=${adults}&children=${children}`,
            hash: 'reservar',
        });
    };

    /* ── Clases reutilizables ── */
    const fieldCls = "flex-1 flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors rounded-xl px-4 py-3 cursor-pointer";
    const labelCls = "text-[10px] text-sand/60 uppercase tracking-wider font-semibold mb-0.5 font-body";
    const iconCls = "w-5 h-5 text-sand shrink-0";

    return (
        <div className="w-full max-w-4xl mx-auto px-4">
            {/* Etiqueta */}
            <p className="text-center text-sand-light text-xs uppercase tracking-[0.25em] font-semibold mb-3 font-body">
                Reserva tu visita
            </p>

            {/* Barra principal */}
            <div className="bg-background-dark/80 backdrop-blur-md border border-sand/10 rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl shadow-black/40">

                {/* Fecha */}
                <label className={fieldCls}>
                    <Calendar className={iconCls} />
                    <div className="flex-1 min-w-0">
                        <p className={labelCls}>Fecha</p>
                        <input
                            type="date"
                            value={date}
                            min={toDateStr(today)}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-transparent text-white text-sm font-medium outline-none cursor-pointer [color-scheme:dark] font-body"
                        />
                    </div>
                </label>

                <div className="hidden md:block w-px bg-sand/10 my-2" />

                {/* Horario */}
                <label className={fieldCls}>
                    <Clock className={iconCls} />
                    <div className="flex-1 min-w-0">
                        <p className={labelCls}>Horario</p>
                        <div className="relative">
                            <select
                                value={slot}
                                onChange={e => setSlot(e.target.value)}
                                className="w-full bg-transparent text-white text-sm font-medium outline-none appearance-none cursor-pointer pr-5 font-body"
                            >
                                {slots.length === 0 && <option value="">Selecciona una fecha</option>}
                                {slots.map(s => {
                                    const avail = s.max_capacity - s.booked_count;
                                    const full = avail <= 0;
                                    return (
                                        <option key={s.time_slot} value={s.time_slot} disabled={full} className="bg-background-dark">
                                            {s.time_slot} {full ? '(Agotado)' : `· ${avail} cupos`}
                                        </option>
                                    );
                                })}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-sand/50 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </label>

                <div className="hidden md:block w-px bg-sand/10 my-2" />

                {/* Personas */}
                <div className="flex-1 relative">
                    <button
                        onClick={() => setShowPeople(p => !p)}
                        className={`w-full ${fieldCls} text-left`}
                    >
                        <Users className={iconCls} />
                        <div className="flex-1">
                            <p className={labelCls}>Personas</p>
                            <p className="text-white text-sm font-medium font-body">
                                {totalPeople} {totalPeople === 1 ? 'persona' : 'personas'}
                                {children > 0 ? ` (${adults}A + ${children}N)` : ''}
                            </p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-sand/50 transition-transform ${showPeople ? 'rotate-180' : ''}`} />
                    </button>

                    {showPeople && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-dark border border-sand/10 rounded-xl p-4 z-50 shadow-2xl">
                            {/* Adultos */}
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-white text-sm font-medium font-body">Adultos</p>
                                    <p className="text-text-main-dark/40 text-xs font-body">+12 años</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setAdults(Math.max(1, adults - 1))} disabled={adults <= 1}
                                        className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-text-main-dark/60 hover:border-primary hover:text-primary transition disabled:opacity-30">
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-6 text-center text-white font-bold font-body">{adults}</span>
                                    <button onClick={() => setAdults(adults + 1)}
                                        className="w-8 h-8 rounded-full border border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition">
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            {/* Niños */}
                            <div className="flex items-center justify-between py-2 border-t border-sand/5">
                                <div>
                                    <p className="text-white text-sm font-medium font-body">Niños</p>
                                    <p className="text-text-main-dark/40 text-xs font-body">3–11 años</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setChildren(Math.max(0, children - 1))} disabled={children <= 0}
                                        className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-text-main-dark/60 hover:border-primary hover:text-primary transition disabled:opacity-30">
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-6 text-center text-white font-bold font-body">{children}</span>
                                    <button onClick={() => setChildren(children + 1)}
                                        className="w-8 h-8 rounded-full border border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition">
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => setShowPeople(false)}
                                className="w-full mt-3 text-center text-sand text-xs font-semibold hover:underline font-body">
                                Listo ✓
                            </button>
                        </div>
                    )}
                </div>

                {/* Botón Reservar */}
                <button
                    onClick={handleReservar}
                    disabled={!date || !slot}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-primary/30 whitespace-nowrap text-sm uppercase tracking-wider font-body"
                >
                    Reservar
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default QuickBookingBar;
