import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X, Check, Search, Compass, Loader2 } from 'lucide-react';
import { LocationData } from '../types';
import { POPULAR_LOCATIONS, getCurrentBrowserLocation, drawVectorMap } from '../utils/location';

interface LocationModalProps {
  onClose: () => void;
  onSendLocation: (location: LocationData) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ onClose, onSendLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(POPULAR_LOCATIONS[0]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [customSearch, setCustomSearch] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Redraw map on location change
  useEffect(() => {
    if (canvasRef.current) {
      drawVectorMap(
        canvasRef.current,
        selectedLocation.latitude,
        selectedLocation.longitude,
        selectedLocation.placeName
      );
    }
  }, [selectedLocation]);

  const handleGetCurrentLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const loc = await getCurrentBrowserLocation();
      setSelectedLocation(loc);
    } catch {
      setLocationError('Could not fetch GPS. Selected Times Square preset.');
      setSelectedLocation(POPULAR_LOCATIONS[0]);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSearchCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearch.trim()) return;

    // Simulate geocoding
    const custom: LocationData = {
      placeName: customSearch.trim(),
      address: `${customSearch.trim()}, Global Metropolis`,
      latitude: Number((35 + Math.random() * 15).toFixed(4)),
      longitude: Number((-100 + Math.random() * 80).toFixed(4)),
    };
    setSelectedLocation(custom);
    setCustomSearch('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">Share Location</h3>
              <p className="text-xs text-slate-500">Send your current GPS position or a landmark</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Vector Map Preview Canvas */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-100">
            <canvas
              ref={canvasRef}
              width={460}
              height={200}
              className="w-full h-48 object-cover block"
            />
            {/* Live GPS locator quick trigger */}
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 hover:text-emerald-600 px-3 py-1.5 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 text-xs font-medium transition-all active:scale-95"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>{isLocating ? 'Detecting GPS...' : 'My Live Location'}</span>
            </button>
          </div>

          {/* Current Selection details */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                {selectedLocation.placeName}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                {selectedLocation.address}
              </p>
              <p className="text-[11px] font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-1">
                Lat: {selectedLocation.latitude} · Lng: {selectedLocation.longitude}
              </p>
            </div>
          </div>

          {locationError && (
            <p className="text-xs text-amber-600 dark:text-amber-400 px-1">
              {locationError}
            </p>
          )}

          {/* Custom Search Box */}
          <form onSubmit={handleSearchCustom} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              placeholder="Search address or custom landmark..."
              className="w-full pl-9 pr-20 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1.5 text-xs bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg font-medium hover:opacity-90 active:scale-95 transition-all"
            >
              Pin
            </button>
          </form>

          {/* Preset Places list */}
          <div>
            <div className="text-xs font-medium text-slate-500 mb-2 px-1">Popular Landmarks</div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {POPULAR_LOCATIONS.map((loc, idx) => {
                const isSelected = selectedLocation.placeName === loc.placeName;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedLocation(loc)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 font-medium'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{loc.placeName}</div>
                        <div className="text-[11px] text-slate-400 truncate">{loc.address}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSendLocation(selectedLocation);
              onClose();
            }}
            className="px-5 py-2.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            <span>Send Selected Location</span>
          </button>
        </div>
      </div>
    </div>
  );
};
