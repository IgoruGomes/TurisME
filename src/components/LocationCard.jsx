import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const LocationCard = ({ location, onClick }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      if (!location.photo_reference) {
        setImageUrl("/fallback.jpg");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/fetch-place-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photo_reference: location.photo_reference }),
        });

        if (!res.ok) throw new Error("Erro ao buscar imagem");

        const blob = await res.blob();
        setImageUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error(err);
        setImageUrl("/fallback.jpg");
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [location.photo_reference]);

  return (
    <motion.div
      variants={cardVariants}
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer flex flex-col group"
    >
      <div className="relative h-40 sm:h-56 overflow-hidden">
        {loading ? (
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        ) : (
          <img
            src={imageUrl}
            alt={location.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
          <h3 className="text-white font-bold text-base sm:text-xl drop-shadow-md line-clamp-2">
            {location.name}
          </h3>
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
