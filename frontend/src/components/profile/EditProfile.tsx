import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import { Loader2, Save, X, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MapModal from '../MapModal';

interface EditProfileProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const COMMON_CONDITIONS = ["Diabetes", "Hypertension", "Asthma", "Thyroid Disorder", "Heart Disease", "Arthritis", "Migraine", "None"];

export default function EditProfile({ onCancel, onSuccess }: EditProfileProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState<any>({});

  // Map Modal State
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await authService.getProfile();
        setRole(data.role);
        
        // Ensure field names match our inputs
        let baseData = {
          ...data,
          experienceYears: data.yearsOfExperience || ''
        };

        // 1. IMMEDIATELY set base data so the form is NEVER blank
        setFormData(baseData); 
        
        // 2. Safely parse conditions ONLY if they are a Patient
        if (data.role === 'ROLE_PATIENT') {
          let conditionsArray: string[] = [];
          
          // Handle both String and Array possibilities from the backend
          if (Array.isArray(data.preMedicalConditions)) {
            conditionsArray = data.preMedicalConditions;
          } else if (typeof data.preMedicalConditions === 'string') {
            conditionsArray = data.preMedicalConditions
              .split(',')
              .map((c: string) => c.trim())
              .filter((c: string) => c !== "");
          }

          // 3. Map to checkboxes safely
          let recognized: string[] = [];
          let others: string[] = [];
          
          conditionsArray.forEach((condition: string) => {
            if (COMMON_CONDITIONS.includes(condition)) {
              recognized.push(condition);
            } else {
              others.push(condition);
            }
          });
          
          setFormData({
            ...baseData,
            medicalConditions: recognized,
            otherCondition: others.join(', ')
          });
        }
      } catch (error) {
        console.error("🔥 CRITICAL PROFILE LOAD ERROR:", error);
        setError("Failed to load profile data. Check the console for details.");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckboxChange = (condition: string) => {
    let current = formData.medicalConditions || [];
    
    if (condition === "None") {
      setFormData({ ...formData, medicalConditions: ["None"], otherCondition: '' });
      return;
    }
    
    current = current.filter((c: string) => c !== "None");

    if (current.includes(condition)) {
      setFormData({ ...formData, medicalConditions: current.filter((c: string) => c !== condition) });
    } else {
      setFormData({ ...formData, medicalConditions: [...current, condition] });
    }
  };

  const handleMapConfirm = (lat: number, lng: number, address: string) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
      clinicAddress: address
    });
    setIsMapOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      let payload = { ...formData };
      
      if (role === 'ROLE_PATIENT') {
        const combined = [...(formData.medicalConditions || [])];
        if (formData.otherCondition && formData.otherCondition.trim()) {
           combined.push(formData.otherCondition.trim());
        }
        payload.preMedicalConditions = combined.join(', ');
        payload.heightCm = formData.heightCm ? parseFloat(formData.heightCm) : null;
        payload.weightKg = formData.weightKg ? parseFloat(formData.weightKg) : null;
        // remove the temporary arrays/strings from payload
        delete payload.medicalConditions;
        delete payload.otherCondition;
      }
      
      await authService.updateProfile(payload);
      setSuccessMsg('Profile updated successfully!');
      
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col items-center justify-center min-h-[400px] cursor-none">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4 cursor-none" />
        <p className="text-slate-400 cursor-none">Loading your details...</p>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden cursor-none"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -ml-32 -mt-32 pointer-events-none cursor-none"></div>

        <div className="flex justify-between items-center mb-8 relative z-10 cursor-none">
          <h2 className="text-2xl font-bold text-white cursor-none">{t('editProfile')}</h2>
          <button 
            onClick={onCancel}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-none group"
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-white cursor-none" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm cursor-none">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400 text-sm cursor-none">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10 cursor-none">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 cursor-none">
            {/* Common Fields */}
            <div className="cursor-none">
              <label className="block text-sm font-medium text-slate-300 mb-2 cursor-none">{t('fullName')}</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-white placeholder-slate-500 transition-all cursor-none"
                required
              />
            </div>

            {/* Patient Fields */}
            {role === 'ROLE_PATIENT' && (
              <>
                <div className="cursor-none">
                  <label className="block text-sm font-medium text-slate-300 mb-2 cursor-none">{t('age')}</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-white placeholder-slate-500 transition-all cursor-none"
                  />
                </div>

                <div className="cursor-none">
                  <label className="block text-sm font-medium text-slate-300 mb-2 cursor-none">{t('gender')}</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-white transition-all cursor-none"
                  >
                    <option value="">{t('selectGender')}</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="cursor-none">
                  <label className="block text-sm font-medium text-slate-300 mb-2 cursor-none">{t('bloodGroup')}</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-white transition-all cursor-none"
                  >
                    <option value="">{t('selectBloodGroup')}</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div className="cursor-none">
                  <label className="block text-sm font-medium text-slate-300 mb-2 cursor-none">Height (cm)</label>
                  <input
                    type="number"
                    step="any"
                    name="heightCm"
                    value={formData.heightCm || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-white placeholder-slate-500 transition-all cursor-none"
                    placeholder="e.g. 175"
                  />
                </div>

                <div className="cursor-none">
                  <label className="block text-sm font-medium text-slate-300 mb-2 cursor-none">Weight (kg)</label>
                  <input
                    type="number"
                    step="any"
                    name="weightKg"
                    value={formData.weightKg || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-white placeholder-slate-500 transition-all cursor-none"
                    placeholder="e.g. 70"
                  />
                </div>
              </>
            )}

            {/* Doctor Fields */}
            {role === 'ROLE_DOCTOR' && (
              <>
                <div className="cursor-none">
                  <label className="block text-sm font-medium text-slate-300 mb-2 cursor-none">Degree</label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-white placeholder-slate-500 transition-all cursor-none"
                  />
                </div>

                <div className="cursor-none">
                  <label className="block text-sm font-medium text-slate-300 mb-2 cursor-none">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-white placeholder-slate-500 transition-all cursor-none"
                  />
                </div>

                <div className="cursor-none">
                  <label className="block text-sm font-medium text-slate-300 mb-2 cursor-none">Years of Experience</label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-white placeholder-slate-500 transition-all cursor-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Full Width Fields */}
          {role === 'ROLE_PATIENT' && (
            <div className="bg-slate-900/30 p-5 rounded-xl border border-white/5 cursor-none">
              <label className="block text-sm font-medium text-slate-300 mb-4 cursor-none">Pre-existing Medical Conditions</label>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 cursor-none">
                {COMMON_CONDITIONS.map(condition => (
                  <label key={condition} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-slate-800/50 hover:bg-slate-700/50 transition-colors cursor-none">
                    <input 
                      type="checkbox"
                      checked={formData.medicalConditions?.includes(condition)}
                      onChange={() => handleCheckboxChange(condition)}
                      className="w-4 h-4 rounded border-white/20 bg-slate-900 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-800 cursor-none"
                    />
                    <span className="text-sm text-slate-300 cursor-none">{condition}</span>
                  </label>
                ))}
              </div>
              
              <div className="cursor-none">
                <label className="block text-xs text-slate-400 mb-2 cursor-none">Other (Specify)</label>
                <input
                  type="text"
                  name="otherCondition"
                  value={formData.otherCondition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-white placeholder-slate-500 transition-all cursor-none"
                  placeholder="e.g. Migraines, Arthritis"
                />
              </div>
            </div>
          )}

          {role === 'ROLE_DOCTOR' && (
            <div className="bg-slate-900/30 p-5 rounded-xl border border-white/5 cursor-none">
              <div className="flex justify-between items-center mb-4 cursor-none">
                 <label className="block text-sm font-medium text-slate-300 cursor-none">{t('address')}</label>
                 <button
                   type="button"
                   onClick={() => setIsMapOpen(true)}
                   className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 rounded-lg transition-colors text-sm font-medium border border-teal-500/20 cursor-none"
                 >
                   <MapPin className="w-4 h-4 cursor-none" />
                   Update Address on Map
                 </button>
              </div>
              
              <div className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white min-h-[60px] cursor-none opacity-80">
                {formData.clinicAddress ? formData.clinicAddress : 'No address set. Please update on map.'}
              </div>
              {formData.latitude && formData.longitude && (
                <div className="mt-2 text-xs text-slate-500 cursor-none">
                   Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-white/10 flex justify-end gap-4 cursor-none">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors font-medium cursor-none"
            >
              {t('cancel')}
            </button>
            
            <button
              type="submit"
              disabled={saving || !!error}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white rounded-xl transition-all font-medium flex items-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-70 disabled:cursor-none cursor-none"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin cursor-none" /> : <Save className="w-5 h-5 cursor-none" />}
              {t('saveChanges')}
            </button>
          </div>
        </form>
      </motion.div>

      <MapModal 
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={handleMapConfirm}
        initialLat={formData.latitude}
        initialLng={formData.longitude}
      />
    </>
  );
}
