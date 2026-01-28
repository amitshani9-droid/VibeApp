import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Dashboard from './components/Dashboard';
import JobTracker from './components/JobTracker';
import Budget from './components/Budget';
import Training from './components/Training';
import Equipment from './components/Equipment';
import Achievements from './components/Achievements';
import Settings from './components/Settings';
import { sounds } from './utils/sounds';

// Data Migration Script to 'vibe_' prefix
const migrateData = () => {
  const keys = ['trips', 'userName', 'employeeId', 'startDate', 'savingsGoal', 'shiftRate', 'workoutTime', 'events', 'soundEnabled'];
  keys.forEach(key => {
    const oldKey = `myGrowthApp_${key}`;
    const legacyEventKey = key === 'events' ? 'dailyEvents' : oldKey;
    const newKey = `vibe_${key}`;
    const oldData = localStorage.getItem(legacyEventKey) || localStorage.getItem(oldKey);
    if (oldData && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, oldData);
    }
  });
};
migrateData();

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('vibe_soundEnabled');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    sounds.setEnabled(soundEnabled);
    localStorage.setItem('vibe_soundEnabled', soundEnabled.toString());
  }, [soundEnabled]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    sounds.playClick();
  };

  // --- State for Settings & Personalization ---
  // Identity
  const [userName, setUserName] = useState(() => localStorage.getItem('vibe_userName') || 'עמית שני');
  const [employeeId, setEmployeeId] = useState(() => localStorage.getItem('vibe_employeeId') || '');

  // Journey
  const [startDate, setStartDate] = useState(() => localStorage.getItem('vibe_startDate') || '2026-02-01');
  const [savingsGoal, setSavingsGoal] = useState(() => Number(localStorage.getItem('vibe_savingsGoal')) || 50000);

  // Salary
  const [shiftRate, setShiftRate] = useState(() => Number(localStorage.getItem('vibe_shiftRate')) || 400);

  // Notifications
  const [workoutTime, setWorkoutTime] = useState(() => localStorage.getItem('vibe_workoutTime') || '19:00');

  // Persistence Effects
  useEffect(() => localStorage.setItem('vibe_userName', userName), [userName]);
  useEffect(() => localStorage.setItem('vibe_employeeId', employeeId), [employeeId]);
  useEffect(() => localStorage.setItem('vibe_startDate', startDate), [startDate]);
  useEffect(() => localStorage.setItem('vibe_savingsGoal', savingsGoal), [savingsGoal]);
  useEffect(() => localStorage.setItem('vibe_shiftRate', shiftRate), [shiftRate]);
  useEffect(() => localStorage.setItem('vibe_workoutTime', workoutTime), [workoutTime]);

  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('vibe_trips');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vibe_trips', JSON.stringify(trips));
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

  // --- Streak Logic ---
  const calculateStreak = () => {
    // 1. Get unique activity dates from trips
    const tripDates = new Set(trips.map(t => t.date));

    // 2. Get activity dates from training completions (stored in localStorage with dynamic keys)
    // Keys format: myGrowthApp_training_complete_DD/MM/YYYY
    const trainingDates = new Set();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('vibe_training_complete_') && localStorage.getItem(key) === 'true') {
        const datePart = key.replace('vibe_training_complete_', '');
        // Convert DD/MM/YYYY to YYYY-MM-DD
        const [d, m, y] = datePart.split('/');
        trainingDates.add(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
      }
    }

    // Combine all activity dates
    const allActivityDates = new Set([...tripDates, ...trainingDates]);
    if (allActivityDates.size === 0) return 0;

    const sortedDates = Array.from(allActivityDates).sort().reverse();

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if the streak is still alive (active today or yesterday)
    if (!allActivityDates.has(todayStr) && !allActivityDates.has(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    let curr = new Date(sortedDates[0]);

    // Simple descending check
    for (let i = 0; i < sortedDates.length; i++) {
      const dateStr = sortedDates[i];
      const dateObj = new Date(dateStr);

      if (i === 0) {
        streak = 1;
      } else {
        const prevDateObj = new Date(sortedDates[i - 1]);
        const diffInDays = (prevDateObj - dateObj) / (1000 * 60 * 60 * 24);

        if (diffInDays === 1) {
          streak++;
        } else {
          break; // Streak broken
        }
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  const totalEarnings = calculateTotalEarnings();
  // goalEarnings is what counts towards 50k
  const goalEarnings = calculateGoalEarnings();

  const netEarnings = goalEarnings; // Start counting 50k from Feb 15
  const displayEarnings = totalEarnings; // Total saved for the main UI
  const targetEarnings = 50000;

  const addTrip = (tripData) => {
    setTrips([...trips, { ...tripData, id: Date.now() }]);
  };

  const handleExportExcel = () => {
    // 1. Get Events from LocalStorage
    const savedEvents = localStorage.getItem('vibe_events');
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



      <main className="app-content" key={activeTab} style={{ animation: 'fade-in 0.4s ease' }}>
        {activeTab === 'dashboard' && (
          <Dashboard
            totalNet={displayEarnings}
            remainingTrips={Math.ceil((targetEarnings - netEarnings) / shiftRate)}
            currentStreak={currentStreak}
            onStartShift={() => handleTabChange('operations')}
            onLogManual={() => handleTabChange('operations')}
          />
        )}

        {/* Combined Operations Tab (Work + Log) */}
        {activeTab === 'operations' && (
          <JobTracker
            trips={isStarted ? filteredTrips : []}
            addTrip={addTrip}
            tripCount={tripCount}
            shiftRate={shiftRate}
            userName={userName}
            employeeId={employeeId}
            viewMode="all"
            playSound={(type, val) => {
              if (type === 'timer') sounds.playTimer(val);
              if (type === 'success') sounds.playSuccess();
            }}
          />
        )}

        {activeTab === 'training' && <Training workoutTime={workoutTime} playSuccess={() => sounds.playSuccess()} playClick={() => sounds.playClick()} />}
        {activeTab === 'equipment' && <Equipment playClick={() => sounds.playClick()} />}

        {activeTab === 'settings' && (
          <>
            <Budget
              totalEarnings={totalEarnings}
              netEarnings={netEarnings}
              targetEarnings={targetEarnings}
              tripCount={tripCount}
              trips={isStarted ? filteredTrips : []}
              shiftRate={shiftRate}
            />
            <Settings
              userName={userName} setUserName={setUserName}
              employeeId={employeeId} setEmployeeId={setEmployeeId}
              startDate={startDate} setStartDate={setStartDate}
              savingsGoal={savingsGoal} setSavingsGoal={setSavingsGoal}
              shiftRate={shiftRate} setShiftRate={setShiftRate}
              workoutTime={workoutTime} setWorkoutTime={setWorkoutTime}
              onReset={handleSystemReset}
              onExport={handleExportExcel}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
            />
          </>
        )}
      </main>

      <nav className="bottom-nav">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => handleTabChange('dashboard')}
        >
          <span>🏠</span>
          <span>ראשי</span>
        </button>
        <button
          className={activeTab === 'operations' ? 'active' : ''}
          onClick={() => handleTabChange('operations')}
        >
          <span>📖</span>
          <span>יומן</span>
        </button>
        <button
          className={activeTab === 'training' ? 'active' : ''}
          onClick={() => handleTabChange('training')}
        >
          <span>🏋️</span>
          <span>אימון</span>
        </button>
        <button
          className={activeTab === 'equipment' ? 'active' : ''}
          onClick={() => handleTabChange('equipment')}
        >
          <span>🎒</span>
          <span>ציוד</span>
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => handleTabChange('settings')}
        >
          <span>⚙️</span>
          <span>הגדרות</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
