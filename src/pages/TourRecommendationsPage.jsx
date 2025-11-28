import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useTour } from '@/contexts/TourContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, X, MapPin, DollarSign, Plus } from 'lucide-react';

const FALLBACK_IMAGE = '/fallback.jpg';

// ==============================
//  COMPONENTE DE IMAGEM
// ==============================
const PlaceImage = ({ photo_reference, alt, className, maxWidth = 400 }) => {
  const src = photo_reference
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    : FALLBACK_IMAGE;

  return <img src={src} alt={alt} className={className} />;
};

// ==============================
//  MODAL DE ALTERNATIVAS
// ==============================
const AlternativesModal = ({ category, currentPlace, onSelect, onClose, coords }) => {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlternatives = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/fetch-places-for-tour', {
          method: 'POST',
          body: JSON.stringify({
            categories: [category],
            lat: coords.lat,
            lon: coords.lon
          })
        });

        const result = await response.json();
        const list = (result[category] || [])
          .filter(p => p.place_id !== currentPlace.place_id)
          .slice(0, 5);

        setAlternatives(list);
      } catch (err) {
        console.error(err);
        setAlternatives([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlternatives();
  }, [category, currentPlace.place_id, coords]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col"
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">Trocar Local</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3">
          {loading && <p>Buscando alternativas...</p>}
          {!loading && alternatives.length === 0 && <p>Nenhuma alternativa encontrada.</p>}

          {alternatives.map(alt => (
            <div
              key={alt.place_id}
              onClick={() => {
                onSelect(currentPlace.place_id, alt);
                onClose();
              }}
              className="flex items-center gap-4 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition"
            >
              <PlaceImage
                photo_reference={alt.photos?.[0]?.photo_reference}
                alt={alt.name}
                className="w-16 h-16 rounded-md object-cover"
                maxWidth={200}
              />

              <div className="flex-grow">
                <p className="font-semibold">{alt.name}</p>
                <p className="text-sm text-gray-500">{alt.vicinity}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==============================
//  MODAL DE ADICIONAR NOVO LOCAL
// ==============================
const AddPlaceModal = ({ onSelect, onClose, coords }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async e => {
    e.preventDefault();
    if (!searchQuery) return;

    setLoading(true);

    try {
      const response = await fetch('/api/fetch-places', {
        method: 'POST',
        body: JSON.stringify({
          query: searchQuery,
          lat: coords?.lat,
          lon: coords?.lon
        })
      });

      const result = await response.json();
      setSearchResults(result.results || []);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col"
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">Adicionar Local</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="search"
              placeholder="Buscar local..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-4 py-2 rounded-full bg-gray-100 focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
              🔍
            </button>
          </form>
        </div>

        <div className="px-4 pb-4 overflow-y-auto space-y-3">
          {loading && <p>Buscando...</p>}

          {searchResults.map(place => (
            <div
              key={place.place_id}
              onClick={() => {
                onSelect(place);
                onClose();
              }}
              className="flex items-center gap-4 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition"
            >
              <PlaceImage
                photo_reference={place.photos?.[0]?.photo_reference}
                alt={place.name}
                className="w-16 h-16 rounded-md object-cover"
                maxWidth={200}
              />

              <div className="flex-grow">
                <p className="font-semibold">{place.name}</p>
                <p className="text-sm text-gray-500">{place.vicinity}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==============================
//  PÁGINA PRINCIPAL
// ==============================
const TourRecommendationsPage = () => {
  const navigate = useNavigate();
  const {
    tourSettings,
    tourRecommendations,
    clearTour,
    updateRecommendation,
    removeRecommendation,
    addRecommendation,
    startActiveTour
  } = useTour();

  const [isSwapModalOpen, setSwapModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedPlaceForSwap, setSelectedPlaceForSwap] = useState(null);

  const priceLevelMap = {
    1: 'Barato',
    2: 'Moderado',
    3: 'Caro',
    4: 'Muito Caro'
  };

  const totalCost = useMemo(() => {
    const priceAverages = { 1: 20, 2: 45, 3: 80, 4: 120 };
    return tourRecommendations.reduce(
      (total, place) => total + (priceAverages[place.price_level] || 0),
      0
    );
  }, [tourRecommendations]);

  useEffect(() => {
    if (!tourSettings) navigate('/tour-setup');
  }, [tourSettings, navigate]);

  const handleCancel = () => {
    clearTour();
    navigate('/home');
  };

  const handleStart = () => {
    startActiveTour();
    navigate('/active-tour');
  };

  const handleAddPlace = place => addRecommendation(place);

  const handleOpenSwapModal = place => {
    const category =
      tourSettings.categories.find(c =>
        place.types?.some(t =>
          t.replace(/_/g, ' ').toLowerCase().includes(c.toLowerCase())
        )
      ) || tourSettings.categories[0];

    setSelectedPlaceForSwap({ ...place, category });
    setSwapModalOpen(true);
  };

  if (!tourSettings) return null;

  return (
    <>
      <Helmet>
        <title>Seu Tour - TurisME</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 p-4 border-b">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button
              onClick={() => navigate('/tour-setup')}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft />
            </button>
            <h1 className="text-xl font-bold">Seu Tour Recomendado</h1>
          </div>
        </header>

        <main className="flex-grow p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            {tourRecommendations.length > 0 ? (
              tourRecommendations.map((place, index) => (
                <motion.div
                  key={place.place_id + index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden flex items-start gap-3 p-3"
                >
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                    <PlaceImage
                      photo_reference={place.photos?.[0]?.photo_reference}
                      alt={place.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleOpenSwapModal(place)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg"
                    >
                      <RefreshCw className="w-6 h-6 text-white" />
                    </button>
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-bold text-lg">{place.name}</h3>

                    <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-1">
                      <MapPin className="w-4 h-4" /> {place.vicinity}
                    </p>

                    {place.price_level && (
                      <p className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" /> Gasto médio:{' '}
                        {priceLevelMap[place.price_level]}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeRecommendation(place.place_id)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">
                Nenhuma recomendação encontrada. Tente adicionar uma!
              </p>
            )}

            <Button
              onClick={() => setAddModalOpen(true)}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Adicionar novo local
            </Button>
          </div>
        </main>

        <footer className="sticky bottom-0 bg-white border-t p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-3">
              <p className="text-sm text-gray-600">Gasto total médio por pessoa</p>
              <p className="text-2xl font-bold text-gray-800">
                R$ {totalCost.toFixed(2)}
              </p>
            </div>

            <div className="flex gap-4">
              <Button variant="destructive" className="flex-1" onClick={handleCancel}>
                Cancelar
              </Button>

              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleStart}
                disabled={tourRecommendations.length === 0}
              >
                Iniciar
              </Button>
            </div>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {isSwapModalOpen && selectedPlaceForSwap && (
          <AlternativesModal
            category={selectedPlaceForSwap.category}
            currentPlace={selectedPlaceForSwap}
            onSelect={updateRecommendation}
            onClose={() => setSwapModalOpen(false)}
            coords={tourSettings.coords}
          />
        )}

        {isAddModalOpen && (
          <AddPlaceModal
            onSelect={handleAddPlace}
            onClose={() => setAddModalOpen(false)}
            coords={tourSettings.coords}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TourRecommendationsPage;            lat: coords.lat,
            lon: coords.lon
          })
        });

        const result = await response.json();
        const list = (result[category] || [])
          .filter(p => p.place_id !== currentPlace.place_id)
          .slice(0, 5);

        setAlternatives(list);
      } catch (err) {
        console.error(err);
        setAlternatives([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlternatives();
  }, [category, currentPlace.place_id, coords]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col"
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">Trocar Local</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3">
          {loading && <p>Buscando alternativas...</p>}
          {!loading && alternatives.length === 0 && <p>Nenhuma alternativa encontrada.</p>}

          {alternatives.map(alt => (
            <div
              key={alt.place_id}
              onClick={() => {
                onSelect(currentPlace.place_id, alt);
                onClose();
              }}
              className="flex items-center gap-4 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition"
            >
              <PlaceImage
                photo_reference={alt.photos?.[0]?.photo_reference}
                alt={alt.name}
                className="w-16 h-16 rounded-md object-cover"
                maxWidth={200}
              />

              <div className="flex-grow">
                <p className="font-semibold">{alt.name}</p>
                <p className="text-sm text-gray-500">{alt.vicinity}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==============================
//  MODAL DE ADICIONAR NOVO LOCAL
// ==============================
const AddPlaceModal = ({ onSelect, onClose, coords }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async e => {
    e.preventDefault();
    if (!searchQuery) return;

    setLoading(true);

    try {
      const response = await fetch('/api/fetch-places', {
        method: 'POST',
        body: JSON.stringify({
          query: searchQuery,
          lat: coords?.lat,
          lon: coords?.lon
        })
      });

      const result = await response.json();
      setSearchResults(result.results || []);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col"
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">Adicionar Local</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="search"
              placeholder="Buscar local..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-4 py-2 rounded-full bg-gray-100 focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
              🔍
            </button>
          </form>
        </div>

        <div className="px-4 pb-4 overflow-y-auto space-y-3">
          {loading && <p>Buscando...</p>}

          {searchResults.map(place => (
            <div
              key={place.place_id}
              onClick={() => {
                onSelect(place);
                onClose();
              }}
              className="flex items-center gap-4 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition"
            >
              <PlaceImage
                photo_reference={place.photos?.[0]?.photo_reference}
                alt={place.name}
                className="w-16 h-16 rounded-md object-cover"
                maxWidth={200}
              />

              <div className="flex-grow">
                <p className="font-semibold">{place.name}</p>
                <p className="text-sm text-gray-500">{place.vicinity}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==============================
//  PÁGINA PRINCIPAL
// ==============================
const TourRecommendationsPage = () => {
  const navigate = useNavigate();
  const {
    tourSettings,
    tourRecommendations,
    clearTour,
    updateRecommendation,
    removeRecommendation,
    addRecommendation,
    startActiveTour
  } = useTour();

  const [isSwapModalOpen, setSwapModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedPlaceForSwap, setSelectedPlaceForSwap] = useState(null);

  const priceLevelMap = {
    1: 'Barato',
    2: 'Moderado',
    3: 'Caro',
    4: 'Muito Caro'
  };

  const totalCost = useMemo(() => {
    const priceAverages = { 1: 20, 2: 45, 3: 80, 4: 120 };
    return tourRecommendations.reduce(
      (total, place) => total + (priceAverages[place.price_level] || 0),
      0
    );
  }, [tourRecommendations]);

  useEffect(() => {
    if (!tourSettings) navigate('/tour-setup');
  }, [tourSettings, navigate]);

  const handleCancel = () => {
    clearTour();
    navigate('/home');
  };

  const handleStart = () => {
    startActiveTour();
    navigate('/active-tour');
  };

  const handleAddPlace = place => addRecommendation(place);

  const handleOpenSwapModal = place => {
    const category =
      tourSettings.categories.find(c =>
        place.types?.some(t =>
          t.replace(/_/g, ' ').toLowerCase().includes(c.toLowerCase())
        )
      ) || tourSettings.categories[0];

    setSelectedPlaceForSwap({ ...place, category });
    setSwapModalOpen(true);
  };

  if (!tourSettings) return null;

  return (
    <>
      <Helmet>
        <title>Seu Tour - TurisME</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 p-4 border-b">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button
              onClick={() => navigate('/tour-setup')}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft />
            </button>
            <h1 className="text-xl font-bold">Seu Tour Recomendado</h1>
          </div>
        </header>

        <main className="flex-grow p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            {tourRecommendations.length > 0 ? (
              tourRecommendations.map((place, index) => (
                <motion.div
                  key={place.place_id + index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden flex items-start gap-3 p-3"
                >
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                    <PlaceImage
                      photo_reference={place.photos?.[0]?.photo_reference}
                      alt={place.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleOpenSwapModal(place)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg"
                    >
                      <RefreshCw className="w-6 h-6 text-white" />
                    </button>
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-bold text-lg">{place.name}</h3>

                    <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-1">
                      <MapPin className="w-4 h-4" /> {place.vicinity}
                    </p>

                    {place.price_level && (
                      <p className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" /> Gasto médio:{' '}
                        {priceLevelMap[place.price_level]}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeRecommendation(place.place_id)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">
                Nenhuma recomendação encontrada. Tente adicionar uma!
              </p>
            )}

            <Button
              onClick={() => setAddModalOpen(true)}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Adicionar novo local
            </Button>
          </div>
        </main>

        <footer className="sticky bottom-0 bg-white border-t p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-3">
              <p className="text-sm text-gray-600">Gasto total médio por pessoa</p>
              <p className="text-2xl font-bold text-gray-800">
                R$ {totalCost.toFixed(2)}
              </p>
            </div>

            <div className="flex gap-4">
              <Button variant="destructive" className="flex-1" onClick={handleCancel}>
                Cancelar
              </Button>

              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleStart}
                disabled={tourRecommendations.length === 0}
              >
                Iniciar
              </Button>
            </div>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {isSwapModalOpen && selectedPlaceForSwap && (
          <AlternativesModal
            category={selectedPlaceForSwap.category}
            currentPlace={selectedPlaceForSwap}
            onSelect={updateRecommendation}
            onClose={() => setSwapModalOpen(false)}
            coords={tourSettings.coords}
          />
        )}

        {isAddModalOpen && (
          <AddPlaceModal
            onSelect={handleAddPlace}
            onClose={() => setAddModalOpen(false)}
            coords={tourSettings.coords}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TourRecommendationsPage;      onClose={() => setSwapModalOpen(false)}
        coords={tourSettings.coords}
      />
    )}
    {isAddModalOpen && (
      <AddPlaceModal
        onSelect={handleAddPlace}
        onClose={() => setAddModalOpen(false)}
        coords={tourSettings.coords}
      />
    )}
  </AnimatePresence>
</>

);
};

export default TourRecommendationsPage;')[0])));
        setSelectedPlaceForSwap({ ...place, category });
        setSwapModalOpen(true);
    };

    if (!tourSettings) return null;

    return (
        <>
            <Helmet><title>Seu Tour - TurisME</title></Helmet>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 p-4 border-b">
                    <div className="max-w-4xl mx-auto flex items-center gap-4">
                        <button onClick={() => navigate('/tour-setup')} className="p-2 rounded-full hover:bg-gray-100"><ArrowLeft /></button>
                        <h1 className="text-xl font-bold">Seu Tour Recomendado</h1>
                    </div>
                </header>

                <main className="flex-grow p-4 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-4">
                        {tourRecommendations.length > 0 ? tourRecommendations.map((place, index) => (
                            <motion.div key={place.place_id + index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-xl shadow-md overflow-hidden flex items-start gap-3 p-3">
                                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                                    <RecommendationImage photo_reference={place.photos && place.photos[0] ? place.photos[0].photo_reference : null} name={place.name} />
                                    <button onClick={() => handleOpenSwapModal(place)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                        <RefreshCw className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-lg">{place.name}</h3>
                                    <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-1"><MapPin className="w-4 h-4" /> {place.vicinity}</p>
                                    {place.price_level && (
                                        <p className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                                            <DollarSign className="w-4 h-4" /> Gasto médio: {priceLevelMap[place.price_level]}
                                        </p>
                                    )}
                                </div>
                                <button onClick={() => removeRecommendation(place.place_id)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </motion.div>
                        )) : <p className="text-center text-gray-500 py-10">Nenhuma recomendação encontrada. Tente adicionar uma!</p>}
                         <Button onClick={() => setAddModalOpen(true)} variant="outline" className="w-full flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Adicionar novo local
                        </Button>
                    </div>
                </main>

                <footer className="sticky bottom-0 bg-white border-t p-4">
                    <div className="max-w-4xl mx-auto">
                         <div className="text-center mb-3">
                            <p className="text-sm text-gray-600">Gasto total médio por pessoa</p>
                            <p className="text-2xl font-bold text-gray-800">R$ {totalCost.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="destructive" className="flex-1" onClick={handleCancel}>Cancelar</Button>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleStart} disabled={tourRecommendations.length === 0}>Iniciar</Button>
                        </div>
                    </div>
                </footer>
            </div>
            
            <AnimatePresence>
                {isSwapModalOpen && selectedPlaceForSwap && (
                    <AlternativesModal
                        category={selectedPlaceForSwap.category}
                        currentPlace={selectedPlaceForSwap}
                        onSelect={updateRecommendation}
                        onClose={() => setSwapModalOpen(false)}
                        coords={tourSettings.coords}
                    />
                )}
                {isAddModalOpen && (
                    <AddPlaceModal
                        onSelect={handleAddPlace}
                        onClose={() => setAddModalOpen(false)}
                        coords={tourSettings.coords}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default TourRecommendationsPage;
