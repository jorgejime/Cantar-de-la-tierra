import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { Eye, EyeOff, Leaf, Lock, Mail, AlertCircle } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
    const { signIn } = useSupabaseAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { error } = await signIn(email, password);
        if (error) {
            setError('Credenciales incorrectas. Verifica tu email y contraseña.');
        } else {
            navigate('/backoffice/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0d1a18] via-[#11211f] to-[#1a3330] flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#3be3d2]/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#8D4E3C]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3be3d2]/10 border border-[#3be3d2]/30 rounded-2xl mb-4">
                        <Leaf className="w-8 h-8 text-[#3be3d2]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">Cantar de la Tierra</h1>
                    <p className="text-[#3be3d2] text-sm uppercase tracking-widest font-semibold">Panel de Administración</p>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Iniciar Sesión</h2>

                    {error && (
                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="admin-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@cantardelatierra.com"
                                    required
                                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#3be3d2]/50 focus:border-[#3be3d2]/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="admin-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl pl-12 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#3be3d2]/50 focus:border-[#3be3d2]/50 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            id="admin-login-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#3be3d2] hover:bg-[#2ccbb6] disabled:opacity-50 disabled:cursor-not-allowed text-[#11211f] font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-[#3be3d2]/20"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-[#11211f]/30 border-t-[#11211f] rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    Acceder al Panel
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-600 text-xs mt-6">
                    © 2026 Cantar de la Tierra · Panel Administrativo
                </p>
            </div>
        </div>
    );
};

export default AdminLoginPage;
