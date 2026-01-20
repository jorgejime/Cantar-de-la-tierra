import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const timeSlots = [
    "09:00", "10:00", "11:00", "12:30", "14:00", "16:00", "17:30"
];

const Booking: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useLanguage();
    const [selectedDate, setSelectedDate] = useState<number | null>(5);
    const [selectedTime, setSelectedTime] = useState<string | null>("10:00");
    const [selectedService, setSelectedService] = useState<string>('massage');

    // Reconstruct services array to use current language
    const services = [
        {
            id: 'circuit',
            name: t.booking.servicesList.circuit.name,
            price: 180000,
            duration: '90 min',
            description: t.booking.servicesList.circuit.desc,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBh-fRSMAHnStCzQH_dtVcY7CZpSR8e6hsg7VSxhjx1M9hJmtTaYTKEQDh8bJz7kF0-oI-nuIppsF9g6IoVKQfrDeSRvp9yO-yklVyMNIiqj3ZFoOrEbTPVfEyEN2U798_OIt5e__KwxJGgHchcGOH4w5PVNKXWVF8A8LvvN-dDIMvXAujxwZ1z2zNMKQS3BRjBAJZReZfaHBNqh_Sm7NQryT6F1fBDWHQhNgU3Jpoz3oJdw5ytRnjkIG2wlSfGPJM0dBBDvd8FudQ'
        },
        {
            id: 'massage',
            name: t.booking.servicesList.massage.name,
            price: 250000,
            duration: '60 min',
            description: t.booking.servicesList.massage.desc,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVK_RCEsN7lRxZLTE_pbPY3MPrlkqNICZMt35nuG0v4EIAWN2MjqQHW2xCa8XwYN3jMBtgzW32gJVhmV9siLfqQVd0eMg9KzzTvVSKSoK_LQvk3qCZhI5GX3KTSbIPUOt6rnqb0pZyx1B7GEOKw0nl_-ZuuLd54mqiltPa0TulEtCyPwr-0MyRp_zFaxrB0m-2c3zD3zh6hqxpZFWb_ED0K73kEHSY78n6t3tQfiESjvcxo9FKw65R6llV9N2PL1h5MyOnuknp_5oB'
        },
        {
            id: 'mud',
            name: t.booking.servicesList.mud.name,
            price: 150000,
            duration: '45 min',
            description: t.booking.servicesList.mud.desc,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTaUutmcpKp-Cx4N2eYOYx_5OTGqguPhotdp7Pct4cgmH8MBKQwtIJF20RYTpo7xqRU2NSwfqwtETHvUi130_j-ejLrxK40LLkmvxgLj82aIeCDLnSwhrAE1hhKIaIzZZ6PUJavI7-nnqpkv_DpRbZaFwm-QBCQOq9Rk4cSc26LvO1sPd_T9Jptcb-E8n9MUgSyLEqxQbGZLpUvPV8mUjNanm31AsqHYAli4GJfDjtxzqZ4YxsQbBm7knJ0tmojFWQ52EQ7oNQXkwV'
        }
    ];

    const currentService = services.find(s => s.id === selectedService) || services[0];
    const currentMonthName = t.booking.months[9]; // Octubre

    const generateCalendarDays = () => {
        const days = [];
        // Empty slots for start of month
        for(let i = 0; i < 3; i++) days.push(<div key={`empty-${i}`} className="h-10 sm:h-12"></div>);
        // Days
        for(let i = 1; i <= 15; i++) {
            const isSelected = i === selectedDate;
            const isDisabled = i === 1; // Example disabled day
            days.push(
                <button
                    key={i}
                    onClick={() => !isDisabled && setSelectedDate(i)}
                    disabled={isDisabled}
                    className={`h-10 sm:h-12 w-full flex items-center justify-center rounded-lg text-sm font-body transition-all duration-300 relative
                        ${isDisabled ? 'text-stone-300 dark:text-stone-600 cursor-not-allowed' : 'hover:bg-stone-100 dark:hover:bg-stone-700'}
                        ${isSelected ? 'font-bold text-white' : 'text-stone-800 dark:text-stone-200'}
                    `}
                >
                    {isSelected && (
                        <div className="absolute inset-0 bg-primary rounded-lg shadow-md -z-10 transform scale-105"></div>
                    )}
                    {i}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="pt-28 pb-12 max-w-[1120px] mx-auto px-4 sm:px-6">
            <div className="mb-10 animate-fadeIn">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors mb-6 text-sm font-bold tracking-widest uppercase"
                >
                    <span className="material-icons-outlined text-sm">arrow_back</span>
                    {t.booking.back}
                </button>
                <h2 className="text-3xl md:text-5xl font-display text-stone-800 dark:text-stone-100 mb-4 leading-tight">
                    {t.booking.title} <span className="italic text-primary">{t.booking.titleHighlight}</span>
                </h2>
                <p className="text-text-muted-light dark:text-text-muted-dark text-lg max-w-2xl font-body font-light">
                    {t.booking.desc}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                <div className="lg:col-span-7 space-y-10">
                    {/* Calendar Section */}
                    <section className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-xl border border-stone-100 dark:border-stone-800">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                            <h3 className="text-2xl font-display font-medium text-stone-800 dark:text-stone-100 flex items-center gap-3">
                                <span className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold font-body">1</span>
                                {t.booking.step1}
                            </h3>
                            <div className="flex gap-2 text-stone-600 dark:text-stone-300 self-end sm:self-auto">
                                <button className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition">
                                    <span className="material-icons-outlined">chevron_left</span>
                                </button>
                                <span className="text-lg font-bold self-center px-2 font-display">{currentMonthName} 2023</span>
                                <button className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition">
                                    <span className="material-icons-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                            {t.booking.daysShort.map(day => (
                                <div key={day} className="text-center text-xs font-bold text-stone-400 uppercase py-2 tracking-wider">{day}</div>
                            ))}
                            {generateCalendarDays()}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-body text-stone-500 mt-4 pl-1">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary"></div> {t.booking.selected}</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-stone-200 dark:bg-stone-700"></div> {t.booking.available}</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-dashed border-stone-300"></div> {t.booking.occupied}</div>
                        </div>
                    </section>

                    {/* Time Selection */}
                    <section>
                        <h3 className="text-2xl font-display font-medium text-stone-800 dark:text-stone-100 flex items-center gap-3 mb-6">
                            <span className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold font-body">2</span>
                            {t.booking.step2}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {timeSlots.map(time => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`py-3 px-4 rounded-xl font-body text-sm transition-all duration-200 border
                                        ${selectedTime === time 
                                            ? 'bg-primary text-white border-primary shadow-lg transform scale-105 font-bold' 
                                            : 'border-stone-200 dark:border-stone-700 hover:border-primary text-stone-600 dark:text-stone-300 hover:text-primary'
                                        }`}
                                >
                                    {time}
                                </button>
                            ))}
                            <button className="py-3 px-4 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 text-stone-300 dark:text-stone-600 font-body text-sm cursor-not-allowed">
                                19:00
                            </button>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Service Selection */}
                    <section>
                        <h3 className="text-2xl font-display font-medium text-stone-800 dark:text-stone-100 flex items-center gap-3 mb-6">
                            <span className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold font-body">3</span>
                            {t.booking.step3}
                        </h3>
                        <div className="space-y-4">
                            {services.map(service => (
                                <label 
                                    key={service.id}
                                    className={`relative flex items-center gap-4 p-4 rounded-2xl border cursor-pointer bg-white dark:bg-surface-dark transition-all duration-300 group
                                        ${selectedService === service.id 
                                            ? 'border-primary shadow-lg ring-1 ring-primary/20' 
                                            : 'border-stone-200 dark:border-stone-700 hover:shadow-md'
                                        }`}
                                >
                                    <input 
                                        type="radio" 
                                        name="service" 
                                        className="sr-only" 
                                        checked={selectedService === service.id}
                                        onChange={() => setSelectedService(service.id)}
                                    />
                                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                                        <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-base sm:text-lg text-stone-800 dark:text-stone-100 font-display">{service.name}</h4>
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                                            <span className="text-xs sm:text-sm text-stone-500 leading-snug font-body line-clamp-2 pr-2">{service.description}</span>
                                            <span className="font-body font-bold text-primary text-sm whitespace-nowrap">
                                                ${(service.price / 1000).toFixed(0)}.000
                                            </span>
                                        </div>
                                    </div>
                                    {selectedService === service.id && (
                                        <div className="absolute top-[-8px] right-[-8px] w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                                            <span className="material-icons-outlined text-sm font-bold">check</span>
                                        </div>
                                    )}
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Summary & Form */}
                    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl p-6 sm:p-8 border border-stone-100 dark:border-stone-800 sticky top-24">
                        <h3 className="text-xl font-medium font-display text-stone-800 dark:text-stone-100 mb-6">{t.booking.personalData}</h3>
                        <form className="space-y-4 mb-8" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 font-body">{t.booking.name}</label>
                                <input className="w-full bg-stone-50 dark:bg-background-dark border-0 border-b-2 border-stone-200 dark:border-stone-700 focus:border-primary focus:ring-0 px-0 py-2 transition-colors font-body text-stone-800 dark:text-stone-100" placeholder="Ej: María García" type="text"/>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 font-body">{t.booking.email}</label>
                                    <input className="w-full bg-stone-50 dark:bg-background-dark border-0 border-b-2 border-stone-200 dark:border-stone-700 focus:border-primary focus:ring-0 px-0 py-2 transition-colors font-body text-stone-800 dark:text-stone-100" placeholder="email@example.com" type="email"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 font-body">{t.booking.phone}</label>
                                    <input className="w-full bg-stone-50 dark:bg-background-dark border-0 border-b-2 border-stone-200 dark:border-stone-700 focus:border-primary focus:ring-0 px-0 py-2 transition-colors font-body text-stone-800 dark:text-stone-100" placeholder="+57 300 000" type="tel"/>
                                </div>
                            </div>
                        </form>
                        
                        <div className="border-t border-dashed border-stone-300 dark:border-stone-700 my-6"></div>
                        
                        <div className="space-y-3 font-body text-sm">
                            <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
                                <span className="flex items-center gap-2"><span className="material-icons-outlined text-lg">calendar_today</span> {t.booking.date}</span>
                                <span className="text-stone-800 dark:text-stone-100 font-medium">{selectedDate} {currentMonthName}, 2023</span>
                            </div>
                            <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
                                <span className="flex items-center gap-2"><span className="material-icons-outlined text-lg">schedule</span> {t.booking.time}</span>
                                <span className="text-stone-800 dark:text-stone-100 font-medium">{selectedTime}</span>
                            </div>
                            <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
                                <span className="flex items-center gap-2"><span className="material-icons-outlined text-lg">spa</span> {t.booking.service}</span>
                                <span className="text-stone-800 dark:text-stone-100 font-medium text-right max-w-[150px] truncate">{currentService.name}</span>
                            </div>
                        </div>

                        <div className="border-t border-stone-200 dark:border-stone-700 mt-6 pt-4 mb-6">
                            <div className="flex justify-between items-end">
                                <span className="text-stone-500 font-body font-medium">{t.booking.total}</span>
                                <span className="text-3xl font-bold text-primary font-display leading-none">
                                    ${(currentService.price / 1000).toFixed(0)}.000 <span className="text-sm font-normal text-stone-400">COP</span>
                                </span>
                            </div>
                        </div>

                        <button className="w-full bg-primary hover:bg-opacity-90 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 group tracking-widest uppercase text-xs">
                            {t.booking.confirm}
                            <span className="material-icons-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                        <p className="text-center text-xs text-stone-400 mt-4 font-body">
                            {t.booking.disclaimer}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;