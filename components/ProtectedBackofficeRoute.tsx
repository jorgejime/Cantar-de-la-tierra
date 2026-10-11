import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

const ProtectedBackofficeRoute: React.FC = () => {
    const { user, loading } = useSupabaseAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d1a18] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-[#3be3d2]/30 border-t-[#3be3d2] rounded-full animate-spin" />
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/backoffice/login" replace />;
};

export default ProtectedBackofficeRoute;
