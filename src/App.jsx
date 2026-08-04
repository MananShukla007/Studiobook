import React, { useState, useEffect, useRef } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────

const SMU_RED  = '#C8102E';
const SMU_BLUE = '#0033A0';

const rooms = [
  {
    id: 1,
    name: 'Studio 0362',
    subtitle: 'Professional Recording Suite',
    type: 'recording',
    equipment: ['Shure SM7B Mics', '4K PTZ Camera', 'RODECaster Pro II', 'Acoustic Panels'],
    capacity: 4,
    icon: '🎙️',
  },
  {
    id: 2,
    name: 'Studio 0364',
    subtitle: 'Video Production Studio',
    type: 'recording',
    equipment: ['Green Screen Setup', 'LED Panel Lights', 'Teleprompter', '4K Blackmagic'],
    capacity: 3,
    icon: '🎬',
  },
];

const timeSlots = [
  { time: '09:00', label: '9:00 AM',  short: '9a',  period: 'morning'   },
  { time: '10:00', label: '10:00 AM', short: '10a', period: 'morning'   },
  { time: '11:00', label: '11:00 AM', short: '11a', period: 'morning'   },
  { time: '12:00', label: '12:00 PM', short: '12p', period: 'afternoon' },
  { time: '13:00', label: '1:00 PM',  short: '1p',  period: 'afternoon' },
  { time: '14:00', label: '2:00 PM',  short: '2p',  period: 'afternoon' },
  { time: '15:00', label: '3:00 PM',  short: '3p',  period: 'afternoon' },
  { time: '16:00', label: '4:00 PM',  short: '4p',  period: 'evening'   },
  { time: '17:00', label: '5:00 PM',  short: '5p',  period: 'evening'   },
];

const slotsByPeriod = [
  { label: 'Morning',   slots: timeSlots.filter(s => s.period === 'morning')   },
  { label: 'Afternoon', slots: timeSlots.filter(s => s.period === 'afternoon') },
  { label: 'Evening',   slots: timeSlots.filter(s => s.period === 'evening')   },
];

const purposes = [
  { value: 'podcast',   label: 'Podcast Recording'  },
  { value: 'lecture',   label: 'Lecture Capture'     },
  { value: 'interview', label: 'Interview Session'   },
  { value: 'video',     label: 'Video Production'    },
  { value: 'meeting',   label: 'Team Meeting'        },
  { value: 'workshop',  label: 'Workshop / Training' },
];

// ─── Storage helpers ──────────────────────────────────────────────────────────

const getStoredData = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
};

// ─── Shared components ────────────────────────────────────────────────────────

