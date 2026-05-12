import { Brain, Stethoscope, CalendarPlus, User, LogOut, LayoutDashboard, Globe, Settings, Trash2, Menu, PanelLeftClose, PanelLeftOpen, Send, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomDropdown } from '../components/CustomDropdown';
import { CustomDatePicker } from '../components/CustomDatePicker';

const OverviewCanvas = ({ onSelectView }: { onSelectView: (view: any) => void }) => (
  <div className="flex-1 flex items-center justify-center p-8 h-full">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectView('mental-health')}
        className="bg-slate-800/40 border border-teal-500/20 hover:border-teal-500/50 rounded-2xl p-8 flex flex-col items-center gap-4 text-center group transition-colors shadow-lg shadow-teal-500/5"
      >
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
          <Brain className="w-8 h-8 text-teal-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-200 group-hover:text-teal-300 transition-colors">Mental Health Support</h3>
          <p className="text-sm text-slate-400 mt-2">Empathetic AI counseling and support</p>
        </div>
      </motion.button>
      
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectView('triage')}
        className="bg-slate-800/40 border border-cyan-500/20 hover:border-cyan-500/50 rounded-2xl p-8 flex flex-col items-center gap-4 text-center group transition-colors shadow-lg shadow-cyan-500/5"
      >
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
          <Stethoscope className="w-8 h-8 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">AI Symptom Triage</h3>
          <p className="text-sm text-slate-400 mt-2">Clinical assessment and recommendations</p>
        </div>
      </motion.button>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectView('appointments')}
        className="bg-slate-800/40 border border-indigo-500/20 hover:border-indigo-500/50 rounded-2xl p-8 flex flex-col items-center gap-4 text-center group transition-colors shadow-lg shadow-indigo-500/5"
      >
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
          <CalendarPlus className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">Book Appointment</h3>
          <p className="text-sm text-slate-400 mt-2">Schedule visits with healthcare professionals</p>
        </div>
      </motion.button>
    </div>
  </div>
);

