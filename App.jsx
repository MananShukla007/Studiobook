import React, { useState, useEffect, useRef } from 'react';

// Room data
const rooms = [
  { 
    id: 1, 
    name: 'Recording Room 1', 
    subtitle: 'Professional Podcast Suite',
    type: 'recording', 
    equipment: ['Shure SM7B Mics', '4K PTZ Camera', 'RODECaster Pro II', 'Acoustic Panels'], 
    capacity: 4, 
    gradient: 'from-violet-600 via-purple-600 to-indigo-700',
    accent: '#8B5CF6',
    icon: '🎙️',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'
  },
  { 
    id: 2, 
    name: 'Recording Room 2', 
    subtitle: 'Video Production Studio',
    type: 'recording', 
    equipment: ['Green Screen Setup', 'LED Panel Lights', 'Teleprompter', '4K Blackmagic'], 
    capacity: 3, 
    gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
    accent: '#06B6D4',
    icon: '🎬',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800'
  },
  { 
    id: 3, 
    name: 'Session Room 1', 
    subtitle: 'Creative Collaboration Space',
    type: 'session', 
    equipment: ['85" 4K Display', 'Wireless Presentation', 'Video Conferencing', 'Whiteboard Wall'], 
    capacity: 6, 
    gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    accent: '#10B981',
    icon: '💡',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
  },
  { 
    id: 4, 
    name: 'Session Room 2', 
    subtitle: 'Executive Meeting Room',
    type: 'session', 
    equipment: ['Dolby Conference System', 'Interactive Display', 'Premium Seating', 'Climate Control'], 
    capacity: 8, 
    gradient: 'from-amber-500 via-orange-600 to-red-600',
    accent: '#F59E0B',
    icon: '✨',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'
  },
];

const timeSlots = [
  { time: '09:00', label: '9:00 AM', period: 'morning' },
  { time: '10:00', label: '10:00 AM', period: 'morning' },
  { time: '11:00', label: '11:00 AM', period: 'morning' },
  { time: '12:00', label: '12:00 PM', period: 'afternoon' },
  { time: '13:00', label: '1:00 PM', period: 'afternoon' },
  { time: '14:00', label: '2:00 PM', period: 'afternoon' },
  { time: '15:00', label: '3:00 PM', period: 'afternoon' },
  { time: '16:00', label: '4:00 PM', period: 'evening' },
  { time: '17:00', label: '5:00 PM', period: 'evening' },
];

const purposes = [
  { value: 'podcast', label: 'Podcast Recording', icon: '🎙️' },
  { value: 'lecture', label: 'Lecture Capture', icon: '📚' },
  { value: 'interview', label: 'Interview Session', icon: '🎤' },
  { value: 'video', label: 'Video Production', icon: '🎬' },
  { value: 'meeting', label: 'Team Meeting', icon: '👥' },
  { value: 'workshop', label: 'Workshop/Training', icon: '🎯' },
];

// Initial bookings
const initialBookings = [
  { id: 1, roomId: 1, date: '2025-01-16', time: '10:00', name: 'Dr. Sarah Chen', purpose: 'podcast', email: 'schen@university.edu' },
  { id: 2, roomId: 1, date: '2025-01-16', time: '14:00', name: 'Prof. James Wilson', purpose: 'lecture', email: 'jwilson@university.edu' },
  { id: 3, roomId: 2, date: '2025-01-16', time: '11:00', name: 'Dr. Emily Rodriguez', purpose: 'video', email: 'erodriguez@university.edu' },
  { id: 4, roomId: 3, date: '2025-01-16', time: '13:00', name: 'Dr. Michael Park', purpose: 'meeting', email: 'mpark@university.edu' },
  { id: 5, roomId: 4, date: '2025-01-16', time: '15:00', name: 'Prof. Lisa Thompson', purpose: 'workshop', email: 'lthompson@university.edu' },
];

// Floating Particles Background
const ParticleField = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: Math.random() * 4 + 1 + 'px',
            height: Math.random() * 4 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            background: `hsl(${Math.random() * 60 + 240}, 70%, 60%)`,
            animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
};

// Animated Gradient Orbs
const GradientOrbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
  </div>
);

