import React from 'react';

const LocationCard = ({ location, onClick }) => {
  return (
    <div
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition"
      onClick={onClick}
    >
      <div className="h-40 sm:h-56 w-full overflow-hidden">
        <img
          src={location.image_url}
          alt={location.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = "/fallback.jpg"; }}
        />
      </div>
      <div className="p-4 space-y-1">
        <h2 className="text-lg font-semibold text-gray-800">{location.name}</h2>
        <p className="text-gray-500 text-sm">{location.description}</p>
      </div>
    </div>
  );
};

export default LocationCard;
