import React, { useState, useEffect, useRef } from 'react';

function JobTracker({ trips, addTrip, tripCount, shiftRate = 400, userName = 'עמית', employeeId = '', viewMode = 'all' }) {
    const [entryMode, setEntryMode] = useState('timer');
    const [isTracking, setIsTracking] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [showSummary, setShowSummary] = useState(false);

    const [isSleepover, setIsSleepover] = useState(false);
    const [notes, setNotes] = useState('');

    const [manualDate, setManualDate] = useState('');
    const [manualHours, setManualHours] = useState('');
    const [error, setError] = useState('');

    const checkCourseWeek = (dateStr) => {
        const d = new Date(dateStr);
        const start = new Date('2026-02-08');
        const end = new Date('2026-02-14');
        return d >= start && d <= end;
    };

    // Auto-detect course week on manual date change
    useEffect(() => {
        if (manualDate && checkCourseWeek(manualDate)) {
            setNotes('קורס הכשרה');
            setManualHours('0'); // Default to 0 earnings
            setError('📅 שבוע הכשרה: שעות על 0 כברירת מחדל.');
        } else if (manualDate) {
            setError(''); // Clear error if moved away from course week
        }
    }, [manualDate]);

    const timerRef = useRef(null);
    const VACATION_START = new Date('2026-05-07');
    const VACATION_END = new Date('2026-05-14');

    // Event Log State
    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('dailyEvents');
        return saved ? JSON.parse(saved) : [];
    });
    const [newEventText, setNewEventText] = useState('');

    useEffect(() => {
        localStorage.setItem('dailyEvents', JSON.stringify(events));
    }, [events]);

    const addEvent = () => {
        if (!newEventText.trim()) return;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
        const newEvent = {
            id: Date.now(),
            text: newEventText,
            time: timeStr,
            date: now.toISOString().split('T')[0] // For future filtering if needed
        };
        setEvents(prev => [newEvent, ...prev]);
        setNewEventText('');
    };

    useEffect(() => {
        if (isTracking) {
            timerRef.current = setInterval(() => {
                setElapsed(Date.now() - startTime);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isTracking, startTime]);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const checkVacation = (dateStr) => {
        const d = new Date(dateStr);
        if (d >= VACATION_START && d <= VACATION_END) return true;
        return false;
    };

    const handleStartShift = () => {
        const now = new Date();
        if (checkVacation(now)) {
            setError('🌴 חופשה! אין עבודה בין ה-7 ל-14 במאי.');
            return;
        }
        setError('');
        setStartTime(Date.now());
        setIsTracking(true);
        setElapsed(0);
        setShowSummary(false);
    };

    const [confirmDate, setConfirmDate] = useState('');

    // Quick Tags for Notes
    const quickTags = ['טיול בצפון', 'אבטחת לילה', 'שעות נוספות', 'חג'];

    const addTag = (tag) => {
        setNotes(prev => prev ? `${prev}, ${tag}` : tag);
    };

    const handleEndShift = () => {
        setIsTracking(false);
        setConfirmDate(new Date().toISOString().split('T')[0]); // Default to Today
        setShowSummary(true);
    };

    const handleConfirmTrip = () => {
        if (!startTime && !confirmDate) return;
        const hours = elapsed / (1000 * 60 * 60);
        // Use user-confirmed date or fallback to start time date
        const dateStr = confirmDate || new Date(startTime).toISOString().split('T')[0];

        addTrip({
            date: dateStr,
            hours: parseFloat(hours.toFixed(2)),
            isSleepover,
            notes,
        });
        handleReset();
    };

    const handleReset = () => {
        setIsTracking(false);
        setStartTime(null);
        setElapsed(0);
        setNotes('');
        setIsSleepover(false);
        setError('');
        setShowSummary(false);
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualDate || !manualHours) return;
        if (checkVacation(manualDate)) {
            setError('🌴 חופשה! אין עבודה בין ה-7 ל-14 במאי.');
            return;
        }
        addTrip({
            date: manualDate,
            hours: parseFloat(manualHours),
            isSleepover,
            notes
        });
        setManualDate('');
        setManualHours('');
        setIsSleepover(false);
        setNotes('');
        setError('');
    };

    const progress = (elapsed / 1000) % 60 * (100 / 60);

    return (
        <div className="section-container">
            {/* TIMER VIEW: Shift Timer & Manual Entry */}
            {(viewMode === 'timer' || viewMode === 'all') && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2>יומן עבודה</h2>
                        <div style={{ background: '#333', borderRadius: '20px', padding: '5px' }}>
                            <button onClick={() => setEntryMode('timer')} style={{ background: entryMode === 'timer' ? 'var(--accent-color)' : 'transparent', color: entryMode === 'timer' ? 'white' : '#aaa', border: 'none', padding: '5px 15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>שעון</button>
                            <button onClick={() => setEntryMode('manual')} style={{ background: entryMode === 'manual' ? 'var(--accent-color)' : 'transparent', color: entryMode === 'manual' ? 'white' : '#aaa', border: 'none', padding: '5px 15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>ידני</button>
                        </div>
                    </div>

                    {entryMode === 'timer' ? (
                        <div className="timer-container">
                            <div className="circular-timer-wrapper active" style={{ '--progress': `${progress}%` }}>
                                <div className="timer-inner">
                                    <div className="timer-label">{isTracking ? 'משמרת פעילה' : 'מוכן לעבודה'}</div>
                                    <div className="timer-display">{formatTime(elapsed)}</div>
                                </div>
                            </div>

                            {!showSummary && (
                                <div className="fab-container">
                                    <button
                                        onClick={() => {
                                            if (navigator.vibrate) navigator.vibrate(10);
                                            isTracking ? handleEndShift() : handleStartShift();
                                        }}
                                        className={`fab-btn ${isTracking ? 'stop' : 'start'}`}
                                    >
                                        {isTracking ? '⏹' : '▶'}
                                    </button>
                                    {!isTracking && <div style={{ marginTop: '10px', color: '#666', fontSize: '0.9rem', position: 'absolute', top: '90px', width: '200px', textAlign: 'center' }}>לחץ להתחלה</div>}
                                </div>
                            )}

                            {isTracking && (
                                <div style={{ marginTop: '100px', textAlign: 'center' }}>
                                    <span onClick={handleReset} style={{ color: '#888', textDecoration: 'underline', cursor: 'pointer' }}>ביטול</span>
                                </div>
                            )}

                            {showSummary && (
                                <div className="summary-modal-overlay">
                                    <div className="summary-modal">
                                        <h3>סיכום משמרת</h3>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'Assistant' }}>{formatTime(elapsed)}</div>

                                        {/* Date Selection */}
                                        <label style={{ fontSize: '0.9rem', color: '#aaa', display: 'block', marginTop: '10px' }}>תאריך רישום</label>
                                        <input
                                            type="date"
                                            value={confirmDate}
                                            onChange={(e) => setConfirmDate(e.target.value)}
                                            style={{ marginBottom: '15px' }}
                                        />

                                        <div style={{ color: 'var(--accent-color)', fontSize: '1.2rem', marginBottom: '20px' }}>
                                            {(elapsed / (1000 * 60 * 60)).toFixed(2)} שעות
                                        </div>

                                        <label className="toggle-label">
                                            <span>לינה (+80₪)</span>
                                            <input type="checkbox" checked={isSleepover} onChange={(e) => setIsSleepover(e.target.checked)} />
                                            <span className="toggle-switch"></span>
                                        </label>

                                        {/* Smart Notes */}
                                        <div style={{ marginTop: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {quickTags.map(tag => (
                                                <span
                                                    key={tag}
                                                    onClick={() => addTag(tag)}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.1)',
                                                        padding: '5px 10px',
                                                        borderRadius: '15px',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer',
                                                        border: '1px solid rgba(255,255,255,0.2)'
                                                    }}
                                                >
                                                    + {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="הערות למשמרת..."
                                            rows="3"
                                            style={{ marginTop: '10px' }}
                                        />

                                        <div className="pay-estimate">
                                            <div style={{ color: '#aaa', marginBottom: '5px' }}>נחסך לחיסכון</div>
                                            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-color)' }}>
                                                ₪{(() => {
                                                    const h = elapsed / (1000 * 60 * 60);
                                                    let pay = 400; // Fixed Base
                                                    if (h > 10) pay += (h - 10) * 56;
                                                    if (isSleepover) pay += 80;
                                                    return pay.toFixed(0);
                                                })()}
                                            </div>
                                        </div>

                                        <button onClick={handleConfirmTrip} className="big-btn start-btn">
                                            אישור ושמירה
                                        </button>
                                        <div style={{ marginTop: '15px' }}>
                                            <span onClick={handleReset} style={{ color: '#aaa', cursor: 'pointer' }}>מחק משמרת</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {error && <div style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</div>}
                        </div>
                    ) : (
                        <form onSubmit={handleManualSubmit} className="card">
                            <h3>הוספה ידנית</h3>
                            {error && <div style={{ color: 'red' }}>{error}</div>}
                            <label>תאריך</label>
                            <input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} required />

                            <label>שעות</label>
                            <input type="number" step="0.5" value={manualHours} onChange={(e) => setManualHours(e.target.value)} required placeholder="10.0" />

                            <div style={{ marginTop: '15px' }}>
                                <label className="toggle-label">
                                    <span>לינה (+80₪)</span>
                                    <input type="checkbox" checked={isSleepover} onChange={(e) => setIsSleepover(e.target.checked)} />
                                    <span className="toggle-switch"></span>
                                </label>
                            </div>

                            <label>הערות</label>
                            <div style={{ margin: '10px 0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {quickTags.map(tag => (
                                    <span
                                        key={tag}
                                        onClick={() => addTag(tag)} // Reuse addTag logic (it uses setNotes)
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            padding: '5px 10px',
                                            borderRadius: '15px',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            border: '1px solid rgba(255,255,255,0.2)'
                                        }}
                                    >
                                        + {tag}
                                    </span>
                                ))}
                            </div>
                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="2"></textarea>

                            <button type="submit" className="big-btn start-btn" style={{ marginTop: '20px' }}>שמור</button>
                        </form>
                    )}

                    <div style={{ marginTop: '30px' }}>
                        <h3>משמרות אחרונות</h3>
                        {trips.length === 0 ? <p style={{ color: '#666' }}>אין נתונים עדיין.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[...trips].reverse().map(trip => (
                                    <div key={trip.id} style={{ background: '#252525', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{trip.date}</div>
                                            <div style={{ color: '#aaa', fontSize: '0.9rem' }}>{trip.hours} שעות {trip.isSleepover && '• 🌙 לינה'}</div>
                                            {trip.notes && <div style={{ fontStyle: 'italic', color: '#888', marginTop: '5px' }}>"{trip.notes}"</div>}
                                        </div>
                                        <div style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>
                                            ✓
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* LOG VIEW: Event Log */}
            {(viewMode === 'log' || viewMode === 'all') && (
                <div style={{ marginTop: '30px', borderTop: (viewMode === 'all' ? '1px solid rgba(255,255,255,0.1)' : 'none'), paddingTop: (viewMode === 'all' ? '20px' : '0') }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3>יומן אירועים</h3>
                        <button
                            onClick={() => {
                                const todayStr = new Date().toISOString().split('T')[0];
                                const todaysEvents = events.filter(e => e.date === todayStr);

                                if (todaysEvents.length === 0) {
                                    alert('אין אירועים להיום לשיתוף');
                                    return;
                                }

                                // Sort by time (assuming they are added chronologically, but just in case)
                                // actually they are prepended, so likely reverse order in display, let's keep array order which is newest first? 
                                // User request: "[Time] - [Event 1] [Time] - [Event 2]" implying chronological list.
                                // The current display maps `events` (newest first).
                                // Let's reverse for the report so it reads Morning -> Evening.

                                const sortedEvents = [...todaysEvents].reverse();

                                let message = `*דיווח אירועים - ${new Date().toLocaleDateString('he-IL')}* 📝\n`;
                                message += `דיווח מאת: ${userName} | מספר עובד: ${employeeId}\n\n`; // Personalization

                                sortedEvents.forEach(e => {
                                    message += `${e.time} - ${e.text}\n`;
                                });
                                message += `\nנשלח מאפליקציית Vibe`;

                                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            style={{
                                background: 'transparent',
                                color: 'var(--accent-color)',
                                border: '1px solid var(--accent-color)',
                                padding: '5px 12px',
                                borderRadius: '15px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            📤 שיתוף
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input
                            type="text"
                            value={newEventText}
                            onChange={(e) => setNewEventText(e.target.value)}
                            placeholder="מה קורה עכשיו?"
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.3)',
                                color: 'white'
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && addEvent()}
                        />
                        <button
                            onClick={addEvent}
                            style={{
                                background: 'var(--accent-color)',
                                border: 'none',
                                borderRadius: '12px',
                                width: '50px',
                                fontSize: '1.5rem',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            +
                        </button>
                    </div>

                    <div className="event-log-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {events.length === 0 ? (
                            <p style={{ color: '#666', textAlign: 'center', fontSize: '0.9rem' }}>טרם נרשמו אירועים היום</p>
                        ) : (
                            events.map(event => (
                                <div key={event.id} className="event-card glass-panel" style={{
                                    padding: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderRadius: '10px'
                                }}>
                                    <span style={{ fontSize: '1rem' }}>{event.text}</span>
                                    <span style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--accent-color)',
                                        background: 'rgba(74, 144, 226, 0.1)',
                                        padding: '2px 8px',
                                        borderRadius: '6px'
                                    }}>
                                        {event.time}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div >
    );
}

export default JobTracker;
