
import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, PlusCircle, Loader, MapPin } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const AddPlacePage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userCoords, setUserCoords] = useState(null);

    React.useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
            },
            () => {
                toast({ variant: 'destructive', title: 'Localização não encontrada' });
            }
        );
    }, [toast]);

    const handleSearch = useCallback(async (e) => {
        e.preventDefault();
        if (!searchQuery) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('fetch-places', {
                body: { query: searchQuery, lat: userCoords?.lat, lon: userCoords?.lon },
            });
            if (error) throw error;
            setSearchResults(data.results || []);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro na busca',
                description: 'Não foi possível buscar locais. Tente novamente.',
            });
        } finally {
            setLoading(false);
        }
    }, [searchQuery, userCoords, toast]);

    const handleAddPlace = (place) => {
        // Here you would typically add the place to your own database
        // For now, we'll just show a toast notification
        toast({
            title: 'Funcionalidade em desenvolvimento',
            description: `A adição do local "${place.name}" será implementada em breve.`,
        });
    };

    return (
        <>
            <Helmet>
                <title>Adicionar Novo Local - TurisME</title>
            </Helmet>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm shadow-sm">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="flex items-center gap-4 h-16">
                            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                                <ArrowLeft />
                            </Button>
                            <h1 className="text-xl font-bold text-gray-800">Adicionar Novo Local</h1>
                        </div>
                    </div>
                </header>
                
                <main className="flex-grow max-w-4xl w-full mx-auto p-4">
                    <form onSubmit={handleSearch} className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        <input
                            type="search"
                            placeholder="Digite o nome do local..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-full text-gray-800 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                        {loading && <Loader className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-blue-600" />}
                    </form>

                    <div className="space-y-3">
                        {searchResults.map((place) => (
                            <motion.div
                                key={place.place_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between gap-4"
                            >
                                <div className="flex-grow">
                                    <p className="font-semibold text-gray-800">{place.name}</p>
                                    <p className="text-sm text-gray-500 line-clamp-1">{place.formatted_address}</p>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => handleAddPlace(place)} className="flex-shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <PlusCircle className="w-5 h-5 mr-2" />
                                    Adicionar
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    {!loading && searchResults.length === 0 && (
                        <div className="text-center py-16 text-gray-500">
                             <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                             <p>Pesquise para encontrar locais e adicioná-los.</p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default AddPlacePage;
