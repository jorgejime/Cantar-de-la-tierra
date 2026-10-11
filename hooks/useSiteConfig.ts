import { useEffect, useState } from 'react';
import { supabase, SiteConfig as SiteConfigType } from '../lib/supabase';

export interface SiteConfigMap {
    logo_url?: string;
    whatsapp_number?: string;
    instagram_url?: string;
    facebook_url?: string;
    google_maps_url?: string;
    address?: string;
    city?: string;
    email?: string;
    phone_display?: string;
    [key: string]: string | undefined;
}

export const useSiteConfig = () => {
    const [config, setConfig] = useState<SiteConfigMap>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await supabase.from('site_config').select('*');
                if (data) {
                    const configMap: SiteConfigMap = {};
                    data.forEach((item: SiteConfigType) => {
                        configMap[item.key] = item.value;
                    });
                    setConfig(configMap);
                }
            } catch (error) {
                console.error('Error fetching site config:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return { config, loading };
};