// 3D Tilt Card Component
const TiltCard = ({ children, className = '', intensity = 15 }) => {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.15 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ transform, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative overflow-hidden rounded-3xl">
        {children}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 50%)`,
          }}
        />
      </div>
    </div>
  );
};

// Glass Card Component
const GlassCard = ({ children, className = '', hover = true }) => (
  <div className={`
    relative overflow-hidden rounded-3xl
    bg-white/10 backdrop-blur-xl
    border border-white/20
    shadow-[0_8px_32px_rgba(0,0,0,0.12)]
    ${hover ? 'hover:bg-white/15 hover:border-white/30 hover:shadow-[0_16px_48px_rgba(0,0,0,0.15)]' : ''}
    transition-all duration-500
    ${className}
  `}>
    {children}
  </div>
);

// Animated Counter
const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>{count}</span>;
};

// Main App Component
export default function StudioBookApp() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookings, setBookings] = useState(initialBookings);
  const [formData, setFormData] = useState({ name: '', email: '', purpose: 'podcast' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1500);
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isSlotBooked = (roomId, date, time) => {
    return bookings.some(b => b.roomId === roomId && b.date === date && b.time === time);
  };

  const getAvailableSlots = (roomId) => {
    return timeSlots.filter(slot => !isSlotBooked(roomId, selectedDate, slot.time)).length;
  };

  const getTotalAvailableToday = () => {
    return rooms.reduce((acc, room) => acc + getAvailableSlots(room.id), 0);
  };

  const handleBooking = () => {
    if (!selectedRoom || !selectedTime || !formData.name || !formData.email) return;
    
    const newBooking = {
      id: Date.now(),
      roomId: selectedRoom.id,
      date: selectedDate,
      time: selectedTime,
      name: formData.name,
      email: formData.email,
      purpose: formData.purpose,
    };
    
    setBookings([...bookings, newBooking]);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setCurrentScreen('bookings');
      setSelectedTime(null);
      setFormData({ name: '', email: '', purpose: 'podcast' });
    }, 2500);
  };

  const cancelBooking = (id) => {
    setBookings(bookings.filter(b => b.id !== id));
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
            <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin animation-delay-150" style={{ animationDirection: 'reverse' }} />
            <div className="absolute inset-8 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-light text-white tracking-[0.3em] uppercase animate-pulse">
            StudioBook
          </h2>
        </div>
      </div>
    );
  }

  // Navigation
  const Navigation = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <GlassCard hover={false} className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between px-6 py-3">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl rotate-6 group-hover:rotate-12 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🎙️</span>
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-white font-bold tracking-wide">StudioBook</h1>
              <p className="text-white/40 text-xs tracking-widest uppercase">University Media Center</p>
            </div>
          </button>
          
          <div className="flex items-center gap-2">
            {[
              { id: 'home', icon: '🏠', label: 'Home' },
              { id: 'rooms', icon: '🚪', label: 'Rooms' },
              { id: 'calendar', icon: '📅', label: 'Calendar' },
              { id: 'bookings', icon: '📋', label: 'My Bookings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`
                  relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                  ${currentScreen === item.id 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'}
                `}
              >
                <span className="mr-2">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
                {currentScreen === item.id && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>
    </nav>
  );

  // Home Screen
  const HomeScreen = () => (
    <div className="pt-28 px-6 pb-12 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16 relative">
        <div className="inline-block mb-6">
          <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium">
            ✨ University Media Center
          </span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Book Your
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
            Creative Space
          </span>
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Professional recording studios and collaboration spaces designed for 
          faculty excellence. Reserve your session in seconds.
        </p>
        <button
          onClick={() => setCurrentScreen('rooms')}
          className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]"
        >
          <span className="relative z-10 flex items-center gap-2">
            Book a Room Now
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'Available Today', value: getTotalAvailableToday(), icon: '⚡', color: 'from-green-500 to-emerald-600' },
          { label: 'Total Rooms', value: 4, icon: '🚪', color: 'from-purple-500 to-indigo-600' },
          { label: 'Total Bookings', value: bookings.length, icon: '📅', color: 'from-cyan-500 to-blue-600' },
          { label: 'Hours Open', value: 9, icon: '🕐', color: 'from-amber-500 to-orange-600' },
        ].map((stat, i) => (
          <TiltCard key={i} intensity={10}>
            <GlassCard className="p-6">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                {stat.icon}
              </div>
              <div className="text-4xl font-bold text-white mb-1">
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="text-white/50 text-sm">{stat.label}</div>
            </GlassCard>
          </TiltCard>
        ))}
      </div>

      {/* Quick Room Status */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Room Status</h2>
          <button 
            onClick={() => setCurrentScreen('rooms')}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {rooms.map((room, i) => {
            const available = getAvailableSlots(room.id);
            const isAvailableNow = !isSlotBooked(room.id, selectedDate, '10:00');
            return (
              <TiltCard key={room.id} intensity={8}>
                <GlassCard 
                  className="p-5 cursor-pointer"
                  onClick={() => { setSelectedRoom(room); setCurrentScreen('booking'); }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${room.gradient} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                      {room.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${isAvailableNow ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                        <span className={`text-xs font-medium ${isAvailableNow ? 'text-green-400' : 'text-red-400'}`}>
                          {isAvailableNow ? 'Available Now' : 'In Use'}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold truncate">{room.name}</h3>
                      <p className="text-white/40 text-sm">{available} slots available today</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </TiltCard>
            );
          })}
        </div>
      </div>

      {/* Today's Schedule */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Today's Schedule</h2>
        <GlassCard className="overflow-hidden">
          <div className="divide-y divide-white/10">
            {bookings.filter(b => b.date === selectedDate).length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-white/50">No bookings for today</p>
              </div>
            ) : (
              bookings.filter(b => b.date === selectedDate).map((booking, i) => {
                const room = rooms.find(r => r.id === booking.roomId);
                const slot = timeSlots.find(s => s.time === booking.time);
                return (
                  <div 
                    key={booking.id}
                    className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${room.gradient} flex flex-col items-center justify-center text-white shadow-lg`}>
                      <span className="text-lg font-bold">{slot?.label.split(':')[0]}</span>
                      <span className="text-xs opacity-70">{slot?.label.split(' ')[1]}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{room.name}</h4>
                      <p className="text-white/50 text-sm">{booking.name}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs">
                        {purposes.find(p => p.value === booking.purpose)?.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );

  // Rooms Screen
  const RoomsScreen = () => (
    <div className="pt-28 px-6 pb-12 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Choose Your Space</h1>
        <p className="text-white/50 max-w-xl mx-auto">
          Select from our professionally equipped studios and collaboration spaces
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {rooms.map((room, i) => {
          const available = getAvailableSlots(room.id);
          return (
            <TiltCard key={room.id} intensity={12}>
              <div 
                className="relative overflow-hidden rounded-3xl cursor-pointer group"
                onClick={() => { setSelectedRoom(room); setCurrentScreen('booking'); }}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img 
                    src={room.image} 
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${room.gradient} opacity-80`} />
                  <div className="absolute inset-0 bg-black/30" />
                </div>
                
                {/* Content */}
                <div className="relative p-8 min-h-[320px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        available > 5 ? 'bg-green-500/30 text-green-300' : 
                        available > 2 ? 'bg-yellow-500/30 text-yellow-300' : 
                        'bg-red-500/30 text-red-300'
                      }`}>
                        {available} slots available
                      </span>
                      <span className="text-4xl filter drop-shadow-lg">{room.icon}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{room.name}</h3>
                    <p className="text-white/70 mb-4">{room.subtitle}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-4 text-white/70 text-sm mb-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {room.capacity} people
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        {room.equipment.length} equipment
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {room.equipment.slice(0, 3).map((eq, j) => (
                        <span key={j} className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs">
                          {eq}
                        </span>
                      ))}
                      {room.equipment.length > 3 && (
                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs">
                          +{room.equipment.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </div>
  );

  // Booking Screen
  const BookingScreen = () => {
    if (!selectedRoom) {
      setCurrentScreen('rooms');
      return null;
    }

    return (
      <div className="pt-28 px-6 pb-12 max-w-4xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => setCurrentScreen('rooms')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to rooms
        </button>

        {/* Room Header */}
        <TiltCard intensity={5} className="mb-8">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0">
              <img src={selectedRoom.image} alt={selectedRoom.name} className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-r ${selectedRoom.gradient} opacity-80`} />
            </div>
            <div className="relative p-8 flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl">
                {selectedRoom.icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{selectedRoom.name}</h1>
                <p className="text-white/70">{selectedRoom.subtitle}</p>
              </div>
            </div>
          </div>
        </TiltCard>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Date & Time */}
          <div className="space-y-6">
            {/* Date Selection */}
            <GlassCard className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center">📅</span>
                Select Date
              </h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(null); }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </GlassCard>

            {/* Time Slots */}
            <GlassCard className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-cyan-500/30 flex items-center justify-center">⏰</span>
                Select Time
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot, i) => {
                  const booked = isSlotBooked(selectedRoom.id, selectedDate, slot.time);
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      onClick={() => !booked && setSelectedTime(slot.time)}
                      disabled={booked}
                      className={`
                        relative py-3 px-2 rounded-xl text-sm font-medium transition-all duration-300
                        ${booked 
                          ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                          : isSelected
                            ? `bg-gradient-to-r ${selectedRoom.gradient} text-white shadow-lg scale-105`
                            : 'bg-white/10 text-white hover:bg-white/20 hover:scale-102'}
                      `}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {slot.label}
                      {booked && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl text-xs">
                          Booked
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Booking Form */}
          <div>
            <GlassCard className="p-6">
              <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-pink-500/30 flex items-center justify-center">✍️</span>
                Your Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Dr. Jane Smith"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">University Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="jsmith@university.edu"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Purpose of Booking</label>
                  <div className="grid grid-cols-2 gap-2">
                    {purposes.map((purpose) => (
                      <button
                        key={purpose.value}
                        onClick={() => setFormData({...formData, purpose: purpose.value})}
                        className={`
                          px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                          ${formData.purpose === purpose.value
                            ? `bg-gradient-to-r ${selectedRoom.gradient} text-white`
                            : 'bg-white/10 text-white/70 hover:bg-white/20'}
                        `}
                      >
                        <span>{purpose.icon}</span>
                        <span className="truncate">{purpose.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                {selectedTime && (
                  <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="text-white/50 text-xs uppercase tracking-wider mb-3">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/50">Room</span>
                        <span className="text-white font-medium">{selectedRoom.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Date</span>
                        <span className="text-white font-medium">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Time</span>
                        <span className="text-white font-medium">{timeSlots.find(s => s.time === selectedTime)?.label}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={!selectedTime || !formData.name || !formData.email}
                  className={`
                    w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300
                    ${selectedTime && formData.name && formData.email
                      ? `bg-gradient-to-r ${selectedRoom.gradient} text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.02]`
                      : 'bg-white/10 text-white/30 cursor-not-allowed'}
                  `}
                >
                  {selectedTime ? 'Confirm Booking' : 'Select a time slot'}
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  };

  // Calendar Screen
  const CalendarScreen = () => {
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const today = new Date();
    const currentWeek = [];
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      currentWeek.push(date);
    }

    return (
      <div className="pt-28 px-6 pb-12 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Weekly Calendar</h1>
          <p className="text-white/50">Overview of all room bookings</p>
        </div>

        {/* Week Navigation */}
        <GlassCard className="p-4 mb-8">
          <div className="flex items-center justify-between">
            <button className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-white font-semibold text-lg">
              {currentWeek[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {currentWeek[4].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            <button className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </GlassCard>

        {/* Calendar Grid */}
        <div className="space-y-4">
          {/* Day Headers */}
          <div className="grid grid-cols-6 gap-2">
            <div className="p-4" /> {/* Empty cell for room labels */}
            {currentWeek.map((date, i) => {
              const isToday = date.toDateString() === today.toDateString();
              return (
                <div 
                  key={i}
                  className={`p-4 rounded-xl text-center ${isToday ? 'bg-gradient-to-br from-purple-500 to-cyan-500' : 'bg-white/10'}`}
                >
                  <div className={`text-sm ${isToday ? 'text-white/80' : 'text-white/50'}`}>{weekDays[i]}</div>
                  <div className={`text-2xl font-bold ${isToday ? 'text-white' : 'text-white'}`}>{date.getDate()}</div>
                </div>
              );
            })}
          </div>

          {/* Room Rows */}
          {rooms.map((room) => (
            <GlassCard key={room.id} className="overflow-hidden">
              <div className="grid grid-cols-6 gap-2 p-4">
                {/* Room Label */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${room.gradient} flex items-center justify-center text-lg`}>
                    {room.icon}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{room.name}</div>
                    <div className="text-white/40 text-xs">{room.type}</div>
                  </div>
                </div>

                {/* Day Columns */}
                {currentWeek.map((date, i) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const dayBookings = bookings.filter(b => b.roomId === room.id && b.date === dateStr);
                  return (
                    <div key={i} className="min-h-[80px] p-2 rounded-xl bg-white/5 space-y-1">
                      {dayBookings.length > 0 ? (
                        dayBookings.map((booking, j) => {
                          const slot = timeSlots.find(s => s.time === booking.time);
                          return (
                            <div 
                              key={j}
                              className={`px-2 py-1 rounded-lg bg-gradient-to-r ${room.gradient} text-white text-xs`}
                            >
                              <div className="font-medium">{slot?.label}</div>
                              <div className="truncate opacity-70">{booking.name.split(' ')[0]}</div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="h-full flex items-center justify-center text-white/30 text-xs">
                          Available
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  };

  // My Bookings Screen
  const BookingsScreen = () => {
    const userBookings = bookings.filter(b => 
      b.email?.includes('@') || b.name.includes('Dr.') || b.name.includes('Prof.')
    );

    return (
      <div className="pt-28 px-6 pb-12 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">My Bookings</h1>
          <p className="text-white/50">Manage your reservations</p>
        </div>

        {userBookings.length === 0 ? (
          <GlassCard className="p-16 text-center">
            <div className="text-6xl mb-6">📭</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Bookings Yet</h3>
            <p className="text-white/50 mb-6">You haven't made any reservations</p>
            <button
              onClick={() => setCurrentScreen('rooms')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white font-medium hover:shadow-lg transition-all"
            >
              Book a Room
            </button>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {userBookings.map((booking, i) => {
              const room = rooms.find(r => r.id === booking.roomId);
              const slot = timeSlots.find(s => s.time === booking.time);
              const purpose = purposes.find(p => p.value === booking.purpose);
              const isPast = new Date(booking.date) < new Date(new Date().toDateString());
              
              return (
                <TiltCard key={booking.id} intensity={5}>
                  <GlassCard className={`overflow-hidden ${isPast ? 'opacity-60' : ''}`}>
                    <div className="flex">
                      {/* Left Color Bar */}
                      <div className={`w-2 bg-gradient-to-b ${room.gradient}`} />
                      
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${room.gradient} flex items-center justify-center text-3xl shadow-lg`}>
                              {room.icon}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white mb-1">{room.name}</h3>
                              <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                                <span>{purpose?.icon} {purpose?.label}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 text-white/70">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1 text-white/70">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {slot?.label}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {!isPast && (
                            <button
                              onClick={() => cancelBooking(booking.id)}
                              className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
                            >
                              Cancel
                            </button>
                          )}
                          {isPast && (
                            <span className="px-4 py-2 rounded-xl bg-white/10 text-white/40 text-sm">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </TiltCard>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Success Modal
  const SuccessModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl animate-scale-in">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
          <p className="text-white/60 mb-4">Your room has been successfully reserved</p>
          <div className="p-4 rounded-xl bg-white/10 text-left">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-white/50">Room</span>
                <span className="text-white font-medium">{selectedRoom?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Date</span>
                <span className="text-white font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Time</span>
                <span className="text-white font-medium">{timeSlots.find(s => s.time === selectedTime)?.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Custom cursor glow effect */}
      <div 
        className="fixed w-96 h-96 rounded-full pointer-events-none z-0 transition-transform duration-100"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          transform: `translate(${mousePosition.x - 192}px, ${mousePosition.y - 192}px)`,
        }}
      />
      
      <ParticleField />
      <GradientOrbs />
      <Navigation />
      
      <main className="relative z-10">
        {currentScreen === 'home' && <HomeScreen />}
        {currentScreen === 'rooms' && <RoomsScreen />}
        {currentScreen === 'booking' && <BookingScreen />}
        {currentScreen === 'calendar' && <CalendarScreen />}
        {currentScreen === 'bookings' && <BookingsScreen />}
      </main>

      {showSuccess && <SuccessModal />}

      {/* Global Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-blob {
          animation: blob 15s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(139,92,246,0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(139,92,246,0.7);
        }

        /* Date input styling */
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
