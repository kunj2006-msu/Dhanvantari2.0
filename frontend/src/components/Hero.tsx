import { motion } from 'framer-motion';
import { User, Activity } from 'lucide-react';

interface HeroProps {
  onOpenAuth: (type: 'patient' | 'doctor') => void;
}

export default function Hero({ onOpenAuth }: HeroProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 animate-gradient">
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/20 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-3xl" />

      {/* Glassmorphism Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-4xl w-full mx-4 p-8 md:p-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-center"
      >
        
        {/* Sanskrit Shloka */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="mb-8"
        >
          <p className="text-orange-400 text-lg md:text-xl font-medium leading-relaxed font-sanskrit tracking-wide whitespace-pre-line">
            {`ॐ सर्वे भवन्तु सुखिनः ।
सर्वे सन्तु निरामयाः ।
सर्वे भद्राणि पश्यन्तु ।
मा कश्चित् दुःख भाग्भवेत् ॥`}
          </p>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4"
        >
          Welcome to Dhanvantari. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
            Your AI Healthcare Companion.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-4 mb-10 text-lg text-slate-300 max-w-2xl mx-auto"
        >
          Experience the future of healthcare with empathetic AI consultations, 
          precise medical triage, and seamless appointment scheduling.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(6, 182, 212, 0.4), 0 10px 10px -5px rgba(6, 182, 212, 0.2)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenAuth('patient')}
            className="flex items-center gap-3 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl font-semibold text-lg transition-all duration-300"
          >
            <User className="w-6 h-6" />
            Continue as Patient
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(6, 182, 212, 0.2), 0 10px 10px -5px rgba(6, 182, 212, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenAuth('doctor')}
            className="flex items-center gap-3 w-full sm:w-auto px-8 py-4 bg-transparent text-cyan-300 border border-cyan-400 hover:bg-cyan-900/30 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-sm"
          >
            <Activity className="w-6 h-6" />
            Continue as Doctor
          </motion.button>
        </motion.div>

      </motion.div>
    </div>
  );
}
