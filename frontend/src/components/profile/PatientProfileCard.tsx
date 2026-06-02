import { motion } from 'framer-motion';
import { Mail, Calendar, User, Activity, Edit3, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PatientProfileCardProps {
  data: any;
  onEdit?: () => void;
}

export default function PatientProfileCard({ data, onEdit }: PatientProfileCardProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden cursor-none">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none cursor-none"></div>
      
      <div className="flex flex-col md:flex-row gap-8 relative z-10 cursor-none">
        {/* Left column - Avatar and basic info */}
        <div className="flex flex-col items-center md:items-start gap-4 md:w-1/3 cursor-none">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-teal-500/30 flex items-center justify-center shadow-lg cursor-none">
            <User className="w-16 h-16 text-teal-400 cursor-none" />
          </div>
          <div className="text-center md:text-left cursor-none">
            <h2 className="text-2xl font-bold text-white mb-1 cursor-none">{data.fullName || 'Unknown User'}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide cursor-none">
              <ShieldCheck className="w-3.5 h-3.5 cursor-none" />
              {t('personalDetails')}
            </div>
          </div>
        </div>

        {/* Right column - Details */}
        <div className="flex-1 flex flex-col gap-6 cursor-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 cursor-none">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 cursor-none">
              <div className="flex items-center gap-2 text-slate-400 mb-1 cursor-none">
                <Mail className="w-4 h-4 cursor-none" />
                <span className="text-xs uppercase tracking-wider font-semibold cursor-none">{t('emailAddress')}</span>
              </div>
              <div className="text-slate-200 font-medium cursor-none">{data.email || 'Not provided'}</div>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 cursor-none">
              <div className="flex items-center gap-2 text-slate-400 mb-1 cursor-none">
                <Calendar className="w-4 h-4 cursor-none" />
                <span className="text-xs uppercase tracking-wider font-semibold cursor-none">{t('age')}</span>
              </div>
              <div className="text-slate-200 font-medium cursor-none">
                {data.dateOfBirth ? data.dateOfBirth.split('-').reverse().join('-') : 'Not provided'}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 cursor-none">
              <div className="flex items-center gap-2 text-slate-400 mb-1 cursor-none">
                <User className="w-4 h-4 cursor-none" />
                <span className="text-xs uppercase tracking-wider font-semibold cursor-none">{t('gender')}</span>
              </div>
              <div className="text-slate-200 font-medium cursor-none">{data.gender || 'Not specified'}</div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 relative overflow-hidden cursor-none">
              <div className="absolute right-0 top-0 w-16 h-16 bg-red-500/10 rounded-full blur-2xl cursor-none"></div>
              <div className="flex items-center gap-2 text-slate-400 mb-1 relative z-10 cursor-none">
                <Activity className="w-4 h-4 text-red-400 cursor-none" />
                <span className="text-xs uppercase tracking-wider font-semibold cursor-none">{t('bloodGroup')}</span>
              </div>
              <div className="text-red-300 font-bold text-lg relative z-10 cursor-none">{data.bloodGroup || 'Unknown'}</div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-5 border border-white/5 cursor-none">
            <h3 className="text-sm uppercase tracking-wider font-semibold text-slate-400 mb-3 cursor-none">Pre-existing Medical Conditions</h3>
            {data.preMedicalConditions && data.preMedicalConditions.length > 0 ? (
              <div className="flex flex-wrap gap-2 cursor-none">
                {data.preMedicalConditions.map((condition: string, index: number) => (
                  <span key={index} className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium cursor-none">
                    {condition}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic text-sm cursor-none">No pre-existing conditions reported.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 flex justify-end relative z-10 cursor-none">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEdit}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 border border-white/10 rounded-xl transition-colors shadow-lg cursor-none group"
        >
          <Edit3 className="w-4 h-4 group-hover:text-teal-400 transition-colors cursor-none" />
          <span className="font-medium cursor-none">{t('editProfile')}</span>
        </motion.button>
      </div>
    </div>
  );
}
