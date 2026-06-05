import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAdminDoctors, updateDoctorStatus } from '../services/api';
import { Shield, Users, ClipboardCheck, LogOut, User, MapPin, Briefcase, Award, Loader2, RefreshCw, CheckCircle2, UserMinus } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  state: string;
  city: string;
  experience: string;
  clinicAddress: string;
  accountStatus: string;
}

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'manage'>('pending');
  const navigate = useNavigate();
  
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

  const handleStatusChange = async (id: string, newStatus: string) => {
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
                        <tr key={doc.id} className="hover:bg-white/5 transition-colors">
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
                            <button
                              onClick={() => handleStatusChange(doc.id, 'ACTIVE')}
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
                        <tr key={doc.id} className="hover:bg-white/5 transition-colors">
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
                                onClick={() => handleStatusChange(doc.id, 'SUNSETTING')}
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
                                onClick={() => handleStatusChange(doc.id, 'DELETED')}
                                disabled={actionLoadingId === doc.id}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 font-semibold rounded-xl text-xs transition-all disabled:opacity-50"
                              >
                                {actionLoadingId === doc.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <UserMinus className="w-3.5 h-3.5" />
                                )}
                                Final Deactivate
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
    </div>
  );
}
