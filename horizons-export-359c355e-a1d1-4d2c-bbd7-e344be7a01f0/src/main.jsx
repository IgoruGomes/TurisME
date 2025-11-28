
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { AnimatePresence } from 'framer-motion';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.Fragment>
    <AnimatePresence mode="wait">
      <App />
    </AnimatePresence>
  </React.Fragment>
);
