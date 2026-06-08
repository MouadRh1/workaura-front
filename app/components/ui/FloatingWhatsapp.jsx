// components/ui/FloatingWhatsApp.jsx (version simple)
'use client';
import { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingWhatsApp() {
//   const [isVisible, setIsVisible] = useState(false);

  const phoneNumber = '212613256977';
  const message = encodeURIComponent(
    'Bonjour, je suis intéressé par vos espaces de coworking.'
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsVisible(window.scrollY > 300);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

  return (
    <AnimatePresence>
      {/* {isVisible && ( */}
        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0, x: 100 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 w-18 h-18 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] shadow-lg flex items-center justify-center cursor-pointer hover:shadow-xl transition-shadow"
        >
          <FaWhatsapp size={35} className="text-white" />
        </motion.a>
      {/* )} */}
    </AnimatePresence>
  );
}