const FeatureCanvas = ({ 
  title, 
  historyTitle, 
  isHistoryOpen, 
  setIsHistoryOpen 
}: { 
  title: string, 
  historyTitle: string, 
  isHistoryOpen: boolean, 
  setIsHistoryOpen: (v: boolean) => void 
}) => (
  <div className="flex h-full w-full">
    {/* Inner History Sidebar */}
    <AnimatePresence initial={false}>
      {isHistoryOpen && (
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="border-r border-white/5 bg-slate-900/40 flex flex-col overflow-hidden shrink-0 z-20"
        >
          <div className="p-4 border-b border-white/5 flex items-center justify-between min-w-[320px] h-16">
            <h3 className="font-semibold text-slate-200">{historyTitle}</h3>
          </div>
          <div className="p-4 min-w-[320px]">
            <div className="text-sm text-slate-500 flex flex-col gap-2">
              <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 cursor-pointer hover:bg-slate-800/60 transition-colors">Placeholder item 1</div>
              <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 cursor-pointer hover:bg-slate-800/60 transition-colors">Placeholder item 2</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Main Active Area */}
    <div className="flex-1 flex flex-col relative min-w-0">
      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-300 transition-colors backdrop-blur-md shadow-lg"
          title={isHistoryOpen ? "Close History" : "Open History"}
        >
          {isHistoryOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="text-2xl font-semibold text-slate-200">{title}</div>
      </div>
    </div>
  </div>
);

const ChatInterface = ({ isHistoryOpen, setIsHistoryOpen, historyTitle, disclaimer, children }: any) => {
  return (
    <div className="flex h-full w-full">
      <AnimatePresence initial={false}>
        {isHistoryOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-r border-white/5 bg-slate-900/40 flex flex-col overflow-hidden shrink-0 z-20"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between min-w-[320px] h-16">
              <h3 className="font-semibold text-slate-200">{historyTitle}</h3>
            </div>
            <div className="p-4 min-w-[320px] overflow-y-auto">
              <div className="text-sm text-slate-500 flex flex-col gap-2">
                <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 cursor-pointer hover:bg-slate-800/60 transition-colors">Placeholder item 1</div>
                <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 cursor-pointer hover:bg-slate-800/60 transition-colors">Placeholder item 2</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative min-w-0 bg-slate-900/10">
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-300 transition-colors backdrop-blur-md shadow-lg"
            title={isHistoryOpen ? "Close History" : "Open History"}
          >
            {isHistoryOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="pt-4 px-16 z-10 flex justify-center mt-2">
            {disclaimer && (
              <div className="text-sm font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-lg shadow-lg text-center max-w-2xl">
                {disclaimer}
              </div>
            )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col pt-12">
           {children}
        </div>

        <div className="p-4 bg-slate-900/60 backdrop-blur-xl border-t border-white/5 z-10">
          <div className="max-w-4xl mx-auto flex items-end gap-2 bg-slate-800/50 border border-white/10 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-teal-500/50 transition-all shadow-inner">
            <textarea 
              rows={1}
              placeholder="Type your message..."
              className="flex-1 bg-transparent text-slate-200 resize-none max-h-32 focus:outline-none p-2 min-h-[44px]"
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
            <button className="p-3 rounded-xl bg-teal-500 text-white hover:bg-teal-400 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.4)] hover:shadow-[0_0_20px_rgba(20,184,166,0.6)] mb-0.5">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MentalHealthCanvas = ({ isHistoryOpen, setIsHistoryOpen }: any) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  if (!selectedMood) {
    return (
      <div className="flex h-full w-full relative">
        <AnimatePresence initial={false}>
          {isHistoryOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-r border-white/5 bg-slate-900/40 flex flex-col overflow-hidden shrink-0 z-20"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between min-w-[320px] h-16">
                <h3 className="font-semibold text-slate-200">Past Sessions</h3>
              </div>
              <div className="p-4 min-w-[320px]">
                <div className="text-sm text-slate-500 flex flex-col gap-2">
                  <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 cursor-pointer hover:bg-slate-800/60 transition-colors">Placeholder item 1</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col relative min-w-0">
          <div className="absolute top-4 left-4 z-10">
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-300 transition-colors backdrop-blur-md shadow-lg"
              title={isHistoryOpen ? "Close History" : "Open History"}
            >
              {isHistoryOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-8 tracking-tight">How are you feeling right now?</h2>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {[
                  { emoji: '😭', label: 'Terrible' },
                  { emoji: '😔', label: 'Bad' },
                  { emoji: '😐', label: 'Okay' },
                  { emoji: '🙂', label: 'Good' },
                  { emoji: '😁', label: 'Great' }
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMood(item.label)}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-800/50 border border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-slate-700/50 hover:border-teal-500/50 transition-colors shadow-lg group"
                  >
                    <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChatInterface 
      isHistoryOpen={isHistoryOpen} 
      setIsHistoryOpen={setIsHistoryOpen}
      historyTitle="Past Sessions"
    >
      <div className="flex justify-start">
        <div className="max-w-[80%] md:max-w-[70%] bg-slate-800 text-slate-200 p-4 rounded-2xl rounded-bl-sm shadow-md">
          <p>Hi there. I see you're feeling {selectedMood.toLowerCase()} today. I'm here to listen. What's on your mind?</p>
        </div>
      </div>
    </ChatInterface>
  );
};

const TriageCanvas = ({ isHistoryOpen, setIsHistoryOpen }: any) => {
  return (
    <ChatInterface 
      isHistoryOpen={isHistoryOpen} 
      setIsHistoryOpen={setIsHistoryOpen}
      historyTitle="Past Triage Results"
      disclaimer="⚠️ Disclaimer: This AI provides preliminary suggestions only. For serious symptoms or emergencies, please consult a real doctor immediately."
    >
      <div className="flex justify-start">
        <div className="max-w-[80%] md:max-w-[70%] bg-slate-800 text-slate-200 p-4 rounded-2xl rounded-bl-sm shadow-md">
          <p>Hello. I'm here to help you assess your symptoms. Please describe what you're experiencing in as much detail as possible.</p>
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <div className="max-w-[80%] md:max-w-[70%] bg-teal-700/80 text-white p-4 rounded-2xl rounded-br-sm shadow-md">
          <p>I've been having a slight headache and feel a bit tired since yesterday morning.</p>
        </div>
      </div>
    </ChatInterface>
  );
};

const AppointmentsCanvas = ({ isHistoryOpen, setIsHistoryOpen }: any) => {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | ''>('');
  const [date, setDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const [appointments, setAppointments] = useState([
    { id: 1, doctor: 'Dr. Sharma', specialty: 'Cardiologist', date: 'May 10, 2026', time: '10:00 AM', status: 'upcoming' },
    { id: 2, doctor: 'Dr. Gupta', specialty: 'Dermatologist', date: 'Apr 25, 2026', time: '02:30 PM', status: 'completed' },
    { id: 3, doctor: 'Dr. Patel', specialty: 'General Physician', date: 'Mar 12, 2026', time: '11:15 AM', status: 'completed' }
  ]);

  const mockDoctors = [
    { id: 1, name: "Dr. Sharma", specialization: "Cardiologist", state: "Gujarat", city: "Vadodara", experience: "15+ Years", clinicAddress: "123 Heart Care Center, Alkapuri, Vadodara" },
    { id: 2, name: "Dr. Gupta", specialization: "Dermatologist", state: "Maharashtra", city: "Mumbai", experience: "10+ Years", clinicAddress: "45 Skin Clinic, Bandra West, Mumbai" },
    { id: 3, name: "Dr. Patel", specialization: "General Physician", state: "Gujarat", city: "Ahmedabad", experience: "8+ Years", clinicAddress: "78 Health Hub, SG Highway, Ahmedabad" },
    { id: 4, name: "Dr. Desai", specialization: "Cardiologist", state: "Maharashtra", city: "Pune", experience: "20+ Years", clinicAddress: "90 Cardiac Center, Koregaon Park, Pune" },
  ];

  const locationData: Record<string, string[]> = {
    "Gujarat": ["Ahmedabad", "Vadodara", "Surat", "Rajkot", "Godhra", "Gandhinagar"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
    "Delhi": ["New Delhi"]
  };

  const timeSlots = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:15 PM'];

  const today = new Date().toISOString().split('T')[0];

  const handleResetForm = () => {
    setSelectedState('');
    setSelectedCity('');
    setSelectedSpecialty('');
    setSelectedDoctorId('');
    setSelectedTime(null);
    setDate('');
    setReason('');
  };

  const handleConfirmAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !selectedTime || !selectedDoctorId) {
      alert('Please fill all required fields');
      return;
    }
    const doctorProfile = mockDoctors.find(d => d.id === selectedDoctorId);
    if (!doctorProfile) return;

    const newAppointment = {
      id: Date.now(),
      doctor: doctorProfile.name,
      specialty: doctorProfile.specialization,
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: selectedTime,
      status: 'upcoming'
    };
    
    setAppointments([newAppointment, ...appointments]);
    handleResetForm();
    alert('Appointment Confirmed!');
  };

  // Filter doctors based on selections
  const filteredDoctors = mockDoctors.filter(doc => {
    if (selectedState && doc.state !== selectedState) return false;
    if (selectedCity && doc.city !== selectedCity) return false;
    if (selectedSpecialty && doc.specialization !== selectedSpecialty) return false;
    return true;
  });

  const selectedDoctorProfile = mockDoctors.find(d => d.id === selectedDoctorId);

  return (
    <div className="flex h-full w-full">
      <AnimatePresence initial={false}>
        {isHistoryOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-r border-white/5 bg-slate-900/40 flex flex-col overflow-hidden shrink-0 z-20"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between min-w-[320px] h-16">
              <h3 className="font-semibold text-slate-200">My Appointments</h3>
            </div>
            
            <div className="p-4 min-w-[320px]">
              <button 
                onClick={handleResetForm}
                className="w-full py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 font-medium transition-colors shadow-lg mb-6">
                + Book New
              </button>
              
              <div className="text-sm flex flex-col gap-3">
                {appointments.map((apt) => (
                  <div key={apt.id} className="p-4 rounded-xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-200">{apt.doctor}</h4>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                        apt.status === 'upcoming' 
                          ? 'bg-teal-500/20 text-teal-400' 
                          : 'bg-slate-700/50 text-slate-400'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="text-slate-400 text-xs mb-2">{apt.specialty}</div>
                    <div className="text-slate-500 text-xs flex items-center gap-1.5">
                      <CalendarPlus className="w-3.5 h-3.5" />
                      {apt.date} &bull; {apt.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative min-w-0 overflow-y-auto bg-slate-900/10">
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-300 transition-colors backdrop-blur-md shadow-lg"
            title={isHistoryOpen ? "Close History" : "Open History"}
          >
            {isHistoryOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50"
          >
            <h2 className="text-2xl font-bold text-slate-100 mb-8 border-b border-white/5 pb-4">Book a Consultation</h2>
            
            <form className="space-y-6" onSubmit={handleConfirmAppointment}>
              {/* Row 1: Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">State</label>
                  <CustomDropdown 
                    value={selectedState}
                    onChange={(val) => {
                      setSelectedState(val);
                      setSelectedCity('');
                      setSelectedDoctorId('');
                    }}
                    options={Object.keys(locationData)}
                    placeholder="Select State..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">City</label>
                  <CustomDropdown 
                    value={selectedCity}
                    onChange={(val) => {
                      setSelectedCity(val);
                      setSelectedDoctorId('');
                    }}
                    options={selectedState ? locationData[selectedState] : []}
                    placeholder={selectedState ? "Select City..." : "Select State first"}
                    disabled={!selectedState}
                  />
                </div>
              </div>

              {/* Row 2: Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Specialization</label>
                  <CustomDropdown 
                    value={selectedSpecialty}
                    onChange={(val) => {
                      setSelectedSpecialty(val);
                      setSelectedDoctorId('');
                    }}
                    options={['General Physician', 'Cardiologist', 'Dermatologist']}
                    placeholder="Any Specialization..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Doctor</label>
                  <CustomDropdown 
                    value={selectedDoctorId}
                    onChange={(val) => setSelectedDoctorId(Number(val))}
                    options={filteredDoctors.map(doc => ({ value: doc.id, label: `${doc.name} - ${doc.specialization}` }))}
                    placeholder="Select Doctor..."
                  />
                </div>
              </div>

              {/* Row 3: Doctor Profile Card */}
              <AnimatePresence>
                {selectedDoctorProfile && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-slate-800/40 border border-teal-500/30 p-4 rounded-xl flex items-start gap-4 shadow-lg">
                      <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0 border border-teal-500/30">
                        <User className="w-6 h-6 text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-100 text-lg">{selectedDoctorProfile.name}</h4>
                        <div className="text-slate-400 text-sm mb-2">{selectedDoctorProfile.specialization} &bull; {selectedDoctorProfile.experience}</div>
                        <div className="flex items-start gap-1.5 text-slate-300 text-sm">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{selectedDoctorProfile.clinicAddress}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Row 4: Date & Time */}
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Date</label>
                  <CustomDatePicker 
                    value={date}
                    onChange={setDate}
                    minDate={today}
                  />
                </div>
                
                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium text-slate-400 mb-2 block">Available Time Slots</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                          selectedTime === time 
                            ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.2)] border' 
                            : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 5: Details */}
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-slate-400">Reason for visit (Symptoms/Notes)</label>
                <textarea 
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-y min-h-[100px]"
                  placeholder="Please describe your symptoms briefly..."
                />
              </div>

              {/* Footer */}
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold rounded-xl py-4 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] transform hover:-translate-y-0.5"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const SeeProfileCanvas = () => (
  <div className="flex-1 flex items-center justify-center p-8 text-center h-full">
    <div className="text-2xl font-semibold text-slate-200">See Profile Interface will go here</div>
  </div>
);

const EditProfileCanvas = () => (
  <div className="flex-1 flex items-center justify-center p-8 text-center h-full">
    <div className="text-2xl font-semibold text-slate-200">Edit Profile Interface will go here</div>
  </div>
);

const DeleteAccountCanvas = () => (
  <div className="flex-1 flex items-center justify-center p-8 text-center h-full">
    <div className="text-2xl font-semibold text-red-400">Delete Account Interface will go here</div>
  </div>
);

type ViewState = 'overview' | 'see-profile' | 'edit-profile' | 'delete-account' | 'mental-health' | 'triage' | 'appointments';

const NavItem = ({ icon: Icon, label, active, onClick, isNavOpen, isDanger = false }: any) => {
  return (
    <button 
      onClick={onClick}
      title={!isNavOpen ? label : undefined}
      className={`w-full flex items-center ${isNavOpen ? 'px-3 gap-3' : 'justify-center'} py-3 rounded-xl transition-all group text-left relative overflow-hidden ${
        active 
          ? (isDanger ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-slate-800/80 border border-slate-600/50 text-slate-200 shadow-inner')
          : (isDanger ? 'border border-transparent hover:bg-red-500/5 text-red-500 hover:text-red-400' : 'border border-transparent hover:bg-slate-800/40 text-slate-400 hover:text-slate-200')
      }`}
    >
      <Icon className="w-5 h-5 shrink-0 relative z-10" />
      <AnimatePresence>
        {isNavOpen && (
          <motion.span 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="font-medium text-sm whitespace-nowrap relative z-10"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

export default function PatientDashboard() {
  const [activeView, setActiveView] = useState<ViewState>('overview');
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [language, setLanguage] = useState('English');
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Patient';

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const handleFeatureSelect = (feature: ViewState) => {
    setActiveView(feature);
    setIsNavOpen(false);
    setIsHistoryOpen(true);
  };

  const languages = [
    'English', 'Hindi', 'Gujarati', 'Marathi', 'Bengali', 'Telugu', 
    'Tamil', 'Urdu', 'Kannada', 'Odia', 'Malayalam'
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Top Header (Navbar) */}
      <header className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {/* Brand */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Dhanvantari
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-teal-500 transition-all">
            <Globe className="w-4 h-4 text-slate-400" />
            <div className="w-40">
              <CustomDropdown 
                value={language}
                onChange={setLanguage}
                options={languages}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden">
        {/* User Profile Sidebar (Outer Left) */}
        <motion.aside 
          animate={{ width: isNavOpen ? 256 : 80 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="border-r border-white/5 bg-slate-900/30 flex flex-col overflow-y-auto overflow-x-hidden shrink-0 z-20"
        >
          {/* Toggle Button */}
          <div className={`p-4 flex ${isNavOpen ? 'justify-end' : 'justify-center'} border-b border-white/5`}>
            <button 
              onClick={() => setIsNavOpen(!isNavOpen)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 border-b border-white/5 flex flex-col items-center justify-center">
            <div className={`rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shrink-0 transition-all ${isNavOpen ? 'w-20 h-20 mb-3' : 'w-10 h-10'}`}>
              <User className={`text-slate-400 transition-all ${isNavOpen ? 'w-10 h-10' : 'w-5 h-5'}`} />
            </div>
            <AnimatePresence>
              {isNavOpen && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col items-center overflow-hidden whitespace-nowrap"
                >
                  <h2 className="text-lg font-semibold text-slate-200">{userName}</h2>
                  <span className="text-xs text-slate-500 mt-1">Patient</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 flex flex-col gap-2 flex-1">
            <AnimatePresence>
              {isNavOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-2 whitespace-nowrap"
                >
                  Account
                </motion.div>
              )}
            </AnimatePresence>
            
            <NavItem 
              icon={LayoutDashboard} 
              label="Dashboard Home" 
              active={activeView === 'overview'} 
              onClick={() => setActiveView('overview')} 
              isNavOpen={isNavOpen} 
            />
            <NavItem 
              icon={User} 
              label="See Profile" 
              active={activeView === 'see-profile'} 
              onClick={() => setActiveView('see-profile')} 
              isNavOpen={isNavOpen} 
            />
            <NavItem 
              icon={Settings} 
              label="Edit Profile" 
              active={activeView === 'edit-profile'} 
              onClick={() => setActiveView('edit-profile')} 
              isNavOpen={isNavOpen} 
            />
            <NavItem 
              icon={Trash2} 
              label="Delete Account" 
              active={activeView === 'delete-account'} 
              onClick={() => setActiveView('delete-account')} 
              isNavOpen={isNavOpen} 
              isDanger={true}
            />
          </div>

          <div className="p-4 border-t border-white/5">
            <NavItem 
              icon={LogOut} 
              label="Log Out" 
              onClick={handleLogout} 
              isNavOpen={isNavOpen} 
            />
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative bg-slate-900/20 p-0 md:p-6">
          <div className="h-full bg-slate-900/40 backdrop-blur-xl md:rounded-2xl border-y md:border border-white/5 relative overflow-hidden shadow-2xl shadow-black/50">
            {/* Subtle top reflection */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"></div>
            
            {/* Dynamic Canvas Area with Framer Motion */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 w-full h-full flex"
              >
                {activeView === 'overview' && <OverviewCanvas onSelectView={handleFeatureSelect} />}
                {activeView === 'mental-health' && <MentalHealthCanvas isHistoryOpen={isHistoryOpen} setIsHistoryOpen={setIsHistoryOpen} />}
                {activeView === 'triage' && <TriageCanvas isHistoryOpen={isHistoryOpen} setIsHistoryOpen={setIsHistoryOpen} />}
                {activeView === 'appointments' && <AppointmentsCanvas isHistoryOpen={isHistoryOpen} setIsHistoryOpen={setIsHistoryOpen} />}
                {activeView === 'see-profile' && <SeeProfileCanvas />}
                {activeView === 'edit-profile' && <EditProfileCanvas />}
                {activeView === 'delete-account' && <DeleteAccountCanvas />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
