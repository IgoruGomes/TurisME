
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (animationComplete) {
      navigate('/login');
    }
  }, [animationComplete, navigate]);

  return (
    <>
      <Helmet>
        <title>TurisME - Descubra Londrina</title>
        <meta name="description" content="Explore os melhores pontos turísticos de Londrina com TurisME" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-orange-500 overflow-hidden">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.8,
            ease: "easeOut"
          }}
          className="relative"
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 1.5,
              repeat: 1,
              ease: "easeInOut"
            }}
          >
            <img 
              src="https://horizons-cdn.hostinger.com/359c355e-a1d1-4d2c-bbd7-e344be7a01f0/4e7d33a87563a7dbf484d5ddc9fa3bfc.png"
              alt="TurisME Logo"
              className="w-64 h-auto"
            />
          </motion.div>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="h-1 bg-white rounded-full mt-8 mx-auto"
            style={{ maxWidth: '200px' }}
          />
        </motion.div>
      </div>
    </>
  );
};

export default SplashScreen;
