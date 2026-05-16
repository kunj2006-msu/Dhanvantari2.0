import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (lat: number, lng: number, address: string) => void;
  city?: string;
  state?: string;
  initialLat?: number | null;
  initialLng?: number | null;
}

function MapController({ center, bounds }: { center: [number, number], bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
    if (bounds) {
      map.setMaxBounds(bounds);
    }
  }, [center, bounds, map]);
  return null;
}

function LocationMarker({ 
  position, 
  setPosition, 
  setAddress, 
  setIsFetchingLocation 
}: { 
  position: L.LatLng | null, 
  setPosition: (p: L.LatLng) => void,
  setAddress: (a: string) => void,
  setIsFetchingLocation: (b: boolean) => void
}) {
  useMapEvents({
    async click(e) {
      setPosition(e.latlng);
      setIsFetchingLocation(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        } else {
          setAddress('Unknown Location');
        }
      } catch (err) {
        console.error("Reverse geocoding failed", err);
        setAddress('Error fetching address');
      } finally {
        setIsFetchingLocation(false);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function MapModal({ isOpen, onClose, onConfirm, city, state, initialLat, initialLng }: MapModalProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [mapBounds, setMapBounds] = useState<L.LatLngBoundsExpression | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialLat && initialLng) {
        setMapCenter([initialLat, initialLng]);
        setPosition(L.latLng(initialLat, initialLng));
        setAddress('Existing Location'); // Optional fallback
      } else if (city && state) {
        const fetchCityData = async () => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)},${encodeURIComponent(state)}`);
            const data = await res.json();
            if (data && data.length > 0) {
              const first = data[0];
              const lat = parseFloat(first.lat);
              const lon = parseFloat(first.lon);
              setMapCenter([lat, lon]);
              
              if (first.boundingbox) {
                const [minLat, maxLat, minLon, maxLon] = first.boundingbox.map(Number);
                setMapBounds([
                  [minLat, minLon],
                  [maxLat, maxLon]
                ]);
              }
            }
          } catch (err) {
            console.error("Failed to fetch city coordinates", err);
          }
        };
        fetchCityData();
      }
    } else {
      // Reset state when closed so it fetches fresh next time it opens
      setPosition(null);
      setAddress('');
    }
  }, [isOpen, city, state, initialLat, initialLng]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-none"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-cyan-900/20 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90">
            <h2 className="text-xl font-bold text-slate-100">
              Select Clinic/Hospital Location
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-none"
            >
              <X className="w-5 h-5 cursor-none" />
            </button>
          </div>

          {/* Map Area */}
          <div className="h-[400px] w-full bg-slate-800 relative cursor-crosshair">
            <MapContainer 
              center={mapCenter}
              zoom={5} 
              style={{ height: '100%', width: '100%' }}
            >
              <MapController center={mapCenter} bounds={mapBounds} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker 
                position={position} 
                setPosition={setPosition} 
                setAddress={setAddress}
                setIsFetchingLocation={setIsFetchingLocation}
              />
            </MapContainer>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-slate-900/90 flex justify-between items-center gap-4">
            <div className="text-sm text-slate-400 flex-1 truncate">
              {isFetchingLocation ? (
                <span>Fetching address...</span>
              ) : position ? (
                <span title={address}>Selected: {address || `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`}</span>
              ) : (
                <span>Click anywhere on the map to drop a pin.</span>
              )}
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-none"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (position && address) {
                    onConfirm(position.lat, position.lng, address);
                  }
                }}
                disabled={!position || isFetchingLocation || !address}
                className="flex items-center gap-2 px-6 py-2 bg-teal-500 text-slate-900 font-bold rounded-xl hover:bg-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-none"
              >
                <Check className="w-4 h-4 cursor-none" />
                Confirm Location
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
