import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(helmet()); 
app.use(morgan('dev')); 
app.use(cors()); 
app.use(express.json());

// Helper for RapidAPI Tripadvisor
const taApi = axios.create({
  baseURL: `https://${process.env.TRIPADVISOR_HOST}/api/v1/hotels`,
  headers: {
    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    'x-rapidapi-host': process.env.TRIPADVISOR_HOST
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running and secure', branding: 'Nomad' });
});

/**
 * GENERATE AI ITINERARY (Gemini)
 */
app.post('/api/itinerary', async (req, res) => {
  try {
    const { destination, duration, travelStyle } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Create a detailed ${duration}-day travel itinerary for ${destination} with a focus on ${travelStyle}. 
    Return the result ONLY as a JSON array of objects. 
    Each object must represent a day and have:
    - day (number)
    - title (string)
    - events (array of objects with 'time', 'type' (food/activity), 'title', 'desc').
    Keep it concise and realistic.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting in AI response
    const jsonString = responseText.replace(/```json|```/gi, '').trim();
    const itinerary = JSON.parse(jsonString);
    
    res.json(itinerary);
  } catch (error) {
    console.error("Gemini Error:", error.message);
    res.status(500).json({ error: "Failed to generate itinerary with AI" });
  }
});

/**
 * SEARCH LOCATION & HOTELS (TripAdvisor)
 */
app.get('/api/search-location', async (req, res) => {
  try {
    const { query } = req.query;
    const response = await taApi.get('/searchLocation', { params: { query } });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Location search failed" });
  }
});

app.get('/api/search-hotels', async (req, res) => {
  try {
    const { locationId, adults } = req.query;
    const response = await taApi.get('/searchHotels', {
      params: { 
        locationId,
        adults: adults || '1',
        currency: 'INR',
        checkIn: '2026-06-01',
        checkOut: '2026-06-05'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Hotel search failed" });
  }
});

app.listen(PORT, () => {
  console.log(`
🚀 Nomad AI Backend Live!
----------------------------------
Port: ${PORT}
Branding: Nomad (with Student Mode)
AI Service: Google Gemini (Connected)
Travel Service: TripAdvisor (Connected)
----------------------------------
  `);
});
