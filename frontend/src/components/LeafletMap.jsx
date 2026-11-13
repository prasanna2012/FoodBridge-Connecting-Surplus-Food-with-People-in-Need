import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths in Vite / Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom pin icons
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const LeafletMap = ({
  center = [17.4156, 78.4487], // Default Hyderabad
  zoom = 12,
  donations = [],
  singlePoint = null, // [lat, lng]
  onLocationSelect = null, // for picker mode
  height = '420px',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Handle map click for location picking
      if (onLocationSelect) {
        map.on('click', (e) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    // 1. Single Point Mode (e.g. Donation Details or Picker)
    if (singlePoint && singlePoint[0] && singlePoint[1]) {
      const marker = L.marker(singlePoint, { icon: greenIcon, draggable: !!onLocationSelect });
      if (onLocationSelect) {
        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          onLocationSelect(pos.lat, pos.lng);
        });
      }
      marker.addTo(layer);
      mapInstanceRef.current.setView(singlePoint, 14);
      return;
    }

    // 2. Multi-Donation Mode
    if (donations.length > 0) {
      const bounds = L.latLngBounds();

      donations.forEach((d) => {
        if (!d.latitude || !d.longitude) return;

        const latLng = [Number(d.latitude), Number(d.longitude)];
        bounds.extend(latLng);

        const marker = L.marker(latLng, { icon: greenIcon });
        
        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 180px;">
            <strong style="color: #14532d; font-size: 13px; display: block; margin-bottom: 4px;">
              ${d.title}
            </strong>
            <p style="font-size: 11px; color: #4b5563; margin: 0 0 6px 0;">
              📦 ${d.quantity_value} ${d.quantity_unit} &bull; ${d.food_category.replace('_', ' ')}
            </p>
            <p style="font-size: 11px; color: #4b5563; margin: 0 0 8px 0;">
              📍 ${d.pickup_address}
            </p>
            <a href="/donations/${d.id}" style="display: inline-block; background-color: #16a34a; color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; text-decoration: none; font-weight: bold;">
              View Details &rarr;
            </a>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(layer);
      });

      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [donations, singlePoint]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-warm-200 shadow-inner">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      {onLocationSelect && (
        <div className="absolute top-3 left-12 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow border border-warm-200 text-xs font-semibold text-gray-700">
          📍 Click map or drag marker to set exact pickup coordinates
        </div>
      )}
    </div>
  );
};

export default LeafletMap;

