import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { CustomDropdown } from './CustomDropdown';
import { CustomDatePicker } from './CustomDatePicker';
import MapModal from './MapModal';
import { MapPin, CheckCircle2 } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{ lat: number, lng: number } | null>(null);

  // Form Data State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [degree, setDegree] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [preMedicalConditions, setPreMedicalConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');

  const navigate = useNavigate();

  // Reset state when modal opens or view changes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setName('');
      setDob('');
      setAge('');
      setGender('');
      setBloodGroup('');
      setSelectedState('');
      setSelectedCity('');
      setDegree('');
      setSpecialization('');
      setRegistrationNumber('');
      setExperienceYears('');
      setClinicAddress('');
      setPreMedicalConditions([]);
      setOtherCondition('');
      setHeightCm('');
      setWeightKg('');
      setIsMapOpen(false);
      setLocationCoords(null);
    }
  }, [isOpen, isLogin, initialUserType]);

  // Auto-calculate age
  useEffect(() => {
    if (dob) {
      let birthDate;
      const parts = dob.split('-');
      if (parts[0].length === 4) {
        birthDate = new Date(dob);
      } else if (parts.length === 3) {
        birthDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      } else {
        birthDate = new Date(dob);
      }

      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        setAge(calculatedAge.toString());
      }
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
        const response = await authService.login({ email, password });

        // NOTE: The Spring Boot backend AuthController now returns { token, name, role } in the response.
        const userRole = response?.role;
        const expectedRole = "ROLE_" + initialUserType.toUpperCase();

        if (userRole && userRole !== expectedRole) {
          authService.logout(); // Clear the token that was just saved
          setErrorMessage(`Access Denied: Please use the ${userRole === 'ROLE_DOCTOR' ? 'Doctor' : 'Patient'} Login portal.`);
          setIsLoading(false);
          return;
        }

        const userName = response?.name || (initialUserType === 'patient' ? 'Patient' : 'Doctor');
        localStorage.setItem('userName', userName);

        if (initialUserType === 'doctor') {
          localStorage.setItem('userSpecialization', response?.specialization || 'Specialist');
        }

        onClose();
        navigate(`/${initialUserType}`);
      } else {
        // --- REAL REGISTRATION LOGIC ---

        // Frontend validation
        if (initialUserType === 'patient') {
          if (!name || !email || !password || !dob || !gender || !bloodGroup) {
            setErrorMessage("Please fill in all mandatory medical fields.");
            setIsLoading(false);
            return;
          }
        } else if (initialUserType === 'doctor') {
          if (!name || !email || !password || !degree || !specialization || !experienceYears || !selectedState || !selectedCity || !locationCoords) {
            setErrorMessage("Please complete all fields and select your clinic location on the map.");
            setIsLoading(false);
            return;
          }
        }

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
            dateOfBirth: dob.includes('-') && dob.split('-')[0].length === 2 ? dob.split('-').reverse().join('-') : dob,
            age: parseInt(age),
            gender,
            bloodGroup,
            preMedicalConditions: finalConditions.join(', '),
            heightCm: heightCm ? parseFloat(heightCm) : undefined,
            weightKg: weightKg ? parseFloat(weightKg) : undefined
          }),
          // Doctor specific
          ...(initialUserType === 'doctor' && {
            degree,
            specialization,
            registrationNumber,
            experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
            clinicAddress,
            state: selectedState,
            city: selectedCity,
            latitude: locationCoords?.lat,
            longitude: locationCoords?.lng
          })
        };

        await authService.register(userData);
        setSuccessMessage('Account created successfully! You can now log in.');
        setIsLogin(true); // Switch back to login view automatically
      }
    } catch (error: any) {
      const errorString = error?.response?.data?.message || error?.message || String(error);

      if (errorString.includes("Email is already in use") || error?.response?.status === 400 || error?.response?.status === 409) {
        setErrorMessage("An account with this email already exists. Please log in.");
      } else {
        setErrorMessage("Registration failed. Please check your details and try again.");
      }
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
                    <div className="relative">
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 pr-10 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all cursor-text"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-none"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5 cursor-none" /> : <Eye className="w-5 h-5 cursor-none" />}
                      </button>
                    </div>
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
                    <div className="relative">
                      <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 pr-10 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all cursor-text" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-none">
                        {showPassword ? <EyeOff className="w-5 h-5 cursor-none" /> : <Eye className="w-5 h-5 cursor-none" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Date of Birth</label>
                      <CustomDatePicker
                        value={dob}
                        onChange={setDob}
                        placeholder="Select Date"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Age</label>
                      <input type="text" value={age} readOnly className="w-full px-4 py-2 bg-slate-800/30 border border-white/5 rounded-xl text-slate-400 cursor-not-allowed transition-all" placeholder="Auto-calc" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                      <label className="block text-sm font-medium text-slate-300 mb-1">Blood Group</label>
                      <CustomDropdown
                        value={bloodGroup}
                        onChange={setBloodGroup}
                        options={[
                          { value: 'A+', label: 'A+' },
                          { value: 'A-', label: 'A-' },
                          { value: 'B+', label: 'B+' },
                          { value: 'B-', label: 'B-' },
                          { value: 'AB+', label: 'AB+' },
                          { value: 'AB-', label: 'AB-' },
                          { value: 'O+', label: 'O+' },
                          { value: 'O-', label: 'O-' }
                        ]}
                        placeholder="Blood Group"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Height (cm)</label>
                      <input 
                        type="number" 
                        step="any"
                        value={heightCm} 
                        onChange={(e) => setHeightCm(e.target.value)} 
                        className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all" 
                        placeholder="e.g. 175" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Weight (kg)</label>
                      <input 
                        type="number" 
                        step="any"
                        value={weightKg} 
                        onChange={(e) => setWeightKg(e.target.value)} 
                        className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all" 
                        placeholder="e.g. 70" 
                      />
                    </div>
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
                    <div className="relative">
                      <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 pr-10 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all cursor-text" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-none">
                        {showPassword ? <EyeOff className="w-5 h-5 cursor-none" /> : <Eye className="w-5 h-5 cursor-none" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Degree</label>
                    <input required type="text" value={degree} onChange={(e) => setDegree(e.target.value)} className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all" placeholder="MBBS, MD" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Specialization</label>
                    <CustomDropdown
                      value={specialization}
                      onChange={setSpecialization}
                      options={['General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Orthopedic', 'Psychiatrist']}
                      placeholder="Select Specialization"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Medical Registration Number</label>
                    <input required type="text" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all cursor-none" placeholder="MCI-12345" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Years of Experience</label>
                    <input required type="number" min="0" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all cursor-none" placeholder="5" />
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
                  <div>
                    <button
                      type="button"
                      disabled={!selectedState || !selectedCity}
                      onClick={() => setIsMapOpen(true)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 transition-all cursor-none ${!selectedState || !selectedCity
                          ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                          : locationCoords
                            ? 'bg-teal-500/10 text-teal-400 border-teal-500/50'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                    >
                      {locationCoords ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 cursor-none" />
                          Location Selected ({locationCoords.lat.toFixed(4)}, {locationCoords.lng.toFixed(4)})
                        </>
                      ) : (
                        <>
                          <MapPin className="w-5 h-5 cursor-none" />
                          📍 Select Address on Map
                        </>
                      )}
                    </button>
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
      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={(lat, lng, address) => {
          setLocationCoords({ lat, lng });
          setClinicAddress(address);
          setIsMapOpen(false);
        }}
        city={selectedCity}
        state={selectedState}
      />
    </AnimatePresence>
  );
}