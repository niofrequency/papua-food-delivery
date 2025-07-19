import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface MapProps {
  longitude: number;
  latitude: number;
  zoom?: number;
  markers?: Array<{
    longitude: number;
    latitude: number;
    label?: string;
    color?: string;
  }>;
  height?: string;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
}

declare global {
  interface Window {
    L: any;
  }
}

export function Map({
  longitude,
  latitude,
  zoom = 13,
  markers = [],
  height = '300px',
  onMapClick,
  className = '',
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Leaflet library dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Check if Leaflet is already loaded
        if (!window.L) {
          // Load CSS
          const linkEl = document.createElement('link');
          linkEl.rel = 'stylesheet';
          linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          linkEl.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          linkEl.crossOrigin = '';
          document.head.appendChild(linkEl);
          
          // Load JS
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          script.async = true;
          
          // Wait for script to load
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to load Leaflet library:', err);
        setError('Failed to load map. Please try again later.');
        setLoading(false);
      }
    };
    
    loadLeaflet();
  }, []);

  // Initialize map when Leaflet is loaded and container is available
  useEffect(() => {
    if (loading || error || !mapContainerRef.current || !window.L) return;
    
    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      const mapOptions = {
        center: [latitude, longitude],
        zoom,
        zoomControl: true,
        scrollWheelZoom: false,
      };
      
      mapInstanceRef.current = window.L.map(mapContainerRef.current, mapOptions);
      
      // Add tile layer (map background)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
      
      // Add click handler
      if (onMapClick) {
        mapInstanceRef.current.on('click', (e: any) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }
    } else {
      // Just update the view if map already exists
      mapInstanceRef.current.setView([latitude, longitude], zoom);
    }
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (mapInstanceRef.current) {
        marker.remove();
      }
    });
    markersRef.current = [];
    
    // Add markers
    markers.forEach(marker => {
      const defaultIcon = window.L.divIcon({
        html: `<div class="w-6 h-6 rounded-full bg-${marker.color || 'primary'} border-2 border-white flex items-center justify-center text-white text-xs font-bold">${marker.label || ''}</div>`,
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      
      const mapMarker = window.L.marker([marker.latitude, marker.longitude], { icon: defaultIcon })
        .addTo(mapInstanceRef.current);
      
      if (marker.label) {
        mapMarker.bindTooltip(marker.label);
      }
      
      markersRef.current.push(mapMarker);
    });
    
    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current && !mapInstanceRef.current._isDestroyed) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, markers, loading, error, onMapClick]);

  // Update map size on container resize
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }
    
    return () => {
      if (mapContainerRef.current) {
        resizeObserver.unobserve(mapContainerRef.current);
      }
    };
  }, [mapInstanceRef.current]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div 
      ref={mapContainerRef} 
      className={`rounded-lg overflow-hidden ${className}`} 
      style={{ height }}
    />
  );
}

// Need to import React hooks
import { useState } from 'react';
