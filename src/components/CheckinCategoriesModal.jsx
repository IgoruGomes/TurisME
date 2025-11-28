
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CheckinInvestmentModal from '@/components/CheckinInvestmentModal';

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

const CheckinCategoriesModal = ({ onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isInvestmentModalOpen, setInvestmentModalOpen] = useState(false);

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

  const handleContinue = () => {
    setInvestmentModalOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">O que você quer fazer hoje?</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Filtrar categorias..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full text-gray-800 bg-gray-100 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto flex-grow">
            <div className="flex flex-wrap gap-3">
              {filteredCategories.map(category => (
                <motion.button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    selectedCategories.includes(category)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200">
            <Button
              onClick={handleContinue}
              disabled={selectedCategories.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Continuar ({selectedCategories.length})
            </Button>
          </div>
        </motion.div>
      </motion.div>
      
      <AnimatePresence>
        {isInvestmentModalOpen && (
          <CheckinInvestmentModal
            categories={selectedCategories}
            onClose={() => setInvestmentModalOpen(false)}
            onTourStart={onClose}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CheckinCategoriesModal;
