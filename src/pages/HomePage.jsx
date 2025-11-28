import React, { useState, useEffect, useCallback } from 'react';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [nearby, setNearby] = useState([]);
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  // 🔍 Busca imagens quando digitar algo
  const fetchImages = useCallback(async () => {
    if (!query.trim()) return;

    try {
      const res = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=SUA_CX_AQUI&q=${query}&searchType=image`
      );

      const data = await res.json();
      setImages(data.items || []);
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
    }
  }, [query, apiKey]);

  // 📌 Busca locais próximos (exemplo estático; posso ligar no Google Places)
  const fetchNearby = useCallback(async () => {
    // Aqui depois você troca pela API real
    const locaisFakes = [
      { nome: 'Café Central', distancia: '300m', img: 'https://placehold.co/300' },
      { nome: 'Parque Lago Azul', distancia: '1.2km', img: 'https://placehold.co/300' },
      { nome: 'Museu Histórico', distancia: '900m', img: 'https://placehold.co/300' }
    ];

    setNearby(locaisFakes);
  }, []);

  useEffect(() => {
    // Se não tem pesquisa → mostra lugares próximos
    if (!query.trim()) {
      fetchNearby();
      return;
    }

    // Se tem pesquisa → busca imagens
    fetchImages();
  }, [query, fetchImages, fetchNearby]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Explorar Locais & Imagens</h1>

      <input
        type="text"
        placeholder="Pesquisar imagens..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: 12,
          fontSize: 16,
          borderRadius: 8,
          marginBottom: 20
        }}
      />

      {/* ------------------------
          QUANDO NÃO TEM PESQUISA
        ------------------------ */}
      {!query.trim() && (
        <div>
          <h2>Lugares próximos de você</h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {nearby.map((loc, idx) => (
              <div key={idx} style={{ width: 200 }}>
                <img
                  src={loc.img}
                  alt={loc.nome}
                  style={{
                    width: '100%',
                    borderRadius: 10,
                    objectFit: 'cover'
                  }}
                />
                <h3>{loc.nome}</h3>
                <p>{loc.distancia}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------
          QUANDO EXISTE PESQUISA
        ------------------------ */}
      {query.trim() && (
        <div>
          <h2>Resultados da pesquisa</h2>

          {images.length === 0 && <p>Nenhuma imagem encontrada...</p>}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {images.map((img) => (
              <img
                key={img.link}
                src={img.link}
                alt={img.title}
                width={200}
                style={{
                  borderRadius: 10,
                  objectFit: 'cover'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
