import React, { useEffect, useRef } from 'react';

const UCSD_CENTER = { lat: 32.8801, lng: -117.2340 };

export default function GoogleMapWidget({ locationData, selectedLocation, onLocationSelect }) {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: UCSD_CENTER,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      infoWindowRef.current = new window.google.maps.InfoWindow();

      if (locationData.length > 0) {
        addMarkers();
      }
    };

    if (locationData.length > 0) {
      loadGoogleMaps();
    }

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [locationData]);

  const addMarkers = () => {
    if (!googleMapRef.current || !window.google) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const geocoder = new window.google.maps.Geocoder();
    const bounds = new window.google.maps.LatLngBounds();

    locationData.forEach((location, index) => {
      const searchQuery = `${location.name}, UCSD, La Jolla, CA`;
      
      geocoder.geocode({ address: searchQuery }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const position = results[0].geometry.location;
          
          const rank = index + 1;
          const markerColor = getMarkerColor(rank);

          const marker = new window.google.maps.Marker({
            position: position,
            map: googleMapRef.current,
            title: location.name,
            label: {
              text: String(rank),
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: rank <= 3 ? 18 : rank <= 10 ? 14 : 10,
              fillColor: markerColor,
              fillOpacity: 0.85,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }
          });

          marker.addListener('click', () => {
            const contentString = `
              <div style="padding: 10px; max-width: 300px;">
                <h3 style="margin: 0 0 8px 0; color: #2c2416; font-size: 1.1rem;">
                  #${rank} ${location.name}
                </h3>
                <p style="margin: 0 0 8px 0; color: #666; font-size: 0.9rem;">
                  <strong>${location.count}</strong> ${location.count === 1 ? 'report' : 'reports'}
                </p>
                <div style="max-height: 200px; overflow-y: auto;">
                  ${location.reports.slice(0, 3).map(report => `
                    <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0;">
                      <div style="font-size: 0.8rem; color: #558b2f; font-weight: 600;">
                        ${report.category}
                      </div>
                      <div style="font-size: 0.75rem; color: #999;">
                        ${report.date_occurred}
                      </div>
                    </div>
                  `).join('')}
                  ${location.reports.length > 3 ? 
                    `<div style="font-size: 0.8rem; color: #999; text-align: center;">
                      + ${location.reports.length - 3} more
                    </div>` : ''
                  }
                </div>
              </div>
            `;
            
            infoWindowRef.current.setContent(contentString);
            infoWindowRef.current.open(googleMapRef.current, marker);
            
            if (onLocationSelect) {
              onLocationSelect(location.name);
            }
          });

          markersRef.current.push(marker);
          bounds.extend(position);

          if (index === locationData.length - 1) {
            googleMapRef.current.fitBounds(bounds);
            const listener = window.google.maps.event.addListener(googleMapRef.current, 'idle', () => {
              if (googleMapRef.current.getZoom() > 16) {
                googleMapRef.current.setZoom(16);
              }
              window.google.maps.event.removeListener(listener);
            });
          }
        }
      });
    });
  };

  const getMarkerColor = (rank) => {
    if (rank <= 3) return '#ef5350';
    if (rank <= 10) return '#ffc107';
    return '#7cb342';
  };

  useEffect(() => {
    if (selectedLocation && markersRef.current.length > 0) {
      const locationIndex = locationData.findIndex(loc => loc.name === selectedLocation);
      if (locationIndex !== -1 && markersRef.current[locationIndex]) {
        window.google.maps.event.trigger(markersRef.current[locationIndex], 'click');
      }
    }
  }, [selectedLocation, locationData]);

  return (
    <div>
      <div 
        ref={mapRef} 
        className="map-visual"
        style={{ height: '500px', width: '100%' }}
      >
        <span className="map-text">Loading Map...</span>
      </div>
      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        background: 'white', 
        border: '1px solid #e8e3d8',
        fontSize: '0.85rem',
        color: '#666'
      }}>
        <strong>Map Legend:</strong> 
        <span style={{ color: '#ef5350', fontWeight: 'bold' }}> Red (Top 3)</span> = Highest frequency, 
        <span style={{ color: '#ffc107', fontWeight: 'bold' }}> Yellow (4-10)</span> = Moderate frequency, 
        <span style={{ color: '#7cb342', fontWeight: 'bold' }}> Green (11+)</span> = Lower frequency. 
        Click pins for details.
      </div>
    </div>
  );
}