import { useState } from 'react';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import Features from '../components/Features';
import AuthModal from '../components/AuthModal';

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'patient' | 'doctor'>('patient');

  const handleOpenAuth = (type: 'patient' | 'doctor') => {
    setAuthModalType(type);
    setIsAuthModalOpen(true);
  };

  return (
    <main className="bg-slate-900 min-h-screen">
      <Navbar />
      <Hero onOpenAuth={handleOpenAuth} />
      <Features />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialUserType={authModalType} 
      />
    </main>
  );
}
