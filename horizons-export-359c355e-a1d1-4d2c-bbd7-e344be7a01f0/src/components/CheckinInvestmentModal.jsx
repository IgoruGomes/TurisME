
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { X, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CheckinInvestmentModal = ({ categories, onClose, onTourStart }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [investment, setInvestment] = useState('');
  const [people, setPeople] = useState(1);
  const [distribution, setDistribution] = useState('auto');
  const [manualDistribution, setManualDistribution] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialManual = {};
    categories.forEach(cat => {
      initialManual[cat] = '';
    });
    setManualDistribution(initialManual);
  }, [categories]);

  const handleManualChange = (category, value) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    if (!isNaN(numValue) || value === '') {
      setManualDistribution(prev => ({ ...prev, [category]: numValue }));
    }
  };

  const getAutoDistribution = () => {
    if (!investment || categories.length === 0) return {};
    const amount = parseFloat(investment) / categories.length;
    const dist = {};
    categories.forEach(cat => {
      dist[cat] = amount.toFixed(2);
    });
    return dist;
  };

  const handleStartTour = async () => {
    setLoading(true);
    try {
        // Mock tour creation logic as we are not using the investment data yet
        // In a real scenario, this would create a "tour plan"
        toast({
            title: "Tour iniciado!",
            description: "Seu planejamento de tour foi salvo. Faça check-in nos locais!",
        });
        // We can save the plan to a new table if needed.
        // For now, it just closes the modal
        // Example: await supabase.from('tour_plans').insert({...})
        onTourStart(); // Closes all check-in modals
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao iniciar tour",
            description: error.message,
        });
    } finally {
        setLoading(false);
    }
  };

  const autoDist = getAutoDistribution();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Definir Investimento</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X /></button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          <div>
            <label className="font-semibold text-gray-700">Quanto você quer gastar?</label>
            <div className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
              <input
                type="number"
                placeholder="100,00"
                value={investment}
                onChange={e => setInvestment(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="font-semibold text-gray-700">Para quantas pessoas?</label>
            <div className="flex items-center gap-4">
              <Button size="icon" variant="outline" onClick={() => setPeople(p => Math.max(1, p - 1))}><Minus className="w-4 h-4" /></Button>
              <span className="text-lg font-bold w-8 text-center">{people}</span>
              <Button size="icon" variant="outline" onClick={() => setPeople(p => p + 1)}><Plus className="w-4 h-4" /></Button>
            </div>
          </div>
          
          <div>
            <label className="font-semibold text-gray-700">Distribuição do valor</label>
            <div className="flex mt-2 rounded-lg border border-gray-300 p-1">
              <Button onClick={() => setDistribution('auto')} variant={distribution === 'auto' ? 'secondary' : 'ghost'} className="flex-1">Automática</Button>
              <Button onClick={() => setDistribution('manual')} variant={distribution === 'manual' ? 'secondary' : 'ghost'} className="flex-1">Manual</Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Visualização</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{cat}</span>
                  {distribution === 'auto' ? (
                    <span className="text-sm font-medium text-gray-800">R$ {autoDist[cat] || '0.00'}</span>
                  ) : (
                    <div className="relative w-24">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                      <input
                        type="number"
                        value={manualDistribution[cat]}
                        onChange={e => handleManualChange(cat, e.target.value)}
                        className="w-full pl-9 pr-2 py-1 rounded-md text-sm border border-gray-300 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <Button onClick={handleStartTour} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? 'Iniciando...' : 'Iniciar Tour'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CheckinInvestmentModal;
