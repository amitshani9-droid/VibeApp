import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Dashboard from './components/Dashboard';
import JobTracker from './components/JobTracker';
import Budget from './components/Budget';
import Training from './components/Training';
import Equipment from './components/Equipment';
import Achievements from './components/Achievements';
import Settings from './components/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- State for Settings & Personalization ---
  // Identity
  const [userName, setUserName] = useState(() => localStorage.getItem('myGrowthApp_userName') || 'עמית שני');
  const [employeeId, setEmployeeId] = useState(() => localStorage.getItem('myGrowthApp_employeeId') || '');

  // Journey
  const [startDate, setStartDate] = useState(() => localStorage.getItem('myGrowthApp_startDate') || '2026-02-01');
  const [savingsGoal, setSavingsGoal] = useState(() => Number(localStorage.getItem('myGrowthApp_savingsGoal')) || 50000);

  // Salary
  const [shiftRate, setShiftRate] = useState(() => Number(localStorage.getItem('myGrowthApp_shiftRate')) || 400);

  // Notifications
  const [workoutTime, setWorkoutTime] = useState(() => localStorage.getItem('myGrowthApp_workoutTime') || '19:00');

  // Persistence Effects
  useEffect(() => localStorage.setItem('myGrowthApp_userName', userName), [userName]);
  useEffect(() => localStorage.setItem('myGrowthApp_employeeId', employeeId), [employeeId]);
  useEffect(() => localStorage.setItem('myGrowthApp_startDate', startDate), [startDate]);
  useEffect(() => localStorage.setItem('myGrowthApp_savingsGoal', savingsGoal), [savingsGoal]);
  useEffect(() => localStorage.setItem('myGrowthApp_shiftRate', shiftRate), [shiftRate]);
  useEffect(() => localStorage.setItem('myGrowthApp_workoutTime', workoutTime), [workoutTime]);

  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('myGrowthApp_trips');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('myGrowthApp_trips', JSON.stringify(trips));
  }, [trips]);

  // System Reset Function
  const handleSystemReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const filteredTrips = trips.filter(trip => new Date(trip.date) >= new Date(startDate));
  const tripCount = filteredTrips.length;
  const overtimeCount = filteredTrips.filter(t => t.hours > 10).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const daysUntilStart = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
  const isStarted = daysUntilStart <= 0;

  const calculateTotalEarnings = () => {
    let total = 0;
    filteredTrips.forEach((trip) => {
      // Only count towards 50k goal if AFTER Feb 15th (User Request)
      // HOWEVER: The user said "50,000 NIS goal... should only start counting from... Feb 15th"
      // But the totalEarnings might be useful for general history?
      // Let's stick to the request: The main 50k tracking is tied to this date.
      // But wait, 'totalEarnings' variable is used for standard display?
      // Let's filter INSIDE the calculation for the goal-related vars.

      // Actually, let's keep totalEarnings as "All Time" but creating a specific variable for the goal.
      // "The 50,000 NIS goal ... should only start counting from Feb 15th".

      let dailyPay = 400;
      if (trip.hours === 0 && trip.notes.includes('קורס')) dailyPay = 0; // Course days

      if (trip.hours > 10) dailyPay += (trip.hours - 10) * 56;
      if (trip.isSleepover) dailyPay += 80;
      total += dailyPay;
    });
    return total;
  };

  const calculateGoalEarnings = () => {
    let total = 0;
    const GOAL_START_DATE = new Date('2026-02-15');

    filteredTrips.forEach((trip) => {
      if (new Date(trip.date) < GOAL_START_DATE) return;

      let dailyPay = 400;
      if (trip.hours === 0 && trip.notes.includes('קורס')) dailyPay = 0;

      if (trip.hours > 10) dailyPay += (trip.hours - 10) * 56;
      if (trip.isSleepover) dailyPay += 80;
      total += dailyPay;
    });
    return total;
  };

  const totalEarnings = calculateTotalEarnings();
  // goalEarnings is what counts towards 50k
  const goalEarnings = calculateGoalEarnings();

  const netEarnings = goalEarnings; // Start counting 50k from Feb 15
  const targetEarnings = 50000;

  const addTrip = (tripData) => {
    setTrips([...trips, { ...tripData, id: Date.now() }]);
  };

  const handleExportExcel = () => {
    // 1. Get Events from LocalStorage
    const savedEvents = localStorage.getItem('myGrowthApp_events');
    const events = savedEvents ? JSON.parse(savedEvents) : [];

    // 2. Prepare Data Rows
    const data = filteredTrips.map(trip => {
      let grossPay = shiftRate; // Base Pay
      if (trip.hours === 0 && trip.notes.includes('קורס')) grossPay = 0;
      if (trip.hours > 10) grossPay += (trip.hours - 10) * 56;
      if (trip.isSleepover) grossPay += 80;

      // Find events for this date
      const dayEvents = events.filter(e => e.date === trip.date);
      const eventText = dayEvents.map(e => `• ${e.text}`).join('\n');

      // Merge notes and events
      const fullNotes = [trip.notes, eventText].filter(Boolean).join('\n');

      return {
        'תאריך': trip.date,
        'שעות עבודה': trip.hours,
        'הכנסה (ברוטו)': grossPay,
        'סטטוס': trip.hours === 0 ? 'קורס/אחר' : 'משמרת',
        'הערות ואירועים': fullNotes
      };
    });

    // 3. Create Workbook & Sheet
    const wb = XLSX.utils.book_new();
    const headerRow = [`דוח הכנסות - ${userName} | מספר עובד: ${employeeId}`];
    const ws = XLSX.utils.aoa_to_sheet([headerRow, []]); // Title, then empty row
    XLSX.utils.sheet_add_json(ws, data, { origin: 'A3' }); // Data starts at A3

    XLSX.utils.book_append_sheet(wb, ws, "Report");

    // 4. Download
    XLSX.writeFile(wb, `Vibe_Report_${userName.split(' ')[0]}.xlsx`);
    alert(`הדוח הוכן בהצלחה! \nVibe_Report_${userName.split(' ')[0]}.xlsx`);
  };

  return (
    <div className="app-container">
      <header className="app-header" style={{ padding: '15px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center' }}>
            <img
              src="/vibe_logo.jpg"
              alt="Vibe Logo"
              style={{ width: '50px', height: '50px', borderRadius: '50%', boxShadow: '0 0 15px rgba(255,255,255,0.2)' }}
            />
            <h1 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '2.8rem', fontWeight: '800', letterSpacing: '2px', marginBottom: '0', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              VIBE
            </h1>
          </div>
          <p style={{ margin: '0', fontSize: '1rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>
            המסלול של {userName}
          </p>
        </div>

        {isStarted ? (
          <div className="balance-preview">
            <span>₪{netEarnings.toLocaleString()}</span>
            <small> / {(targetEarnings / 1000).toFixed(0)}k</small>
          </div>
        ) : (
          <div className="countdown-badge">
            עוד {daysUntilStart} ימים 🚀
          </div>
        )}
      </header>

      {/* Glanceable Status Bar */}
      {isStarted && (
        <div className="status-bar" style={{ fontSize: '0.85rem', gap: '8px', padding: '10px 5px' }}>
          {(() => {
            // Net Today Calculation
            const todayStr = new Date().toISOString().split('T')[0];
            const todayTrips = trips.filter(t => t.date === todayStr);
            let todayNet = 0;
            todayTrips.forEach(t => {
              let pay = 400;
              if (t.hours > 10) pay += (t.hours - 10) * 56;
              if (t.isSleepover) pay += 80;
              todayNet += pay;
            });

            // Remaining Trips Calculation
            const remaining = Math.max(0, targetEarnings - netEarnings);
            const tripsLeft = Math.ceil(remaining / shiftRate);

            return (
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: 'var(--accent-color)' }}>✦</span> נחסך היום: ₪{todayNet.toLocaleString()}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: 'var(--accent-color)' }}>✈️</span> עוד {tripsLeft} טיולים
                </span>
              </div>
            );
          })()}
        </div>
      )}



      <main className="app-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            totalNet={netEarnings}
            remainingTrips={Math.ceil((targetEarnings - netEarnings) / shiftRate)}
            onStartShift={() => setActiveTab('job')}
            onLogManual={() => setActiveTab('job')}
          />
        )}

        {/* JobTracker - Persisted for Timer */}
        <div style={{ display: (activeTab === 'job' || activeTab === 'log') ? 'block' : 'none' }}>
          <JobTracker
            trips={isStarted ? filteredTrips : []}
            addTrip={addTrip}
            tripCount={tripCount}
            shiftRate={shiftRate}
            userName={userName}
            employeeId={employeeId}
            viewMode={activeTab === 'log' ? 'log' : 'timer'}
          />
        </div>

        {activeTab === 'training' && <Training workoutTime={workoutTime} />}

        {/* Hidden internal routes or preserved for direct access if needed */}
        {activeTab === 'budget' && (
          <Budget
            totalEarnings={totalEarnings}
            netEarnings={netEarnings}
            targetEarnings={targetEarnings}
            tripCount={tripCount}
            trips={isStarted ? filteredTrips : []}
            shiftRate={shiftRate}
          />
        )}
        {activeTab === 'gear' && <Equipment />}

        {activeTab === 'awards' && (
          <Achievements
            netEarnings={netEarnings}
            tripCount={tripCount}
            overtimeCount={overtimeCount}
          />
        )}
        {activeTab === 'settings' && (
          <Settings
            userName={userName} setUserName={setUserName}
            employeeId={employeeId} setEmployeeId={setEmployeeId}
            startDate={startDate} setStartDate={setStartDate}
            savingsGoal={savingsGoal} setSavingsGoal={setSavingsGoal}
            shiftRate={shiftRate} setShiftRate={setShiftRate}
            workoutTime={workoutTime} setWorkoutTime={setWorkoutTime}
            onReset={handleSystemReset}
            onExport={handleExportExcel}
          />
        )}
      </main>

      <nav className="bottom-nav">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            setActiveTab('dashboard');
          }}
        >
          <span>🏠</span>
          ראשי
        </button>
        <button
          className={activeTab === 'job' ? 'active' : ''}
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            setActiveTab('job');
          }}
        >
          <span>⏱️</span>
          עבודה
        </button>
        <button
          className={activeTab === 'log' ? 'active' : ''}
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            setActiveTab('log');
          }}
        >
          <span>📝</span>
          יומן
        </button>
        <button
          className={activeTab === 'training' ? 'active' : ''}
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            setActiveTab('training');
          }}
        >
          <span>🏋️</span>
          אימון
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            setActiveTab('settings');
          }}
        >
          <span>⚙️</span>
          הגדרות
        </button>
      </nav>
    </div>
  );
}

export default App;
