# 🌍 Nomad — AI Trip Planner for Students

<div align="center">
  <img src="public/logo.png" alt="Nomad Logo" width="80" />
  
  **Plan smarter trips with AI-powered itineraries and exclusive student discounts.**

  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
  [![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vite.dev)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white&style=flat-square)](https://nodejs.org)
  [![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google&logoColor=white&style=flat-square)](https://aistudio.google.com)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Itineraries** | Powered by Google Gemini — generates real, day-by-day travel plans |
| 🎓 **Student Mode** | Automatic 18–30% discounts on hotels, transit & dining for students |
| 🔐 **Google Auth** | One-click sign in. `.edu` / `.ac.in` emails auto-verified as students |
| 📍 **Smart Autocomplete** | Google Maps Places API for origin & destination inputs |
| 📅 **Date Pickers** | Depart + Return dates auto-calculate trip duration |
| 💸 **Live Cost Estimates** | Real-time breakdowns for transport, stay, dining & activities |
| 📜 **Trip History** | Sidebar with recent iterations — double-click to rename any trip |
| 🌟 **Premium UI** | Glassmorphism design with Student (golden) and Standard (dark) modes |

---

## 🖥️ Screenshots

> *Student Mode — golden theme with exclusive rates*

| Plan View | Results View |
|-----------|-------------|
| ![Plan](https://via.placeholder.com/500x300/fef9c3/b45309?text=Plan+Your+Trip) | ![Results](https://via.placeholder.com/500x300/f0fdf4/166534?text=AI+Itinerary+Results) |

---

## 🏗️ Tech Stack

### Frontend
- **React 19** + **Vite 6** — blazing fast SPA
- **Framer Motion** — smooth page transitions and micro-animations
- **Lucide React** — consistent icon system
- **@react-oauth/google** — Google Sign-In integration
- **Vanilla CSS** with CSS custom properties for theming

### Backend
- **Node.js** + **Express 5** — REST API server
- **Google Generative AI** (`gemini-1.5-flash`) — itinerary generation
- **Helmet** + **Morgan** — security and logging middleware
- **dotenv** — environment variable management

### APIs & Services
- 🗺️ **Google Maps Places API** — address autocomplete
- 🤖 **Google Gemini API** — AI itinerary generation
- 🔐 **Google OAuth 2.0** — user authentication
- 🏨 **TripAdvisor API (RapidAPI)** — hotel data

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Cloud project with Maps API + OAuth enabled

### 1. Clone the repo
```bash
git clone https://github.com/spikor123/nomad-trip-planner.git
cd nomad-trip-planner
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development

# Google APIs
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_CLIENT_ID=your_oauth_client_id

# AI
GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# TripAdvisor via RapidAPI (optional)
RAPIDAPI_KEY=your_rapidapi_key
TRIPADVISOR_HOST=tripadvisor16.p.rapidapi.com
```

### 4. Run the app

**Start the backend server:**
```bash
npm run server
```

**Start the frontend dev server (in a new terminal):**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
nomad-trip-planner/
├── public/
│   └── logo.png              # App logo & favicon
├── src/
│   ├── components/
│   │   └── CustomSelect.jsx  # Pill-shaped dropdown component
│   ├── services/
│   │   ├── apiService.js     # Backend API calls (itinerary, hotels, transit)
│   │   └── cabDataService.js # Historical cab price estimates
│   ├── App.jsx               # Main application component
│   ├── main.jsx              # React entry point + Google OAuth provider
│   └── index.css             # Global styles & design system
├── server.js                 # Express backend (Gemini AI + APIs)
├── vite.config.js            # Vite configuration
└── .env                      # Environment variables (not committed)
```

---

## 🌐 Deployment

This app uses a **split deployment** architecture:

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | [Vercel](https://vercel.com) | `https://your-app.vercel.app` |
| Backend | [Render](https://render.com) | `https://your-backend.onrender.com` |

See the full [Deployment Guide](deployment_guide.md) for step-by-step instructions.

---

## 🎓 Student Verification

Nomad automatically verifies student status based on email domain — **no manual ID upload required**.

Recognized academic domains:
- `.edu` (US universities)
- `.ac.in` (Indian universities)
- `.ac.uk` (UK universities)
- `.edu.au` (Australian universities)
- `.res.in` (Indian research institutes)

Students get a **"Verified Student"** badge and automatic access to exclusive rates.

---

## 🔑 Getting API Keys

| Key | Where to get it |
|-----|----------------|
| Google Maps API | [console.cloud.google.com](https://console.cloud.google.com) → APIs → Maps JavaScript API |
| Google OAuth Client ID | [console.cloud.google.com](https://console.cloud.google.com) → Credentials → OAuth 2.0 Client IDs |
| Gemini API Key | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| RapidAPI Key | [rapidapi.com](https://rapidapi.com) → Subscribe to TripAdvisor API |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  Made with ❤️ for students who travel smart.
  <br/>
  <strong>Nomad</strong> — Plan Less. Explore More.
</div>
