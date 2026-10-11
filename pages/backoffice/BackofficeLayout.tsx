import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import {
    LayoutDashboard, CalendarCheck, Image, Settings, Tag,
    LogOut, Menu, X, Leaf, ChevronRight, Wrench
} from 'lucide-react';

const navItems = [
    { to: '/backoffice/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/backoffice/bookings', icon: CalendarCheck, label: 'Reservas' },
    { to: '/backoffice/services', icon: Wrench, label: 'Servicios' },
    { to: '/backoffice/images', icon: Image, label: 'Imágenes' },
    { to: '/backoffice/prices', icon: Tag, label: 'Precios' },
    { to: '/backoffice/settings', icon: Settings, label: 'Configuración' },
];

const BackofficeLayout: React.FC = () => {
    const { user, signOut } = useSupabaseAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/backoffice/login');
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3be3d2]/10 border border-[#3be3d2]/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Leaf className="w-5 h-5 text-[#3be3d2]" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm leading-tight">Cantar de la Tierra</p>
                        <p className="text-[#3be3d2] text-xs">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                ? 'bg-[#3be3d2] text-[#11211f] shadow-lg shadow-[#3be3d2]/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span className="flex-1">{label}</span>
                                {isActive && <ChevronRight className="w-4 h-4" />}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User & Logout */}
            <div className="p-4 border-t border-white/10">
                <div className="bg-white/5 rounded-xl p-3 mb-3">
                    <p className="text-white text-xs font-medium truncate">{user?.email}</p>
                    <p className="text-gray-500 text-xs">Administrador</p>
                </div>
                <button
                    id="backoffice-logout-btn"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0d1a18] flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-[#11211f] border-r border-white/5 flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#11211f] border-r border-white/5 flex flex-col">
                        <div className="flex justify-end p-4">
                            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white p-2">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center gap-4 p-4 bg-[#11211f] border-b border-white/5 sticky top-0 z-40">
                    <button
                        id="mobile-menu-btn"
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-[#3be3d2]" />
                        <span className="text-white font-bold text-sm">Admin Panel</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default BackofficeLayout;
