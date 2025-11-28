
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { X, Search, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTour } from '@/contexts/TourContext';
import { useToast } from '@/components/ui/use-toast';

const categoriesList = [
  "Bar", "Ponto Turístico", "Tabacaria", "Supermercado", "Lanchonete",
  "Loja de Acessórios", "Loja de Bebidas", "Loja de Brinquedos",
  "Loja de Calçados", "Loja de Decoração", "Loja de Eletrônicos",
  "Loja de Informática", "Loja de Móveis", "Loja de Perfumes",
  "Loja de Roupas", "Loja de Utilidades Domésticas", "Mercado Local",
  "Pet Shop", "Papelaria", "Pizzaria", "Posto de Combustível",
  "Pub/Balada", "Salão de Beleza", "Serviços Gerais", "Sorveteria",
  "Adega", "Autopeças/Oficina", "Academia", "Barbearia",
  "Bancos & Lotéricas", "Clínicas & Consultórios", "Distribuidora",
  "Flor & Presentes"
];

const TourSetupPage = () => {
  const navigate = useNavigate();
  const { saveTourSettings, manualDistribution, setManualDistribution, clearTour } = useTour();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [investment, setInvestment] = useState('');
  const [people, setPeople] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [distribution, setDistribution] = useState('auto');

  useEffect(() => {
    clearTour();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      () => {
        toast({ variant: 'destructive', title: 'Erro de Localização', description: 'Não foi possível obter sua localização. Usando localização padrão.' });
        setUserCoords({ lat: -23.3105, lon: -51.1629 }); // Londrina fallback
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const initialManual = {};
    selectedCategories.forEach(cat => {
      initialManual[cat] = manualDistribution[cat] || '';
    });
    setManualDistribution(initialManual);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories]);

  const handleManualChange = (category, value) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    if (!isNaN(numValue) || value === '') {
      setManualDistribution(prev => ({ ...prev, [category]: numValue }));
    }
  };

  const autoDist = useMemo(() => {
    if (!investment || selectedCategories.length === 0) return {};
    const amount = parseFloat(investment) / selectedCategories.length;
    const dist = {};
    selectedCategories.forEach(cat => {
      dist[cat] = amount.toFixed(2);
    });
    return dist;
  }, [investment, selectedCategories]);
  
  const filteredCategories = useMemo(() =>
    categoriesList.filter(c =>
      c.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const handleNextStep = () => setStep(2);
  
  const handleGenerateRecommendations = async () => {
    if (!investment) {
        toast({ variant: 'destructive', title: 'Campo obrigatório', description: 'Por favor, defina um valor de investimento.' });
        return;
    }
    if (!userCoords) {
        toast({ variant: 'destructive', title: 'Aguarde', description: 'Obtendo sua localização...' });
        return;
    }
    setLoading(true);
    const settings = { categories: selectedCategories, investment: parseFloat(investment), people, coords: userCoords, distribution, manualDistribution };
    const { error } = await saveTourSettings(settings);
    setLoading(false);
    if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível gerar recomendações.' });
    } else {
        navigate('/tour-recommendations');
    }
  };

  return (
    <>
      <Helmet><title>Planejar Tour - TurisME</title></Helmet>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-2xl mx-auto">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: '-100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '-100%' }} className="flex flex-col h-screen">
              <div className="p-6 border-b sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-gray-800">O que você quer fazer?</h2><button onClick={() => navigate('/home')} className="p-2 hover:bg-gray-100 rounded-full transition"><X /></button></div>
                <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Filtrar categorias..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-full bg-gray-100 border-transparent focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div className="p-6 overflow-y-auto flex-grow"><div className="flex flex-wrap gap-3">{filteredCategories.map(c => <motion.button key={c} onClick={() => toggleCategory(c)} whileTap={{ scale: 0.95 }} className={`px-4 py-2 rounded-full text-sm font-medium border ${selectedCategories.includes(c) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-100'}`}>{c}</motion.button>)}</div></div>
              <div className="p-6 border-t sticky bottom-0 bg-white"><Button onClick={handleNextStep} disabled={selectedCategories.length === 0} className="w-full bg-blue-600 hover:bg-blue-700">Continuar ({selectedCategories.length})</Button></div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} className="flex flex-col h-screen">
              <div className="p-6 border-b sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800">Definir Investimento</h2><button onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 rounded-full transition"><X /></button></div>
              </div>
              <div className="p-6 space-y-6 overflow-y-auto flex-grow">
                <div><label className="font-semibold text-gray-700">Quanto você quer gastar?</label><div className="relative mt-2"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span><input type="number" placeholder="100,00" value={investment} onChange={e => setInvestment(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" /></div></div>
                <div className="flex items-center justify-between"><label className="font-semibold text-gray-700">Para quantas pessoas?</label><div className="flex items-center gap-4"><Button size="icon" variant="outline" onClick={() => setPeople(p => Math.max(1, p - 1))}><Minus/></Button><span className="text-lg font-bold w-8 text-center">{people}</span><Button size="icon" variant="outline" onClick={() => setPeople(p => p + 1)}><Plus/></Button></div></div>
                <div>
                  <label className="font-semibold text-gray-700">Distribuição do valor</label>
                  <div className="grid grid-cols-2 gap-2 mt-2 rounded-lg border border-gray-300 p-1 bg-gray-100">
                    <Button onClick={() => setDistribution('auto')} variant={distribution === 'auto' ? 'default' : 'ghost'} className={`w-full ${distribution === 'auto' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>Automática</Button>
                    <Button onClick={() => setDistribution('manual')} variant={distribution === 'manual' ? 'default' : 'ghost'} className={`w-full ${distribution === 'manual' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>Manual</Button>
                  </div>
                </div>
                 <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Visualização</h3>
                    <div className="space-y-2">
                    {selectedCategories.map(cat => (
                        <div key={cat} className="flex items-center justify-between gap-4 p-3 bg-gray-100 rounded-lg">
                        <span className="text-sm text-gray-600">{cat}</span>
                        {distribution === 'auto' ? (
                            <span className="text-sm font-medium text-gray-800">R$ {autoDist[cat] || '0.00'}</span>
                        ) : (
                            <div className="relative w-28">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                            <input type="number" value={manualDistribution[cat]} onChange={e => handleManualChange(cat, e.target.value)} className="w-full pl-9 pr-2 py-1 rounded-md text-sm border-gray-300 focus:ring-1 focus:ring-blue-500"/>
                            </div>
                        )}
                        </div>
                    ))}
                    </div>
                </div>
              </div>
              <div className="p-6 border-t sticky bottom-0 bg-white"><Button onClick={handleGenerateRecommendations} disabled={loading || !investment} className="w-full bg-blue-600 hover:bg-blue-700">{loading ? 'Gerando...' : 'Gerar Recomendações'}</Button></div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default TourSetupPage;
