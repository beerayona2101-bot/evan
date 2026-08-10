import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Check, X, Search, RefreshCw } from 'lucide-react';

interface AddressMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (locationData: {
    lat: number;
    lng: number;
    houseNo?: string;
    street?: string;
    area?: string;
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    formattedAddress?: string;
  }) => void;
  initialLat?: number;
  initialLng?: number;
}

export const AddressMapModal: React.FC<AddressMapModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLat = 19.0596, // Default: Bandra, Mumbai
  initialLng = 72.8295,
}) => {
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [addressDetails, setAddressDetails] = useState<any>(null);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletMarkerRef = useRef<any>(null);

  // Reverse geocode coordinates using OpenStreetMap Nominatim API
  const reverseGeocode = async (latitude: number, longitude: number) => {
    setLoadingGeo(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const houseNo = addr.house_number || addr.building || addr.amenity || '';
        const street = addr.road || addr.street || addr.pedestrian || addr.suburb || '';
        const area = addr.suburb || addr.neighbourhood || addr.residential || addr.village || addr.town || '';
        const city = addr.city || addr.town || addr.city_district || addr.county || '';
        const district = addr.state_district || addr.county || city;
        const state = addr.state || '';
        const postalCode = addr.postcode || '';

        setAddressDetails({
          lat: latitude,
          lng: longitude,
          houseNo,
          street: street || area,
          area: area || street,
          city: city || district,
          district: district || city,
          state,
          postalCode,
          formattedAddress: data.display_name,
        });
      }
    } catch (err) {
      console.error('[Map Reverse Geocode Error]', err);
    } finally {
      setLoadingGeo(false);
    }
  };

  // Search location by query text
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + ', India')}&format=json&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);
        setLat(newLat);
        setLng(newLng);
        if (leafletMapRef.current && leafletMarkerRef.current) {
          leafletMapRef.current.setView([newLat, newLng], 16);
          leafletMarkerRef.current.setLatLng([newLat, newLng]);
        }
        await reverseGeocode(newLat, newLng);
      }
    } catch (err) {
      console.error('[Location Search Error]', err);
    } finally {
      setSearching(false);
    }
  };

  // Handle GPS Current Location
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setLat(newLat);
        setLng(newLng);
        if (leafletMapRef.current && leafletMarkerRef.current) {
          leafletMapRef.current.setView([newLat, newLng], 16);
          leafletMarkerRef.current.setLatLng([newLat, newLng]);
        }
        reverseGeocode(newLat, newLng);
      },
      (err) => {
        setLoadingGeo(false);
        alert('Could not fetch current GPS location: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  // Dynamically load Leaflet JS & CSS when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const loadLeaflet = async () => {
      // Load Leaflet CSS if not attached
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS if not available
      if (!(window as any).L) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      // Clean up previous map if exists
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      const map = L.map(mapContainerRef.current).setView([lat, lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom red marker icon
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color: #991b1b; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #fef3c7; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;"><svg style="width: 14px; height: 14px; color: #fef3c7;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const marker = L.marker([lat, lng], { draggable: true, icon: customIcon }).addTo(map);

      marker.on('dragend', (e: any) => {
        const position = e.target.getLatLng();
        setLat(position.lat);
        setLng(position.lng);
        reverseGeocode(position.lat, position.lng);
      });

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        setLat(e.latlng.lat);
        setLng(e.latlng.lng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      leafletMapRef.current = map;
      leafletMarkerRef.current = marker;

      reverseGeocode(lat, lng);
    };

    setTimeout(() => {
      loadLeaflet();
    }, 150);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl border border-amber-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-900/80 border border-amber-400 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-street text-lg font-black tracking-wide text-amber-300">
                SELECT EXACT LOCATION ON MAP
              </h3>
              <p className="text-[10px] text-slate-300 font-medium">
                Tap anywhere on the map or drag the pin marker to pick your delivery location
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & GPS Trigger */}
        <div className="p-3 bg-amber-50/80 border-b border-amber-200 flex flex-wrap gap-2 items-center justify-between">
          <form onSubmit={handleSearchLocation} className="flex-1 min-w-[240px] flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search area, locality, or city (e.g. Bandra West, Mumbai)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs rounded-xl flex items-center gap-1 uppercase tracking-wider"
            >
              {searching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleUseGPS}
            disabled={loadingGeo}
            className="px-3.5 py-2 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs rounded-xl flex items-center gap-1.5 border border-amber-300 uppercase tracking-wider shadow-sm disabled:opacity-50"
          >
            <Navigation className="w-3.5 h-3.5 text-amber-300" />
            <span>Use My GPS</span>
          </button>
        </div>

        {/* Interactive Map View */}
        <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {loadingGeo && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="flex items-center gap-2 bg-slate-900 text-amber-300 px-4 py-2 rounded-xl text-xs font-bold border border-amber-400 shadow-xl">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Locating address details...</span>
              </div>
            </div>
          )}
        </div>

        {/* Location Details Footer */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-xs">
            <MapPin className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="font-black text-slate-900 block uppercase tracking-wider text-[11px]">SELECTED PIN LOCATION</span>
              <p className="text-slate-700 font-medium line-clamp-2 mt-0.5">
                {addressDetails?.formattedAddress || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`}
              </p>
              {addressDetails && (
                <div className="flex flex-wrap gap-2 text-[10px] font-bold text-amber-900 mt-1">
                  {addressDetails.area && <span className="bg-white px-2 py-0.5 rounded border border-amber-300">Area: {addressDetails.area}</span>}
                  {addressDetails.city && <span className="bg-white px-2 py-0.5 rounded border border-amber-300">City: {addressDetails.city}</span>}
                  {addressDetails.state && <span className="bg-white px-2 py-0.5 rounded border border-amber-300">State: {addressDetails.state}</span>}
                  {addressDetails.postalCode && <span className="bg-white px-2 py-0.5 rounded border border-amber-300">PIN: {addressDetails.postalCode}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (addressDetails) {
                  onSelectLocation(addressDetails);
                } else {
                  onSelectLocation({ lat, lng });
                }
                onClose();
              }}
              className="px-6 py-2.5 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs rounded-xl flex items-center gap-1.5 border border-amber-300 uppercase tracking-widest shadow-md"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>Confirm Location Pin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
