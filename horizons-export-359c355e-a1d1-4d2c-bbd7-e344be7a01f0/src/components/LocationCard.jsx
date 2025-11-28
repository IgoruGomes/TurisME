
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const LocationCard = ({ location, onClick }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      if (location.image_photo_reference) {
        setLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke('fetch-place-photo', {
            body: { photo_reference: location.image_photo_reference }
          });
          if (error) throw error;
          if (data instanceof Blob) {
            setImageUrl(URL.createObjectURL(data));
          }
        } catch (err) {
          console.error('Error fetching image for card:', err);
          setImageUrl('https://via.placeholder.com/400x224?text=Imagem+Indisponível');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchImage();
    
    // Cleanup URL object when component unmounts
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [location.image_photo_reference, imageUrl]);

  return (
    <motion.div
      variants={cardVariants}
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition hover:scale-[1.03] hover:shadow-xl flex flex-col group"
    >
      <div className="relative h-40 sm:h-56 overflow-hidden">
        {loading ? (
           <div className="w-full h-full bg-gray-200 animate-pulse" />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={location.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
          <h3 className="text-white font-bold text-base sm:text-xl drop-shadow-md line-clamp-2">{location.name}</h3>
        </div>
      </div>
      
      <div className="p-2 sm:p-4 flex-grow flex flex-col">
        {location.description && (
          <div className="flex items-start gap-2 text-gray-500 text-xs sm:text-sm mt-auto">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{location.description}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LocationCard;
