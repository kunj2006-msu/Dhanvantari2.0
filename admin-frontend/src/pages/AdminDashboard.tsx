import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAdminDoctors, updateDoctorStatus, fetchUpcomingAppointments, rejectDoctorApplication } from '../services/api';
import { Shield, Users, ClipboardCheck, LogOut, User, MapPin, Briefcase, Award, Loader2, RefreshCw, CheckCircle2, UserMinus, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  state: string;
  city: string;
  experience: string;
  clinicAddress: string;
  accountStatus: string;
  registrationNumber?: string;
  degree?: string;
  latitude?: number;
  longitude?: number;
}

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'manage'>('pending');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const navigate = useNavigate();
  const [safetyLockDoctorId, setSafetyLockDoctorId] = useState<string | null>(null);
  const [safetyConfirmText, setSafetyConfirmText] = useState('');
  const [rejectDoctorId, setRejectDoctorId] = useState<string | null>(null);
  const [showRejectToast, setShowRejectToast] = useState(false);
  const [rejectToastMessage, setRejectToastMessage] = useState('');
  
  const adminName = localStorage.getItem('dhanvantari_admin_name') || 'Admin';

  const loadDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminDoctors();
      setDoctors(data);
    } catch (err: any) {
      console.error("Failed to load doctors:", err);
      setError("Failed to retrieve doctor directory. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      setLoadingAppointments(true);
      fetchUpcomingAppointments(selectedDoctor.id)
        .then(data => {
          setUpcomingAppointments(data);
        })
        .catch(err => {
          console.error("Failed to fetch upcoming appointments:", err);
        })
        .finally(() => {
          setLoadingAppointments(false);
        });
    } else {
      setUpcomingAppointments([]);
    }
  }, [selectedDoctor]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (newStatus === 'DELETED') {
      const doc = doctors.find(d => d.id === id);
      if (doc && doc.accountStatus === 'SUNSETTING') {
        let hasUpcoming = false;
        if (selectedDoctor?.id === id) {
          hasUpcoming = upcomingAppointments.length > 0;
        } else {
          try {
            const appointments = await fetchUpcomingAppointments(id);
            hasUpcoming = appointments && appointments.length > 0;
          } catch (e) {
            console.error("Failed to check appointments during deletion safety interlock:", e);
          }
        }

        if (hasUpcoming) {
          setSafetyLockDoctorId(id);
          setSafetyConfirmText('');
          return; // Pause, will finalize deletion via custom safety lock modal
        }
      }
    }

    await executeStatusChange(id, newStatus);
  };

  const executeStatusChange = async (id: string, newStatus: string) => {
    setActionLoadingId(id);
    try {
      await updateDoctorStatus(id, newStatus);
      // Re-fetch doctor list to reflect updates in UI state
      const data = await fetchAdminDoctors();
      setDoctors(data);
    } catch (err: any) {
      console.error("Failed to update status:", err);
      alert(err.response?.data?.message || "Failed to update doctor status. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSafetyLockConfirm = async () => {
    if (safetyConfirmText !== 'CONFIRM' || !safetyLockDoctorId) return;
    const id = safetyLockDoctorId;
    setSafetyLockDoctorId(null);
    setSafetyConfirmText('');
    await executeStatusChange(id, 'DELETED');
  };

  const handleRejectClick = (id: string) => {
    setRejectDoctorId(id);
  };

  const handleRejectConfirm = async () => {
    if (!rejectDoctorId) return;
    const id = rejectDoctorId;
    setRejectDoctorId(null);
    setActionLoadingId(id);
    try {
      await rejectDoctorApplication(id);
      // Re-fetch doctor list to reflect updates in UI state
      const data = await fetchAdminDoctors();
      setDoctors(data);
      setRejectToastMessage("Application rejected and registration data deleted permanently.");
      setShowRejectToast(true);
      setTimeout(() => setShowRejectToast(false), 4000);
    } catch (err: any) {
      console.error("Failed to reject doctor:", err);
      alert(err.response?.data?.message || "Failed to reject doctor application. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dhanvantari_admin_token');
    localStorage.removeItem('dhanvantari_admin_name');
    localStorage.removeItem('dhanvantari_admin_role');
    navigate('/');
  };

  const pendingDoctors = doctors.filter(doc => doc.accountStatus === 'PENDING_APPROVAL');
  const manageDoctors = doctors.filter(doc => doc.accountStatus === 'ACTIVE' || doc.accountStatus === 'SUNSETTING');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">Pending Approval</span>;
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>;
      case 'SUNSETTING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">Sunsetting</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-400">Deleted</span>;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] ambient-orb pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] ambient-orb pointer-events-none" style={{ animationDelay: '-6s' }}></div>

      {/* ── SIDEBAR ── */}
      <aside className="w-full md:w-64 shrink-0 bg-slate-900/40 backdrop-blur-xl border-r border-white/5 flex flex-col z-20">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Dhanvantari
          </span>
        </div>

        {/* Profile Card */}
        <div className="p-6 border-b border-white/5 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-3 text-purple-400">
            <User className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-slate-200">{adminName}</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full mt-1.5 border border-purple-500/20">
            Administrator
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="p-4 flex-1 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === 'pending'
              ? 'bg-slate-800/80 border border-white/10 text-purple-400'
              : 'hover:bg-slate-800/30 text-slate-400 hover:text-slate-200'
              }`}
          >
            <ClipboardCheck className="w-5 h-5" />
            Pending Approvals
            {pendingDoctors.length > 0 && (
              <span className="ml-auto bg-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {pendingDoctors.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === 'manage'
              ? 'bg-slate-800/80 border border-white/10 text-purple-400'
              : 'hover:bg-slate-800/30 text-slate-400 hover:text-slate-200'
              }`}
          >
            <Users className="w-5 h-5" />
            Manage Doctors
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 overflow-hidden p-6 md:p-10 flex flex-col z-10">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">
              {activeTab === 'pending' ? 'Registration Requests' : 'Manage Practitioner Roster'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {activeTab === 'pending'
                ? 'Approve or hold medical practitioner signup requests.'
                : 'Monitor active medical practitioners and initiate graceful decommissioning.'}
            </p>
          </div>
          <button
            onClick={loadDoctors}
            disabled={loading}
            className="p-3 bg-slate-900/50 border border-white/10 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex-1 bg-slate-900/20 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
              <span className="text-sm text-slate-400 font-medium">Fetching doctor directory...</span>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="p-5">Practitioner</th>
                    <th className="p-5">Specialization</th>
                    <th className="p-5">Credentials</th>
                    <th className="p-5">State & City</th>
                    <th className="p-5">Address</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {activeTab === 'pending' ? (
                    pendingDoctors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center p-20 text-slate-500 italic">
                          No pending approval requests.
                        </td>
                      </tr>
                    ) : (
                      pendingDoctors.map(doc => (
                        <tr key={doc.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedDoctor(doc)}>
                          <td className="p-5 font-semibold text-slate-200">{doc.name}</td>
                          <td className="p-5 text-slate-400">{doc.specialization}</td>
                          <td className="p-5">
                            <div className="flex items-center gap-2 text-slate-300">
                              <Award className="w-4 h-4 text-purple-400 shrink-0" />
                              <span>{doc.experience}</span>
                            </div>
                          </td>
                          <td className="p-5 text-slate-400">{doc.state}, {doc.city}</td>
                          <td className="p-5 text-slate-400 max-w-[200px] truncate" title={doc.clinicAddress}>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                              <span>{doc.clinicAddress}</span>
                            </div>
                          </td>
                          <td className="p-5">{getStatusBadge(doc.accountStatus)}</td>
                          <td className="p-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleStatusChange(doc.id, 'ACTIVE'); }}
                                disabled={actionLoadingId === doc.id}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] disabled:opacity-50"
                              >
                                {actionLoadingId === doc.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRejectClick(doc.id); }}
                                disabled={actionLoadingId === doc.id}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 font-semibold rounded-xl text-xs transition-all disabled:opacity-50"
                              >
                                {actionLoadingId === doc.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <X className="w-3.5 h-3.5" />
                                )}
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    manageDoctors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center p-20 text-slate-500 italic">
                          No active or sunsetting doctors registered.
                        </td>
                      </tr>
                    ) : (
                      manageDoctors.map(doc => (
                        <tr key={doc.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedDoctor(doc)}>
                          <td className="p-5 font-semibold text-slate-200">{doc.name}</td>
                          <td className="p-5 text-slate-400">{doc.specialization}</td>
                          <td className="p-5">
                            <div className="flex items-center gap-2 text-slate-300">
                              <Briefcase className="w-4 h-4 text-purple-400 shrink-0" />
                              <span>{doc.experience}</span>
                            </div>
                          </td>
                          <td className="p-5 text-slate-400">{doc.state}, {doc.city}</td>
                          <td className="p-5 text-slate-400 max-w-[200px] truncate" title={doc.clinicAddress}>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                              <span>{doc.clinicAddress}</span>
                            </div>
                          </td>
                          <td className="p-5">{getStatusBadge(doc.accountStatus)}</td>
                          <td className="p-5 text-right">
                            {doc.accountStatus === 'ACTIVE' ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleStatusChange(doc.id, 'SUNSETTING'); }}
                                disabled={actionLoadingId === doc.id}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:border-orange-500/50 font-semibold rounded-xl text-xs transition-all disabled:opacity-50"
                              >
                                {actionLoadingId === doc.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <UserMinus className="w-3.5 h-3.5" />
                                )}
                                Initiate Offboarding
                              </button>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleStatusChange(doc.id, 'DELETED'); }}
                                disabled={actionLoadingId === doc.id}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] disabled:opacity-50"
                              >
                                {actionLoadingId === doc.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <UserMinus className="w-3.5 h-3.5" />
                                )}
                                Finalize Deletion
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── DETAILED DOCTOR MODAL ── */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={() => setSelectedDoctor(null)}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Close Button */}
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Header */}
            <div className="mb-6 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{selectedDoctor.name}</h2>
                {getStatusBadge(selectedDoctor.accountStatus)}
              </div>
              <p className="text-sm text-purple-400 font-semibold">{selectedDoctor.specialization}</p>
            </div>

            {/* Warning Banner */}
            {selectedDoctor.accountStatus === 'SUNSETTING' && upcomingAppointments.length > 0 && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-400 text-sm">
                <Shield className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-300">Warning: This doctor still has active appointments.</h4>
                  <p className="text-xs text-red-400/80 mt-1 font-light">Deactivating this doctor will override safety interlocks. Manual confirmation is required.</p>
                </div>
              </div>
            )}
            
            {/* Content grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Profile Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Professional Profile</h3>
                
                <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <Award className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">Degree</p>
                    <p className="text-sm font-semibold text-slate-200">{selectedDoctor.degree || 'Not Provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <Briefcase className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">Experience</p>
                    <p className="text-sm font-semibold text-slate-200">{selectedDoctor.experience}</p>
                  </div>
                </div>
              </div>

              {/* Administrative Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Administrative Info</h3>

                <div className="flex items-start gap-3 bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
                  <Shield className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-purple-300 font-medium">Medical Registration Number</p>
                    <p className="text-lg font-bold text-purple-400 tracking-wide mt-0.5">
                      {selectedDoctor.registrationNumber || 'Pending Verification'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">Location</p>
                    <p className="text-sm font-semibold text-slate-200">{selectedDoctor.city}, {selectedDoctor.state}</p>
                  </div>
                </div>
              </div>

              {/* Clinic Location Details */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinic & Geography</h3>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                  <div>
                    <p className="text-xs text-slate-400">Clinic Address</p>
                    <p className="text-sm text-slate-200 mt-1 font-medium">{selectedDoctor.clinicAddress}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5 text-xs text-slate-400">
                    <div>
                      <span>Latitude: </span>
                      <span className="font-semibold text-slate-300">{selectedDoctor.latitude ?? 'N/A'}</span>
                    </div>
                    <div>
                      <span>Longitude: </span>
                      <span className="font-semibold text-slate-300">{selectedDoctor.longitude ?? 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Appointments Section */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming Appointments</h3>
                {loadingAppointments ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    <span>Loading appointments...</span>
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <p className="text-sm text-slate-500 italic py-2">No upcoming appointments scheduled.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto border border-white/5 rounded-2xl divide-y divide-white/5 bg-white/5 custom-scrollbar">
                    {upcomingAppointments.map((apt: any) => (
                      <div key={apt.id} className="p-3.5 flex items-center justify-between text-sm">
                        <div className="font-semibold text-slate-200">{apt.patientName}</div>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <div>{apt.date}</div>
                          <div className="bg-slate-800 px-2 py-0.5 rounded border border-white/5 text-purple-400 font-medium">{apt.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              {selectedDoctor.accountStatus === 'PENDING_APPROVAL' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(selectedDoctor.id, 'ACTIVE');
                    setSelectedDoctor(null);
                  }}
                  disabled={actionLoadingId === selectedDoctor.id}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] disabled:opacity-50"
                >
                  Approve Doctor
                </button>
              )}
              {selectedDoctor.accountStatus === 'ACTIVE' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(selectedDoctor.id, 'SUNSETTING');
                    setSelectedDoctor(null);
                  }}
                  disabled={actionLoadingId === selectedDoctor.id}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] disabled:opacity-50"
                >
                  Initiate Offboarding
                </button>
              )}
              {selectedDoctor.accountStatus === 'SUNSETTING' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(selectedDoctor.id, 'DELETED');
                    setSelectedDoctor(null);
                  }}
                  disabled={actionLoadingId === selectedDoctor.id}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] disabled:opacity-50"
                >
                  Finalize Deletion
                </button>
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${selectedDoctor.clinicAddress}, ${selectedDoctor.city}, ${selectedDoctor.state}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl text-sm transition-all"
              >
                <Globe className="w-4 h-4" />
                View on Map
              </a>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl text-sm transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Interlock Modal */}
      <AnimatePresence>
        {safetyLockDoctorId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
              onClick={() => setSafetyLockDoctorId(null)}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl text-slate-100 z-10 text-center"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <Shield className="w-6 h-6 text-red-500 animate-pulse" />
              </div>

              {/* Header */}
              <h3 className="text-xl font-bold text-white mb-3">Safety Interlock Triggered</h3>

              {/* Message */}
              <p className="text-slate-300 text-sm mb-5 leading-relaxed">
                Warning: This doctor still has active appointments. Type <span className="font-bold text-red-400">CONFIRM</span> below to bypass this safety lock and finalize deletion.
              </p>

              {/* Input */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Type CONFIRM to proceed"
                  value={safetyConfirmText}
                  onChange={(e) => setSafetyConfirmText(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-center text-sm font-medium tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-red-500/50 text-red-400 placeholder-slate-600 transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSafetyLockDoctorId(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all font-semibold border border-white/5 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSafetyLockConfirm}
                  disabled={safetyConfirmText !== 'CONFIRM'}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-xl transition-all text-sm shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Confirmation Modal */}
      <AnimatePresence>
        {rejectDoctorId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
              onClick={() => setRejectDoctorId(null)}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl text-slate-100 z-10 text-center"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <X className="w-6 h-6 text-red-500" />
              </div>

              {/* Header */}
              <h3 className="text-xl font-bold text-white mb-3">Reject Application?</h3>

              {/* Message */}
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Are you sure you want to reject this application? This will permanently delete their registration data from the system.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectDoctorId(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all font-semibold border border-white/5 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-xl transition-all text-sm shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]"
                >
                  Reject Application
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Success Toast */}
      <AnimatePresence>
        {showRejectToast && (
          <div className="fixed bottom-10 right-10 z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-slate-900/95 border border-red-500/30 text-slate-100 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.3)] flex items-center gap-3 backdrop-blur-md max-w-sm pointer-events-auto"
            >
              <CheckCircle2 className="w-5 h-5 text-red-400" />
              <span className="font-semibold text-sm">{rejectToastMessage}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
