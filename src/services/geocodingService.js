// Simple mock geocoding service for major Indian cities
// In a production app, use the OpenStreetMap Nominatim API or Google Geocoding API

export const CITY_COORDINATES = {
  'Mumbai': [19.0760, 72.8777],
  'Delhi': [28.6139, 77.2090],
  'Bangalore': [12.9716, 77.5946],
  'Pune': [18.5204, 73.8567],
  'Goa': [15.2993, 74.1240],
  'Jaipur': [26.9124, 75.7873],
  'Manali': [32.2432, 77.1892],
  'Current Location (GPS)': [19.0760, 72.8777], // Default to Mumbai for demo if GPS not actual
  'default': [20.5937, 78.9629] // Center of India
};

export const getCityCoordinates = (city) => {
  const normalizedCity = Object.keys(CITY_COORDINATES).find(
    k => city.toLowerCase().includes(k.toLowerCase())
  ) || 'default';
  
  return CITY_COORDINATES[normalizedCity];
};
