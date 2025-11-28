import React from 'react';

const LocationCard = ({ location, onClick }) => {
  const handleImageError = (e) => {
    e.target.onerror = null; // evita loop infinito
    e.target.src = "/fallback.jpg";
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition"
      onClick={() => onClick?.()}
    >
      <div className="h-40 sm:h-56 w-full overflow-hidden">
        <img
          src={location?.image_url || "/fallback.jpg"}
          alt={location?.name || "Local turístico"}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
      </div>
      <div className="p-4 space-y-1">
        <h2 className="text-lg font-semibold text-gray-800">
          {location?.name || "Sem nome"}
        </h2>
        <p className="text-gray-500 text-sm">
          {location?.description || "Sem descrição disponível"}
        </p>
      </div>
    </div>
  );
};

export default LocationCard;
