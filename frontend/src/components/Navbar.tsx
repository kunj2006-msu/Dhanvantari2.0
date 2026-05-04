import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import HeartPulseMonitor from './HeartPulseMonitor';

const languages = [
  'English', 'Hindi', 'Gujarati', 'Marathi', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Punjabi', 'Odia'
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');

  return (
    <nav className="fixed top-0 w-full z-40 bg-slate-900/50 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex-shrink-0 flex items-center gap-3">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 font-serif">
              Dhanvantari
            </span>
            <HeartPulseMonitor />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-4 py-2 text-teal-100 hover:text-cyan-300 transition-colors focus:outline-none"
            >
              <Globe className="w-5 h-5" />
              <span className="hidden sm:block font-medium">{selectedLang}</span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-lg border border-teal-800/50 py-2 overflow-hidden"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLang(lang);
                        setIsOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-teal-900/50 transition-colors ${
                        selectedLang === lang ? 'text-cyan-400 font-semibold bg-teal-900/30' : 'text-gray-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </nav>
  );
}
