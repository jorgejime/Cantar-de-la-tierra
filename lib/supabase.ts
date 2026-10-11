import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =============================================
// TYPE DEFINITIONS
// =============================================

export type BookingStatus = 'pending' | 'approved' | 'cancelled' | 'completed';

export interface Booking {
    id: string;
    ticket_number: string;
    client_name: string;
    client_email?: string;
    client_phone?: string;
    date: string;
    service_type: string;
    adults: number;
    children: number;
    addons: AddonItem[];
    total_price: number;
    status: BookingStatus;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface AddonItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export interface Service {
    id: string;
    name_es: string;
    name_en: string;
    description_es?: string;
    description_en?: string;
    price_adult: number;
    price_child: number;
    category: 'main' | 'addon' | 'package';
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface SiteImage {
    id: string;
    key: string;
    label: string;
    url: string;
    storage_path?: string;
    section: string;
    created_at: string;
    updated_at: string;
}

export interface SiteConfig {
    id: string;
    key: string;
    value?: string;
    value_json?: any;
    label: string;
    type: 'text' | 'number' | 'image' | 'json' | 'boolean';
    updated_at: string;
}
