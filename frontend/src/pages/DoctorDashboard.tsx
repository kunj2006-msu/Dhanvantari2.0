import { Calendar, Users, Settings, LogOut, Stethoscope, Menu, Globe, Clock, User, FileText, Send } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomDropdown } from '../components/CustomDropdown';

type ViewState = 'schedule' | 'patients' | 'settings';

interface Appointment {
  id: number;
  patientName: string;
  time: string;
  reason: string;
  age: number;
  gender: string;
  bloodGroup: string;
  pastHistory: string;
}

const mockAppointments: Appointment[] = [
  { id: 1, patientName: 'Rahul Desai', time: '10:00 AM', reason: 'Routine Checkup', age: 34, gender: 'Male', bloodGroup: 'O+', pastHistory: 'No major illnesses.' },
  { id: 2, patientName: 'Priya Sharma', time: '11:30 AM', reason: 'Fever & Cough', age: 28, gender: 'Female', bloodGroup: 'A+', pastHistory: 'Asthma' },
  { id: 3, patientName: 'Amit Patel', time: '02:00 PM', reason: 'Follow-up for Hypertension', age: 52, gender: 'Male', bloodGroup: 'B+', pastHistory: 'Hypertension diagnosed in 2024.' },
];

const ScheduleCanvas = ({ isHistoryOpen, setIsHistoryOpen }: any) => {
  const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);
  const [notes, setNotes] = useState('');

  return (
    <div className="flex h-full w-full cursor-none">
      {/* Inner Left Panel (Upcoming Patients) */}
      <AnimatePresence initial={false}>
        {isHistoryOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-r border-white/5 bg-slate-900/40 flex flex-col overflow-hidden shrink-0 z-20 cursor-none"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between min-w-[320px] h-16 cursor-none">
              <h3 className="font-semibold text-slate-200 cursor-none">Upcoming Patients</h3>
            </div>
            
            <div className="p-4 min-w-[320px] overflow-y-auto cursor-none custom-scrollbar">
              <div className="text-sm flex flex-col gap-3 cursor-none">
                {mockAppointments.map((apt) => (
                  <button 
                    key={apt.id} 
                    onClick={() => setSelectedPatient(apt)}
                    className={`text-left p-4 rounded-xl border transition-colors group cursor-none w-full ${
                      selectedPatient?.id === apt.id 
                        ? 'bg-teal-500/20 border-teal-500/50' 
                        : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 cursor-none">
                      <h4 className={`font-semibold cursor-none ${selectedPatient?.id === apt.id ? 'text-teal-300' : 'text-slate-200'}`}>
                        {apt.patientName}
                      </h4>
                    </div>
                    <div className="text-slate-400 text-xs mb-2 cursor-none">{apt.reason}</div>
                    <div className="text-slate-500 text-xs flex items-center gap-1.5 cursor-none">
                      <Clock className="w-3.5 h-3.5 cursor-none" />
                      {apt.time}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inner Right Panel (Consultation Canvas) */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-slate-900/10 cursor-none">
        <div className={`flex-1 flex flex-col items-center p-6 md:p-8 overflow-y-auto cursor-none custom-scrollbar ${!selectedPatient ? 'justify-center' : 'justify-start pt-8 md:pt-12'}`}>
          <AnimatePresence mode="wait">
            {!selectedPatient ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-slate-400 flex flex-col items-center gap-4 cursor-none"
              >
                <User className="w-16 h-16 opacity-50 cursor-none" />
                <p className="cursor-none">Select a patient from the list to begin consultation</p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedPatient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-3xl flex flex-col gap-6 cursor-none"
              >
                {/* Patient Summary Card */}
                <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl cursor-none">
                  <div className="flex items-start justify-between border-b border-white/5 pb-4 mb-4 cursor-none">
                    <div className="flex items-center gap-4 cursor-none">
                      <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30 cursor-none">
                        <User className="w-6 h-6 text-teal-400 cursor-none" />
                      </div>
                      <div className="cursor-none">
                        <h2 className="text-xl font-bold text-slate-100 cursor-none">{selectedPatient.patientName}</h2>
                        <p className="text-sm text-slate-400 cursor-none">Consultation at {selectedPatient.time}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 cursor-none">
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 cursor-none">
                      <div className="text-xs text-slate-500 mb-1 cursor-none">Age</div>
                      <div className="font-medium text-slate-200 cursor-none">{selectedPatient.age} Yrs</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 cursor-none">
                      <div className="text-xs text-slate-500 mb-1 cursor-none">Gender</div>
                      <div className="font-medium text-slate-200 cursor-none">{selectedPatient.gender}</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 cursor-none">
                      <div className="text-xs text-slate-500 mb-1 cursor-none">Blood Group</div>
                      <div className="font-medium text-slate-200 cursor-none">{selectedPatient.bloodGroup}</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 cursor-none">
                      <div className="text-xs text-slate-500 mb-1 cursor-none">Condition</div>
                      <div className="font-medium text-slate-200 truncate cursor-none" title={selectedPatient.reason}>{selectedPatient.reason}</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 cursor-none">
                    <div className="text-xs text-slate-500 mb-1 cursor-none">Past Medical History</div>
                    <div className="text-sm text-slate-300 cursor-none">{selectedPatient.pastHistory}</div>
                  </div>
                </div>

                {/* Prescription / Notes Area */}
                <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex-1 flex flex-col cursor-none">
                  <div className="flex items-center gap-2 mb-4 cursor-none">
                    <FileText className="w-5 h-5 text-teal-400 cursor-none" />
                    <h3 className="font-semibold text-slate-200 cursor-none">Prescription & Notes</h3>
                  </div>
                  
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full flex-1 bg-slate-900/50 border border-white/10 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none min-h-[200px] cursor-none custom-scrollbar"
                    placeholder="Write your clinical notes, diagnosis, and prescription details here..."
                  />
                  
                  <div className="mt-4 flex justify-end cursor-none">
                    <button className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] flex items-center gap-2 cursor-none">
                      <Send className="w-4 h-4 cursor-none" />
                      Save & Complete
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// NavItem Reused
const NavItem = ({ icon: Icon, label, active, onClick, isNavOpen, isDanger = false }: any) => {
  return (
    <button 
      onClick={onClick}
      title={!isNavOpen ? label : undefined}
      className={`w-full flex items-center ${isNavOpen ? 'px-3 gap-3' : 'justify-center'} py-3 rounded-xl transition-all group text-left relative overflow-hidden cursor-none ${
        active 
          ? (isDanger ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-slate-800/80 border border-slate-600/50 text-slate-200 shadow-inner')
          : (isDanger ? 'border border-transparent hover:bg-red-500/5 text-red-500 hover:text-red-400' : 'border border-transparent hover:bg-slate-800/40 text-slate-400 hover:text-slate-200')
      }`}
    >
      <Icon className="w-5 h-5 shrink-0 relative z-10 cursor-none" />
      <AnimatePresence>
        {isNavOpen && (
          <motion.span 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="font-medium text-sm whitespace-nowrap relative z-10 cursor-none"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

export default function DoctorDashboard() {
  const [activeView, setActiveView] = useState<ViewState>('schedule');
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true); 
  const [language, setLanguage] = useState('English');
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Doctor';
  const userSpecialization = localStorage.getItem('userSpecialization') || 'Specialist';

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const languages = ['English', 'Hindi', 'Gujarati', 'Marathi', 'Bengali', 'Telugu', 'Tamil', 'Urdu', 'Kannada', 'Odia', 'Malayalam'];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans cursor-none">
      {/* Top Header */}
      <header className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40 cursor-none">
        <div className="flex items-center gap-3 cursor-none">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)] cursor-none">
            <Stethoscope className="w-5 h-5 text-white cursor-none" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent cursor-none">
            Dhanvantari
          </span>
        </div>

        <div className="flex items-center gap-4 cursor-none">
          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-teal-500 transition-all cursor-none">
            <Globe className="w-4 h-4 text-slate-400 cursor-none" />
            <div className="w-40 cursor-none">
              <CustomDropdown 
                value={language}
                onChange={setLanguage}
                options={languages}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden cursor-none">
        {/* Outer Left Navigation */}
        <motion.aside 
          animate={{ width: isNavOpen ? 256 : 80 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="border-r border-white/5 bg-slate-900/30 flex flex-col overflow-y-auto overflow-x-hidden shrink-0 z-20 cursor-none custom-scrollbar"
        >
          <div className={`p-4 flex ${isNavOpen ? 'justify-end' : 'justify-center'} border-b border-white/5 cursor-none`}>
            <button 
              onClick={() => setIsNavOpen(!isNavOpen)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-none"
            >
              <Menu className="w-5 h-5 cursor-none" />
            </button>
          </div>

          <div className="p-6 border-b border-white/5 flex flex-col items-center justify-center cursor-none">
            <div className={`rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shrink-0 transition-all cursor-none ${isNavOpen ? 'w-20 h-20 mb-3' : 'w-10 h-10'}`}>
              <User className={`text-slate-400 transition-all cursor-none ${isNavOpen ? 'w-10 h-10' : 'w-5 h-5'}`} />
            </div>
            <AnimatePresence>
              {isNavOpen && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col items-center overflow-hidden whitespace-nowrap cursor-none"
                >
                  <h2 className="text-lg font-semibold text-slate-200 cursor-none">{userName}</h2>
                  <span className="text-xs text-slate-500 mt-1 cursor-none">{userSpecialization}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 flex flex-col gap-2 flex-1 cursor-none">
            <AnimatePresence>
              {isNavOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-2 whitespace-nowrap cursor-none"
                >
                  Doctor Panel
                </motion.div>
              )}
            </AnimatePresence>
            
            <NavItem 
              icon={Calendar} 
              label="Today's Schedule" 
              active={activeView === 'schedule'} 
              onClick={() => setActiveView('schedule')} 
              isNavOpen={isNavOpen} 
            />
            <NavItem 
              icon={Users} 
              label="Patient Records" 
              active={activeView === 'patients'} 
              onClick={() => setActiveView('patients')} 
              isNavOpen={isNavOpen} 
            />
            <NavItem 
              icon={Settings} 
              label="Settings" 
              active={activeView === 'settings'} 
              onClick={() => setActiveView('settings')} 
              isNavOpen={isNavOpen} 
            />
          </div>

          <div className="p-4 border-t border-white/5 cursor-none">
            <NavItem 
              icon={LogOut} 
              label="Log Out" 
              onClick={handleLogout} 
              isNavOpen={isNavOpen} 
            />
          </div>
        </motion.aside>

        {/* Dynamic Canvas Area */}
        <main className="flex-1 overflow-hidden relative bg-slate-900/20 p-0 md:p-6 cursor-none">
          <div className="h-full bg-slate-900/40 backdrop-blur-xl md:rounded-2xl border-y md:border border-white/5 relative overflow-hidden shadow-2xl shadow-black/50 cursor-none">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 cursor-none"></div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 w-full h-full flex cursor-none"
              >
                {activeView === 'schedule' && <ScheduleCanvas isHistoryOpen={isHistoryOpen} setIsHistoryOpen={setIsHistoryOpen} />}
                {activeView === 'patients' && (
                  <div className="flex-1 flex items-center justify-center text-slate-400 cursor-none">
                    Patient Records View (Under Construction)
                  </div>
                )}
                {activeView === 'settings' && (
                  <div className="flex-1 flex items-center justify-center text-slate-400 cursor-none">
                    Settings View (Under Construction)
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
