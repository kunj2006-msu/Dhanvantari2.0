import { Calendar, Users, LogOut, Stethoscope, Menu, Globe, Clock, User, FileText, Send, Trash2, MessageSquare, AlertCircle, RefreshCw, X, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomDropdown } from '../components/CustomDropdown';
import Profile from '../components/profile/Profile';
import { fetchDoctorAppointments, updateAppointmentNotes, fetchPatientTriageHistory } from '../services/api';
import type { DoctorAppointment, PatientTriageSession } from '../services/api';

type ViewState = 'schedule' | 'patients' | 'settings' | 'see-profile';

const ScheduleCanvas = ({ isHistoryOpen, appointments, onRefresh }: any) => {
  const [selectedPatient, setSelectedPatient] = useState<DoctorAppointment | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [triageHistory, setTriageHistory] = useState<PatientTriageSession[]>([]);
  const [triageLoading, setTriageLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PatientTriageSession | null>(null);

  useEffect(() => {
    if (selectedPatient) {
      setNotes(selectedPatient.doctorNotes || '');

      const loadTriageHistory = async () => {
        setTriageLoading(true);
        try {
          const history = await fetchPatientTriageHistory(selectedPatient.patientId);
          setTriageHistory(history);
        } catch (err) {
          console.error("Failed to load patient triage history", err);
        } finally {
          setTriageLoading(false);
        }
      };

      loadTriageHistory();
    } else {
      setTriageHistory([]);
    }
    setSelectedSession(null);
  }, [selectedPatient]);

  const handleSaveNotes = async () => {
    if (!selectedPatient) return;
    setSaving(true);
    try {
      await updateAppointmentNotes(selectedPatient.id, notes);
      await onRefresh();
      setSelectedPatient(null);
      setNotes('');
    } catch (err) {
      alert("Failed to save prescription notes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const scheduledAppointments = appointments.filter((apt: any) => apt.status === 'SCHEDULED');

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
                {scheduledAppointments.length === 0 ? (
                  <div className="text-slate-400 text-center py-8">No scheduled appointments for today.</div>
                ) : (
                  scheduledAppointments.map((apt: any) => (
                    <button
                      key={apt.id}
                      onClick={() => setSelectedPatient(apt)}
                      className={`text-left p-4 rounded-xl border transition-colors group cursor-none w-full ${selectedPatient?.id === apt.id
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
                  ))
                )}
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
                <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl cursor-none font-sans">
                  <div className="flex items-start justify-between border-b border-white/5 pb-4 mb-4 cursor-none">
                    <div className="flex items-center gap-4 cursor-none">
                      <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30 cursor-none">
                        <User className="w-6 h-6 text-teal-400 cursor-none" />
                      </div>
                      <div className="cursor-none">
                        <h2 className="text-xl font-bold text-slate-100 cursor-none">{selectedPatient.patientName}</h2>
                        <p className="text-sm text-slate-400 cursor-none">Consultation at {selectedPatient.time} ({selectedPatient.date})</p>
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
                      <div className="text-xs text-slate-500 mb-1 cursor-none">Physical Metrics</div>
                      <div className="font-medium text-slate-200 truncate cursor-none">
                        {selectedPatient.heightCm ? `${selectedPatient.heightCm} cm` : '--'} / {selectedPatient.weightKg ? `${selectedPatient.weightKg} kg` : '--'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 cursor-none">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 cursor-none">
                      <div className="text-xs text-slate-500 mb-1 cursor-none">Current Complaint</div>
                      <div className="text-sm text-slate-300 cursor-none">{selectedPatient.reason}</div>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 cursor-none">
                      <div className="text-xs text-slate-500 mb-1 cursor-none">Past Medical History</div>
                      <div className="text-sm text-slate-300 cursor-none">{selectedPatient.pastHistory}</div>
                    </div>
                  </div>
                </div>

                {/* AI Chatbot Triage History */}
                <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl cursor-none flex flex-col gap-4 font-sans">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3 cursor-none">
                    <MessageSquare className="w-5 h-5 text-teal-400 cursor-none" />
                    <h3 className="font-semibold text-slate-200 cursor-none">AI Chatbot Triage & Remedies</h3>
                  </div>

                  {triageLoading ? (
                    <div className="flex items-center justify-center py-6 cursor-none">
                      <RefreshCw className="w-6 h-6 text-teal-400 animate-spin cursor-none" />
                    </div>
                  ) : triageHistory.length === 0 ? (
                    <p className="text-slate-400 text-sm cursor-none">No AI chatbot triage sessions recorded for this patient.</p>
                  ) : (
                    <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-1 cursor-none">
                      {triageHistory.map((session) => (
                        <button
                          key={session.sessionId}
                          onClick={() => setSelectedSession(session)}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/50 border border-white/5 hover:border-teal-500/30 hover:bg-slate-800/50 transition-all text-left w-full cursor-none group"
                        >
                          <div className="cursor-none">
                            <div className="text-sm font-medium text-slate-200 group-hover:text-teal-300 transition-colors cursor-none">
                              {session.title || "AI Consultation"}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 flex gap-2 cursor-none">
                              <span className="cursor-none">Lang: {session.languageCode.toUpperCase()}</span>
                              <span className="cursor-none">•</span>
                              <span className="cursor-none">{new Date(session.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors cursor-none" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prescription / Notes Area */}
                <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex-1 flex flex-col cursor-none font-sans">
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
                    <button
                      onClick={handleSaveNotes}
                      disabled={saving}
                      className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 disabled:from-slate-700 disabled:to-slate-900 text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] disabled:shadow-none flex items-center gap-2 cursor-none"
                    >
                      {saving ? (
                        <RefreshCw className="w-4 h-4 animate-spin cursor-none" />
                      ) : (
                        <Send className="w-4 h-4 cursor-none" />
                      )}
                      {saving ? 'Saving...' : 'Save & Complete'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Chat Transcript Modal */}
      <AnimatePresence>
        {selectedSession && (
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center cursor-none p-4"
            onClick={() => setSelectedSession(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/95 border border-white/10 rounded-2xl w-full max-w-2xl h-[500px] flex flex-col shadow-2xl overflow-hidden cursor-none"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900 cursor-none">
                <div className="cursor-none">
                  <h3 className="font-bold text-slate-200 text-lg cursor-none">{selectedSession.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 cursor-none">
                    AI Chat Triage Log • {new Date(selectedSession.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-none"
                >
                  <X className="w-5 h-5 cursor-none" />
                </button>
              </div>

              {/* Modal Chat Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-950/30 cursor-none">
                {selectedSession.messages.map((msg, index) => {
                  const isUser = msg.role.toLowerCase() === 'user';
                  return (
                    <div
                      key={index}
                      className={`flex flex-col cursor-none ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-slate-500 mb-1 px-2 font-semibold tracking-wider uppercase cursor-none">
                        {isUser ? 'Patient' : 'Dhanvantari AI'}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg cursor-none ${isUser
                          ? 'bg-slate-800 border border-white/5 text-slate-200 rounded-tr-none'
                          : 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 text-teal-100 rounded-tl-none shadow-[0_0_15px_rgba(20,184,166,0.05)]'
                          }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/5 bg-slate-900 text-right cursor-none">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-medium border border-white/5 cursor-none"
                >
                  Close Logs
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PatientsRecordsCanvas = ({ appointments }: any) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Get unique patients list
  const patients = appointments.reduce((acc: any[], current: any) => {
    const exists = acc.find((p: any) => p.patientId === current.patientId);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  const selectedPatient = patients.find((p: any) => p.patientId === selectedPatientId);

  // Get all consults for this selected patient
  const patientConsults = appointments.filter((apt: any) => apt.patientId === selectedPatientId && apt.status === 'COMPLETED');

  return (
    <div className="flex h-full w-full cursor-none font-sans">
      {/* Left panel: patients list */}
      <div className="w-80 border-r border-white/5 bg-slate-900/40 flex flex-col overflow-hidden shrink-0 z-20 cursor-none">
        <div className="p-4 border-b border-white/5 h-16 flex items-center cursor-none">
          <h3 className="font-semibold text-slate-200 cursor-none">Registered Patients</h3>
        </div>
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-3 cursor-none">
          {patients.length === 0 ? (
            <div className="text-slate-400 text-sm text-center py-8 cursor-none">No patients records found.</div>
          ) : (
            patients.map((p: any) => (
              <button
                key={p.patientId}
                onClick={() => setSelectedPatientId(p.patientId)}
                className={`text-left p-4 rounded-xl border transition-all w-full cursor-none ${selectedPatientId === p.patientId
                  ? 'bg-teal-500/20 border-teal-500/50'
                  : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60'
                  }`}
              >
                <h4 className="font-semibold text-slate-200 mb-1 cursor-none">{p.patientName}</h4>
                <div className="text-xs text-slate-400 flex gap-2 cursor-none">
                  <span className="cursor-none">{p.age} Yrs</span>
                  <span className="cursor-none">•</span>
                  <span className="cursor-none">{p.gender}</span>
                  <span className="cursor-none">•</span>
                  <span className="cursor-none">{p.bloodGroup}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel: patient detail & consultation history */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar cursor-none">
        {!selectedPatient ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 cursor-none">
            <Users className="w-16 h-16 opacity-50 cursor-none" />
            <p className="cursor-none">Select a patient from the list to view medical history & records</p>
          </div>
        ) : (
          <div className="max-w-4xl flex flex-col gap-6 cursor-none">
            {/* Patient Profile Summary */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl cursor-none">
              <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2 cursor-none">
                <User className="w-5 h-5 text-teal-400 cursor-none" />
                {selectedPatient.patientName} - Profile
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 cursor-none">
                <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 cursor-none">
                  <div className="text-xs text-slate-500 mb-1 cursor-none">Age</div>
                  <div className="font-medium text-slate-200 cursor-none">{selectedPatient.age} Years</div>
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
                  <div className="text-xs text-slate-500 mb-1 cursor-none">Physical Metrics</div>
                  <div className="font-medium text-slate-200 cursor-none">
                    {selectedPatient.heightCm ? `${selectedPatient.heightCm} cm` : '--'} / {selectedPatient.weightKg ? `${selectedPatient.weightKg} kg` : '--'}
                  </div>
                </div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 cursor-none">
                <div className="text-xs text-slate-500 mb-1 cursor-none">Pre-existing Medical Conditions</div>
                <div className="text-sm text-slate-300 cursor-none">{selectedPatient.pastHistory}</div>
              </div>
            </div>

            {/* Past Consultation Notes & Prescriptions */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl cursor-none">
              <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2 cursor-none">
                <FileText className="w-5 h-5 text-teal-400 cursor-none" />
                Prescription History & Consultation Notes
              </h3>

              {patientConsults.length === 0 ? (
                <p className="text-slate-400 text-sm cursor-none">No completed consultations recorded for this patient.</p>
              ) : (
                <div className="space-y-4 cursor-none">
                  {patientConsults.map((consult: any) => (
                    <div key={consult.id} className="p-4 rounded-xl bg-slate-900/50 border border-white/5 cursor-none">
                      <div className="flex justify-between items-center mb-2 cursor-none">
                        <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider cursor-none">
                          Consultation Date: {consult.date} ({consult.time})
                        </span>
                        <span className="text-xs text-slate-500 cursor-none">Reason: {consult.reason}</span>
                      </div>
                      <div className="text-sm text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-white/5 whitespace-pre-line cursor-none">
                        {consult.doctorNotes || "No prescription notes recorded."}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
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
      className={`w-full flex items-center ${isNavOpen ? 'px-3 gap-3' : 'justify-center'} py-3 rounded-xl transition-all group text-left relative overflow-hidden cursor-none ${active
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [language, setLanguage] = useState('English');
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Doctor';
  const userSpecialization = localStorage.getItem('userSpecialization') || 'Specialist';

  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDoctorAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load doctor dashboard appointments. Please verify the API connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
              icon={User}
              label="See Profile"
              active={activeView === 'see-profile'}
              onClick={() => setActiveView('see-profile')}
              isNavOpen={isNavOpen}
            />
            <NavItem
              icon={Trash2}
              label="Delete Account"
              active={showDeleteModal}
              onClick={() => setShowDeleteModal(true)}
              isNavOpen={isNavOpen}
              isDanger={true}
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

            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-400 bg-slate-950/45">
                <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
                <p className="text-sm font-medium tracking-wide">Fetching dashboard records...</p>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-400 bg-slate-950/45 p-6">
                <AlertCircle className="w-12 h-12 text-red-500/80" />
                <p className="text-center font-medium text-slate-300 max-w-md">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="mt-2 px-5 py-2.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:border-teal-500/50 rounded-xl transition-all cursor-none flex items-center gap-2 font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Connection
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 w-full h-full flex cursor-none"
                >
                  {activeView === 'schedule' && (
                    <ScheduleCanvas
                      isHistoryOpen={isHistoryOpen}
                      setIsHistoryOpen={setIsHistoryOpen}
                      appointments={appointments}
                      onRefresh={fetchDashboardData}
                    />
                  )}
                  {activeView === 'patients' && (
                    <PatientsRecordsCanvas appointments={appointments} />
                  )}
                  {activeView === 'see-profile' && <Profile />}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center cursor-none"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl cursor-none text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-2 cursor-none">Delete Account?</h2>
              <p className="text-slate-400 text-sm mb-6 cursor-none">
                Are you absolutely sure you want to permanently delete your account? All your medical records and history will be lost. This action cannot be undone.
              </p>

              <div className="flex gap-4 cursor-none">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-medium border border-white/5 cursor-none"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await authService.deleteAccount();
                      navigate('/');
                    } catch (err) {
                      console.error("Failed to delete account", err);
                      alert("Failed to delete account");
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 rounded-xl transition-all font-medium shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-none"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}