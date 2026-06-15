'use client';
import { useLoading } from './LoadingContext';
import { AnimatePresence, motion } from 'framer-motion';

export default function PageLoader() {
  const { isLoading } = useLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeOut' } }}
          className="fixed inset-0 z-[9999] bg-[#0A0A0F] flex flex-col items-center justify-center gap-6"
        >
          {/* Logo / Brand */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-bold text-white tracking-tight"
          >
            Work<span className="bg-gradient-to-r from-[#F4620A] to-[#9B1FD4] bg-clip-text text-transparent">aura</span>
          </motion.div>

          {/* Barre de progression animée */}
          <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#F4620A] to-[#9B1FD4]"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <p className="text-[#A0A0B8] text-sm">Chargement en cours...</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}