// Clean white card with border
const Card = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${
      onClick ? 'cursor-pointer hover:border-gray-300 hover:shadow-md transition-all duration-150' : ''
    } ${className}`}
  >
    {children}
  </div>
);

// Mini availability row — shown inline so professors see which slots are open at a glance
const SlotMiniGrid = ({ roomId, date, isSlotBooked, isSlotBlocked }) => (
  <div className="flex gap-1 flex-wrap" role="list" aria-label="Today's slot availability">
    {timeSlots.map(slot => {
      const unavail = isSlotBooked(roomId, date, slot.time) || isSlotBlocked(roomId, date, slot.time);
      return (
        <span
          key={slot.time}
          role="listitem"
          title={`${slot.label}: ${unavail ? 'Unavailable' : 'Available'}`}
          aria-label={`${slot.label} ${unavail ? 'unavailable' : 'available'}`}
          className={`text-xs px-1.5 py-0.5 rounded font-medium tabular-nums select-none ${
            unavail
              ? 'bg-gray-100 text-gray-400'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {slot.short}
        </span>
      );
    })}
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [currentScreen,  setCurrentScreen]  = useState('home');
  const [selectedRoom,   setSelectedRoom]   = useState(null);
  const [selectedDate,   setSelectedDate]   = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime,   setSelectedTime]   = useState(null);
  const [formName,       setFormName]       = useState('');
  const [formEmail,      setFormEmail]      = useState('');
  const [formPurpose,    setFormPurpose]    = useState('podcast');
  const [showSuccess,    setShowSuccess]    = useState(false);
  const [isAdmin,        setIsAdmin]        = useState(false);
  const [adminPassword,  setAdminPassword]  = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminTab,       setAdminTab]       = useState('pending');
  const [blockDate,      setBlockDate]      = useState(new Date().toISOString().split('T')[0]);
  const [blockRoom,      setBlockRoom]      = useState(1);
  const [blockTime,      setBlockTime]      = useState('09:00');
  const [bookings,       setBookings]       = useState([]);
  const [blockedSlots,   setBlockedSlots]   = useState([]);
  const [isDataLoaded,   setIsDataLoaded]   = useState(false);

  const passwordInputRef = useRef(null);

  // Load persisted data
  useEffect(() => {
    setBookings(getStoredData('studiobook_bookings', []));
    setBlockedSlots(getStoredData('studiobook_blocked_slots', []));
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (isDataLoaded) saveToStorage('studiobook_bookings', bookings);
  }, [bookings, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) saveToStorage('studiobook_blocked_slots', blockedSlots);
  }, [blockedSlots, isDataLoaded]);

  // Focus password input when modal opens
  useEffect(() => {
    if (showAdminLogin && passwordInputRef.current) {
      setTimeout(() => passwordInputRef.current?.focus(), 100);
    }
  }, [showAdminLogin]);

  // ── Slot helpers ──────────────────────────────────────────────────────────

  const isSlotBooked = (roomId, date, time) =>
    bookings.some(b => b.roomId === roomId && b.date === date && b.time === time && b.status !== 'rejected');

  const isSlotBlocked = (roomId, date, time) =>
    blockedSlots.some(b => b.roomId === roomId && b.date === date && b.time === time);

  const getAvailableSlots = (roomId) =>
    timeSlots.filter(s => !isSlotBooked(roomId, selectedDate, s.time) && !isSlotBlocked(roomId, selectedDate, s.time)).length;

  // ── Booking actions ───────────────────────────────────────────────────────

  const handleBooking = () => {
    if (!selectedRoom || !selectedTime || !formName || !formEmail) return;
    setBookings(prev => [...prev, {
      id: Date.now(),
      roomId: selectedRoom.id,
      date: selectedDate,
      time: selectedTime,
      name: formName,
      email: formEmail,
      purpose: formPurpose,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }]);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCurrentScreen('home');
      setSelectedTime(null);
      setFormName('');
      setFormEmail('');
      setFormPurpose('podcast');
    }, 2500);
  };

  const cancelBooking  = (id) => setBookings(prev => prev.filter(b => b.id !== id));
  const approveBooking = (id) => setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'approved' } : b));
  const rejectBooking  = (id) => setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected' } : b));

  const handleBlockSlot = () =>
    setBlockedSlots(prev => [...prev, { roomId: blockRoom, date: blockDate, time: blockTime }]);

  const unblockSlot = (roomId, date, time) =>
    setBlockedSlots(prev => prev.filter(b => !(b.roomId === roomId && b.date === date && b.time === time)));

  const handleAdminLogin = () => {
    if (adminPassword === 'smu2025') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      alert('Incorrect password');
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────

  const totalAvailable  = rooms.reduce((acc, r) => acc + getAvailableSlots(r.id), 0);
  const totalBookings   = bookings.filter(b => b.status !== 'rejected').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  const today      = new Date();
  const dayOfWeek  = today.getDay();
  const monday     = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const currentWeek = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  // ── Reusable style fragments ──────────────────────────────────────────────

  const inputCls = [
    'w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0033A0] focus-visible:ring-offset-1',
    'transition-shadow',
  ].join(' ');

  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

  const navItems = [
    { id: 'home',     label: 'Home'     },
    { id: 'rooms',    label: 'Studios'  },
    { id: 'calendar', label: 'Calendar' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin' }] : []),
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100" role="navigation" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="text-xl font-bold tracking-tight text-gray-900"
              style={{ fontFamily: 'Fraunces, Georgia, serif' }}
            >
              StudioBook
            </span>
            <span className="text-xs text-gray-400 font-medium hidden sm:block pt-0.5">SMU Media Center</span>
          </div>

          <div className="flex items-center gap-0.5" role="menubar">
            {navItems.map(item => (
              <button
                key={item.id}
                role="menuitem"
                aria-current={currentScreen === item.id ? 'page' : undefined}
                onClick={() => setCurrentScreen(item.id)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0033A0] focus-visible:ring-offset-1 ${
                  currentScreen === item.id
                    ? 'text-[#0033A0]'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
                {currentScreen === item.id && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ background: SMU_BLUE }}
                    aria-hidden="true"
                  />
                )}
              </button>
            ))}

            {!isAdmin ? (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="ml-2 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0033A0]"
                aria-label="Admin login"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setIsAdmin(false)}
                className="ml-2 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Admin Login Modal ───────────────────────────────────────────────── */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdminLogin(false)} aria-hidden="true" />
          <Card className="relative p-8 max-w-sm w-full">
            <h3 id="admin-modal-title" className="text-lg font-semibold text-gray-900 mb-5">Admin Login</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="admin-password" className={labelCls}>Password</label>
                <input
                  id="admin-password"
                  ref={passwordInputRef}
                  type="password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                  placeholder="Enter admin password"
                  className={inputCls}
                  autoComplete="current-password"
                />
              </div>
              <button
                onClick={handleAdminLogin}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8102E] focus-visible:ring-offset-1"
                style={{ background: SMU_RED }}
              >
                Login
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Success Modal ───────────────────────────────────────────────────── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-labelledby="success-title" aria-live="polite">
          <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
          <Card className="relative p-8 max-w-sm w-full text-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 id="success-title" className="text-lg font-semibold text-gray-900 mb-1">Request Submitted</h3>
            <p className="text-sm text-gray-500 mb-5">Your booking is pending admin approval.</p>
            <div className="text-left border border-gray-100 rounded-xl p-4 space-y-2 bg-gray-50">
              {[
                ['Room',   selectedRoom?.name],
                ['Date',   selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''],
                ['Time',   timeSlots.find(s => s.time === selectedTime)?.label],
                ['Status', 'Pending Approval'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className={`font-medium ${k === 'Status' ? 'text-amber-600' : 'text-gray-900'}`}>{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ── HOME ─────────────────────────────────────────────────────────── */}
        {currentScreen === 'home' && (
          <div>
            {/* Hero */}
            <div className="mb-10">
              <h1
                className="text-5xl sm:text-6xl font-bold text-gray-900 mb-3 leading-tight"
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
              >
                Book Your<br />
                <span style={{ color: SMU_RED }}>Studio Session</span>
              </h1>
              <p className="text-gray-500 text-lg max-w-xl mb-7 leading-relaxed">
                Reserve a professional recording studio at the SMU Media Center in seconds.
              </p>
              <button
                onClick={() => setCurrentScreen('rooms')}
                className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C8102E]"
                style={{ background: SMU_RED }}
                onMouseEnter={e => e.currentTarget.style.background = '#a50e25'}
                onMouseLeave={e => e.currentTarget.style.background = SMU_RED}
              >
                Book a Room →
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Slots Available Today', value: totalAvailable, color: SMU_BLUE },
                { label: 'Studios',               value: 2,              color: SMU_BLUE },
                { label: 'Total Bookings',         value: totalBookings,  color: SMU_RED  },
                { label: 'Hours Open',             value: 9,              color: SMU_BLUE },
              ].map(stat => (
                <Card key={stat.label} className="p-5">
                  <div className="text-3xl font-bold mb-1 tabular-nums" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </Card>
              ))}
            </div>

            {/* Studio status with inline slot grid */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Studio Availability — Today</h2>
                <button
                  onClick={() => setCurrentScreen('rooms')}
                  className="text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0033A0] rounded"
                  style={{ color: SMU_BLUE }}
                >
                  View &amp; Book →
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {rooms.map(room => {
                  const available = getAvailableSlots(room.id);
                  return (
                    <Card
                      key={room.id}
                      className="p-5"
                      onClick={() => { setSelectedRoom(room); setCurrentScreen('booking'); }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-base font-semibold text-gray-900">{room.name}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              available > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                            }`}>
                              {available > 0 ? `${available} open` : 'Full'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">{room.subtitle}</div>
                        </div>
                        <span className="text-xl" aria-hidden="true">{room.icon}</span>
                      </div>
                      <SlotMiniGrid
                        roomId={room.id}
                        date={selectedDate}
                        isSlotBooked={isSlotBooked}
                        isSlotBlocked={isSlotBlocked}
                      />
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Today's confirmed bookings */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Today's Confirmed Bookings</h2>
              <Card>
                {bookings.filter(b => b.date === selectedDate && b.status === 'approved').length === 0 ? (
                  <div className="p-10 text-center text-sm text-gray-400">No confirmed bookings for today</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {bookings.filter(b => b.date === selectedDate && b.status === 'approved').map(booking => {
                      const room = rooms.find(r => r.id === booking.roomId);
                      const slot = timeSlots.find(s => s.time === booking.time);
                      return (
                        <div key={booking.id} className="flex items-center gap-4 p-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-lg flex-shrink-0" aria-hidden="true">
                            {room?.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900">{room?.name}</div>
                            <div className="text-sm text-gray-500 truncate">{booking.name} · {slot?.label}</div>
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-medium flex-shrink-0">
                            Approved
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ── ROOMS ────────────────────────────────────────────────────────── */}
        {currentScreen === 'rooms' && (
          <div>
            <div className="mb-8">
              <h1
                className="text-3xl font-bold text-gray-900 mb-1"
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
              >
                Choose a Studio
              </h1>
              <p className="text-gray-500">Select a room to see availability and book a time slot.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              {rooms.map(room => {
                const available = getAvailableSlots(room.id);
                return (
                  <Card key={room.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h2 className="text-lg font-semibold text-gray-900">{room.name}</h2>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            available > 5 ? 'bg-green-50 text-green-700' :
                            available > 2 ? 'bg-amber-50 text-amber-700' :
                            available > 0 ? 'bg-orange-50 text-orange-700' :
                                            'bg-red-50 text-red-600'
                          }`}>
                            {available > 0 ? `${available} of ${timeSlots.length} open` : 'Fully booked'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{room.subtitle}</p>
                      </div>
                      <span className="text-2xl" aria-hidden="true">{room.icon}</span>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Today's availability</div>
                      <SlotMiniGrid
                        roomId={room.id}
                        date={selectedDate}
                        isSlotBooked={isSlotBooked}
                        isSlotBlocked={isSlotBlocked}
                      />
                    </div>

                    <div className="mb-5">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Equipment · {room.capacity} person max
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {room.equipment.map(eq => (
                          <span key={eq} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">{eq}</span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => { setSelectedRoom(room); setCurrentScreen('booking'); }}
                      className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-colors
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0033A0]"
                      style={{ background: SMU_BLUE }}
                      onMouseEnter={e => e.currentTarget.style.background = '#002080'}
                      onMouseLeave={e => e.currentTarget.style.background = SMU_BLUE}
                    >
                      Book {room.name} →
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ── BOOKING ──────────────────────────────────────────────────────── */}
        {currentScreen === 'booking' && selectedRoom && (
          <div className="max-w-3xl">
            <button
              onClick={() => setCurrentScreen('rooms')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-7 transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0033A0] rounded"
              aria-label="Back to studios"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Studios
            </button>

            <div className="flex items-center gap-3 mb-7 pb-7 border-b border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl" aria-hidden="true">
                {selectedRoom.icon}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{selectedRoom.name}</h1>
                <p className="text-sm text-gray-500">{selectedRoom.subtitle}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Date + time slots */}
              <div className="space-y-5">
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Date</h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => { setSelectedDate(e.target.value); setSelectedTime(null); }}
                    min={new Date().toISOString().split('T')[0]}
                    className={inputCls}
                    aria-label="Select booking date"
                  />
                </Card>

                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Select Time</h3>
                  <div className="space-y-5" role="group" aria-label="Available time slots">
                    {slotsByPeriod.map(({ label, slots }) => (
                      <div key={label}>
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{label}</div>
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map(slot => {
                            const booked   = isSlotBooked(selectedRoom.id, selectedDate, slot.time);
                            const blocked  = isSlotBlocked(selectedRoom.id, selectedDate, slot.time);
                            const unavail  = booked || blocked;
                            const selected = selectedTime === slot.time;
                            return (
                              <button
                                key={slot.time}
                                onClick={() => !unavail && setSelectedTime(slot.time)}
                                disabled={unavail}
                                aria-pressed={selected}
                                aria-label={`${slot.label}${unavail ? `, ${blocked ? 'unavailable' : 'booked'}` : ''}`}
                                className={`py-2.5 px-2 rounded-lg text-sm font-medium transition-all text-center
                                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0033A0] ${
                                  unavail
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : selected
                                      ? 'text-white'
                                      : 'bg-white border border-gray-200 text-gray-700 hover:border-[#0033A0] hover:text-[#0033A0]'
                                }`}
                                style={selected ? { background: SMU_BLUE } : {}}
                              >
                                <div className={unavail ? 'line-through' : ''}>{slot.label}</div>
                                {unavail && (
                                  <div className="text-xs font-normal mt-0.5">
                                    {blocked ? 'Unavailable' : 'Booked'}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Form */}
              <div>
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Your Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className={labelCls}>
                        Full Name <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        placeholder="Dr. Jane Smith"
                        className={inputCls}
                        autoComplete="name"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className={labelCls}>
                        University Email <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formEmail}
                        onChange={e => setFormEmail(e.target.value)}
                        placeholder="jsmith@smu.edu"
                        className={inputCls}
                        autoComplete="email"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="purpose" className={labelCls}>Purpose</label>
                      <select
                        id="purpose"
                        value={formPurpose}
                        onChange={e => setFormPurpose(e.target.value)}
                        className={inputCls}
                      >
                        {purposes.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>

                    {selectedTime && (
                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl" role="region" aria-label="Booking summary">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Summary</div>
                        {[
                          ['Studio', selectedRoom.name],
                          ['Date',   selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''],
                          ['Time',   timeSlots.find(s => s.time === selectedTime)?.label],
                          ['Status', 'Pending Approval'],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between text-sm py-0.5">
                            <span className="text-gray-500">{k}</span>
                            <span className={`font-medium ${k === 'Status' ? 'text-amber-600' : 'text-gray-900'}`}>{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={handleBooking}
                      disabled={!selectedTime || !formName || !formEmail}
                      className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#C8102E] ${
                        selectedTime && formName && formEmail
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      style={selectedTime && formName && formEmail ? { background: SMU_RED } : {}}
                      onMouseEnter={e => { if (selectedTime && formName && formEmail) e.currentTarget.style.background = '#a50e25'; }}
                      onMouseLeave={e => { if (selectedTime && formName && formEmail) e.currentTarget.style.background = SMU_RED; }}
                    >
                      {!selectedTime
                        ? 'Select a time slot first'
                        : (!formName || !formEmail)
                          ? 'Fill in your details above'
                          : 'Request Booking →'}
                    </button>
                    <p className="text-xs text-gray-400 text-center">
                      Bookings require admin approval before confirmation.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ── CALENDAR ─────────────────────────────────────────────────────── */}
        {currentScreen === 'calendar' && (
          <div>
            <div className="mb-8">
              <h1
                className="text-3xl font-bold text-gray-900 mb-1"
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
              >
                Weekly Calendar
              </h1>
              <p className="text-gray-500">All studio bookings at a glance.</p>
            </div>

            <Card className="p-4 mb-5">
              <div className="flex items-center justify-between">
                <button
                  className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-900 transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0033A0]"
                  aria-label="Previous week"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {currentWeek[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  {' – '}
                  {currentWeek[4].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <button
                  className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-900 transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0033A0]"
                  aria-label="Next week"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </Card>

            <div className="space-y-3" role="grid" aria-label="Studio booking calendar">
              {/* Day headers */}
              <div className="grid grid-cols-6 gap-2 px-1" role="row">
                <div role="columnheader" />
                {currentWeek.map((date, i) => {
                  const isToday = date.toDateString() === today.toDateString();
                  return (
                    <div
                      key={i}
                      role="columnheader"
                      aria-current={isToday ? 'date' : undefined}
                      className={`p-3 rounded-xl text-center ${
                        isToday ? 'border-2 bg-blue-50' : 'bg-gray-50 border border-transparent'
                      }`}
                      style={isToday ? { borderColor: SMU_BLUE } : {}}
                    >
                      <div className={`text-xs font-medium ${isToday ? 'text-[#0033A0]' : 'text-gray-500'}`}>{weekDays[i]}</div>
                      <div className={`text-xl font-bold ${isToday ? 'text-[#0033A0]' : 'text-gray-700'}`}>{date.getDate()}</div>
                    </div>
                  );
                })}
              </div>

              {rooms.map(room => (
                <Card key={room.id} className="overflow-hidden">
                  <div className="grid grid-cols-6 gap-2 p-4" role="row">
                    <div className="flex items-center gap-2" role="rowheader">
                      <span className="text-lg" aria-hidden="true">{room.icon}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{room.name}</div>
                        <div className="text-xs text-gray-400">{room.type}</div>
                      </div>
                    </div>

                    {currentWeek.map((date, i) => {
                      const dateStr     = date.toISOString().split('T')[0];
                      const isToday     = date.toDateString() === today.toDateString();
                      const dayBookings = bookings.filter(
                        b => b.roomId === room.id && b.date === dateStr && b.status === 'approved'
                      );
                      return (
                        <div
                          key={i}
                          role="gridcell"
                          className={`min-h-[72px] p-2 rounded-xl space-y-1 ${
                            isToday ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
                          }`}
                        >
                          {dayBookings.length > 0 ? (
                            dayBookings.map((booking, j) => {
                              const slot = timeSlots.find(s => s.time === booking.time);
                              return (
                                <div
                                  key={j}
                                  className="px-2 py-1 rounded-lg text-white text-xs font-medium"
                                  style={{ background: SMU_BLUE }}
                                >
                                  <div>{slot?.short}</div>
                                  <div className="truncate opacity-75 font-normal">{booking.name.split(' ')[0]}</div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="min-h-[56px] flex items-center justify-center text-xs text-gray-300">
                              Free
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── ADMIN ────────────────────────────────────────────────────────── */}
        {currentScreen === 'admin' && isAdmin && (
          <div>
            <div className="mb-8">
              <h1
                className="text-3xl font-bold text-gray-900 mb-1"
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
              >
                Admin Dashboard
              </h1>
              <p className="text-gray-500">Manage booking requests and studio availability.</p>
            </div>

            <div className="flex gap-0 border-b border-gray-200 mb-6" role="tablist">
              {[
                { id: 'pending', label: 'Pending',      count: pendingBookings.length },
                { id: 'all',     label: 'All Bookings', count: bookings.length        },
                { id: 'block',   label: 'Block Slots',  count: blockedSlots.length    },
              ].map(tab => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={adminTab === tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0033A0] focus-visible:ring-offset-1 ${
                    adminTab === tab.id
                      ? 'border-[#0033A0] text-[#0033A0]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                      adminTab === tab.id ? 'bg-blue-100 text-[#0033A0]' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {adminTab === 'pending' && (
              <div className="space-y-3" role="tabpanel">
                {pendingBookings.length === 0 ? (
                  <Card className="p-10 text-center text-sm text-gray-400">No pending requests</Card>
                ) : (
                  pendingBookings.map(booking => {
                    const room    = rooms.find(r => r.id === booking.roomId);
                    const slot    = timeSlots.find(s => s.time === booking.time);
                    const purpose = purposes.find(p => p.value === booking.purpose);
                    return (
                      <Card key={booking.id} className="p-5">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0" aria-hidden="true">
                              {room?.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 text-sm">{booking.name}</div>
                              <div className="text-xs text-gray-500 truncate">{booking.email}</div>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
                                <span>{room?.name}</span>
                                <span>{booking.date ? new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                                <span>{slot?.label}</span>
                                <span>{purpose?.label}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => approveBooking(booking.id)}
                              className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold
                                hover:bg-green-700 transition-colors
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-1"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectBooking(booking.id)}
                              className="px-4 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold
                                hover:bg-red-50 transition-colors
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            {adminTab === 'all' && (
              <Card className="overflow-hidden" role="tabpanel">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-label="All bookings">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Name', 'Studio', 'Date', 'Time', 'Status', 'Actions'].map(h => (
                          <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No bookings yet</td>
                        </tr>
                      ) : (
                        bookings.map(booking => {
                          const room = rooms.find(r => r.id === booking.roomId);
                          const slot = timeSlots.find(s => s.time === booking.time);
                          return (
                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-900">{booking.name}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{booking.email}</div>
                              </td>
                              <td className="px-4 py-3 text-gray-700">{room?.name}</td>
                              <td className="px-4 py-3 text-gray-500">
                                {booking.date ? new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                              </td>
                              <td className="px-4 py-3 text-gray-500">{slot?.label}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                  booking.status === 'approved' ? 'bg-green-50 text-green-700' :
                                  booking.status === 'pending'  ? 'bg-amber-50 text-amber-700' :
                                                                  'bg-red-50 text-red-600'
                                }`}>
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => cancelBooking(booking.id)}
                                  className="text-xs text-red-500 hover:text-red-700 font-medium
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {adminTab === 'block' && (
              <div className="grid lg:grid-cols-2 gap-5" role="tabpanel">
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Block a Time Slot</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="block-room" className={labelCls}>Studio</label>
                      <select id="block-room" value={blockRoom} onChange={e => setBlockRoom(Number(e.target.value))} className={inputCls}>
                        {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="block-date" className={labelCls}>Date</label>
                      <input id="block-date" type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label htmlFor="block-time" className={labelCls}>Time</label>
                      <select id="block-time" value={blockTime} onChange={e => setBlockTime(e.target.value)} className={inputCls}>
                        {timeSlots.map(s => <option key={s.time} value={s.time}>{s.label}</option>)}
                      </select>
                    </div>
                    <button
                      onClick={handleBlockSlot}
                      className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-colors
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8102E] focus-visible:ring-offset-1"
                      style={{ background: SMU_RED }}
                      onMouseEnter={e => e.currentTarget.style.background = '#a50e25'}
                      onMouseLeave={e => e.currentTarget.style.background = SMU_RED}
                    >
                      Block Slot
                    </button>
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Blocked Slots{blockedSlots.length > 0 && <span className="text-gray-400 font-normal ml-1">({blockedSlots.length})</span>}
                  </h3>
                  {blockedSlots.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-400">No blocked slots</div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {blockedSlots.map((slot, i) => {
                        const room     = rooms.find(r => r.id === slot.roomId);
                        const timeSlot = timeSlots.find(s => s.time === slot.time);
                        return (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{room?.name}</div>
                              <div className="text-xs text-gray-500">{slot.date} · {timeSlot?.label}</div>
                            </div>
                            <button
                              onClick={() => unblockSlot(slot.roomId, slot.date, slot.time)}
                              className="text-xs px-3 py-1 rounded-lg border border-green-200 text-green-700
                                hover:bg-green-50 transition-colors font-medium
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                            >
                              Unblock
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
