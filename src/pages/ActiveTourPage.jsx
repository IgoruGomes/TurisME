
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTour } from '@/contexts/TourContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CheckCircle, Route, Loader } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const TourLocationCard = ({ place, onNavigate, onComplete }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const imageRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        if (place.photos && place.photos[0]) {
            const fetchImage = async () => {
                try {
                    const { data, error } = await supabase.functions.invoke('fetch-place-photo', {
                        body: { photo_reference: place.photos[0].photo_reference, maxwidth: 400 }
                    });
                    if (error) throw error;
                    if (data instanceof Blob && isMounted) {
                        const url = URL.createObjectURL(data);
                        imageRef.current = url;
                        setImageUrl(url);
                    }
                } catch (err) { console.error(err); }
            };
            fetchImage();
            return () => {
                isMounted = false;
                if (imageRef.current) {
                    URL.revokeObjectURL(imageRef.current);
                    imageRef.current = null;
                }
            };
        }
    }, [place.photos]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group"
        >
            <div className="relative h-40 overflow-hidden cursor-pointer" onClick={() => onNavigate(place)}>
                {!imageUrl ? <div className="w-full h-full bg-gray-200 animate-pulse" /> : 
                    <img src={imageUrl} alt={place.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-bold text-lg drop-shadow-md line-clamp-2">{place.name}</h3>
                </div>
                 <div className="absolute top-0 right-0 p-3 bg-black/30 rounded-bl-2xl">
                    <Route className="w-6 h-6 text-white" />
                 </div>
            </div>
            <div className="p-2">
                <Button onClick={() => onComplete(place)} variant="ghost" className="w-full text-green-600 hover:text-green-700 hover:bg-green-50">
                    <Check className="w-5 h-5 mr-2" />
                    Concluir Visita
                </Button>
            </div>
        </motion.div>
    );
};

const ActiveTourPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { activeTour, clearTour, completeTourLocation } = useTour();
    const [placeToNavigate, setPlaceToNavigate] = useState(null);
    const [placeToComplete, setPlaceToComplete] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);

    React.useEffect(() => {
        if (activeTour.length === 0) {
            navigate('/home');
        }
    }, [activeTour, navigate]);
    
    const handleConfirmNavigation = (place) => {
    setIsNavigating(true);
    if (!navigator.geolocation) {
        toast({ variant: 'destructive', title: 'Geolocalização não suportada' });
        setIsNavigating(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = place.geometry?.location?.lat;
            const lng = place.geometry?.location?.lng;

            if (!lat || !lng) {
                toast({ variant: 'destructive', title: 'Destino inválido' });
                setIsNavigating(false);
                return;
            }

            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

            window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
            setPlaceToNavigate(null);
            setIsNavigating(false);
        },
        (error) => {
            console.error("Geolocation error:", error);
            toast({ variant: 'destructive', title: 'Erro ao obter localização' });
            setIsNavigating(false);
        },
        { enableHighAccuracy: true }
    );
};

    const handleConfirmCompletion = () => {
        if(placeToComplete){
            completeTourLocation(placeToComplete.place_id);
            toast({
                title: "Visita Concluída!",
                description: `${placeToComplete.name} foi removido do seu tour.`,
            })
            setPlaceToComplete(null);
        }
    };

    const handleFinishTour = () => {
        clearTour();
        navigate('/home');
        toast({ title: "Tour Finalizado!", description: "Esperamos que tenha se divertido." });
    };
    
    if (activeTour.length === 0) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <>
            <Helmet><title>Tour Ativo - TurisME</title></Helmet>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 p-4 border-b">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <h1 className="text-xl font-bold">Seu Tour Ativo</h1>
                        <Button variant="destructive" size="sm" onClick={handleFinishTour}>Finalizar Tour</Button>
                    </div>
                </header>

                <main className="flex-grow p-4 overflow-y-auto">
                    <AnimatePresence>
                        <motion.div
                            layout
                            className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            {activeTour.map((place) => (
                                <TourLocationCard 
                                    key={place.place_id} 
                                    place={place} 
                                    onNavigate={setPlaceToNavigate}
                                    onComplete={setPlaceToComplete}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
            
            {/* Navigation Confirmation Dialog */}
            <AlertDialog open={!!placeToNavigate} onOpenChange={(open) => !open && setPlaceToNavigate(null)}>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Iniciar Rota</AlertDialogTitle>
                        <AlertDialogDescription>
                           Você quer traçar a rota para <span className="font-semibold">{placeToNavigate?.name}</span> no Google Maps?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isNavigating}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleConfirmNavigation(placeToNavigate)} disabled={isNavigating}>
                            {isNavigating ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                            Sim, vamos!
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            {/* Completion Confirmation Dialog */}
             <AlertDialog open={!!placeToComplete} onOpenChange={(open) => !open && setPlaceToComplete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Concluir Visita</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza de que deseja marcar <span className="font-semibold">{placeToComplete?.name}</span> como concluído? O local será removido do seu tour ativo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmCompletion} className="bg-green-600 hover:bg-green-700">
                           <CheckCircle className="w-4 h-4 mr-2"/> Sim, concluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default ActiveTourPage;
