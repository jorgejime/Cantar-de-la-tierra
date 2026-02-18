import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import SectionImagesManager from './SectionImagesManager';
import ServicesManager from './ServicesManager';
import BookingsManager from './BookingsManager';
import GalleryManager from './GalleryManager';
import SettingsManager from './SettingsManager';

type Tab = 'images' | 'services' | 'gallery' | 'bookings' | 'settings';

const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'images', label: 'Imágenes del Sitio', icon: 'photo_library' },
    { key: 'services', label: 'Servicios y Precios', icon: 'restaurant_menu' },
    { key: 'gallery', label: 'Galería', icon: 'collections' },
    { key: 'bookings', label: 'Reservas', icon: 'calendar_month' },
    { key: 'settings', label: 'Configuración', icon: 'settings' },
];

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState<Tab>('images');

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-zinc-900">
            {/* Sidebar */}
            <aside className="w-72 bg-white dark:bg-zinc-800 shadow-xl flex-col hidden md:flex border-r border-gray-200 dark:border-zinc-700">
                <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-icons-outlined text-primary">admin_panel_settings</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">Panel Admin</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Cantar de la Tierra</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 text-sm font-medium ${activeTab === tab.key
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                                }`}
                        >
                            <span className="material-icons-outlined text-xl">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-zinc-700 space-y-2">
                    <a
                        href="/"
                        target="_blank"
                        className="w-full text-left px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-3 text-sm"
                    >
                        <span className="material-icons-outlined text-lg">open_in_new</span>
                        Ver sitio web
                    </a>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-3 text-sm"
                    >
                        <span className="material-icons-outlined text-lg">logout</span>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Mobile header */}
                <div className="md:hidden sticky top-0 z-20 bg-white dark:bg-zinc-800 p-4 shadow-sm border-b border-gray-200 dark:border-zinc-700">
                    <div className="flex justify-between items-center">
                        <h1 className="text-lg font-bold text-primary dark:text-gray-100">Panel Admin</h1>
                        <div className="flex items-center gap-2">
                            <a href="/" target="_blank" className="text-gray-400 hover:text-gray-600">
                                <span className="material-icons-outlined">open_in_new</span>
                            </a>
                            <button onClick={handleLogout} className="text-red-500">
                                <span className="material-icons-outlined">logout</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab.key
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300'
                                    }`}
                            >
                                <span className="material-icons-outlined text-sm">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {activeTab === 'images' && <SectionImagesManager />}
                    {activeTab === 'services' && <ServicesManager />}
                    {activeTab === 'gallery' && <GalleryManager />}
                    {activeTab === 'bookings' && <BookingsManager />}
                    {activeTab === 'settings' && <SettingsManager />}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
