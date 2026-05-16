import { motion } from 'framer-motion';
import { MapPin, Award, Stethoscope, Briefcase, FileBadge, Edit3 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DoctorProfileCardProps {
  data: any;
  onEdit?: () => void;
}

export default function DoctorProfileCard({ data, onEdit }: DoctorProfileCardProps) {
  const hasCoordinates = data.latitude && data.longitude;
  const mapLink = hasCoordinates ? `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}` : "#";

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden cursor-none">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none cursor-none"></div>

      <div className="flex flex-col lg:flex-row gap-8 relative z-10 cursor-none">
        
        {/* Left Column - Details */}
        <div className="flex-1 flex flex-col gap-6 cursor-none">
          <div className="flex items-center gap-5 border-b border-white/5 pb-6 cursor-none">
             <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-900 to-slate-800 border border-cyan-500/30 flex items-center justify-center shadow-lg cursor-none">
              <Stethoscope className="w-10 h-10 text-cyan-400 cursor-none" />
            </div>
            <div className="cursor-none">
              <h2 className="text-3xl font-bold text-white mb-1 cursor-none">{data.fullName || 'Unknown Doctor'}</h2>
              <div className="text-cyan-300 font-medium cursor-none">{data.specialization || 'Specialist'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 cursor-none">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 cursor-none">
              <div className="flex items-center gap-2 text-slate-400 mb-1 cursor-none">
                <Award className="w-4 h-4 cursor-none" />
                <span className="text-xs uppercase tracking-wider font-semibold cursor-none">Degree</span>
              </div>
              <div className="text-slate-200 font-medium cursor-none">{data.degree || 'Not provided'}</div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 cursor-none">
              <div className="flex items-center gap-2 text-slate-400 mb-1 cursor-none">
                <FileBadge className="w-4 h-4 cursor-none" />
                <span className="text-xs uppercase tracking-wider font-semibold cursor-none">Medical Reg No.</span>
              </div>
              <div className="text-slate-200 font-medium cursor-none">{data.medicalRegistrationNumber || 'Pending'}</div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 cursor-none">
              <div className="flex items-center gap-2 text-slate-400 mb-1 cursor-none">
                <Briefcase className="w-4 h-4 cursor-none" />
                <span className="text-xs uppercase tracking-wider font-semibold cursor-none">Experience</span>
              </div>
              <div className="text-slate-200 font-medium cursor-none">{data.yearsOfExperience ? `${data.yearsOfExperience}+ Years` : 'Not provided'}</div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 flex items-start gap-3 cursor-none">
            <MapPin className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5 cursor-none" />
            <div className="cursor-none">
               <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1 cursor-none">Clinic Address</h3>
               <p className="text-slate-200 text-sm leading-relaxed cursor-none">{data.clinicAddress || 'Address not available'}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Map */}
        {hasCoordinates && (
          <div className="lg:w-2/5 flex flex-col cursor-none">
             <div className="flex items-center justify-between mb-3 cursor-none">
               <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 cursor-none">
                 <MapPin className="w-4 h-4 text-cyan-500 cursor-none" /> Clinic Location
               </h3>
               <a href={mapLink} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                 Open in Google Maps
               </a>
             </div>
             <a href={mapLink} target="_blank" rel="noopener noreferrer" className="flex-1 min-h-[250px] rounded-2xl overflow-hidden border border-white/10 shadow-inner relative cursor-none ring-1 ring-cyan-500/20 group block">
               <MapContainer 
                 center={[data.latitude, data.longitude]} 
                 zoom={15} 
                 scrollWheelZoom={false}
                 doubleClickZoom={false}
                 dragging={false}
                 zoomControl={false}
                 className="w-full h-full z-0 cursor-none"
               >
                 <TileLayer
                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                   url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                 />
                 <Marker position={[data.latitude, data.longitude]}>
                    <Popup>
                      <div className="font-semibold text-slate-800">{data.fullName}</div>
                      <div className="text-sm text-slate-600">{data.clinicAddress}</div>
                    </Popup>
                 </Marker>
               </MapContainer>
               {/* Overlay to enforce read-only, prevent cursor changes, and act as a clickable area */}
               <div className="absolute inset-0 z-[1000] cursor-none bg-black/0 group-hover:bg-cyan-500/10 transition-colors flex items-center justify-center backdrop-blur-[1px] opacity-0 group-hover:opacity-100">
                  <span className="bg-slate-900/80 text-cyan-300 px-4 py-2 rounded-xl border border-cyan-500/30 text-sm font-medium shadow-lg">
                    View on Google Maps
                  </span>
               </div>
             </a>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 flex justify-end relative z-10 cursor-none">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEdit}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 border border-white/10 rounded-xl transition-colors shadow-lg cursor-none group"
        >
          <Edit3 className="w-4 h-4 group-hover:text-cyan-400 transition-colors cursor-none" />
          <span className="font-medium cursor-none">Edit Credentials</span>
        </motion.button>
      </div>
    </div>
  );
}
