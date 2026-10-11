import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';
import { supabase, SiteImage } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const GalleryPage: React.FC = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      // Fetch images specifically tagged for gallery, or general fallback
      const { data } = await supabase
        .from('site_images')
        .select('*')
        .in('section', ['gallery'])
        .order('created_at', { ascending: false });

      if (data) {
        setImages(data);
      }
      setLoading(false);
    };

    fetchGallery();
  }, []);

  return (
    <>
      <SEOHead
        title={t.pages.gallery.title}
        description={t.pages.gallery.subtitle}
      />
      <div className="pt-24 pb-20 min-h-screen bg-[#f6f8f8] dark:bg-[#11211f] text-gray-800 dark:text-gray-100 animate-fade-in-up">
        <div className="text-center mb-12 px-4">
          <h1 className="text-4xl md:text-6xl font-display mb-4 text-[#8D4E3C] dark:text-[#3be3d2]">
            {t.pages.gallery.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light">
            {t.pages.gallery.subtitle}
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-10 h-10 text-[#3be3d2] animate-spin" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20 opacity-60">
              <p>No hay imágenes en la galería aún.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((img) => (
                <div key={img.id} className="relative group overflow-hidden rounded-xl shadow-lg aspect-[4/3] bg-gray-200 dark:bg-white/5">
                  <img
                    src={img.url}
                    alt={img.label || 'Gallery image'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  {img.label && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-sm font-medium">{img.label}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GalleryPage;