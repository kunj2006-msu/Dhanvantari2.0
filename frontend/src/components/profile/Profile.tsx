import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import PatientProfileCard from './PatientProfileCard';
import DoctorProfileCard from './DoctorProfileCard';
import { Loader2 } from 'lucide-react';

export default function Profile() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await authService.getProfile();
        setProfileData(data);
      } catch (err) {
        console.error("Failed to fetch profile from backend:", err);
        setError('Failed to fetch profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 h-full cursor-none">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4 cursor-none" />
        <p className="text-slate-400 cursor-none">Loading your profile securely...</p>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 h-full cursor-none">
        <div className="text-red-400 cursor-none">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center cursor-none custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl cursor-none"
      >
        {profileData?.role === 'ROLE_DOCTOR' ? (
          <DoctorProfileCard data={profileData} />
        ) : (
          <PatientProfileCard data={profileData} />
        )}
      </motion.div>
    </div>
  );
}
