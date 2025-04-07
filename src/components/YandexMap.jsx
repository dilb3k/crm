// YandexMap.js
import React, { useEffect, useRef, useState } from 'react';
import mapManager from './YandexMapSingleton';

const YandexMap = ({ 
  containerId, 
  latitude, 
  longitude, 
  zoom = 15, 
  editable = false,
  onLocationSelected,
  placeholderId, // Unique ID to avoid duplicates
  address
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapInstanceRef = useRef(null);
  const placemarkRef = useRef(null);
  const containerRef = useRef(null);

  // Function to initialize the map
  const initializeMap = async () => {
    try {
      setLoading(true);
      
      // Create a unique container ID to avoid duplicates
      const uniqueContainerId = containerId || `map-${placeholderId}`;
      
      // Get the coordinates
      const coords = [
        parseFloat(latitude) || 41.311081, 
        parseFloat(longitude) || 69.240562
      ];
      
      // Create or get map instance
      const map = await mapManager.createMap(uniqueContainerId, {
        center: coords,
        zoom: zoom,
        controls: ['zoomControl', editable ? 'searchControl' : null].filter(Boolean)
      });
      
      if (!map) {
        throw new Error('Failed to create map');
      }
      
      mapInstanceRef.current = map;
      
      // Add placemark
      const placemark = mapManager.addPlacemark(uniqueContainerId, coords, {
        hintContent: address || 'Joylashuv',
        draggable: editable
      });
      
      placemarkRef.current = placemark;
      
      // Set up events for editable maps
      if (editable && placemark && onLocationSelected) {
        // Update coordinates when placemark is moved
        placemark.events.add('dragend', function() {
          const newCoords = placemark.geometry.getCoordinates();
          onLocationSelected({
            latitude: newCoords[0].toFixed(6),
            longitude: newCoords[1].toFixed(6)
          });
        });
        
        // Update coordinates when map is clicked
        map.events.add('click', function(e) {
          const newCoords = e.get('coords');
          placemark.geometry.setCoordinates(newCoords);
          onLocationSelected({
            latitude: newCoords[0].toFixed(6),
            longitude: newCoords[1].toFixed(6)
          });
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Map initialization error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Initialize the map on mount
  useEffect(() => {
    // Only initialize once the container is in the DOM
    if (containerRef.current) {
      initializeMap();
    }
    
    // Cleanup function - destroy the map when component unmounts
    return () => {
      const uniqueContainerId = containerId || `map-${placeholderId}`;
      mapManager.destroyMap(uniqueContainerId);
    };
  }, [placeholderId]); // Only run on initial mount

  // Update the map when coordinates change
  useEffect(() => {
    // Skip if we're still loading or there's no map
    if (loading || !mapInstanceRef.current || !placemarkRef.current) return;
    
    const newCoords = [
      parseFloat(latitude) || 41.311081,
      parseFloat(longitude) || 69.240562
    ];
    
    // Update placemark position
    placemarkRef.current.geometry.setCoordinates(newCoords);
    
    // Center map on new coordinates
    mapInstanceRef.current.setCenter(newCoords);
  }, [latitude, longitude]);

  return (
    <div className="map-container w-full" style={{ position: 'relative' }}>
      <div
        id={containerId || `map-${placeholderId}`}
        ref={containerRef}
        className="w-full rounded-lg border border-gray-300"
        style={{ minHeight: '300px', height: '400px' }}
      ></div>
      
      {loading && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)' 
          }}
        >
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <span className="text-gray-500">Xarita yuklanmoqda...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)' 
          }}
        >
          <div className="text-center text-red-500">
            <p>Xaritani yuklashda xatolik:</p>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default YandexMap;