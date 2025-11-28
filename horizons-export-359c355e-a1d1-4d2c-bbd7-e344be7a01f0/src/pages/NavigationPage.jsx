
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTour } from '@/contexts/TourContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Loader, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Routing = ({ userCoords, destinationCoords }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !userCoords || !destinationCoords) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(userCoords.lat, userCoords.lng),
                L.latLng(destinationCoords.lat, destinationCoords.lng)
            ],
            routeWhileDragging: true,
            show: false, // Hides the itinerary panel
            addWaypoints: false,
            draggableWaypoints: false,
            lineOptions: {
                styles: [{ color: '#2563eb', opacity: 0.8, weight: 6 }]
            },
            createMarker: function() { return null; } // Use our own markers
        }).addTo(map);

        return () => map.removeControl(routingControl);
    }, [map, userCoords, destinationCoords]);

    return null;
};


const NavigationPage = () => {
    const { placeId } = useParams();
    const navigate = useNavigate();
    const { activeTour, completeTourLocation } = useTour();
    const [place, setPlace] = useState(null);
    const [userCoords, setUserCoords] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const currentPlace = activeTour.find(p => p.place_id === placeId);
        if (!currentPlace) {
            navigate('/active-tour', { replace: true });
            return;
        }
        setPlace(currentPlace);

        if (!navigator.geolocation) {
            setError("Geolocalização não é suportada pelo seu navegador.");
            setLoading(false);
            return;
        }
        
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
            setLoading(false);
          },
          () => {
            setError("Não foi possível obter sua localização. Por favor, habilite a permissão de localização.");
            setLoading(false);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        }
    }, [placeId, activeTour, navigate]);

    const handleComplete = () => {
        completeTourLocation(placeId);
        navigate('/active-tour');
    };

    const destinationCoords = useMemo(() => {
        if (place?.geometry?.location) {
            return { lat: place.geometry.location.lat, lng: place.geometry.location.lng };
        }
        return null;
    }, [place]);
    
    if (loading && !userCoords) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100">
                <Loader className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">Carregando mapa e sua localização...</p>
            </div>
        );
    }
    
    return (
        <React.Fragment>
            <Helmet><title>Navegando para {place?.name} - TurisME</title></Helmet>
            <div className="h-screen w-screen flex flex-col bg-gray-100">
                <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm z-[1001] p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/active-tour')} className="p-2 rounded-full hover:bg-gray-100"><ArrowLeft /></button>
                        <div>
                            <p className="text-xs text-gray-500">Indo para</p>
                            <h1 className="text-lg font-bold line-clamp-1">{place?.name}</h1>
                        </div>
                    </div>
                </header>
                <main className="flex-grow relative">
                    {error && !destinationCoords && (
                        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-white/80 p-4 text-center">
                            <MapPin className="w-12 h-12 text-red-500 mb-4" />
                            <h2 className="text-lg font-bold text-red-600">Erro no Mapa</h2>
                            <p className="text-gray-600">{error}</p>
                        </div>
                    )}
                    {destinationCoords && (
                        <MapContainer
                            center={userCoords ? [userCoords.lat, userCoords.lng] : [destinationCoords.lat, destinationCoords.lng]}
                            zoom={15}
                            scrollWheelZoom={true}
                            className="w-full h-full z-0"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {userCoords && (
                                <Marker position={[userCoords.lat, userCoords.lng]}>
                                    <Popup>Sua localização</Popup>
                                </Marker>
                            )}
                            <Marker position={[destinationCoords.lat, destinationCoords.lng]}>
                                <Popup>{place?.name}</Popup>
                            </Marker>
                            {userCoords && destinationCoords && (
                                <Routing userCoords={userCoords} destinationCoords={destinationCoords} />
                            )}
                        </MapContainer>
                    )}
                </main>
                <motion.footer 
                    initial={{ y: 150 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 1, type: 'spring' }}
                    className="p-4 bg-white border-t z-[1001]"
                >
                    <Button onClick={handleComplete} className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2">
                        <Check />
                        Cheguei! Concluir visita
                    </Button>
                </motion.footer>
            </div>
        </React.Fragment>
    );
};

export default NavigationPage;
