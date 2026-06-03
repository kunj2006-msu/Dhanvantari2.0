import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Stethoscope, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Features from '../components/Features';
import AuthModal from '../components/AuthModal';
import heroVideo from '../assets/hero-bg.mp4';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'ur', label: 'اردو (Urdu)' },
  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' }
];

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'patient' | 'doctor'>('patient');
  const [isLangOpen, setIsLangOpen] = useState(false);

  const { t, i18n } = useTranslation();

  const handleOpenAuth = (type: 'patient' | 'doctor') => {
    setAuthModalType(type);
    setIsAuthModalOpen(true);
  };

  const currentLangLabel = LANGUAGES.find(l => l.code === (i18n.language || 'en'))?.label || 'English';

  return (
    <main className="bg-slate-950 min-h-screen flex flex-col w-full overflow-x-hidden">

      {/* ── 1. HERO SECTION WITH VIDEO ── */}
      <section className="relative w-full min-h-screen">

        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ objectPosition: 'center 15%' }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-slate-950/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />

        {/* ── Top Right Controls (Portals & Dropdown) ── */}
        <div className="absolute top-8 right-6 md:right-12 z-50 flex flex-col items-end gap-4">

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => handleOpenAuth('patient')}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500/90 to-cyan-500/90 hover:from-teal-400 hover:to-cyan-400 backdrop-blur-md text-white rounded-full font-semibold shadow-lg shadow-teal-500/20 transition-all"
            >
              <User className="w-5 h-5" />
              {t('patientPortal', 'Patient Portal')}
            </button>
            <button
              onClick={() => handleOpenAuth('doctor')}
              className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full font-semibold shadow-lg transition-all"
            >
              <Stethoscope className="w-5 h-5" />
              {t('doctorPortal', 'Doctor Portal')}
            </button>
          </div>

          {/* Custom Glassmorphic Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full transition-all text-white text-sm font-medium shadow-lg"
            >
              <Globe className="w-4 h-4" />
              {currentLangLabel}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-56 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="max-h-72 overflow-y-auto py-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3 text-sm transition-colors ${i18n.language === lang.code
                          ? 'bg-teal-500/20 text-teal-300 font-semibold'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Hero Text (Bottom Left) ── */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          /* Increased duration to 2.5 seconds and delay to 0.4 seconds */
          transition={{ duration: 3.5, ease: "easeOut", delay: 1 }}
          className="absolute bottom-24 left-6 md:left-16 z-20 max-w-2xl text-left pointer-events-none"
        >
          <h1
            className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-wide drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] leading-[1.4]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {t('heroTitleTop', "Dhanvantari's")} <br />
            <span className="inline-block mt-2 pb-4 text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              {t('heroTitleBottom', "Divine Grace")}
            </span>
          </h1>

          <div className="space-y-4">
            <p className="text-lg md:text-xl text-slate-100 font-light max-w-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              {t('heroDesc', 'Inspired by Lord Dhanvantari, we bridge ancient wisdom with modern technology for your holistic well-being.')}
            </p>
            <p className="text-base md:text-lg text-teal-50 font-medium max-w-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] tracking-wide">
              {t('heroShloka', 'ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः । सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत ॥')}
            </p>
          </div>

          {/* Mobile Buttons */}
          <div className="md:hidden flex flex-col gap-3 mt-8 pointer-events-auto">
            <button
              onClick={() => handleOpenAuth('patient')}
              className="flex justify-center items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500/90 to-cyan-500/90 backdrop-blur-md text-white rounded-full font-semibold shadow-lg"
            >
              <User className="w-5 h-5" />
              {t('patientPortal', 'Patient Portal')}
            </button>
            <button
              onClick={() => handleOpenAuth('doctor')}
              className="flex justify-center items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-semibold shadow-lg"
            >
              <Stethoscope className="w-5 h-5" />
              {t('doctorPortal', 'Doctor Portal')}
            </button>
          </div>
        </motion.div>

      </section>

      {/* ── 2. SCROLLING FEATURES SECTION ── */}
      <div id="features" className="relative z-20 bg-slate-950 pt-16">
        <Features />
      </div>

      {/* ── 3. AUTHENTICATION MODAL ── */}
      <div className="relative z-50">
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialUserType={authModalType}
        />
      </div>

    </main>
  );
}