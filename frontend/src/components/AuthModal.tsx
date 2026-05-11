import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { CustomDropdown } from './CustomDropdown';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUserType: 'patient' | 'doctor';
}

const locationData: Record<string, string[]> = {
  "Gujarat": ["Ahmedabad", "Vadodara", "Surat", "Rajkot", "Godhra", "Gandhinagar"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
  "Delhi": ["New Delhi"]
};

export default function AuthModal({ isOpen, onClose, initialUserType }: AuthModalProps) {
  // Form View State
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form Data State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [degree, setDegree] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [preMedicalConditions, setPreMedicalConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState('');

  const navigate = useNavigate();

  // Reset state when modal opens or view changes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      setEmail('');
      setPassword('');
      setName('');
      setDob('');
      setAge('');
      setGender('');
      setSelectedState('');
      setSelectedCity('');
      setDegree('');
      setSpecialization('');
      setPreMedicalConditions([]);
      setOtherCondition('');
    }
  }, [isOpen, isLogin, initialUserType]);

  // Auto-calculate age
  useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge.toString());
    } else {
      setAge('');
    }
  }, [dob]);

  // Handle Checkbox Toggles for Conditions
  const handleConditionToggle = (condition: string) => {
    if (condition === 'None') {
      setPreMedicalConditions(['None']);
      setOtherCondition('');
    } else {
      setPreMedicalConditions(prev => {
        const filtered = prev.filter(c => c !== 'None');
        if (filtered.includes(condition)) {
          return filtered.filter(c => c !== condition);
        } else {
          return [...filtered, condition];
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // --- REAL LOGIN LOGIC ---
        await authService.login({ email, password });
        onClose();
        navigate(`/${initialUserType}`);
      } else {
        // --- REAL REGISTRATION LOGIC ---

        // Compile the conditions list
        const finalConditions = [...preMedicalConditions];
        if (otherCondition) finalConditions.push(otherCondition);

        // Build the payload expected by Spring Boot
        const userData = {
          role: "ROLE_" + initialUserType.toUpperCase(),
          name,
          email,
          password,
          // Patient specific
          ...(initialUserType === 'patient' && {
            dob,
            age: parseInt(age),
            gender,
            preMedicalConditions: finalConditions.join(', ')
          }),
          // Doctor specific
          ...(initialUserType === 'doctor' && {
            degree,
            specialization,
            state: selectedState,
            city: selectedCity
          })
        };

        await authService.register(userData);
        setSuccessMessage('Account created successfully! You can now log in.');
        setIsLogin(true); // Switch back to login view automatically
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-cyan-900/20 custom-scrollbar"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-slate-100">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6">

            {/* Status Messages */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-2 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/50 rounded-xl text-teal-400 text-sm">
                <p>{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Common Login Fields */}
              {isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email ID</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}

              {/* Patient Register Fields */}
              {!isLogin && initialUserType === 'patient' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                    <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email ID</label>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                    <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all" placeholder="••••••••" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Date of Birth</label>
                      <input required type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 [color-scheme:dark] transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Age</label>
                      <input type="text" value={age} readOnly className="w-full px-4 py-2 bg-slate-800/30 border border-white/5 rounded-xl text-slate-400 cursor-not-allowed transition-all" placeholder="Auto-calc" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Gender</label>
                    <CustomDropdown
                      value={gender}
                      onChange={setGender}
                      options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' }
                      ]}
                      placeholder="Select Gender"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Pre-medical Conditions</label>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-3">
                      {['Diabetes', 'Hypertension', 'Asthma', 'Thyroid Disorder', 'Heart Disease', 'Arthritis', 'Migraine', 'None'].map(condition => (
                        <label key={condition} className="flex items-center gap-3 text-slate-300 cursor-pointer group">
                          <div className="relative flex items-center justify-center w-5 h-5">
                            <input
                              type="checkbox"
                              checked={preMedicalConditions.includes(condition)}
                              onChange={() => handleConditionToggle(condition)}
                              className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-slate-800/50 checked:bg-teal-500 checked:border-teal-500 transition-all focus:ring-2 focus:ring-teal-500/50 focus:outline-none"
                            />
                            <svg className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-slate-900 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <span className="group-hover:text-white transition-colors">{condition}</span>
                        </label>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={otherCondition}
                      onChange={(e) => setOtherCondition(e.target.value)}
                      disabled={preMedicalConditions.includes('None')}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Other conditions..."
                    />
                  </div>
                </>
              )}

              {/* Doctor Register Fields */}
              {!isLogin && initialUserType === 'doctor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                    <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all" placeholder="Dr. Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email ID</label>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all" placeholder="doctor@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                    <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Degree</label>
                    <input required type="text" value={degree} onChange={(e) => setDegree(e.target.value)} className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all" placeholder="MBBS, MD" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Specialization</label>
                    <input required type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all" placeholder="Cardiologist" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">State</label>
                      <CustomDropdown
                        value={selectedState}
                        onChange={(val) => {
                          setSelectedState(val);
                          setSelectedCity(''); // Reset city when state changes
                        }}
                        options={Object.keys(locationData)}
                        placeholder="Select State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">City</label>
                      <CustomDropdown
                        value={selectedCity}
                        onChange={setSelectedCity}
                        disabled={!selectedState}
                        options={selectedState ? locationData[selectedState] : []}
                        placeholder={selectedState ? "Select City" : "Select a State first"}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? "Processing..."
                  : isLogin
                    ? `Login as ${initialUserType === 'patient' ? 'Patient' : 'Doctor'}`
                    : `Register as ${initialUserType === 'patient' ? 'Patient' : 'Doctor'}`
                }
              </button>
            </form>

            {/* Footer toggle */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMessage(''); // Clear errors when switching tabs
                }}
                className="text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium"
              >
                {isLogin ? "New here? Register" : "Already have an account? Login"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}