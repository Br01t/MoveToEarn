
import React, { useState, useEffect } from 'react';
import { MapPin, Crown, X, AlertTriangle, Loader, Navigation } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface ZoneDiscoveryModalProps {
  isOpen: boolean;
  data: {
    lat: number;
    lng: number;
    defaultName: string;
    cost: number;
    reward: number;
  };
  onConfirm: (name: string) => void;
  onDiscard: () => void;
}

const ZoneDiscoveryModal: React.FC<ZoneDiscoveryModalProps> = ({ isOpen, data, onConfirm, onDiscard }) => {
  const { t } = useLanguage();
  const [customName, setCustomName] = useState('');
  const [warning, setWarning] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  // 1. Auto-fetch address (Reverse Geocoding via Nominatim - Free)
  useEffect(() => {
    if (isOpen && data.lat && data.lng) {
        setIsAddressLoading(true);
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.lat}&lon=${data.lng}&zoom=18&addressdetails=1`;
        
        fetch(url, { headers: { 'User-Agent': 'ZoneRun-Game/1.0' } })
        .then(res => res.json())
        .then(json => {
            if (json && json.address) {
                // Construct readable address
                const road = json.address.road || json.address.pedestrian || json.address.park || "";
                const city = json.address.city || json.address.town || json.address.village || json.address.county || "";
                const cc = (json.address.country_code || "xx").toUpperCase();
                
                let readable = "";
                if (road) readable += road;
                if (city) readable += (readable ? `, ${city}` : city);
                if (cc) readable += ` - ${cc}`;
                
                setAddress(readable || "Unknown Location");
                
                // Smart Pre-fill if name is empty
                if (!customName) {
                    setCustomName(`${road || 'New Zone'}, ${city} - ${cc}`);
                }
            }
        })
        .catch(err => {
            console.error("Geocoding error:", err);
            setAddress("Signal Weak - Map Data Unavailable");
        })
        .finally(() => setIsAddressLoading(false));
    }
  }, [isOpen, data.lat, data.lng]);

  // Reset map loading when coordinates change and add delay
  useEffect(() => {
      setShowMap(false);
      setIsMapLoading(true);
      
      // Delay map rendering to ensure container is stable and prevent zoom glitches
      const timer = setTimeout(() => {
          setShowMap(true);
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
  }, [data.lat, data.lng]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    // SECURITY: Sanitize input to allow only alphanumeric, spaces, and basic punctuation
    // This prevents HTML injection or script execution through zone names
    const sanitizedInput = customName.replace(/[^a-zA-Z0-9\s,.-]/g, "").trim();
    const nameToSubmit = sanitizedInput || data.defaultName;

    // Validation: Check format "Name, City - CC"
    const isValidFormat = /.+,.+\s-\s[A-Z]{2}$/.test(nameToSubmit);

    if (!isValidFormat && !warning) {
        setWarning("Format required: 'Name, City - CC' (e.g. 'Hyde Park, London - UK'). Click Mint again to ignore.");
        return;
    }

    onConfirm(nameToSubmit);
    setCustomName('');
    setWarning(null);
    setAddress(null);
  };

  // Calculate Map Bounding Box for Embed
  // Adjusted for Aspect Ratio (Width > Height) to prevent OSM from zooming out to fit
  const latDelta = 0.001;  // ~110m vertical
  const lngDelta = 0.0025; // ~250m horizontal
  
  const minLon = data.lng - lngDelta;
  const minLat = data.lat - latDelta;
  const maxLon = data.lng + lngDelta;
  const maxLat = data.lat + latDelta;
  
  const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
      
      {/* Container: Glass panel heavy */}
      <div className="glass-panel-heavy rounded-2xl w-full max-w-2xl shadow-[0_0_60px_rgba(16,185,129,0.3)] overflow-hidden flex flex-col animate-slide-up relative">
        
        {/* Background Grid Decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

        {/* TOP: MAP VISUAL (Interactive Embed) */}
        <div className="relative h-72 bg-gray-900 border-b border-white/10 w-full shrink-0 group">
            
            {/* Loading Skeleton for Map */}
            {(!showMap || isMapLoading) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20 animate-pulse">
                    <Loader size={32} className="text-emerald-500 animate-spin mb-2" />
                    <span className="text-xs text-emerald-500/80 font-mono uppercase tracking-widest">Acquiring Satellite Feed...</span>
                </div>
            )}

            {showMap && (
                <iframe 
                    key={`${data.lat}-${data.lng}`} // Force re-render on coord change
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${data.lat},${data.lng}`}
                    className={`opacity-80 group-hover:opacity-100 transition-opacity duration-700 ${isMapLoading ? 'opacity-0' : 'opacity-80'} grayscale hover:grayscale-0`}
                    onLoad={() => setIsMapLoading(false)}
                ></iframe>
            )}
            
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-gray-950 via-transparent to-transparent"></div>
            
            {/* Floating Header on Map */}
            <div className="absolute bottom-5 left-6 right-6 flex justify-between items-end z-20">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-wider drop-shadow-md">{t('discovery.title')}</h2>
                    <div className="flex items-center gap-1.5 text-emerald-300 text-sm font-bold drop-shadow-md bg-black/60 px-3 py-1 rounded-full w-fit backdrop-blur-md mt-2 border border-emerald-500/30">
                        <MapPin size={14} />
                        {isAddressLoading ? (
                            <span className="flex items-center gap-1"><Loader size={12} className="animate-spin"/> Scanning...</span>
                        ) : (
                            <span className="truncate max-w-[400px]">{address || `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* BOTTOM: CONTROLS & STATS */}
        <div className="p-8 flex flex-col gap-6 relative z-10 bg-transparent">
           
           {/* Naming Input */}
           <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 flex justify-between">
                  <span>{t('discovery.name_label')}</span>
                  <span className="text-emerald-500/70 flex items-center gap-1"><Navigation size={12}/> {data.lat.toFixed(5)}, {data.lng.toFixed(5)}</span>
              </label>
              <div className="relative">
                  <input 
                     type="text" 
                     placeholder={t('discovery.name_placeholder')}
                     value={customName}
                     onChange={(e) => {
                         setCustomName(e.target.value);
                         setWarning(null); 
                     }}
                     maxLength={50} // Prevent long inputs
                     className={`w-full bg-black/40 border-2 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none transition-all font-bold text-lg ${warning ? 'border-yellow-500 focus:border-yellow-500' : 'border-gray-700 focus:border-emerald-500'}`}
                  />
                  {warning && <AlertTriangle className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-500 animate-pulse" size={20} />}
              </div>
              
              {/* Validation / Helper Message */}
              <div className={`mt-2 text-xs flex items-start gap-1.5 leading-tight ${warning ? 'text-yellow-400 font-bold' : 'text-gray-500'}`}>
                  {warning ? (
                      <>{warning}</>
                  ) : (
                      <>{t('discovery.naming_tip')}</>
                  )}
              </div>
           </div>

           {/* Compact Stats Row */}
           <div className="grid grid-cols-2 gap-6">
              <div className="bg-black/30 border border-gray-700 rounded-xl p-4 flex items-center justify-between px-5">
                 <span className="text-xs text-red-400 uppercase font-bold tracking-wider">{t('discovery.cost')}</span>
                 <span className="text-lg font-bold text-white font-mono">{data.cost} <span className="text-xs text-gray-500">RUN</span></span>
              </div>
              <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between px-5">
                 <span className="text-xs text-emerald-400 uppercase font-bold tracking-wider">{t('discovery.reward')}</span>
                 <span className="text-lg font-bold text-white font-mono">+{data.reward} <span className="text-xs text-emerald-600">GOV</span></span>
              </div>
           </div>

           {/* Action Buttons */}
           <div className="flex gap-4 pt-2">
               <button 
                 onClick={onDiscard}
                 className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold rounded-xl transition-colors text-sm"
               >
                 {t('discovery.discard_btn')}
               </button>
               <button 
                 onClick={handleSubmit}
                 className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 hover:scale-[1.01]"
               >
                 <Crown size={20} className="fill-black/20" /> 
                 {warning ? 'Confirm Anyway' : t('discovery.mint_btn')}
               </button>
           </div>

        </div>
      </div>
    </div>
  );
};

export default ZoneDiscoveryModal;