import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
    const { t } = useLanguage();

    return (
        <footer id="contacto" className="bg-background-light dark:bg-background-dark pt-20">
            <div className="text-center mb-12">
                <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">{t.footer.locationTag}</span>
                <h2 className="font-display text-4xl text-stone-800 dark:text-stone-100 mt-2">{t.footer.howTo}</h2>
            </div>
            
            <div className="w-full h-80 grayscale opacity-80 hover:grayscale-0 transition-all duration-500 relative bg-stone-200 dark:bg-stone-800">
                <img 
                    alt="Abstract map representation" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxnHMKJz6VXKjOMnaF_RWKb1n1vG34_E_PCEhml-GztJ3_Ovjklr52MQMpoSvuAABjZlkRtT2YtFVs-5yMB3i5p5XoGHFW_boSrphHeCTTd-LZACEw4yQvLeqgGX32iSpkMqNBpn14ZHMYVJkBpwl-qsU9pZJLb90_KYSxE1E7qYvAJmR-HVNc2Dv3EbcSpYWjqvjr59e2QZY4CTA42AdYM0TGWQik9zORNuAOEFuKF07oOrnD8nB8tF-pChCtzexG-86CxnJlhKji" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white dark:bg-stone-900 p-4 rounded shadow-lg flex items-center gap-3">
                        <span className="material-icons-outlined text-red-500 text-3xl">place</span>
                        <div className="text-left">
                            <p className="font-bold text-stone-800 dark:text-stone-100 text-sm">Ciénaga Magdalena</p>
                            <p className="text-xs text-stone-500">{t.footer.country}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-stone-200 dark:border-stone-800 mt-10">
                <div className="text-center md:text-left">
                    <p className="font-display text-lg text-stone-800 dark:text-stone-200 font-bold mb-1">Cantar de la Tierra</p>
                    <p className="text-stone-500 text-sm">{t.footer.rights}</p>
                </div>
                <div className="flex gap-6">
                    <a href="#" className="text-stone-500 hover:text-primary transition-colors">
                        <span className="material-icons-outlined">facebook</span>
                    </a>
                    <a href="#" className="text-stone-500 hover:text-primary transition-colors">
                        <span className="material-icons-outlined">camera_alt</span>
                    </a> 
                    <a href="#" className="text-stone-500 hover:text-primary transition-colors">
                        <span className="material-icons-outlined">alternate_email</span>
                    </a>
                </div>
                <div className="text-stone-500 text-xs text-center md:text-right">
                    <p>{t.footer.created}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;