
import React, { createContext, useState, useContext, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const TourContext = createContext();

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }) => {
  const [tourSettings, setTourSettings] = useState(null);
  const [tourRecommendations, setTourRecommendations] = useState([]);
  const [activeTour, setActiveTour] = useState([]);
  const [manualDistribution, setManualDistribution] = useState({});

  const saveTourSettings = useCallback(async (settings) => {
    setTourSettings(settings);
    const { data, error } = await supabase.functions.invoke('fetch-places-for-tour', {
        body: { 
            categories: settings.categories,
            lat: settings.coords.lat,
            lon: settings.coords.lon
        },
    });

    if(error) {
        console.error("Error fetching recommendations:", error);
        return { error };
    }
    
    const investmentPerCategory = settings.investment / settings.categories.length;

    const priceLevelMapping = {
        'Barato': [1],
        'Moderado': [1,2],
        'Caro': [1,2,3],
        'Muito Caro': [1,2,3,4]
    };
    
    let allowedPriceLevels = [];
    if (investmentPerCategory > 100) allowedPriceLevels = priceLevelMapping['Muito Caro'];
    else if (investmentPerCategory > 60) allowedPriceLevels = priceLevelMapping['Caro'];
    else if (investmentPerCategory > 30) allowedPriceLevels = priceLevelMapping['Moderado'];
    else allowedPriceLevels = priceLevelMapping['Barato'];

    const filteredRecs = settings.categories.map(category => {
        const placesForCategory = (data[category] || [])
            .filter(place => place.price_level === undefined || allowedPriceLevels.includes(place.price_level));
        return placesForCategory[0]; // pick the first one for now
    }).filter(Boolean); // remove undefined entries

    setTourRecommendations(filteredRecs);
    return { data: filteredRecs };
  }, []);

  const clearTour = useCallback(() => {
    setTourSettings(null);
    setTourRecommendations([]);
    setActiveTour([]);
    setManualDistribution({});
  }, []);
  
  const updateRecommendation = (oldPlaceId, newPlace) => {
    setTourRecommendations(prevRecs => 
      prevRecs.map(rec => rec.place_id === oldPlaceId ? newPlace : rec)
    );
  };
  
  const removeRecommendation = (placeId) => {
    setTourRecommendations(prevRecs => prevRecs.filter(rec => rec.place_id !== placeId));
  };
  
  const addRecommendation = (newPlace) => {
    setTourRecommendations(prevRecs => {
        if (prevRecs.some(rec => rec.place_id === newPlace.place_id)) {
            return prevRecs; // Avoid duplicates
        }
        return [...prevRecs, newPlace];
    });
  };

  const startActiveTour = () => {
    setActiveTour([...tourRecommendations]);
    setTourRecommendations([]); // Clear recommendations after starting a tour
  };

  const completeTourLocation = (placeId) => {
    setActiveTour(prev => prev.filter(p => p.place_id !== placeId));
  };

  return (
    <TourContext.Provider value={{ 
        tourSettings, saveTourSettings, 
        clearTour, 
        tourRecommendations, setTourRecommendations, 
        updateRecommendation, removeRecommendation, addRecommendation,
        activeTour, startActiveTour, completeTourLocation,
        manualDistribution, setManualDistribution
    }}>
      {children}
    </TourContext.Provider>
  );
};
