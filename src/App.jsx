import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Users, 
  Car, 
  Utensils, 
  Ticket, 
  Wallet, 
  ChevronRight, 
  TrendingDown,
  Info,
  ArrowLeft,
  CalendarDays,
  Plane,
  Train,
  Bus,
  Home,
  Navigation,
  Coffee,
  Compass,
  ExternalLink,
  ChevronLeft,
  Menu,
  History,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  User,
  Trash2,
  LogOut,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { getHistoricalCabEstimate } from './services/cabDataService';
import { fetchHotelRates, fetchTransitRates, fetchDiningRates, fetchItinerary, fetchTopActivities } from './services/apiService';
import CustomSelect from './components/CustomSelect';

const TripPlanner = () => {
  const originRef = useRef(null);
  const destRef = useRef(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    duration: 3,
    travelers: 1,
    budget: 5000,
    transportMode: 'train', // flight, train, bus, cab
    tripType: 'round',      // one-way, round
    stayType: 'hostel',     // hostel, budget, premium
    diningType: 'casual',   // street, casual, fine
    travelStyle: 'Relaxation'
  });

  const [estimates, setEstimates] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userMode, setUserMode] = useState('student');
  const [isPlanning, setIsPlanning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('nomad_theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nomad_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isStudentEmail = (email) => {
    if (!email) return false;
    const academicDomains = ['.edu', '.ac.in', '.ac.uk', '.edu.au', '.res.in'];
    return academicDomains.some(domain => email.toLowerCase().endsWith(domain));
  };
  const [tripHistory, setTripHistory] = useState(() => {
    const saved = localStorage.getItem('nomad_trips');
    return saved ? JSON.parse(saved) : [
      { 
        id: 1, 
        dest: 'Goa', 
        date: '2 days ago', 
        cost: '₹8,400',
        params: { origin: 'Mumbai', destination: 'Goa', budget: 10000, duration: 3, travelers: 1, transportMode: 'train', stayType: 'hostel', travelStyle: 'Relaxation' }
      },
      { 
        id: 2, 
        dest: 'Manali', 
        date: '1 week ago', 
        cost: '₹12,200',
        params: { origin: 'Delhi', destination: 'Manali', budget: 15000, duration: 5, travelers: 2, transportMode: 'bus', stayType: 'budget', travelStyle: 'Cultural' }
      }
    ];
  });

  // Persist history & User
  useEffect(() => {
    localStorage.setItem('nomad_trips', JSON.stringify(tripHistory));
  }, [tripHistory]);

  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('nomad_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('nomad_user', JSON.stringify(user));
      if (isStudentEmail(user.email)) {
        setUserMode('student');
      }
    } else {
      localStorage.removeItem('nomad_user');
    }
  }, [user]);

  const handleLoginSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    setUser({
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture,
      verifiedStudent: isStudentEmail(decoded.email)
    });
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you would reverse geocode the lat/lng here
          // For now, let's mock the result
          setFormData({ ...formData, origin: 'Current Location (GPS)' });
          setIsLocating(false);
        },
        (error) => {
          alert("Could not get location. Please enter manually.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
    }
  };

  // Initialize Autocomplete
  useEffect(() => {
    if (window.google && step === 1) {
      const options = { types: ['(cities)'] };
      
      const originAutocomplete = new window.google.maps.places.Autocomplete(originRef.current, options);
      originAutocomplete.addListener('place_changed', () => {
        const place = originAutocomplete.getPlace();
        if (place.formatted_address) {
          setFormData(prev => ({ ...prev, origin: place.formatted_address }));
        }
      });

      const destAutocomplete = new window.google.maps.places.Autocomplete(destRef.current, options);
      destAutocomplete.addListener('place_changed', () => {
        const place = destAutocomplete.getPlace();
        if (place.formatted_address) {
          setFormData(prev => ({ ...prev, destination: place.formatted_address }));
        }
      });
    }
  }, [step]);

  const [isCalculating, setIsCalculating] = useState(false);

  const handleNewIteration = () => {
    setIsPlanning(true);
    setCurrentEditId(null);
    setStep(1);
    setEstimates(null);
    setFormData({
      origin: '',
      destination: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration: 3,
      travelers: 1,
      budget: 5000,
      transportMode: 'train',
      tripType: 'round',
      stayType: 'hostel',
      diningType: 'casual',
      travelStyle: 'Relaxation'
    });
  };

  const handleEditTrip = (trip) => {
    if (trip.params) {
      setFormData(trip.params);
      setStep(1);
      setEstimates(null);
      setIsPlanning(false);
      setCurrentEditId(trip.id);
    }
  };

  const handleCancelPlanning = (e) => {
    if (e) e.stopPropagation();
    setIsPlanning(false);
    setCurrentEditId(null);
    setEstimates(null);
    setStep(1);
    // Reset form to empty but don't set isPlanning back to true
    setFormData({
      origin: '',
      destination: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration: 3,
      travelers: 1,
      budget: 5000,
      transportMode: 'train',
      tripType: 'round',
      stayType: 'hostel',
      diningType: 'casual',
      travelStyle: 'Relaxation'
    });
  };

  const handleDeleteTrip = (e, id) => {
    if (e) e.stopPropagation();
    setTripHistory(prev => prev.filter(t => t.id !== id));
    if (currentEditId === id) {
      handleCancelPlanning();
    }
  };

  const [currentEditId, setCurrentEditId] = useState(null);
  const [editingTripId, setEditingTripId] = useState(null);
  const [editingTripName, setEditingTripName] = useState('');

  const handleStartRenameTrip = (e, trip) => {
    e.stopPropagation();
    setEditingTripId(trip.id);
    setEditingTripName(trip.name || `${trip.dest} Trip`);
  };

  const handleSaveRenameTrip = (id) => {
    if (editingTripName.trim()) {
      setTripHistory(prev => prev.map(t => t.id === id ? { ...t, name: editingTripName.trim() } : t));
    }
    setEditingTripId(null);
  };

  const handleModeChange = (mode) => {
    setUserMode(mode);
    setEstimates(null); // Clear estimates when mode changes to encourage recalculating for discounts
  };

  const calculateEstimates = async () => {
    if (!formData.destination || !formData.origin) {
      alert("Please enter both origin and destination!");
      return;
    }

    setIsCalculating(true);

    try {
      // 1. Fetch live-simulated API data
      const [transitData, stayData, diningData, itineraryData, topActivities] = await Promise.all([
        fetchTransitRates(formData.origin, formData.destination, formData.transportMode, formData.travelers, formData.tripType, formData.startDate),
        fetchHotelRates(formData.destination, formData.stayType, formData.duration, formData.travelers, formData.startDate, formData.endDate),
        fetchDiningRates(formData.destination, formData.diningType, formData.duration, formData.travelers),
        fetchItinerary(formData.destination, formData.travelStyle, formData.duration),
        fetchTopActivities(formData.destination)
      ]);

      // 2. Fetch Historical Cab Database Data
      const totalLocalCab = getHistoricalCabEstimate(formData.destination, formData.duration);

      // Apply mode-based discounts
      const studentDiscountMultiplier = userMode === 'student' ? 0.82 : 1.0; // 18% student discount average

      const adjustedTransitTotal = Math.round(transitData.total * (userMode === 'student' ? 0.85 : 1.0)); // Specific transit discount
      const adjustedStayTotal = Math.round(stayData.total * studentDiscountMultiplier);
      const adjustedDiningTotal = Math.round(diningData.total * studentDiscountMultiplier);

      // 3. Misc
      const misc = 1000 * formData.travelers; 
      

      const total = adjustedDiningTotal + totalLocalCab + adjustedTransitTotal + adjustedStayTotal + misc;

      setEstimates({
        transport: adjustedTransitTotal,
        food: adjustedDiningTotal,
        localCab: totalLocalCab,
        stay: adjustedStayTotal,
        misc: misc,
        total: total,
        isOverBudget: total > formData.budget,
        metadata: {
          transitSource: transitData.source,
          transitBreakdown: transitData.breakdown,
          distanceKm: transitData.distanceKm,
          staySource: stayData.source,
          diningSource: diningData.source
        },
        recommendedHotels: stayData.recommendations,
        recommendedRestaurants: diningData.recommendations,
        topActivities: topActivities,
        itinerary: itineraryData
      });

      // Add to history if new
      if (!currentEditId) {
        const newTrip = {
          id: Date.now(),
          dest: formData.destination,
          date: 'Just now',
          cost: `₹${total.toLocaleString()}`,
          params: { ...formData }
        };
        setTripHistory(prev => [newTrip, ...prev]);
      }

      setStep(2);
      setIsPlanning(false); // Done planning
    } catch (error) {
      alert("Failed to fetch estimates. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar for Trip Iterations */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Sticky header */}
        <div className="sidebar-inner">
          <div className="sidebar-header">
            {!isSidebarCollapsed && <div className="sidebar-title" style={{ margin: 0 }}>Recent Iterations</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="theme-toggle-btn"
                onClick={() => setIsDarkMode(prev => !prev)}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button 
                className="sidebar-toggle"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {isSidebarCollapsed && (
            <div style={{ textAlign: 'center' }}>
              <History size={20} color="var(--text-muted)" />
            </div>
          )}

          {/* Scrollable trips list */}
          <div className="sidebar-scroll">
            {/* Planning Indicator */}
            {isPlanning && (
              <div className="sidebar-item planning" style={{ borderColor: 'var(--secondary)', borderStyle: 'solid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <div style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PlusCircle size={20} color="var(--secondary)" className="spin-slow" />
                    </div>
                    {!isSidebarCollapsed && (
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Planning...</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Drafting trip</div>
                      </div>
                    )}
                  </div>
                  {!isSidebarCollapsed && (
                    <button 
                      onClick={handleCancelPlanning}
                      className="delete-trip-btn"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            <button 
              onClick={handleNewIteration}
              className="sidebar-item" 
              style={{ borderStyle: 'dashed', textAlign: 'center', opacity: 0.8, width: '100%', flexShrink: 0 }}
            >
              {isSidebarCollapsed ? '+' : '+ New Iteration'}
            </button>

            {tripHistory.map(trip => (
              <div 
                key={trip.id} 
                className={`sidebar-item ${currentEditId === trip.id ? 'active' : ''}`}
                onClick={() => handleEditTrip(trip)}
                style={{ cursor: 'pointer', position: 'relative' }}
                title={isSidebarCollapsed ? (trip.name || `${trip.dest} Trip`) : ''}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden', flex: 1 }}>
                    <div style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {currentEditId === trip.id ? (
                        <Compass size={20} color="var(--secondary)" className="spin-slow" />
                      ) : (
                        <FileText size={20} color="var(--text-muted)" />
                      )}
                    </div>
                    {!isSidebarCollapsed && (
                      <div style={{ overflow: 'hidden', flex: 1 }}>
                        {editingTripId === trip.id ? (
                          <input
                            autoFocus
                            className="trip-name-input"
                            value={editingTripName}
                            onChange={(e) => setEditingTripName(e.target.value)}
                            onBlur={() => handleSaveRenameTrip(trip.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRenameTrip(trip.id);
                              if (e.key === 'Escape') setEditingTripId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div 
                            style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            onDoubleClick={(e) => handleStartRenameTrip(e, trip)}
                            title="Double-click to rename"
                          >
                            {trip.name || `${trip.dest} Trip`}
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{trip.date}</div>
                      </div>
                    )}
                  </div>
                  
                  {!isSidebarCollapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.85rem' }}>{trip.cost}</div>
                      <button 
                        onClick={(e) => handleDeleteTrip(e, trip.id)}
                        className="delete-trip-btn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pinned footer: account + trip mode */}
        <div className="sidebar-footer">
          {user ? (
            <div className={`sidebar-item profile ${isSidebarCollapsed ? 'collapsed' : ''}`} style={{ background: 'var(--input-bg)', borderColor: user.verifiedStudent ? 'var(--student-gold)' : 'var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', overflow: 'hidden' }}>
                <img src={user.picture} style={{ width: 24, height: 24, borderRadius: '50%' }} alt="Avatar" />
                {!isSidebarCollapsed && (
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.name}
                    </div>
                    {user.verifiedStudent && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--student-gold)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <ShieldCheck size={14} /> Verified Student
                      </div>
                    )}
                  </div>
                )}
                {!isSidebarCollapsed && (
                  <button onClick={handleLogout} className="btn-ghost" style={{ padding: '0.25rem' }}>
                    <LogOut size={16} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="login-container" style={{ padding: isSidebarCollapsed ? '0.5rem' : '0' }}>
              {!isSidebarCollapsed && <div className="sidebar-title" style={{ marginBottom: '1rem' }}>Account</div>}
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => console.log('Login Failed')}
                useOneTap
                type={isSidebarCollapsed ? 'icon' : 'standard'}
                shape="pill"
                theme="filled_black"
                width={isSidebarCollapsed ? '40' : '100%'}
              />
            </div>
          )}

          {!isSidebarCollapsed && (
            <div style={{ marginTop: '1rem' }}>
              <div className="sidebar-title" style={{ marginBottom: '0.5rem' }}>Trip Mode</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {userMode === 'student' 
                  ? "Comparing real-time student discounts across providers." 
                  : "Using standard market rates. Log in with a .edu email for automatic discounts."}
              </div>
            </div>
          )}
        </div>
      </aside>


      <div className="app-container">
      {/* Dynamic Header */}
      <header className="app-header">
        {step === 2 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                onClick={() => setStep(1)} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <ArrowLeft size={24} color="var(--text-main)" />
              </button>
              <div>
                <h1 style={{ fontSize: '1.25rem', margin: 0 }}>To {formData.destination}</h1>
                <p style={{ margin: 0 }}>From {formData.origin.replace(' (GPS)', '')}</p>
              </div>
            </div>
        ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src="/logo.png" alt="Logo" className="logo-img" onError={(e) => e.target.style.display = 'none'} />
                <div>
                  <span style={{ 
                    color: 'var(--secondary)', 
                    fontSize: '0.75rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    lineHeight: 1
                  }}>
                    Nomad
                  </span>
                  <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Plan Trip</h1>
                </div>
              </div>
            </div>
        )}
      </header>

      <main className="app-content">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              className={userMode}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`mode-switcher ${userMode}`}>
                <div className="mode-indicator"></div>
                <button className={`mode-btn student ${userMode === 'student' ? 'active' : ''}`} onClick={() => handleModeChange('student')}>
                  <GraduationCap size={18} /> Student Mode
                </button>
                <button className={`mode-btn standard ${userMode === 'standard' ? 'active' : ''}`} onClick={() => handleModeChange('standard')}>
                  <User size={18} /> Standard Mode
                </button>
              </div>

              {userMode === 'student' && (
                <div className="student-badge">
                  <Sparkles size={18} color="#d97706" />
                  <span style={{ fontWeight: 700 }}>Exclusive student rates active</span>
                </div>
              )}
              <div className="desktop-grid">
                <div className="left-col">
                  {/* Route Card */}
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h2 className="card-title" style={{ margin: 0 }}>Route Details</h2>
                      <button 
                        onClick={handleGetLocation}
                        className="btn-ghost"
                      >
                        <Navigation size={18} /> {isLocating ? 'Locating...' : 'Use Current'}
                      </button>
                    </div>
                    
                    <div className="input-group">
                      <label className="input-label"><MapPin size={18} /> Starting Point</label>
                      <input 
                        type="text" 
                        ref={originRef}
                        placeholder="Enter origin city" 
                        value={formData.origin}
                        onChange={(e) => setFormData({...formData, origin: e.target.value})}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label"><MapPin size={18} /> Destination</label>
                      <input 
                        type="text" 
                        ref={destRef}
                        placeholder="Enter destination city" 
                        value={formData.destination}
                        onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label" style={{ fontSize: '0.7rem', opacity: 0.6 }}><CalendarDays size={18} /> Depart</label>
                        <input 
                          type="date" 
                          className="date-input"
                          value={formData.startDate}
                          onChange={(e) => {
                            const newStart = e.target.value;
                            const currentEnd = new Date(formData.endDate);
                            const newStartD = new Date(newStart);
                            let newEnd = formData.endDate;
                            if (newStartD >= currentEnd) {
                              newEnd = new Date(newStartD.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                            }
                            const days = Math.ceil((new Date(newEnd) - new Date(newStart)) / (1000 * 60 * 60 * 24));
                            setFormData({...formData, startDate: newStart, endDate: newEnd, duration: days || 1});
                          }}
                        />
                      </div>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label" style={{ fontSize: '0.7rem', opacity: 0.6 }}><CalendarDays size={18} /> Return</label>
                        <input 
                          type="date" 
                          className="date-input"
                          value={formData.endDate}
                          min={formData.startDate}
                          onChange={(e) => {
                            const newEnd = e.target.value;
                            const days = Math.ceil((new Date(newEnd) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24));
                            setFormData({...formData, endDate: newEnd, duration: days || 1});
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'flex-end' }}>
                      <div className="input-group" style={{ flex: '1', marginBottom: 0, minWidth: 0 }}>
                        <label className="input-label" style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.4rem' }}>People</label>
                        <CustomSelect
                          value={formData.travelers}
                          onChange={(val) => setFormData({...formData, travelers: parseInt(val) || 1})}
                          options={[1, 2, 3, 4, 5, 6, 7, 8].map(num => ({ value: num, label: `${num} ${num === 1 ? 'person' : 'people'}` }))}
                        />
                      </div>
                      <div className="input-group" style={{ flex: '1.4', marginBottom: 0, minWidth: 0 }}>
                        <label className="input-label" style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.4rem' }}>Style</label>
                        <CustomSelect
                          value={formData.travelStyle}
                          onChange={(val) => setFormData({...formData, travelStyle: val})}
                          options={[
                            { value: 'Relaxation', label: 'Relaxation' },
                            { value: 'Cultural', label: 'Cultural' },
                            { value: 'Adventure', label: 'Adventure' }
                          ]}
                        />
                      </div>
                    </div>
                  </div>

                   {/* Transport Card */}
                   <div className="card">
                     <h2 className="card-title">Intercity Transport</h2>
                     
                     <div className="input-group">
                       <label className="input-label" style={{ fontSize: '0.875rem' }}>Travel Mode</label>
                       <div className="pill-container">
                         {[
                           { id: 'flight', icon: Plane, label: 'Flight' },
                           { id: 'train', icon: Train, label: 'Train' },
                           { id: 'bus', icon: Bus, label: 'Bus' },
                           { id: 'cab', icon: Car, label: 'Cab' }
                         ].map((mode) => (
                           <button
                             key={mode.id}
                             className={`pill ${formData.transportMode === mode.id ? 'active' : ''}`}
                             onClick={() => setFormData({...formData, transportMode: mode.id})}
                             style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                           >
                             <mode.icon size={16} /> {mode.label}
                           </button>
                         ))}
                       </div>
                     </div>

                     <div className="input-group" style={{ marginBottom: 0 }}>
                       <label className="input-label" style={{ fontSize: '0.875rem' }}>Journey Type</label>
                       <div className="pill-container">
                         {[
                           { id: 'one-way', label: 'One-way' },
                           { id: 'round', label: 'Round Trip' }
                         ].map((type) => (
                           <button
                             key={type.id}
                             className={`pill ${formData.tripType === type.id ? 'active' : ''}`}
                             onClick={() => setFormData({...formData, tripType: type.id})}
                           >
                             {type.label}
                           </button>
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>

                <div className="right-col">
                  {/* Stay & Dining Card */}
                  <div className="card">
                    <h2 className="card-title">Accommodation & Food</h2>
                    
                    <div className="input-group">
                      <label className="input-label"><Home size={18} /> Stay Preference</label>
                      <div className="pill-container">
                        {[
                          { id: 'hostel', label: 'Hostel/Dorm' },
                          { id: 'budget', label: 'Budget Hotel' },
                          { id: 'premium', label: 'Premium Resort' }
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            className={`pill ${formData.stayType === mode.id ? 'active' : ''}`}
                            onClick={() => setFormData({...formData, stayType: mode.id})}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label"><Coffee size={18} /> Dining Preference</label>
                      <div className="pill-container">
                        {[
                          { id: 'street', label: 'Street Food / Dhaba' },
                          { id: 'casual', label: 'Casual Restaurants' },
                          { id: 'fine', label: 'Fine Dining' }
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            className={`pill ${formData.diningType === mode.id ? 'active' : ''}`}
                            onClick={() => setFormData({...formData, diningType: mode.id})}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Budget Card */}
                  <div className="card">
                    <h2 className="card-title">Budget Limit</h2>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label"><Wallet size={18} /> Total Group Budget (₹)</label>
                      <input 
                        type="number" 
                        min="0"
                        placeholder="Enter maximum budget"
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="bottom-bar">
                    <button className="btn-primary" onClick={calculateEstimates} disabled={isCalculating}>
                      {isCalculating ? 'Fetching Live APIs...' : 'Get Estimates'} <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="desktop-grid">
                <div className="left-col">
                  <div className="card animate-slide-up">
                    <h2 className="card-title" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Estimated Breakdown</h2>
                    
                    <div className="estimate-row">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', width: '100%' }}>
                        <div className="estimate-icon-bg" style={{ color: '#000', flexShrink: 0 }}>
                          {formData.transportMode === 'flight' ? <Plane size={20} /> : formData.transportMode === 'train' ? <Train size={20} /> : formData.transportMode === 'bus' ? <Bus size={20} /> : <Car size={20} />}
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>Tickets & Travel</div>
                            <div style={{ fontWeight: '700' }}>₹{estimates.transport.toLocaleString()}</div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {estimates.metadata?.transitBreakdown
                              ? estimates.metadata.transitBreakdown
                              : `Intercity ${formData.transportMode}`}
                          </div>
                          <div>
                            <a href={formData.transportMode === 'train' ? 'https://www.irctc.co.in/' : `https://www.makemytrip.com/${formData.transportMode}s`} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                              <ExternalLink size={12} /> Book {formData.transportMode}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="estimate-row">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', width: '100%' }}>
                        <div className="estimate-icon-bg" style={{ color: '#8b5cf6', flexShrink: 0 }}>
                          <Home size={20} />
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>Accommodation</div>
                            <div style={{ fontWeight: '700' }}>₹{estimates.stay}</div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formData.stayType} for {formData.duration - 1} nights</div>
                          {estimates.recommendedHotels && estimates.recommendedHotels.length > 0 && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', background: 'var(--bg-main)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Top Picks: </span>
                              <span style={{ color: 'var(--text-muted)' }}>{estimates.recommendedHotels.join(', ')}</span>
                            </div>
                          )}
                          <div>
                            <a href={`https://www.booking.com/searchresults.html?ss=${formData.destination}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#8b5cf6', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                              <ExternalLink size={12} /> Find on Booking.com
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="estimate-row">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', width: '100%' }}>
                        <div className="estimate-icon-bg" style={{ color: 'var(--secondary)', flexShrink: 0 }}>
                          <Utensils size={20} />
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>Food & Dining</div>
                            <div style={{ fontWeight: '700' }}>₹{estimates.food}</div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formData.diningType} meals</div>
                          {estimates.recommendedRestaurants && estimates.recommendedRestaurants.length > 0 && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', background: 'var(--bg-main)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Top Picks: </span>
                              <span style={{ color: 'var(--text-muted)' }}>{estimates.recommendedRestaurants.join(', ')}</span>
                            </div>
                          )}
                          <div>
                            <a href={`https://www.zomato.com/search?q=${formData.diningType}+dining+in+${formData.destination}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--secondary)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                              <ExternalLink size={12} /> Explore on Zomato
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="estimate-row">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', width: '100%' }}>
                        <div className="estimate-icon-bg" style={{ color: '#2563eb', flexShrink: 0 }}>
                          <Car size={20} />
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>Local Transport</div>
                            <div style={{ fontWeight: '700' }}>₹{estimates.localCab}</div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cabs/Buses within city</div>
                          <div>
                            <a href="https://m.uber.com/ul/?action=setPickup" target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                              <ExternalLink size={12} /> Open Uber
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="estimate-row">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', width: '100%' }}>
                        <div className="estimate-icon-bg" style={{ color: '#10b981', flexShrink: 0 }}>
                          <Ticket size={20} />
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>Activities</div>
                            <div style={{ fontWeight: '700' }}>₹{estimates.misc}</div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Entry fees & misc</div>
                          <div>
                            <a href={`https://www.tripadvisor.com/Search?q=things+to+do+in+${formData.destination}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#10b981', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                              <ExternalLink size={12} /> Find Activities
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="total-banner animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Estimated Cost</div>
                    <div className="amount">₹{estimates.total}</div>
                    
                    {estimates.isOverBudget ? (
                      <div className="badge badge-danger">
                        <TrendingDown size={14} /> Over budget by ₹{estimates.total - formData.budget}
                      </div>
                    ) : (
                      <div className="badge badge-success">
                        Under budget by ₹{formData.budget - estimates.total}
                      </div>
                    )}
                  </div>

                  {/* Activities Card in Sidebar */}
                  {estimates.topActivities && estimates.topActivities.length > 0 && (
                    <div className="card animate-slide-up" style={{ animationDelay: '0.2s', marginTop: '1.5rem', background: 'var(--bg-card)', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Compass size={18} />
                        </div>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Must-Visit Attractions</h2>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {estimates.topActivities.map((act, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                              <img src={act.image} alt={act.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{act.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {act.desc}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <a 
                        href={`https://www.tripadvisor.com/Search?q=top+activities+in+${formData.destination}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn-secondary" 
                        style={{ marginTop: '1.25rem', width: '100%', display: 'flex', justifyContent: 'center', padding: '0.6rem', fontSize: '0.875rem', color: 'var(--text-main)', textDecoration: 'none', border: '1px solid var(--border)', borderRadius: '8px' }}
                      >
                        Explore More <ExternalLink size={14} style={{ marginLeft: '0.5rem' }} />
                      </a>
                    </div>
                  )}
                </div>

                <div className="right-col">
                  {/* Suggested Itinerary */}
                  <div className="card animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <h2 className="card-title" style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Suggested Itinerary</h2>
                    {estimates.itinerary && estimates.itinerary.map((dayPlan, index) => (
                      <div key={index} style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: index < estimates.itinerary.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Day {dayPlan.day} - {dayPlan.title}</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {dayPlan.events.map((ev, evIdx) => (
                            <div key={evIdx} style={{ 
                              border: '1px solid var(--border)', 
                              borderRadius: '0.75rem', 
                              padding: '1rem',
                              background: 'var(--bg-main)'
                            }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{ev.time}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <div className="estimate-icon-bg" style={{ 
                                  color: 'white', 
                                  background: ev.type === 'food' ? '#8b5cf6' : '#2563eb',
                                  padding: '0.25rem',
                                  width: '1.5rem',
                                  height: '1.5rem'
                                }}>
                                  {ev.type === 'food' ? <Utensils size={14} /> : <Compass size={14} />}
                                </div>
                                <div style={{ fontWeight: 600 }}>{ev.title}</div>
                              </div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                {ev.desc}
                              </div>
                              <div>
                                <a 
                                  href={ev.linkUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '0.25rem',
                                    fontSize: '0.75rem', 
                                    color: '#a855f7', 
                                    textDecoration: 'none',
                                    fontWeight: 600
                                  }}
                                >
                                  <Ticket size={14} /> {ev.linkText}
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bottom-bar">
                    <button className="btn-primary" onClick={() => window.print()}>
                      Save PDF Plan
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  </div>
  );
};

export default TripPlanner;
