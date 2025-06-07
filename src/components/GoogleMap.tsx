
import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Define the Google Maps types to fix TypeScript errors
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

// Define the Google Maps script ID for loading
const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script';
// Use a valid API key - in production this should be in environment variables
const GOOGLE_MAPS_API_KEY = 'R4G5ctQMCOPqzR3WbfrwjQv7FLc8npljpHQTdWdvnEw'; // Using a working API key AIzaSyBMH72N88r6D4OXpF9nhZCOaBcxeuFb4W0

interface GoogleMapProps {
  donorLocation: {
    lat: number;
    lng: number;
  };
  donorAddress: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ donorLocation, donorAddress }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any | null>(null);
  const [directionsService, setDirectionsService] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Google Maps API
  useEffect(() => {
    // Check if script is already loaded elsewhere
    if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) {
      setScriptLoaded(true);
      return;
    }

    // Create and append script if not already loaded
    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => setError('Failed to load Google Maps. Please try again later.');
    
    // Define global callback
    window.initMap = () => {
      setScriptLoaded(true);
    };
    
    document.head.appendChild(script);

    return () => {
      // Clean up script if component unmounts before script loads
      const loadedScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
      if (loadedScript && loadedScript.parentNode) {
        loadedScript.parentNode.removeChild(loadedScript);
      }
      
      // Cleanup global callback
      delete window.initMap;
    };
  }, []);

  // Initialize map when script is loaded
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current) return;
    
    try {
      // Create Google Maps instances
      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: donorLocation,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
      });
      
      setMap(newMap);
      
      // Create directions service and renderer
      const newDirectionsService = new window.google.maps.DirectionsService();
      const newDirectionsRenderer = new window.google.maps.DirectionsRenderer({
        map: newMap,
        suppressMarkers: false,
      });
      
      setDirectionsService(newDirectionsService);
      setDirectionsRenderer(newDirectionsRenderer);
      
      // Add donor marker
      new window.google.maps.Marker({
        position: donorLocation,
        map: newMap,
        title: 'Donor Location',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        }
      });

      // Get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            
            setUserLocation(userPos);
            
            // Add user marker
            new window.google.maps.Marker({
              position: userPos,
              map: newMap,
              title: 'Your Location',
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }
            });

            // Calculate and display route
            calculateRoute(userPos, donorLocation, newDirectionsService, newDirectionsRenderer);
            
            // Fit map bounds to include both markers
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(userPos);
            bounds.extend(donorLocation);
            newMap.fitBounds(bounds);
          },
          (error) => {
            console.error('Error getting user location:', error);
            setError('Unable to access your location. Please enable location services and try again.');
            setIsLoading(false);
            
            // Center on donor location if user location is not available
            newMap.setCenter(donorLocation);
          }
        );
      } else {
        setError('Geolocation is not supported by this browser.');
        setIsLoading(false);
        
        // Center on donor location if geolocation is not supported
        newMap.setCenter(donorLocation);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize Google Maps. Please try again later.');
      setIsLoading(false);
    }
  }, [scriptLoaded, donorLocation]);

  // Calculate route between user and donor
  const calculateRoute = (
    origin: {lat: number, lng: number},
    destination: {lat: number, lng: number},
    service: any,
    renderer: any
  ) => {
    service.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response: any, status: any) => {
        if (status === window.google.maps.DirectionsStatus.OK && response) {
          renderer.setDirections(response);
        } else {
          console.error(`Directions request failed: ${status}`);
          setError('Failed to calculate route. Please try again later.');
        }
      }
    );
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-accent/10 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2">Loading map...</span>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10 p-4 text-center">
          <div>
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-gray-600 mt-2">
              You can still contact the donor for the medicine.
            </p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-md"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
};

export default GoogleMap;
