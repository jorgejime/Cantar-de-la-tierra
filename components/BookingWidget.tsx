import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Users, Sparkles, Calendar, Clock, User, CheckCircle,
  ChevronLeft, ChevronRight, Printer, Plus, Minus, X, Ticket
} from 'lucide-react';

/* ── Types ───────────────────────────────────────────── */
interface ServiceItem { id: string; name_es: string; price_adult: number; price_child: number; category: string }
interface SlotInfo { time_slot: string; booked_count: number; max_capacity: number }

/* ── Helpers ─────────────────────────────────────────── */
const formatCOP = (n: number) =>
  '$' + new Intl.NumberFormat('es-CO').format(n) + ' COP';

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/* ── Counter UI ─────────────────────────────────────────── */
const Counter = ({
  label, sublabel, value, onChange, min = 0
}: { label: string; sublabel?: string; value: number; onChange: (v: number) => void; min?: number }) => (
  <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
    <div>
      <p className="font-medium text-white text-base font-body">{label}</p>
      {sublabel && <p className="text-xs text-white/40 mt-0.5 font-body">{sublabel}</p>}
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-primary hover:text-primary transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-8 text-center font-bold text-xl text-white font-body">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-9 h-9 rounded-full border border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

/* ── Step Indicator ──────────────────────────────────── */
const StepBar = ({ step }: { step: number }) => {
  const steps = ['Fecha & Visita', 'Experiencia', 'Confirmar', 'Ticket'];
  return (
    <div className="flex items-center gap-1 mb-6">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`flex items-center gap-1.5 text-xs font-semibold transition-all font-body ${i + 1 === step ? 'text-primary' : i + 1 < step ? 'text-primary/60' : 'text-white/30'
            }`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i + 1 === step ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : i + 1 < step ? 'bg-primary/20 text-primary'
                : 'bg-white/5 text-white/30'
              }`}>
              {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className="hidden sm:inline">{s}</span>
          </div>
          {i < 3 && <div className={`flex-1 h-px ${i + 1 < step ? 'bg-primary/40' : 'bg-white/10'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ── Main Component ──────────────────────────────────── */
const BookingWidget: React.FC = () => {
  /* State */
  const [step, setStep] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [seniors, setSeniors] = useState(0);
  const [dbServices, setDbServices] = useState<ServiceItem[]>([]);
  
  // Nuevo estado para la lógica simplificada
  const [selectedPlanId, setSelectedPlanId] = useState<string>(''); // El plan principal para el grupo
  const [addonCounts, setAddonCounts] = useState<Record<string, number>>({}); // Solo para categorías 'addon' o extras
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ticketCode, setTicketCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  /* Leer query params del Home (QuickBookingBar) */
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const qDate = searchParams.get('date');
    const qSlot = searchParams.get('slot');
    const qAdults = searchParams.get('adults');
    const qChildren = searchParams.get('children');
    const qExperience = searchParams.get('experience');
    
    if (qDate) {
      const d = new Date(qDate + 'T12:00:00');
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
        setCalMonth(d.getMonth());
        setCalYear(d.getFullYear());
      }
    }
    if (qSlot) setSelectedSlot(qSlot);
    if (qAdults) setAdults(Math.max(1, parseInt(qAdults) || 1));
    if (qChildren) setChildren(Math.max(0, parseInt(qChildren) || 0));
    if (qExperience) setSelectedPlanId(qExperience);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalGuests = adults + children + seniors;

  /* Load services & logo */
  useEffect(() => {
    supabase.from('services').select('id, name_es, price_adult, price_child, category')
      .eq('is_active', true).order('sort_order')
      .then(({ data }) => {
        if (data) {
          const normalized = data.map(s => ({ 
            ...s, 
            price_adult: Number(s.price_adult),
            price_child: Number(s.price_child || s.price_adult) // Fallback al de adulto si no hay de niño
          }));
          setDbServices(normalized as ServiceItem[]);
        }
      });

    supabase.from('site_config').select('value').eq('key', 'logo_url').single()
      .then(({ data }) => { if (data?.value) setLogoUrl(data.value); });
  }, []);

  /* Load slots when date changes */
  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    supabase.from('daily_capacity')
      .select('time_slot, booked_count, max_capacity')
      .eq('booking_date', dateStr).order('time_slot')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSlots(data as SlotInfo[]);
        } else {
          setSlots(['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'].map(ts => ({
            time_slot: ts, booked_count: 0, max_capacity: 30
          })));
        }
      });
    setSelectedSlot('');
  }, [selectedDate]);

  /* Derived services */
  const mainServices = dbServices.filter(s => s.category === 'main');
  const addOnServices = dbServices.filter(s => s.category === 'addon');

  // Auto-seleccionar el primer plan disponible si no hay uno
  useEffect(() => {
    if (mainServices.length > 0 && !selectedPlanId) {
      setSelectedPlanId(mainServices[0].id);
    }
  }, [mainServices, selectedPlanId]);

  const calcTotal = () => {
    let total = 0;
    
    // 1. Sumar el plan base para todos los asistentes con distinción de edad
    const basePlan = dbServices.find(s => s.id === selectedPlanId);
    if (basePlan) {
      const isCouplePlan = basePlan.name_es.toLowerCase().includes('pareja');
      
      if (isCouplePlan) {
        // En plan pareja usualmente se cobra por pack de 2
        total += basePlan.price_adult * Math.ceil(totalGuests / 2);
      } else {
        // Cobro diferenciado: Adultos + Seniors (como adultos) y Niños
        total += (basePlan.price_adult * (adults + seniors));
        total += (basePlan.price_child * children);
      }
    }

    // 2. Sumar los complementos seleccionados
    Object.entries(addonCounts).forEach(([id, c]) => {
      const count = c as number;
      const svc = dbServices.find(s => s.id === id);
      if (svc) {
        total += svc.price_adult * count;
      }
    });

    return total;
  };

  /* Calendar logic */
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
        <button key={d} disabled={isPast} onClick={() => setSelectedDate(date)}
          className={`aspect-square rounded-lg text-sm font-medium transition-all font-body
            ${isPast ? 'text-white/20 cursor-not-allowed' : 'hover:bg-primary/10 cursor-pointer'}
            ${isSelected ? 'bg-primary text-white font-bold shadow-lg shadow-primary/30' : 'text-white/60'}`}>
          {d}
        </button>
      );
    }
    return cells;
  };

  const goPrevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const goNextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  /* Validation */
  const canGoNext = () => {
    if (step === 1) return selectedDate && selectedSlot && totalGuests > 0;
    if (step === 2) return true; // Siempre puedes saltar a confirmar aunque no haya adiciones
    if (step === 3) return name.trim().length > 2 && phone.trim().length > 6;
    return false;
  };

  /* Confirm booking */
  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot) return;
    setLoading(true); setError('');
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // Transformar cantidades al formato esperado por el backend
    const servicesData: any[] = [];
    
    // 1. Agregar el plan base para cada asistente (o pack) diferenciado por precio
    const basePlan = dbServices.find(s => s.id === selectedPlanId);
    if (basePlan) {
      const isCouplePlan = basePlan.name_es.toLowerCase().includes('pareja');
      
      if (isCouplePlan) {
        const qty = Math.ceil(totalGuests / 2);
        for (let i = 0; i < qty; i++) {
          servicesData.push({ guestIndex: 0, serviceId: basePlan.id, serviceName: basePlan.name_es, price: basePlan.price_adult });
        }
      } else {
        // Adultos y Seniors
        for (let i = 0; i < (adults + seniors); i++) {
          servicesData.push({ guestIndex: 0, serviceId: basePlan.id, serviceName: `${basePlan.name_es} (Adulto)`, price: basePlan.price_adult });
        }
        // Niños
        for (let i = 0; i < children; i++) {
          servicesData.push({ guestIndex: 0, serviceId: basePlan.id, serviceName: `${basePlan.name_es} (Niño)`, price: basePlan.price_child });
        }
      }
    }

    // 2. Agregar los addons
    Object.entries(addonCounts).forEach(([id, c]) => {
      const count = c as number;
      const svc = dbServices.find(s => s.id === id);
      if (svc && count > 0) {
        for (let i = 0; i < count; i++) {
          servicesData.push({
            guestIndex: 0,
            serviceId: svc.id,
            serviceName: svc.name_es,
            price: svc.price_adult
          });
        }
      }
    });

    try {
      const { data, error: rpcError } = await supabase.rpc('create_booking', {
        p_user_name: name,
        p_user_email: '',
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
      const result = data as { success: boolean; ticket_code?: string; error?: string; available?: number };
      if (result.success && result.ticket_code) {
        setTicketCode(result.ticket_code);
        setStep(4);
      } else if (result.error === 'NO_AVAILABILITY') {
        setError(`Sin disponibilidad. Quedan ${result.available} cupos en este horario.`);
      } else {
        setError('Ocurrió un error. Por favor intenta de nuevo.');
      }
    } catch {
      setError('Error de conexión. Por favor intenta de nuevo.');
    }
    setLoading(false);
  };

  /* Print ticket */
  const handlePrint = () => {
    if (!ticketRef.current) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Ticket ${ticketCode}</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Lato',sans-serif;background:#fff;padding:40px;max-width:480px;margin:0 auto}
        .logo-wrap{text-align:center;margin-bottom:24px}
        .logo{max-height:80px;max-width:200px;object-fit:contain}
        .logo-text{font-family:'Playfair Display',serif;font-size:22px;color:#11211f;text-align:center}
        .divider{border:none;border-top:2px dashed #3F606A;margin:20px 0}
        .ticket-code{font-family:'Playfair Display',serif;font-size:36px;font-weight:700;text-align:center;
          letter-spacing:6px;color:#8C6145;padding:16px;border:2px dashed #8C6145;border-radius:12px;margin:20px 0}
        .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px}
        .row span:first-child{color:#666}
        .row span:last-child{font-weight:600;color:#11211f}
        .services-list{margin-top:6px;padding-left:0;list-style:none}
        .services-list li{display:flex;justify-content:space-between;font-size:13px;color:#555;padding:4px 0 4px 12px;border-left:3px solid #3F606A;margin-bottom:4px}
        .total{display:flex;justify-content:space-between;padding:12px 0;font-size:18px;font-weight:700;color:#11211f;margin-top:8px}
        .footer{text-align:center;color:#888;font-size:12px;margin-top:24px;padding-top:16px;border-top:2px solid #11211f}
        @media print{body{padding:20px}}
      </style></head><body>`);
    w.document.write(`
      <div class="logo-wrap">
        ${logoUrl ? `<img src="${logoUrl}" alt="Cantar de la Tierra" class="logo">` : '<p class="logo-text">CANTAR DE LA TIERRA</p>'}
      </div>
      <hr class="divider">
      <div class="ticket-code">${ticketCode}</div>
      <hr class="divider">
      <div class="row"><span>Nombre</span><span>${name}</span></div>
      <div class="row"><span>Teléfono</span><span>${phone}</span></div>
      <div class="row"><span>Fecha</span><span>${selectedDate?.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
      <div class="row"><span>Horario</span><span>${selectedSlot}</span></div>
      <div class="row"><span>Adultos</span><span>${adults}</span></div>
      ${children > 0 ? `<div class="row"><span>Niños</span><span>${children}</span></div>` : ''}
      ${seniors > 0 ? `<div class="row"><span>Adultos Mayores</span><span>${seniors}</span></div>` : ''}
      ${calcTotal() > 0 ? `
        <div class="row" style="flex-direction:column;align-items:flex-start">
          <span style="margin-bottom:6px">Tu Experiencia Seleccionada</span>
          <ul class="services-list" style="width:100%">
            ${(() => {
              const basePlan = dbServices.find(s => s.id === selectedPlanId);
              if (!basePlan) return '';
              const isCouplePlan = basePlan.name_es.toLowerCase().includes('pareja');
              if (isCouplePlan) {
                return `<li><span>Plan: ${basePlan.name_es}</span> <span>${formatCOP(basePlan.price_adult * Math.ceil(totalGuests/2))}</span></li>`;
              }
              let html = '';
              if (adults + seniors > 0) html += `<li><span>${adults + seniors}x ${basePlan.name_es} (Adultos)</span> <span>${formatCOP(basePlan.price_adult * (adults + seniors))}</span></li>`;
              if (children > 0) html += `<li><span>${children}x ${basePlan.name_es} (Niños)</span> <span>${formatCOP(basePlan.price_child * children)}</span></li>`;
              return html;
            })()}
            ${Object.entries(addonCounts).map(([id, c]) => {
              const count = c as number;
              const svc = dbServices.find(s => s.id === id);
              if (!svc || count === 0) return '';
              return `<li><span>${count}x ${svc.name_es}</span> <span>${formatCOP(svc.price_adult * count)}</span></li>`;
            }).join('')}
          </ul>
        </div>` : ''}
      <div class="total"><span>TOTAL ESTIMADO</span><span>${formatCOP(calcTotal())}</span></div>
      <hr class="divider">
      <div class="footer">
        <p>Presenta este ticket en la recepción · Pago presencial</p>
        <p>Neira, Caldas, Colombia · +57 310 502 6547</p>
      </div>
    `);
    w.document.write('</body></html>');
    w.document.close();
    setTimeout(() => w.print(), 600);
  };

  /* Reset */
  const handleReset = () => {
    setStep(1); setAdults(1); setChildren(0); setSeniors(0);
    setAddonCounts({}); setSelectedPlanId(dbServices.find(s => s.category === 'main')?.id || '');
    setSelectedDate(null); setSelectedSlot('');
    setName(''); setPhone(''); setTicketCode(''); setError('');
  };

  /* ── Render ────────────────────────────────────────── */
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-sand uppercase tracking-[0.3em] text-xs font-bold block mb-2 font-body">Reserva tu visita</span>
        <h2 className="text-3xl md:text-4xl font-display font-light text-white">
          Planifica tu <span className="italic text-sand">experiencia</span>
        </h2>
      </div>

      {/* Step bar */}
      {step < 4 && <StepBar step={step} />}

      {/* Main Card */}
      <div className="bg-surface-dark/95 backdrop-blur-md border border-primary/20 rounded-2xl overflow-hidden shadow-2xl">

        {/* ═══ STEP 1: Cuándo y Quiénes ═══ */}
        {step === 1 && (
          <div className="p-6 md:p-8 space-y-8">
            
            {/* Sección Calendario */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-display text-white">1. ¿Cuándo nos visitas?</h3>
              </div>

              <div className="bg-background-dark/30 border border-white/5 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={goPrevMonth}
                    className="p-2 hover:bg-white/5 rounded-full transition text-white/60 hover:text-white">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="font-display text-white font-medium uppercase tracking-wide">
                    {MONTHS_ES[calMonth]} {calYear}
                  </span>
                  <button onClick={goNextMonth}
                    className="p-2 hover:bg-white/5 rounded-full transition text-white/60 hover:text-white">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS_ES.map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-white/40 uppercase font-body">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>
              </div>
            </div>

            {/* Horarios (visible cuando hay fecha) */}
            {selectedDate && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/10 p-2.5 rounded-xl">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-display text-white">2. Selecciona tu horario</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {slots.map(slot => {
                    const avail = slot.max_capacity - slot.booked_count;
                    const isFull = avail < totalGuests;
                    const isSel = selectedSlot === slot.time_slot;
                    return (
                      <button key={slot.time_slot} disabled={isFull}
                        onClick={() => setSelectedSlot(slot.time_slot)}
                        className={`p-3 rounded-xl text-center border transition-all font-body ${isFull ? 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                          : isSel ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-background-dark/30 border-white/10 hover:border-primary/50 text-white/80'
                          }`}>
                        <span className="block font-bold text-sm tracking-wide">{slot.time_slot}</span>
                        <span className={`text-[10px] ${isFull ? 'text-white/20' : isSel ? 'text-white/90' : 'text-primary/70'}`}>
                          {isFull ? 'Lleno' : `${avail} cupos`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Asistentes */}
            {selectedSlot && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/10 p-2.5 rounded-xl">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-display text-white">3. ¿Quiénes asisten?</h3>
                </div>
                <div className="bg-background-dark/30 border border-white/5 p-2 rounded-xl">
                  <div className="px-4"><Counter label="Adultos" sublabel="Desde 18 años" value={adults} onChange={setAdults} min={1} /></div>
                  <div className="px-4"><Counter label="Niños" sublabel="4 a 12 años" value={children} onChange={setChildren} /></div>
                  <div className="px-4"><Counter label="Mayores" sublabel="60+ años" value={seniors} onChange={setSeniors} /></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ STEP 2: Experiencia y Servicios ═══ */}
        {step === 2 && (
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-display text-white">Construye tu Experiencia</h3>
            </div>
            <p className="text-white/50 text-sm mb-8 font-body">
              Agrega los planes, accesos o terapias que deseen tomar durante la visita. Para evitar cobros duplicados, selecciona exactamente lo que tu grupo consumirá.
            </p>

            <div className="space-y-8 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Sección Principal (Un solo plan para todos) */}
              <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest font-body mb-4">Elige tu Plan Base</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mainServices.map(svc => (
                    <button 
                      key={svc.id} 
                      onClick={() => setSelectedPlanId(svc.id)}
                      className={`relative overflow-hidden p-4 rounded-2xl border text-left transition-all ${
                        selectedPlanId === svc.id 
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20 ring-1 ring-primary/30' 
                        : 'border-white/5 bg-background-dark/30 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${selectedPlanId === svc.id ? 'text-primary' : 'text-white/40'}`}>
                          Plan
                        </span>
                        {selectedPlanId === svc.id && <CheckCircle className="w-4 h-4 text-primary" />}
                      </div>
                      <p className="font-display text-white text-base leading-tight mb-2">{svc.name_es}</p>
                      <p className="text-xs font-bold text-primary">{formatCOP(svc.price_adult)} <span className="text-[10px] text-white/30 font-normal uppercase italic tracking-tighter">por persona</span></p>
                      
                      {selectedPlanId === svc.id && (
                        <div className="mt-3 pt-3 border-t border-primary/20 animate-fade-in">
                          <p className="text-[10px] text-primary/80 font-body uppercase font-bold tracking-widest">Calculado para:</p>
                          <p className="text-xs text-white/60 font-body">
                            {totalGuests} Persona{totalGuests !== 1 ? 's' : ''} {svc.name_es.toLowerCase().includes('pareja') ? '( Pack Pareja )' : ''}
                          </p>
                        </div>
                      )}
                    </button>
                  ))}
                  {mainServices.length === 0 && <p className="text-white/40 text-xs py-2 italic">Sin planes configurados.</p>}
                </div>
              </div>

              {/* Sección Complementos (Terapias) */}
              <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest font-body mb-4">Complementa tu visita (Extras)</h4>
                <div className="space-y-3">
                  {addOnServices.map(svc => (
                    <div key={svc.id} className="bg-background-dark/40 border border-white/5 rounded-xl px-4 flex items-center justify-between">
                      <div className="py-4">
                        <p className="font-medium text-white text-sm font-body">{svc.name_es}</p>
                        <p className="text-xs text-primary/80 mt-1 font-body font-bold">+{formatCOP(svc.price_adult)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setAddonCounts(prev => ({ ...prev, [svc.id]: Math.max(0, (prev[svc.id] || 0) - 1)}))}
                          className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-4 text-center font-bold text-lg text-white font-body">{addonCounts[svc.id] || 0}</span>
                        <button onClick={() => setAddonCounts(prev => ({ ...prev, [svc.id]: (prev[svc.id] || 0) + 1}))}
                          className="w-8 h-8 rounded-full border border-primary flex items-center justify-center text-primary transition">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {addOnServices.length === 0 && <p className="text-white/40 text-xs py-2 italic">Sin complementos configurados.</p>}
                </div>
              </div>
            </div>

            {/* Floating Summary in Step */}
            <div className="mt-6 p-4 bg-background-dark/80 backdrop-blur-md border border-primary/20 rounded-xl flex items-center justify-between sticky bottom-0 z-10">
              <div>
                <span className="block text-white/60 text-xs uppercase tracking-wider font-body mb-1">Total del Carrito</span>
                <span className="font-bold text-white text-xl font-display">{formatCOP(calcTotal())}</span>
              </div>
              <div className="text-right">
                <span className="block text-xs text-primary font-bold font-body">{totalGuests} Personas + {(Object.values(addonCounts) as number[]).reduce((a, b) => a + b, 0)} Extras</span>
              </div>
            </div>

          </div>
        )}

        {/* ═══ STEP 3: Datos de Reserva ═══ */}
        {step === 3 && (
          <div className="p-6 md:p-8 space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-display text-white">Verifica y Confirma</h3>
            </div>
            
            <div className="bg-background-dark/40 border border-white/5 rounded-2xl p-6">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 font-body">Datos de Contacto</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1.5 ml-1 font-body uppercase tracking-wider">Nombre Completo</label>
                  <input type="text" placeholder="Ej. Camila Rodríguez" value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-dark/50 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition text-sm font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1.5 ml-1 font-body uppercase tracking-wider">Teléfono / WhatsApp</label>
                  <input type="tel" placeholder="Ej. 310 123 4567" value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-dark/50 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition text-sm font-body"
                  />
                </div>
              </div>
            </div>

            {/* Resumen Final */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 font-body">Resumen de Visita</h4>
              <div className="space-y-3 text-sm font-body">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Fecha y Hora</span>
                  <span className="text-white font-medium text-right">
                    {selectedDate?.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })} <br/>
                    <span className="text-primary">{selectedSlot}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-y border-white/5">
                  <span className="text-white/60">Asistentes</span>
                  <span className="text-white font-medium">{totalGuests} persona{totalGuests !== 1 ? 's' : ''}</span>
                </div>

                <div className="pt-2">
                  <span className="text-white/60 block mb-2">Detalle de tu Plan:</span>
                  <ul className="space-y-1.5">
                    {/* Base Plan */}
                    {dbServices.find(s => s.id === selectedPlanId) && (() => {
                      const bp = dbServices.find(s => s.id === selectedPlanId)!;
                      const isCouple = bp.name_es.toLowerCase().includes('pareja');
                      
                      if (isCouple) {
                        return (
                          <li className="flex justify-between text-white/80 text-xs bg-primary/10 p-2 rounded-lg border border-primary/20">
                            <span className="font-medium text-primary">● {bp.name_es} (Pack)</span>
                            <span className="font-bold">{formatCOP(bp.price_adult * Math.ceil(totalGuests / 2))}</span>
                          </li>
                        );
                      }
                      
                      return (
                        <>
                          {(adults + seniors > 0) && (
                            <li className="flex justify-between text-white/80 text-xs bg-primary/10 p-2 rounded-lg border border-primary/20 mb-1">
                              <span className="font-medium text-primary">● {bp.name_es} (Adultos) x{adults + seniors}</span>
                              <span className="font-bold">{formatCOP(bp.price_adult * (adults + seniors))}</span>
                            </li>
                          )}
                          {(children > 0) && (
                            <li className="flex justify-between text-white/80 text-xs bg-primary/10 p-2 rounded-lg border border-primary/20">
                              <span className="font-medium text-primary">● {bp.name_es} (Niños) x{children}</span>
                              <span className="font-bold">{formatCOP(bp.price_child * children)}</span>
                            </li>
                          )}
                        </>
                      );
                    })()}
                    
                    {/* Addons */}
                    {(Object.values(addonCounts) as number[]).reduce((a,b)=>a+b,0) > 0 && 
                      Object.entries(addonCounts).map(([id, c]) => {
                        const count = c as number;
                        if (count === 0) return null;
                        const svc = dbServices.find(s => s.id === id);
                        return svc ? (
                          <li key={id} className="flex justify-between text-white/80 text-xs bg-black/20 p-2 rounded-lg">
                            <span>{count}x {svc.name_es}</span>
                            <span className="font-bold">{formatCOP(svc.price_adult * count)}</span>
                          </li>
                        ) : null;
                      })
                    }
                  </ul>
                </div>
                
                <div className="flex justify-between pt-4 mt-2 border-t border-primary/20 items-end">
                  <span className="text-white">Pagas al ingresar</span>
                  <span className="font-bold text-primary text-2xl font-display">{formatCOP(calcTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 4: Ticket ═══ */}
        {step === 4 && (
          <div className="p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-display text-white mb-1">¡Reserva confirmada!</h3>
              <p className="text-white/40 text-sm font-body">Te esperamos en Cantar de la Tierra</p>
            </div>

            {/* Ticket visual */}
            <div className="border border-white/10 rounded-2xl p-1 mb-6 bg-background-dark shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
              <div className="p-6">
                <div className="text-center mb-6 border-b border-dashed border-white/10 pb-6">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Cantar de la Tierra" className="h-10 w-auto object-contain mx-auto mb-4 opacity-80" />
                  ) : (
                    <p className="font-display text-white/80 text-lg mb-4">CANTAR DE LA TIERRA</p>
                  )}
                  <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-body mb-2">Código de Ingreso</p>
                  <p className="font-mono text-3xl font-bold text-accent tracking-widest">{ticketCode}</p>
                </div>

                <div ref={ticketRef} className="hidden">{/* Para impresión */}</div>

                <div className="space-y-3 text-sm font-body">
                  <div className="flex justify-between">
                    <span className="text-white/40">Titular</span>
                    <span className="text-white font-medium truncate max-w-[60%]">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Visita</span>
                    <span className="text-white font-medium text-right">
                      {selectedDate?.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })} a las {selectedSlot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Aforo</span>
                    <span className="text-white font-medium">{totalGuests} Pax</span>
                  </div>
                  
                  <div className="pt-4 mt-2 border-t border-white/5">
                    <span className="text-white/40 block mb-2 text-xs uppercase tracking-wider">Detalle del carrito</span>
                    <ul className="space-y-1">
                      {/* Base Plan */}
                      {dbServices.find(s => s.id === selectedPlanId) && (() => {
                        const bp = dbServices.find(s => s.id === selectedPlanId)!;
                        const isCouple = bp.name_es.toLowerCase().includes('pareja');
                        if (isCouple) return (
                          <li className="flex justify-between text-white text-xs font-semibold">
                            <span>{bp.name_es}</span>
                            <span>{formatCOP(bp.price_adult * Math.ceil(totalGuests / 2))}</span>
                          </li>
                        );
                        return (
                          <>
                            {adults + seniors > 0 && (
                              <li className="flex justify-between text-white text-xs font-semibold">
                                <span>{bp.name_es} (Adultos)</span>
                                <span>{formatCOP(bp.price_adult * (adults + seniors))}</span>
                              </li>
                            )}
                            {children > 0 && (
                              <li className="flex justify-between text-white text-xs font-semibold">
                                <span>{bp.name_es} (Niños)</span>
                                <span>{formatCOP(bp.price_child * children)}</span>
                              </li>
                            )}
                          </>
                        );
                      })()}
                      {/* Addons */}
                      {Object.entries(addonCounts).map(([id, c]) => {
                        const count = c as number;
                        if (count === 0) return null;
                        const svc = dbServices.find(s => s.id === id);
                        return svc ? (
                          <li key={id} className="flex justify-between text-white/50 text-xs italic">
                            <span className="truncate pr-2">{count}x {svc.name_es}</span>
                            <span className="shrink-0">{formatCOP(svc.price_adult * count)}</span>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                  <div className="flex justify-between pt-4 mt-2 border-t border-white/10">
                    <span className="font-bold text-white">Total Estimado</span>
                    <span className="font-bold text-primary text-lg">{formatCOP(calcTotal())}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 py-3 text-center">
                <p className="text-[10px] text-white/30 uppercase tracking-widest">PAGO EN ESTABLECIMIENTO</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 font-body">
                <Printer className="w-5 h-5" />
                Imprimir o Guardar PDF
              </button>
              <button onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 bg-transparent text-white/60 hover:text-white font-medium py-3 rounded-xl transition-all font-body">
                <Plus className="w-4 h-4" />
                Hacer otra reserva
              </button>
            </div>
          </div>
        )}

        {/* ═══ Navegación (Bottom Bar) ═══ */}
        {step < 4 && (
          <div className="px-6 md:px-8 pb-6 md:pb-8 pt-2">
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm font-body">
                <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            <div className="flex gap-3">
              {step > 1 && (
                <button onClick={() => { setStep(s => s - 1); setError(''); }}
                  className="flex items-center gap-1 px-5 py-3.5 border border-white/10 text-white/60 rounded-xl hover:bg-white/5 transition font-medium font-body shrink-0">
                  <ChevronLeft className="w-4 h-4" />
                  Atrás
                </button>
              )}
              <button
                onClick={step === 3 ? handleConfirm : () => setStep(s => s + 1)}
                disabled={!canGoNext() || loading}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-xl shadow-primary/10 disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed font-body"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : step === 3 ? (
                  <><CheckCircle className="w-5 h-5" /> Confirmar Reserva</>
                ) : (
                  <>Siguiente <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingWidget;