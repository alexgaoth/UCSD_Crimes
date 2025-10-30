import React, { useEffect, useRef } from 'react';

const UCSD_CENTER = { lat: 32.8801, lng: -117.2340 };

export default function GoogleMapWidget({ locationData, selectedLocation, onLocationSelect, onValidLocationsUpdate }) {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const processedLocationsRef = useRef(new Set());

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      //const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const apiKey = "AIzaSyBYOuOtlXP4lAjsf9CHOTY5PpV-Vgrepcc";
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
        clickableIcons: false,
        gestureHandling: 'greedy',
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
    processedLocationsRef.current.clear();

    const geocoder = new window.google.maps.Geocoder();
    const bounds = new window.google.maps.LatLngBounds();
    const validLocations = [];
    let processedCount = 0;

    const ucsdBounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(32.865, -117.250),
      new window.google.maps.LatLng(32.895, -117.220)
    );

    const tryGeocodeWithStrategies = (location, callback) => {
      const strategy1 = `${location.name}, University of California San Diego, La Jolla, CA 92093`;
      
      geocoder.geocode({ address: strategy1 }, (results1, status1) => {
        if (status1 === 'OK' && results1[0]) {
          const position = results1[0].geometry.location;
          const locationType = results1[0].geometry.location_type;
          
          const isPrecise = locationType === 'ROOFTOP' || locationType === 'RANGE_INTERPOLATED';
          const isOnCampus = ucsdBounds.contains(position);
          
          if (isOnCampus && isPrecise) {
            callback({ success: true, position, results: results1[0] });
            return;
          }
        }
        
        const strategy2 = `${location.name}, UCSD Campus, La Jolla, CA`;
        
        geocoder.geocode({ address: strategy2 }, (results2, status2) => {
          if (status2 === 'OK' && results2[0]) {
            const position = results2[0].geometry.location;
            const isOnCampus = ucsdBounds.contains(position);
            
            if (isOnCampus) {
              callback({ success: true, position, results: results2[0] });
              return;
            }
          }
          
          const strategy3 = `${location.name} UCSD`;
          
          geocoder.geocode({ address: strategy3 }, (results3, status3) => {
            if (status3 === 'OK' && results3[0]) {
              const position = results3[0].geometry.location;
              const isOnCampus = ucsdBounds.contains(position);
              
              if (isOnCampus) {
                callback({ success: true, position, results: results3[0] });
                return;
              }
            }
            
            console.warn(`Could not precisely locate: "${location.name}"`);
            callback({ success: false });
          });
        });
      });
    };

    locationData.forEach((location, index) => {
      tryGeocodeWithStrategies(location, (result) => {
        processedCount++;
        
        if (result.success) {
          const posKey = `${result.position.lat().toFixed(6)},${result.position.lng().toFixed(6)}`;
          
          const existingAtPosition = validLocations.find(
            v => `${v.position.lat().toFixed(6)},${v.position.lng().toFixed(6)}` === posKey
          );
          
          if (!existingAtPosition) {
            processedLocationsRef.current.add(location.name);
            validLocations.push({ location, position: result.position });
          } else {
            console.warn(`Location "${location.name}" maps to same coordinates as "${existingAtPosition.location.name}", skipping to avoid overlap`);
          }
        }
        
        if (processedCount === locationData.length) {
          validLocations.sort((a, b) => b.location.count - a.location.count);
          
          validLocations.forEach((item, idx) => {
            const { location, position } = item;
            const rank = idx + 1;
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
                scale: rank <= 3 ? 18 : rank <= 8 ? 14 : 10,
                fillColor: markerColor,
                fillOpacity: 0.85,
                strokeColor: '#ffffff',
                strokeWeight: 2
              },
              optimized: false,
              zIndex: 1000 - rank
            });

            marker.addListener('click', (e) => {
              if (e) {
                e.stop?.();
              }
              
              if (infoWindowRef.current) {
                infoWindowRef.current.close();
              }
              
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
              
              setTimeout(() => {
                infoWindowRef.current.setContent(contentString);
                infoWindowRef.current.open(googleMapRef.current, marker);
                
                if (onLocationSelect) {
                  onLocationSelect(location.name);
                }
              }, 50);
            });

            markersRef.current.push(marker);
            bounds.extend(position);
          });
          
          if (markersRef.current.length > 0) {
            googleMapRef.current.fitBounds(bounds);
            const listener = window.google.maps.event.addListener(googleMapRef.current, 'idle', () => {
              if (googleMapRef.current.getZoom() > 16) {
                googleMapRef.current.setZoom(16);
              }
              window.google.maps.event.removeListener(listener);
            });
          }
          
          if (onValidLocationsUpdate) {
            onValidLocationsUpdate(processedLocationsRef.current);
          }
        }
      });
    });
  };

  const getMarkerColor = (rank) => {
    if (rank <= 3) return '#ef5350';
    if (rank <= 8) return '#ffc107';
    return '#7cb342';
  };

  useEffect(() => {
    if (selectedLocation && markersRef.current.length > 0 && processedLocationsRef.current.has(selectedLocation)) {
      // Don't auto-trigger marker clicks to prevent jumping
    }
  }, [selectedLocation]);

  return (
    <div className="map-container">
      <div 
        ref={mapRef} 
        className="map-visual"
      >
        <span className="map-text">Loading Map...</span>
      </div>
      <div className="map-legend">
        <strong>Map Legend:</strong> 
        <span style={{ color: '#ef5350', fontWeight: 'bold' }}> Red (Top 1-3)</span> = Highest frequency, 
        <span style={{ color: '#ffc107', fontWeight: 'bold' }}> Yellow (4-8)</span> = Moderate frequency, 
        <span style={{ color: '#7cb342', fontWeight: 'bold' }}> Green (9+)</span> = Lower frequency. 
        Click pins for details.
        
        {/* Note not all locations have respective pins, due to the lack of nuance of location in google maps.*/}
      </div>
    </div>
  );
}