import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Optional: Check if server is up
export const checkServerHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.warn("Backend server not reached. It might be offline.");
    return null;
  }
};

// ==========================================================
// HOTEL API (Amadeus / Booking.com / RapidAPI)
// Currently a mock implementation simulating a free tier API 
// that checks hotel availability and pricing.
// ==========================================================
export const fetchHotelRates = async (destination, stayType, duration, travelers) => {
  try {
    // 1. Search for the location ID using our backend proxy
    const locResponse = await axios.get(`${API_BASE_URL}/search-location`, {
      params: { query: destination }
    });

    const locationId = locResponse.data.data?.[0]?.locationId;
    
    if (!locationId) throw new Error("Location not found");

    // 2. Fetch real hotel deals for this location
    const hotelResponse = await axios.get(`${API_BASE_URL}/search-hotels`, {
      params: { 
        locationId,
        adults: travelers.toString()
      }
    });

    const taHotels = hotelResponse.data.data || [];
    
    if (taHotels.length === 0) throw new Error("No hotels found");

    // Filter hotels by stayType (rough approximation for mock purposes)
    const topHotels = taHotels.slice(0, 3);
    const averagePrice = topHotels[0]?.price ? parseInt(topHotels[0].price.replace(/[^0-9]/g, '')) : 2500;
    
    const roomsNeeded = Math.ceil(travelers / 2);
    const totalCost = averagePrice * roomsNeeded * (duration === 1 ? 1 : duration - 1);

    return {
      source: "TripAdvisor Live",
      confidence: "Verified",
      total: totalCost,
      breakdown: `₹${averagePrice} (avg) x ${roomsNeeded} rooms x ${duration - 1} nights`,
      recommendations: topHotels.map(h => `${h.title} - ${h.price || 'Check Rates'}`)
    };

  } catch (error) {
    console.warn("TA API failed, using smart fallback:", error.message);
    
    // Fallback logic
    const baseRates = { hostel: 600, budget: 1500, premium: 4000 };
    const mockHotels = {
      hostel: ["Zostel", "Moustache Hostel", "goSTOPS"],
      budget: ["FabHotel", "OYO Rooms", "Treebo Trend"],
      premium: ["Taj Premium", "ITC Hotels", "The Leela"]
    };
    
    const dailyRate = baseRates[stayType] || baseRates.budget;
    const roomsNeeded = Math.ceil(travelers / 2);
    const totalCost = dailyRate * roomsNeeded * (duration === 1 ? 1 : duration - 1);
    const recommendations = (mockHotels[stayType] || mockHotels.budget).map(h => `${h} ${destination}`);

    return {
      source: "Nomad Intelligence (Fallback)",
      confidence: "Estimated",
      total: totalCost,
      breakdown: `₹${dailyRate} x ${roomsNeeded} rooms x ${duration - 1} nights`,
      recommendations
    };
  }
};

// ==========================================================
// FLIGHT/TRAIN API (Skyscanner / IRCTC / Amadeus)
// Mock implementation of a transit API.
// ==========================================================
export const fetchTransitRates = async (origin, destination, transportMode, travelers, tripType) => {
  await new Promise(resolve => setTimeout(resolve, 1200));

  const baseRates = {
    flight: 4500,
    train: 1200,
    bus: 800,
    cab: 3000
  };

  // Add some randomness to simulate real time pricing
  const volatility = (Math.random() * 0.2) + 0.9; // 0.9x to 1.1x
  const ticketCost = Math.round(baseRates[transportMode] * volatility);
  
  // Apply multiplier for round trip
  const multiplier = tripType === 'round' ? 2 : 1;
  const totalCost = ticketCost * travelers * multiplier;

  return {
    source: "Mock Transit API",
    confidence: "Medium",
    total: totalCost,
    perPerson: ticketCost * multiplier,
    isRoundTrip: tripType === 'round'
  };
};

// ==========================================================
// FOOD API (Google Places / Yelp Fusion)
// Mock implementation to get average meal costs in an area.
// ==========================================================
export const fetchDiningRates = async (destination, diningType, duration, travelers) => {
  await new Promise(resolve => setTimeout(resolve, 600));

  const baseRates = {
    street: 250,
    casual: 600,
    fine: 1500
  };

  const mockDining = {
    street: ["Local Dhabas", "Street Food Stalls", "Maggie Points"],
    casual: ["Cafe Coffee Day", "Haldiram's", "Local Bistros"],
    fine: ["Barbeque Nation", "Mainland China", "Luxury Dining"]
  };

  const dailyFoodPerPerson = baseRates[diningType] || baseRates.casual;
  const totalCost = dailyFoodPerPerson * duration * travelers;

  const placesText = mockDining[diningType] || mockDining.casual;
  const recommendedPlaces = placesText.map(d => `${d} in ${destination}`);

  return {
    source: "Mock Places API",
    confidence: "High",
    total: totalCost,
    dailyAvg: dailyFoodPerPerson,
    recommendations: recommendedPlaces
  };
};

// ==========================================================
// ITINERARY API (OpenAI / ChatGPT / Google Generative AI)
// Mock implementation to generate a daily itinerary
// ==========================================================
export const fetchItinerary = async (destination, travelStyle, duration) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/itinerary`, {
      destination,
      duration,
      travelStyle
    });
    return response.data;
  } catch (error) {
    console.warn("AI Itinerary failed, using local generator:", error.message);
    
    // Fallback: Local generator
    const days = [];
    const queryDest = destination ? destination.trim().replace(/\s+/g, '+') : 'City';

    for (let i = 1; i <= Math.min(duration, 3); i++) {
      days.push({
        day: i,
        title: `${travelStyle} in ${destination || 'the City'} - Day ${i}`,
        events: [
          {
            time: "8:00 AM",
            type: "food",
            title: `Breakfast at Local Cafe in ${destination}`,
            desc: "Start your morning with freshly brewed coffee and local breakfast delicacies.",
            linkText: "Find on Zomato",
            linkUrl: `https://www.zomato.com/search?q=breakfast+in+${queryDest}`
          },
          {
            time: "1:00 PM",
            type: "food",
            title: `Lunch at famous eatery`,
            desc: "Try the iconic local dishes people always talk about.",
            linkText: "Find on Zomato",
            linkUrl: `https://www.zomato.com/search?q=lunch+in+${queryDest}`
          },
          {
            time: "8:00 PM",
            type: "food",
            title: `Dinner Experience`,
            desc: "Cap off your day with a memorable dining experience.",
            linkText: "Reserve Table",
            linkUrl: `https://www.zomato.com/search?q=dinner+in+${queryDest}`
          }
        ]
      });
    }
    return days;
  }
};
