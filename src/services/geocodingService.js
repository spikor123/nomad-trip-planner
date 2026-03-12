// Geocoding service with comprehensive Indian city database
// Used to calculate real distances for accurate transport pricing

export const CITY_COORDINATES = {
  // Metro cities
  'Mumbai':         [19.0760,  72.8777],
  'Delhi':          [28.6139,  77.2090],
  'New Delhi':      [28.6139,  77.2090],
  'Bangalore':      [12.9716,  77.5946],
  'Bengaluru':      [12.9716,  77.5946],
  'Chennai':        [13.0827,  80.2707],
  'Kolkata':        [22.5726,  88.3639],
  'Hyderabad':      [17.3850,  78.4867],
  'Pune':           [18.5204,  73.8567],
  'Ahmedabad':      [23.0225,  72.5714],

  // Maharashtra
  'Lonavala':       [18.7521,  73.4071],
  'Khandala':       [18.7604,  73.3870],
  'Mahabaleshwar':  [17.9238,  73.6588],
  'Panchgani':      [17.9244,  73.8067],
  'Lavasa':         [18.4083,  73.5081],
  'Alibaug':        [18.6414,  72.8723],
  'Matheran':       [18.9847,  73.2710],
  'Shirdi':         [19.7688,  74.4770],

  // Rajasthan extras
  'Mount Abu':      [24.5926,  72.7156],
  'Ranthambore':    [26.0173,  76.5026],
  'Chittorgarh':    [24.8887,  74.6269],
  'Bundi':          [25.4391,  75.6358],

  // Himachal extras
  'Dalhousie':      [32.5378,  75.9774],
  'Chail':          [30.9637,  77.1923],
  'Kufri':          [31.0985,  77.2665],
  'Solang Valley':  [32.3165,  77.1545],
  'Kullu':          [31.9578,  77.1095],
  'Bir Billing':    [32.0393,  76.7181],

  // Uttarakhand extras
  'Auli':           [30.5186,  79.5651],
  'Chopta':         [30.3958,  79.2281],
  'Lansdowne':      [29.8394,  78.6832],
  'Jim Corbett':    [29.5300,  78.7747],
  'Valley of Flowers': [30.7282, 79.6076],

  // South extras
  'Wayanad':        [11.6854,  76.1320],
  'Varkala':        [ 8.7334,  76.7151],
  'Hampi':          [15.3350,  76.4600],
  'Badami':         [15.9204,  75.6785],
  'Gokarna':        [14.5479,  74.3188],
  'Chikmagalur':    [13.3161,  75.7720],
  'Sakleshpur':     [12.9424,  75.7807],
  'Yercaud':        [11.7775,  78.2062],
  'Valparai':       [10.3258,  76.9551],

  // East extras
  'Puri':           [19.8135,  85.8312],
  'Konark':         [19.8876,  86.0945],
  'Sundarbans':     [21.9497,  89.1833],
  'Ziro':           [27.5395,  93.8382],
  'Tawang':         [27.5862,  91.8594],

  // Northeast extras
  'Dibrugarh':      [27.4728,  94.9120],
  'Jorhat':         [26.7433,  94.2059],
  'Majuli':         [26.9509,  94.1641],
  'Cherrapunji':    [25.2836,  91.7359],
  'Mawlynnong':     [25.2011,  91.9163],
  'Dzukou Valley':  [25.5500,  94.0900],

  // Tier-2 cities
  'Lucknow':        [26.8467,  80.9462],
  'Chandigarh':     [30.7333,  76.7794],
  'Indore':         [22.7196,  75.8577],
  'Bhopal':         [23.2599,  77.4126],
  'Nagpur':         [21.1458,  79.0882],
  'Surat':          [21.1702,  72.8311],
  'Patna':          [25.5941,  85.1376],
  'Ranchi':         [23.3441,  85.3096],
  'Bhubaneswar':    [20.2961,  85.8245],
  'Visakhapatnam':  [17.6868,  83.2185],
  'Vijayawada':     [16.5062,  80.6480],
  'Coimbatore':     [11.0168,  76.9558],
  'Trichy':         [10.7905,  78.7047],
  'Tiruchirappalli':[10.7905,  78.7047],
  'Raipur':         [21.2514,  81.6296],
  'Jabalpur':       [23.1815,  79.9864],
  'Aurangabad':     [19.8762,  75.3433],
  'Nashik':         [19.9975,  73.7898],
  'Vadodara':       [22.3072,  73.1812],
  'Rajkot':         [22.3039,  70.8022],
  'Jamnagar':       [22.4707,  70.0577],
  'Bikaner':        [28.0229,  73.3119],
  'Ajmer':          [26.4499,  74.6399],
  'Kota':           [25.2138,  75.8648],
  'Siliguri':       [26.7271,  88.3953],

  // GPS fallback
  'Current Location (GPS)': [19.0760, 72.8777],
  'default':        [20.5937,  78.9629]
};

/**
 * Find coordinates for a city string (case-insensitive, partial match)
 */
export const getCityCoordinates = (city) => {
  if (!city) return CITY_COORDINATES['default'];
  const normalizedCity = Object.keys(CITY_COORDINATES).find(
    k => city.toLowerCase().includes(k.toLowerCase()) ||
         k.toLowerCase().includes(city.toLowerCase().split(',')[0].trim())
  ) || 'default';
  return CITY_COORDINATES[normalizedCity];
};

/**
 * Haversine formula — returns straight-line distance in km between two [lat, lng] pairs.
 * Road/rail distance is typically 1.2–1.4× this value.
 */
export const haversineDistance = ([lat1, lon1], [lat2, lon2]) => {
  const R   = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Returns estimated road/rail distance between two city strings.
 * Uses a 1.3× factor over straight-line for realistic routing.
 */
export const getDistanceBetweenCities = (cityA, cityB) => {
  const coordsA = getCityCoordinates(cityA);
  const coordsB = getCityCoordinates(cityB);
  const straightLine = haversineDistance(coordsA, coordsB);
  return Math.round(straightLine * 1.3); // road/rail factor
};
