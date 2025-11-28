
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, Calendar } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import LocationCard from '@/components/LocationCard';
import LocationModal from '@/components/LocationModal';
import CalendarModal from '@/components/CalendarModal';
import TurismeLogo from '@/components/TurismeLogo';
import BottomNav from '@/components/BottomNav';

const HomePage = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState(null);
  const [headerTitle, setHeaderTitle] = useState('Recomendações para você');
  const initialFetchDone = useRef(false);

  const fetchPlaces = useCallback(async (query, lat, lon) => {
    setLoading(true);
    setHeaderTitle(query ? `Resultados para "${query}"` : 'Recomendações para você');
    try {
      const { data, error } = await supabase.functions.invoke('fetch-places', {
        body: { query: query, lat, lon },
      });

      if (error) throw error;
      
      const placesWithPhotos = (data.results || [])
        .filter(p => p.photos && p.photos.length > 0)
        .map(p => ({
            ...p,
            image_photo_reference: p.photos[0].photo_reference,
        }));
      setLocations(placesWithPhotos);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar locais",
        description: "Não foi possível carregar os locais. Tente novamente.",
      });
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lon: longitude });
        fetchPlaces('', latitude, longitude);
      },
      (error) => {
        console.warn("Permissão de localização negada.", error);
        toast({
          title: "Localização não permitida",
          description: "Buscando locais populares em Londrina.",
        });
        fetchPlaces('', null, null); // Londrina fallback from edge function
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    fetchEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true });
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPlaces(searchQuery, userCoords?.lat, userCoords?.lon);
  };
  
  const handleSearchChange = (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      if (query === '') {
          fetchPlaces('', userCoords?.lat, userCoords?.lon);
      }
  };

  return (
    <>
      <Helmet>
        <title>Explore Londrina - TurisME</title>
        <meta name="description" content="Descubra os melhores pontos turísticos de Londrina" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 pb-24">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16 md:h-20 gap-2 sm:gap-4">
              <div className="flex-shrink-0">
                <TurismeLogo className="h-6 sm:h-7 w-auto text-gray-800" />
              </div>
              
              <form onSubmit={handleSearch} className="flex-grow min-w-0">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="search"
                    placeholder="Restaurantes, bares, parques..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-11 pr-4 py-2.5 rounded-full text-gray-800 bg-gray-100 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                  />
                </div>
              </form>
              
              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowCalendar(true)}
                  className="p-2 text-blue-600 hover:bg-blue-100/50 rounded-full transition"
                  aria-label="Calendário de Eventos"
                >
                  <Calendar className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-4 sm:p-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6"
          >
            {headerTitle}
          </motion.h1>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg h-56 sm:h-80 animate-pulse">
                  <div className="h-40 sm:h-56 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 hidden sm:block"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate="show"
            >
              {locations.map((location) => (
                <LocationCard
                  key={location.place_id}
                  location={{
                    id: location.place_id,
                    name: location.name,
                    description: location.formatted_address,
                    image_photo_reference: location.image_photo_reference
                  }}
                  onClick={() => setSelectedLocation(location)}
                />
              ))}
            </motion.div>
          )}

          {locations.length === 0 && !loading && (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">Nenhum local encontrado.</p>
            </div>
          )}
        </main>

        <BottomNav activeTab="home" />

        {selectedLocation && (
          <LocationModal
            location={selectedLocation}
            placeId={selectedLocation.place_id}
            onClose={() => setSelectedLocation(null)}
          />
        )}

        {showCalendar && (
          <CalendarModal
            events={events}
            onClose={() => setShowCalendar(false)}
          />
        )}
      </div>
    </>
  );
};

export default HomePage;
