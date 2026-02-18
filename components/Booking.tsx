import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

/* ── Types ─────────────────────────────── */
interface ServiceItem { id: string; title: string; price: number; category: string }
interface SlotInfo { time_slot: string; booked_count: number; max_capacity: number }
interface TicketResult { success: boolean; ticket_code?: string; booking_id?: string; error?: string; available?: number }

const PRICES = { adult: 75000, child: 40000, senior: 60000 };
const formatCOP = (n: number) => new Intl.NumberFormat('es-CO').format(n) + ' COP';

const Booking: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useLanguage();

    /* ── State ──────────────────────── */
    const [step, setStep] = useState(1);
    // Step 1
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [seniors, setSeniors] = useState(0);
    // Step 2
    const [dbServices, setDbServices] = useState<ServiceItem[]>([]);
    const [guestServices, setGuestServices] = useState<Record<number, string[]>>({});
    // Step 3
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [slots, setSlots] = useState<SlotInfo[]>([]);
    const [calMonth, setCalMonth] = useState(new Date().getMonth());
    const [calYear, setCalYear] = useState(new Date().getFullYear());
    // Contact
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    // Ticket
    const [ticketCode, setTicketCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    const ticketRef = useRef<HTMLDivElement>(null);

    const totalGuests = adults + children + seniors;

    /* ── Load services from DB ──── */
    useEffect(() => {
        supabase.from('services').select('id, title, price, category').order('created_at')
            .then(({ data }) => {
                if (data) setDbServices(data as ServiceItem[]);
            });

        // Load logo
        supabase.from('site_config').select('value').eq('key', 'logo_url').single()
            .then(({ data }) => {
                if (data) setLogoUrl(data.value);
            });
    }, []);

    /* ── Load slots when date changes ──── */
    useEffect(() => {
        if (!selectedDate) return;
        const dateStr = selectedDate.toISOString().split('T')[0];
        supabase.from('daily_capacity')
            .select('time_slot, booked_count, max_capacity')
            .eq('booking_date', dateStr)
            .order('time_slot')
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setSlots(data as SlotInfo[]);
                } else {
                    // Default slots if none seeded
                    setSlots(['09:00', '10:00', '11:00', '12:30', '14:00', '16:00'].map(ts => ({
                        time_slot: ts, booked_count: 0, max_capacity: 30
                    })));
                }
            });
        setSelectedSlot('');
    }, [selectedDate]);

    /* ── Derived ──────────────────── */
    const treatments = dbServices.filter(s => s.category === 'treatment');

    const calcTotal = () => {
        let total = adults * PRICES.adult + children * PRICES.child + seniors * PRICES.senior;
        (Object.values(guestServices) as string[][]).forEach(svcIds => {
            if (svcIds) {
                svcIds.forEach(sId => {
                    const svc = dbServices.find(s => s.id === sId);
                    if (svc) total += svc.price;
                });
            }
        });
        return total;
    };

    const toggleService = (guestIdx: number, serviceId: string) => {
        setGuestServices(prev => {
            const current = prev[guestIdx] || [];
            if (current.includes(serviceId)) {
                const updated = current.filter(id => id !== serviceId);
                if (updated.length === 0) {
                    const copy = { ...prev };
                    delete copy[guestIdx];
                    return copy;
                }
                return { ...prev, [guestIdx]: updated };
            } else {
                return { ...prev, [guestIdx]: [...current, serviceId] };
            }
        });
    };

    const guestServiceCount = (guestIdx: number) => (guestServices[guestIdx] || []).length;
    const guestServiceTotal = (guestIdx: number) => {
        return (guestServices[guestIdx] || []).reduce((sum, sId) => {
            const svc = dbServices.find(s => s.id === sId);
            return sum + (svc?.price || 0);
        }, 0);
    };

    const canGoNext = () => {
        if (step === 1) return totalGuests > 0;
        if (step === 2) return true; // services are optional
        if (step === 3) return selectedDate && selectedSlot && name.trim() && email.trim();
        return false;
    };

    /* ── Create booking ──────────── */
    const handleConfirm = async () => {
        if (!selectedDate || !selectedSlot) return;
        setLoading(true);
        setError('');

        const dateStr = selectedDate.toISOString().split('T')[0];
        const servicesData = (Object.entries(guestServices) as [string, string[]][]).flatMap(([idx, svcIds]) => {
            return svcIds.map(sId => {
                const svc = dbServices.find(s => s.id === sId);
                return { guestIndex: Number(idx), serviceId: sId, serviceName: svc?.title || '', price: svc?.price || 0 };
            });
        }).filter(s => s.serviceId);

        try {
            const { data, error: rpcError } = await supabase.rpc('create_booking', {
                p_user_name: name,
                p_user_email: email,
                p_user_phone: phone,
                p_booking_date: dateStr,
                p_time_slot: selectedSlot,
                p_num_adults: adults,
                p_num_children: children,
                p_num_seniors: seniors,
                p_guest_services: servicesData,
                p_total_price: calcTotal(),
                p_notes: ''
            });

            if (rpcError) throw rpcError;
            const result = data as TicketResult;
            if (result.success && result.ticket_code) {
                setTicketCode(result.ticket_code);
                setStep(4);
            } else if (result.error === 'NO_AVAILABILITY') {
                setError(`${t.booking.errorOverbooking} ${result.available}.`);
            } else {
                setError(t.booking.errorGeneral);
            }
        } catch {
            setError(t.booking.errorGeneral);
        }
        setLoading(false);
    };

    /* ── Print ticket ──────────── */
    const handlePrint = () => {
        if (!ticketRef.current) return;
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<!DOCTYPE html><html><head><title>Ticket ${ticketCode}</title>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
            <style>*{margin:0;box-sizing:border-box;font-family:'Lato',sans-serif}body{padding:30px;max-width:450px;margin:0 auto}
            .logo-container{text-align:center;margin-bottom:20px}
            .logo{max-height:80px;max-width:200px;object-fit:contain}
            .logo-text{font-family:'Playfair Display',serif;font-size:24px;text-align:center;margin-bottom:20px;color:#3F606A}
            .code{font-size:32px;font-weight:bold;text-align:center;letter-spacing:4px;color:#8C6145;margin:20px 0;padding:16px;border:2px dashed #BA9269;border-radius:8px}
            .info{margin:12px 0;padding:8px 0;border-bottom:1px solid #eee}.info span{font-weight:bold}
            .services-list{margin-top:4px;padding-left:0;list-style:none}
            .services-list li{font-size:13px;color:#555;padding-left:10px;border-left:2px solid #ddd;margin-bottom:4px}
            .msg{text-align:center;color:#666;font-size:13px;margin-top:24px;padding-top:16px;border-top:2px solid #3F606A}
            .total{font-size:20px;font-weight:bold;color:#3F606A;text-align:right;margin-top:16px}
            @media print{body{padding:15px}}</style></head><body>`);
        w.document.write(ticketRef.current.innerHTML);
        w.document.write('</body></html>');
        w.document.close();
        // Give time for image to load before printing
        setTimeout(() => {
            w.print();
        }, 500);
    };

    /* ── Counter component ──────── */
    const Counter = ({ label, sublabel, value, onChange, min = 0 }: { label: string; sublabel: string; value: number; onChange: (v: number) => void; min?: number }) => (
        <div className="flex items-center justify-between py-3 border-b border-stone-200 dark:border-stone-700 last:border-0">
            <div>
                <p className="font-display text-base sm:text-lg text-stone-800 dark:text-stone-100">{label}</p>
                <p className="text-xs text-stone-500">{sublabel}</p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onChange(Math.max(min, value - 1))}
                    className="w-9 h-9 rounded-full border border-stone-300 dark:border-stone-600 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition active:scale-95 disabled:opacity-30"
                    disabled={value <= min}
                    aria-label={`Menos ${label}`}
                >
                    <span className="material-icons-outlined text-sm">remove</span>
                </button>
                <span className="w-8 text-center font-bold text-lg text-stone-800 dark:text-stone-100">{value}</span>
                <button
                    onClick={() => onChange(value + 1)}
                    className="w-9 h-9 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition active:scale-95"
                    aria-label={`Más ${label}`}
                >
                    <span className="material-icons-outlined text-sm">add</span>
                </button>
            </div>
        </div>
    );

    /* ── Step indicator ──────────── */
    const steps = [t.booking.step1, t.booking.step2, t.booking.step3, t.booking.step4];

    /* ── Calendar ──────────── */
    const renderCalendar = () => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const firstDay = new Date(calYear, calMonth, 1).getDay();
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const cells = [];

        for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />);
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(calYear, calMonth, d);
            const isPast = date < today;
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            cells.push(
                <button
                    key={d}
                    disabled={isPast}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all
                        ${isPast ? 'text-stone-300 dark:text-stone-600 cursor-not-allowed' : 'hover:bg-primary/10 cursor-pointer'}
                        ${isSelected ? 'bg-primary text-white hover:bg-primary shadow-md' : 'text-stone-700 dark:text-stone-300'}`}
                >
                    {d}
                </button>
            );
        }
        return cells;
    };

    const goPrevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
    const goNextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

    /* ── Guest labels ──────────── */
    const guestLabels: { type: string; label: string }[] = [];
    for (let i = 0; i < adults; i++) guestLabels.push({ type: 'adult', label: `${t.booking.adult} ${adults > 1 ? i + 1 : ''}` });
    for (let i = 0; i < children; i++) guestLabels.push({ type: 'child', label: `${t.booking.child} ${children > 1 ? i + 1 : ''}` });
    for (let i = 0; i < seniors; i++) guestLabels.push({ type: 'senior', label: `${t.booking.senior} ${seniors > 1 ? i + 1 : ''}` });

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <div className="bg-primary text-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    <button onClick={onBack} className="flex items-center gap-1 text-white/80 hover:text-white text-sm mb-3 transition">
                        <span className="material-icons-outlined text-lg">arrow_back</span>
                        {t.booking.back}
                    </button>
                    <h1 className="font-display text-2xl sm:text-3xl">
                        {t.booking.title} <span className="text-sand-light">{t.booking.titleHighlight}</span>
                    </h1>
                </div>
            </div>

            {/* Stepper */}
            {step < 4 && (
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                        {steps.slice(0, 3).map((s, i) => (
                            <React.Fragment key={i}>
                                <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-all
                                    ${i + 1 === step ? 'text-primary' : i + 1 < step ? 'text-primary/60' : 'text-stone-400'}`}>
                                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                        ${i + 1 === step ? 'bg-primary text-white shadow-md' : i + 1 < step ? 'bg-primary/20 text-primary' : 'bg-stone-200 dark:bg-stone-700 text-stone-400'}`}>
                                        {i + 1 < step ? <span className="material-icons-outlined text-sm">check</span> : i + 1}
                                    </div>
                                    <span className="hidden sm:inline">{s}</span>
                                </div>
                                {i < 2 && <div className={`flex-1 h-px ${i + 1 < step ? 'bg-primary/40' : 'bg-stone-200 dark:bg-stone-700'}`} />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">

                {/* ═══ STEP 1: Tickets ═══ */}
                {step === 1 && (
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-5 sm:p-8 border border-stone-200 dark:border-stone-800">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-icons-outlined text-primary text-2xl" aria-hidden="true">confirmation_number</span>
                            <h2 className="font-display text-xl sm:text-2xl text-stone-800 dark:text-stone-100">{t.booking.howMany}</h2>
                        </div>
                        <Counter label={t.booking.adult} sublabel={`${t.booking.adultPrice} COP ${t.booking.perPerson}`} value={adults} onChange={setAdults} />
                        <Counter label={t.booking.child} sublabel={`${t.booking.childPrice} COP ${t.booking.perPerson}`} value={children} onChange={setChildren} />
                        <Counter label={t.booking.senior} sublabel={`${t.booking.seniorPrice} COP ${t.booking.perPerson}`} value={seniors} onChange={setSeniors} />

                        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                            <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400">
                                <span>{t.booking.entries} ({totalGuests})</span>
                                <span className="font-bold text-stone-800 dark:text-stone-100">{formatCOP(adults * PRICES.adult + children * PRICES.child + seniors * PRICES.senior)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ STEP 2: Services per person ═══ */}
                {step === 2 && (
                    <div className="space-y-3">
                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-5 sm:p-8 border border-stone-200 dark:border-stone-800">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-icons-outlined text-accent text-2xl" aria-hidden="true">spa</span>
                                <h2 className="font-display text-xl sm:text-2xl text-stone-800 dark:text-stone-100">{t.booking.selectService}</h2>
                            </div>
                            <p className="text-sm text-stone-500 mb-6">{t.booking.serviceFor} {totalGuests} {t.booking.guest.toLowerCase()}{totalGuests > 1 ? 's' : ''} — selección múltiple</p>

                            <div className="space-y-4">
                                {guestLabels.map((g, idx) => (
                                    <div key={idx} className="p-4 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                                                <span className="material-icons-outlined text-base text-primary" aria-hidden="true">person</span>
                                                {g.label}
                                            </p>
                                            {guestServiceCount(idx) > 0 && (
                                                <span className="text-xs font-bold text-accent">
                                                    {guestServiceCount(idx)} servicio{guestServiceCount(idx) > 1 ? 's' : ''} · +{formatCOP(guestServiceTotal(idx))}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            {/* Treatment options as checkboxes */}
                                            {treatments.map(svc => {
                                                const isChecked = (guestServices[idx] || []).includes(svc.id);
                                                return (
                                                    <label key={svc.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all
                                                        ${isChecked ? 'border-accent bg-accent/5 shadow-sm' : 'border-stone-200 dark:border-stone-600 hover:border-accent/40'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => toggleService(idx, svc.id)}
                                                            className="accent-accent w-4 h-4 rounded"
                                                        />
                                                        <span className="text-sm text-stone-700 dark:text-stone-200 flex-1">{svc.title}</span>
                                                        <span className={`text-xs font-bold whitespace-nowrap ${isChecked ? 'text-accent' : 'text-stone-400'}`}>+{formatCOP(svc.price)}</span>
                                                    </label>
                                                );
                                            })}
                                            {guestServiceCount(idx) === 0 && (
                                                <p className="text-xs text-stone-400 italic px-1 pt-1 flex items-center gap-1">
                                                    <span className="material-icons-outlined text-xs">info</span>
                                                    Solo entrada — sin servicios adicionales
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ STEP 3: Date + Time + Contact ═══ */}
                {step === 3 && (
                    <div className="space-y-4">
                        {/* Calendar */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-5 sm:p-8 border border-stone-200 dark:border-stone-800">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="material-icons-outlined text-primary text-2xl" aria-hidden="true">calendar_month</span>
                                <h2 className="font-display text-xl sm:text-2xl text-stone-800 dark:text-stone-100">{t.booking.selectDate}</h2>
                            </div>

                            {/* Month nav */}
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={goPrevMonth} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition">
                                    <span className="material-icons-outlined text-stone-600 dark:text-stone-300">chevron_left</span>
                                </button>
                                <span className="font-display text-base sm:text-lg text-stone-800 dark:text-stone-100">
                                    {t.booking.months[calMonth]} {calYear}
                                </span>
                                <button onClick={goNextMonth} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition">
                                    <span className="material-icons-outlined text-stone-600 dark:text-stone-300">chevron_right</span>
                                </button>
                            </div>

                            {/* Day headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {t.booking.daysShort.map((d: string) => (
                                    <div key={d} className="text-center text-[10px] sm:text-xs font-bold text-stone-400 uppercase">{d}</div>
                                ))}
                            </div>
                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {renderCalendar()}
                            </div>
                        </div>

                        {/* Time slots */}
                        {selectedDate && (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-5 sm:p-8 border border-stone-200 dark:border-stone-800">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-icons-outlined text-accent text-2xl" aria-hidden="true">schedule</span>
                                    <h2 className="font-display text-lg sm:text-xl text-stone-800 dark:text-stone-100">{t.booking.selectTime}</h2>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {slots.map(slot => {
                                        const avail = slot.max_capacity - slot.booked_count;
                                        const isFull = avail < totalGuests;
                                        const isSel = selectedSlot === slot.time_slot;
                                        return (
                                            <button
                                                key={slot.time_slot}
                                                disabled={isFull}
                                                onClick={() => setSelectedSlot(slot.time_slot)}
                                                className={`p-3 rounded-lg text-center border transition-all
                                                    ${isFull ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 border-stone-200 dark:border-stone-700 cursor-not-allowed' :
                                                        isSel ? 'border-primary bg-primary text-white shadow-md' :
                                                            'border-stone-200 dark:border-stone-700 hover:border-primary/40 text-stone-700 dark:text-stone-300'}`}
                                            >
                                                <span className="block font-bold text-sm">{slot.time_slot}</span>
                                                <span className={`text-[10px] ${isFull ? 'text-stone-400' : isSel ? 'text-white/70' : 'text-stone-500'}`}>
                                                    {isFull ? t.booking.full : `${avail} ${t.booking.spotsLeft}`}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Contact info */}
                        {selectedSlot && (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-5 sm:p-8 border border-stone-200 dark:border-stone-800">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-icons-outlined text-sand text-2xl" aria-hidden="true">badge</span>
                                    <h2 className="font-display text-lg sm:text-xl text-stone-800 dark:text-stone-100">{t.booking.yourData}</h2>
                                </div>
                                <div className="space-y-3">
                                    <input
                                        type="text" placeholder={t.booking.name} value={name} onChange={e => setName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-base text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                                    />
                                    <input
                                        type="email" placeholder={t.booking.email} value={email} onChange={e => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-base text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                                    />
                                    <input
                                        type="tel" placeholder={t.booking.phone} value={phone} onChange={e => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-base text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Summary */}
                        {selectedSlot && name && email && (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-5 sm:p-8 border border-stone-200 dark:border-stone-800">
                                <h3 className="font-display text-lg text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
                                    <span className="material-icons-outlined text-primary" aria-hidden="true">receipt_long</span>
                                    {t.booking.summary}
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">{t.booking.adult} × {adults}</span>
                                        <span className="text-stone-700 dark:text-stone-300">{formatCOP(adults * PRICES.adult)}</span>
                                    </div>
                                    {children > 0 && <div className="flex justify-between">
                                        <span className="text-stone-500">{t.booking.child} × {children}</span>
                                        <span className="text-stone-700 dark:text-stone-300">{formatCOP(children * PRICES.child)}</span>
                                    </div>}
                                    {seniors > 0 && <div className="flex justify-between">
                                        <span className="text-stone-500">{t.booking.senior} × {seniors}</span>
                                        <span className="text-stone-700 dark:text-stone-300">{formatCOP(seniors * PRICES.senior)}</span>
                                    </div>}
                                    {(Object.entries(guestServices) as [string, string[]][]).flatMap(([idx, svcIds]) => {
                                        return svcIds.map(sId => {
                                            const svc = dbServices.find(s => s.id === sId);
                                            if (!svc) return null;
                                            return (
                                                <div key={`${idx}-${sId}`} className="flex justify-between">
                                                    <span className="text-stone-500">{svc.title} ({guestLabels[Number(idx)]?.label})</span>
                                                    <span className="text-accent font-medium">{formatCOP(svc.price)}</span>
                                                </div>
                                            );
                                        });
                                    })}
                                    <div className="border-t border-stone-200 dark:border-stone-700 pt-3 mt-3 flex justify-between">
                                        <span className="font-bold text-stone-800 dark:text-stone-100">{t.booking.total}</span>
                                        <span className="font-bold text-lg text-primary">{formatCOP(calcTotal())}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ STEP 4: Ticket ═══ */}
                {step === 4 && (
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-5 sm:p-8 border border-stone-200 dark:border-stone-800 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <span className="material-icons-outlined text-primary text-3xl">check_circle</span>
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl text-stone-800 dark:text-stone-100 mb-2">{t.booking.ticketTitle}</h2>

                        <div ref={ticketRef}>
                            <div className="logo-container">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Cantar de la Tierra" className="logo" />
                                ) : (
                                    <p className="logo-text">Cantar de la Tierra</p>
                                )}
                            </div>
                            <div className="code">{ticketCode}</div>
                            <div className="info"><span>{t.booking.name}:</span> {name}</div>
                            <div className="info"><span>{t.booking.email}:</span> {email}</div>
                            {phone && <div className="info"><span>{t.booking.phone}:</span> {phone}</div>}
                            <div className="info"><span>Fecha:</span> {selectedDate?.toLocaleDateString('es-CO')} — {selectedSlot}</div>
                            <div className="info"><span>{t.booking.entries}:</span> {adults} {t.booking.adult}, {children} {t.booking.child}, {seniors} {t.booking.senior}</div>
                            {Object.keys(guestServices).length > 0 && (
                                <div className="info">
                                    <span style={{ display: 'block', marginBottom: '4px' }}>{t.booking.services}:</span>
                                    <ul className="services-list mt-2 pl-0 list-none text-left">
                                        {(Object.entries(guestServices) as [string, string[]][]).flatMap(([idx, svcIds]) => {
                                            return svcIds.map(sId => {
                                                const svc = dbServices.find(s => s.id === sId);
                                                return svc ? <li key={`${idx}-${sId}`} className="text-sm text-stone-600 dark:text-stone-400 pl-3 border-l-2 border-stone-200 dark:border-stone-700 mb-1">{guestLabels[Number(idx)]?.label}: {svc.title}</li> : null;
                                            });
                                        })}
                                    </ul>
                                </div>
                            )}
                            <div className="total">{t.booking.total}: {formatCOP(calcTotal())}</div>
                            <p className="msg">{t.booking.ticketMsg}</p>
                        </div>

                        {/* Visual ticket for screen */}
                        <div className="mt-6 p-6 border-2 border-dashed border-sand rounded-xl bg-sand/5">
                            <p className="text-xs text-stone-500 uppercase tracking-widest mb-2">{t.booking.ticketCode}</p>
                            <p className="font-mono text-3xl sm:text-4xl font-bold text-accent tracking-[6px]">{ticketCode}</p>
                        </div>

                        <p className="text-sm text-stone-500 mt-6 mb-6">{t.booking.ticketMsg}</p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition font-medium">
                                <span className="material-icons-outlined text-lg">print</span>
                                {t.booking.print}
                            </button>
                            <button onClick={() => { setStep(1); setTicketCode(''); setAdults(1); setChildren(0); setSeniors(0); setGuestServices({}); setSelectedDate(null); setSelectedSlot(''); setName(''); setEmail(''); setPhone(''); }}
                                className="flex-1 flex items-center justify-center gap-2 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 py-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition font-medium">
                                <span className="material-icons-outlined text-lg">add</span>
                                {t.booking.newBooking}
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══ Navigation ═══ */}
                {step < 4 && (
                    <div className="mt-6">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                                <span className="material-icons-outlined text-lg">warning</span>
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            {step > 1 && (
                                <button onClick={() => { setStep(s => s - 1); setError(''); }}
                                    className="flex items-center justify-center gap-1 px-6 py-3 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition font-medium">
                                    <span className="material-icons-outlined text-lg">chevron_left</span>
                                    {t.booking.prev}
                                </button>
                            )}
                            <button
                                onClick={step === 3 ? handleConfirm : () => setStep(s => s + 1)}
                                disabled={!canGoNext() || loading}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>{t.booking.processing}</>
                                ) : step === 3 ? (
                                    <><span className="material-icons-outlined text-lg">confirmation_number</span>{t.booking.confirm}</>
                                ) : (
                                    <>{t.booking.next}<span className="material-icons-outlined text-lg">chevron_right</span></>
                                )}
                            </button>
                        </div>

                        <p className="text-center text-xs text-stone-400 mt-4">{t.booking.disclaimer}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Booking;