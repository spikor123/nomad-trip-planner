// Simulated Historical Data Service for Cabs
// In a real app, this would be a MongoDB or PostgreSQL database accessed via a backend API.
// This data would be updated periodically by a cron job checking real rates.

export const HISTORICAL_CAB_DATA = {
  // Base rates per km (in INR)
  baseRates: {
    'Mumbai': 25,
    'Delhi': 20,
    'Bangalore': 22,
    'Pune': 18,
    'Goa': 30, // Tourist premium
    'Jaipur': 15,
    'Manali': 35, // Hilly terrain premium
    'default': 20
  },
  
  // Multipliers based on time of day
  timeMultipliers: {
    morningRush: 1.5, // 8 AM - 11 AM
    afternoon: 1.0,   // 11 AM - 5 PM
    eveningRush: 1.8,  // 5 PM - 9 PM
    night: 1.2        // 9 PM - 8 AM
  },

  // estimated avg daily km travel for a tourist
  avgDailyKm: 30,
};

export const getHistoricalCabEstimate = (city, days) => {
  const normalizedCity = Object.keys(HISTORICAL_CAB_DATA.baseRates).find(
    k => city.toLowerCase().includes(k.toLowerCase())
  ) || 'default';

  const baseRate = HISTORICAL_CAB_DATA.baseRates[normalizedCity];
  const avgDailyKm = HISTORICAL_CAB_DATA.avgDailyKm;
  
  // Mix of normal and rush hour travel for a typical tourist day (avg multiplier ~1.3)
  const avgMultiplier = 1.3; 
  
  const estimatedDailyCost = Math.round(baseRate * avgDailyKm * avgMultiplier);
  return estimatedDailyCost * days;
};
