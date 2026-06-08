// components/home/CTASection.jsx
'use client';
import Link from 'next/link'
import Button from '../ui/Button'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { MdOutlineEventAvailable } from 'react-icons/md'
import { FaWhatsapp } from 'react-icons/fa'

export default function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#F4620A]/20 to-[#C040E0]/20" />
      
      {/* Cercles flottants animés */}
      <motion.div 
        className="absolute top-20 left-20 w-[300px] h-[300px] rounded-full bg-[#F4620A]/30 blur-[100px]"
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-20 right-20 w-[300px] h-[300px] rounded-full bg-[#C040E0]/30 blur-[100px]"
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, -30, 0],
          y: [0, 30, 0]
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Titre animé au scroll */}
        <motion.h2 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
        >
          Prêt à rejoindre <span className="gradient-text">l'aura ?</span>
        </motion.h2>
        
        {/* Sous-titre animé au scroll */}
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="text-[#A0A0B8] text-lg mb-8"
        >
          Réservez votre espace dès aujourd'hui et rejoignez une communauté qui avance.
        </motion.p>
        
        {/* Boutons animés au scroll */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/espaces">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button variant="primary" className="px-8 py-4 text-lg flex items-center gap-2">
                <MdOutlineEventAvailable size={20} />
                Réserver maintenant
              </Button>
            </motion.div>
          </Link>
          
          <Link 
            href="https://wa.me/212600000000?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20vos%20espaces%20de%20coworking"
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button variant="secondary" className="px-8 py-4 text-lg flex items-center gap-2">
                <FaWhatsapp size={20} className="text-green-400" />
                Contact WhatsApp
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}