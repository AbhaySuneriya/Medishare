
/**
 * Utility functions for working with geolocation
 */

// Default location used when user location is not available
export const DEFAULT_LOCATION = {
  lat: 37.7749,
  lng: -122.4194, // San Francisco coordinates as fallback
};

/**
 * Request user's current location
 * @returns Promise that resolves to user's coordinates
 */
export const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting user location:', error.message);
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
};

/**
 * Calculate distance between two points using the Haversine formula
 * @param lat1 Latitude of point 1
 * @param lng1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lng2 Longitude of point 2
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  // If any coordinates are missing, return a large number
  if (!lat1 || !lng1 || !lat2 || !lng2) {
    return 9999;
  }

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
};

/**
 * Convert degrees to radians
 */
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted distance string
 */
export const formatDistance = (distance: number): string => {
  if (distance === 9999) {
    return 'Distance unknown';
  }
  
  if (distance < 1) {
    // Convert to meters if less than 1 km
    const meters = Math.round(distance * 1000);
    return `${meters} m away`;
  }
  
  // Round to 1 decimal place for km
  return `${distance.toFixed(1)} km away`;
};
