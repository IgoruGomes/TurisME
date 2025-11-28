
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { X, MapPin, Phone, Clock, Star, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

const PhotoCarousel = ({ photos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState({});
  
  useEffect(() => {
    const fetchImages = async () => {
        if (!photos || photos.length === 0) return;

        const urls = {};
        for (let i = 0; i < photos.length; i++) {
            const photo = photos[i];
            if (!imageUrls[photo.photo_reference]) {
                try {
                    const { data, error } = await supabase.functions.invoke('fetch-place-photo', {
                        body: { photo_reference: photo.photo_reference, maxwidth: 800 }
                    });
                    if (error) throw error;
                    if (data instanceof Blob) {
                        urls[photo.photo_reference] = URL.createObjectURL(data);
                    }
                } catch (err) {
                    console.error(`Error fetching photo ${photo.photo_reference}:`, err);
                    urls[photo.photo_reference] = 'https://via.placeholder.com/800x400?text=Imagem+Indisponível';
                }
            }
        }
        setImageUrls(prev => ({ ...prev, ...urls }));
    };

    fetchImages();

    return () => {
        Object.values(imageUrls).forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
    };
  }, [photos]);


  if (!photos || photos.length === 0) {
    return (
        <div className="relative w-full h-64 overflow-hidden bg-gray-200">
             <MapPin className="w-16 h-16 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
    );
  }

  const nextSlide = () => setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
  
  const currentPhotoRef = photos[currentIndex]?.photo_reference;
  const currentImageUrl = imageUrls[currentPhotoRef];

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-t-3xl sm:rounded-t-3xl bg-gray-200">
      <AnimatePresence initial={false}>
        {currentImageUrl ? (
            <motion.img
                key={currentIndex}
                src={currentImageUrl}
                alt={`Foto ${currentIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 0.3 } }}
                className="w-full h-full object-cover absolute"
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center animate-pulse" />
        )}
      </AnimatePresence>
      {photos.length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"><ChevronLeft /></button>
          <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"><ChevronRight /></button>
        </>
      )}
    </div>
  );
};

const RatingStars = ({ rating }) => {
  const totalStars = 5;
  if (typeof rating !== 'number') return null;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="w-5 h-5 text-yellow-400 fill-current" />)}
      {halfStar && <Star key="half" className="w-5 h-5 text-yellow-400" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />}
      {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300 fill-current" />)}
      <span className="ml-2 text-sm font-medium text-gray-600">{rating?.toFixed(1)}</span>
    </div>
  );
};

const LocationModal = ({ location, placeId, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!placeId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('fetch-place-details', {
          body: { place_id: placeId }
        });
        if (error) throw error;
        setDetails(data.result);
      } catch (error) {
        console.error("Error fetching place details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [placeId]);

  const priceLevelMap = {
    0: 'Gratuito',
    1: 'Barato (R$10-R$30)',
    2: 'Moderado (R$30-R$60)',
    3: 'Caro (R$60-R$100)',
    4: 'Muito Caro (Acima de R$100)',
  };
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          {loading ? (
             <div className="w-full h-64 bg-gray-200 flex items-center justify-center animate-pulse rounded-t-3xl sm:rounded-t-3xl" />
          ) : (
            <PhotoCarousel photos={details?.photos} />
          )}
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/70 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition">
            <X className="w-6 h-6 text-gray-800" />
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{location.name}</h2>
          
          {loading ? <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse mb-6"></div> :
          (
            <>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                {details?.rating && <RatingStars rating={details.rating} />}
                {details?.price_level !== undefined && (
                    <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-sm font-medium">Gasto médio: {priceLevelMap[details.price_level]}</span>
                    </div>
                )}
              </div>
              <div className="space-y-4">
                {details?.formatted_address && <InfoItem icon={MapPin} title="Endereço" content={details.formatted_address} />}
                {details?.formatted_phone_number && <InfoItem icon={Phone} title="Telefone" content={details.formatted_phone_number} />}
                {details?.opening_hours?.weekday_text && <InfoItem icon={Clock} title="Horário de Funcionamento" content={<ul className="text-sm text-gray-600 list-inside">{details.opening_hours.weekday_text.map(day => <li key={day}>{day}</li>)}</ul>} />}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const InfoItem = ({ icon: Icon, title, content }) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
    <div>
      <p className="font-semibold text-gray-800">{title}</p>
      {typeof content === 'string' ? <p className="text-gray-600">{content}</p> : content}
    </div>
  </div>
);

export default LocationModal;
