import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const FALLBACK_IMAGES = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBGcx3KNce1ueKPt0pHLaIfl8DT2t2oLEIqXeE2iQoslYNJNm6V08mGQytosuRDNvaJxw6va9IXKdof8pwA-Rf4Se1sXVyNggb270JZ_Gz56qCf9T1NGG04t-fjJst1ZCQRrwpF9Wi1IIqTrvUc3n6OlCy3-PZeNfLWm5j3gdayOLQ1X7HJB4xirkBg2bx0-shkUu6MudGCnZBbhizcwZEnrlyYm-xG1CZQyfxtgGG6X1P-fnJpYjVIGpZ2uUOn19QrwKH1Lp8ZFcM6",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCsbcHkeJf8ft_j4dMVPIf6udw4OtuRSnMBw5OXLHvvDQNvCzvIxYg7IBuA6SeEJKPEFG-y7CfYsH7pO7eIiet3CTRuAGPgRuvbCyyHEaVAFxSTQgGiFOYq1LRZvng7qlMkr8WigciLXlgtBmmeX4fgpfm4YJB10pVxZi69jrvCjQV-NKAq1QaFAaKX3tpc6oWf9VkMJRek91TfvwYUcf2BnKV1idH9H4_tcyePD_GxwCaw-UpZvZ-gpl0baIUgAb7219W3etk4WUM1",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBK6lhdYFqUJ_esEfTG39YNXXtWuIcyRWj4xjOqC0fljGgKrqyGvduzHqyqeAeS2QRfcvpLJtEnxygaR0Tbn_X4oHIFbAm3av7crecUXXoru_LUHNbjJImdknxZSZau4oyk60G8UUOGAfOiVMBUF9puhM-Cu2JCzxDNG7VUX3Z-LMseY2N-d3u6-T7GvO5LzsWtqEkcKiqZ6vYpkpKxe3mNF3-2gm-i9tVnJxmHN1DgOtUOViWtX0uhj1H050u7F7nBk6rvR6l5VbGb",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA7daeD0WaeD7dIFcB8JU2x2U5760vBY8gSJd8IQ72kJNaiAqvuIlnrulieMsf7d-RfFX_6eoMkVgi_A9LhFFe633BORaMEq_VpM6FyJB_n0ei-2ux9A2nPa9xuAzj3K5PgMB-b8wMOThSxsh5nLCUPNLl2QOoKhdd4KL8sRYpQa4Q1Mvp-UdeVQGncS-s-ctJiU2ISarcW9e3hi8Ttcm0z-DLwxvhZJqsgXki5O5WdmTUCgSssrYfdkLHFuGx-XRWX43T6Zx0FmozP",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDvNIhqYMc3JugkujHS2vN3Dj_VOF7oHN_Zh3IMOpV9_yH6jE6BVZRPV3IHt71P7-8AbDUJwYc-w9IzKQQ9RtR0KrHTZA9eqXpv96nRFDo-QTOLBdRwq6Yw6t79tJXcPFN67zFFlg9Yf-dLGmDsaHUg1NV2ZbhOeriTsTZG9HPxkZsGsX3oaPNjoGB-X-Mo3EC96nDdT0X9s9fYIgGTDojhil5V8GLy_bM6Aar2RHPdlyCm9lgx_Im7l2c9wnzQElJVLOLYImYtPmny",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBl9hO59sUqkwD5Qez3LWVXjr-fPwf0GSG3qon90gaEuWZ7IasG0_a5VBvpao4ytF8ryooFKK65NKTq3uQ8kIcKS1AU2u15ppANngHMePHFdjBqQWUbB2fnlNfOSc2caePgaUAquh92HNV3HU72JnvKJ8pzHZHMqYW76bQ_aYhKcMoImEpxRDOuYGLfI0rZgOzqtJZkJUbhWEDoKlBFQbEt57RjR1EKdQsoEx_joLF_iMM9C0QJ-Lbs8ONa8fK-ANQYnzUUfyJlH2iz",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCIkPtHCdCqF70-3K297lRTJSqm1_uHZt1Scz5qF2KVPDEnHZKLV0Bxta2dohdS1t25G6gBmRVDT4gruDJR63aCwjE9JUY8HYpeJ8DDXg94B3HDWS7hsu4hftWZgek83EXL3uu1LmFgt1s42U9Zc-cNefRkoxxA7D6aATApNCGrBCcym-WOS6vOLrG2Jqh-RS0E1wkD9qtr_IJIidke120K9CKzWbUycRFci-pnx2ZGBYkq6C1sNkyXHGctieD0fOK4i4_jsKtMWwJG",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB4Qs6ijDK6_CfHMPYR-4EV9CPqqCdNEqQcZaaqmVQ4pJs4cKyfhdkdVhLQDmia4cMFcZD3nAmMZJLmGzZTo-kUtklIJw34Le2NGiQ_E7HGrMHQsI5X4U9Ke1QqOLJu-t8VXdoyBiziGvB0hhhqvnlth1D8Q_feXEeaZbj5kUjG5nu_IgZhk8Fv4j4O6zPFGPxTnB6MSUyRPTqdta5Nxl1vq3MJ9Wyi0IDWT71ZcAIpIvlDsFQpA5FuSJySUwQyIM6gpD4dBGFFvCB_"
];

const Gallery: React.FC = () => {
    const { t } = useLanguage();
    const [images, setImages] = useState<string[]>(FALLBACK_IMAGES);

    useEffect(() => {
        supabase.from('gallery_images').select('url').order('created_at')
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setImages(data.map(d => d.url));
                }
            });
    }, []);

    return (
        <section id="galeria" className="py-16 sm:py-24 bg-background-light dark:bg-background-dark" aria-labelledby="gallery-heading">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-10 sm:mb-16">
                    <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">{t.gallery.tag}</span>
                    <h2 id="gallery-heading" className="font-display text-3xl sm:text-4xl text-stone-800 dark:text-stone-100 mt-2">{t.gallery.title}</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                    {images.map((src, index) => (
                        <div key={index} className="aspect-square rounded overflow-hidden group relative cursor-pointer">
                            <img
                                alt={`Galería Cantar de la Tierra — imagen ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                src={src}
                                loading="lazy"
                                decoding="async"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Gallery;