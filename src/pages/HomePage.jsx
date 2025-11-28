import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import LocationCard from '@/components/LocationCard';
import { useToast } from '@/components/ui/use-toast';

const FALLBACK_IMAGE = "/fallback.jpg";

const HomePage = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialFetchDone = useRef(false);

  // Função para buscar URL da foto via backend
  const fetchPhotoUrl = async (photo_reference) => {
    if (!photo_reference) return FALLBACK_IMAGE;

    try {
      const res = await fetch('/api/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_reference, maxwidth: 800 }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        console.log("URL criada para foto:", url);
        return url;
      } else {
        const errorData = await res.json();
        console.error("Erro ao buscar foto:", errorData);
        return FALLBACK_IMAGE;
      }
    } catch (err) {
      console.error("Erro ao buscar foto:", err);
      return FALLBACK_IMAGE;
    }
  };

  // Buscar locais
  const fetchPlaces = useCallback(async (query, lat, lon) => {
    setLoading(true);
    console.log("Buscando locais com:", { query, lat, lon });

    try {
      const { data, error } = await supabase.functions.invoke('fetch-places', {
        body: { query, lat, lon },
      });

      if (error) throw error;
      console.log("Dados recebidos do backend:", data);

      const formatted = await Promise.all(
        (data.results || []).map(async (p) => {
          console.log("photo_reference do local:", p.photos?.[0]?.photo_reference);
          const image_url = await fetchPhotoUrl(p.photos?.[0]?.photo_reference);
          return {
            id: p.place_id,
            name: p.name,
            description: p.formatted_address,
            image_url,
            raw: p,
          };
        })
      );

      setLocations(formatted);
    } catch (err) {
      console.error("Erro ao buscar locais:", err);
      toast({ variant: "destructive", title: "Erro ao buscar locais", description: err.message });
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch inicial
  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("Coords do usuário:", latitude, longitude);
        setUserCoords({ lat: latitude, lon: longitude });
        fetchPlaces('', latitude, longitude);
      },
      () => {
        console.log("Permissão de localização negada");
        fetchPlaces('', null, null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return (
    <div>
      <h1>Locais</h1>
      {loading && <p>Carregando...</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {locations.map((loc) => (
          <LocationCard
            key={loc.id}
            location={{
              name: loc.name,
              description: loc.description,
              image_url: loc.image_url,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
