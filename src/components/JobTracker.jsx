import React, { useState, useEffect, useRef } from 'react';

function JobTracker({ trips, addTrip, updateTrip, deleteTrip, tripCount, shiftRate = 400, userName = 'עמית', employeeId = '', viewMode = 'all', playSound }) {
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
    const [editingTripId, setEditingTripId] = useState(null);

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
    const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
    const [logTime, setLogTime] = useState('');
    const [isLogFormOpen, setIsLogFormOpen] = useState(false);
    const [newEventText, setNewEventText] = useState('');
    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('vibe_events');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('vibe_events', JSON.stringify(events));
    }, [events]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!logTime) { // Auto-update time if not manually touched
                const now = new Date();
                setLogTime(now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false }));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [logTime]);

    const addEvent = () => {
        if (!newEventText.trim()) return;

        const finalTime = logTime || new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });

        const newEvent = {
            id: Date.now(),
            text: newEventText,
            time: finalTime,
            date: logDate
        };
        setEvents(prev => [newEvent, ...prev]);
        setNewEventText('');
        setLogTime(''); // Reset to auto
        setIsLogFormOpen(false);
    };

    const deleteEvent = (id) => {
        if (window.confirm('האם למחוק את האירוע?')) {
            setEvents(prev => prev.filter(e => e.id !== id));
        }
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
        if (playSound) playSound('timer', true);
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
        if (playSound) playSound('timer', false);
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

        if (editingTripId) {
            updateTrip(editingTripId, {
                date: manualDate,
                hours: parseFloat(manualHours),
                isSleepover,
                notes
            });
            setEditingTripId(null);
            alert('✅ המשמרת עודכנה בהצלחה!');
        } else {
            addTrip({
                date: manualDate,
                hours: parseFloat(manualHours),
                isSleepover,
                notes
            });
            if (playSound) playSound('success');
            alert('✅ המשמרת נשמרה בהצלחה!');
        }

        // Reset states
        setManualDate('');
        setManualHours('');
        setIsSleepover(false);
        setNotes('');
        setError('');
        setEntryMode('timer');
    };

    const startEditing = (trip) => {
        setEditingTripId(trip.id);
        setManualDate(trip.date);
        setManualHours(trip.hours.toString());
        setIsSleepover(trip.isSleepover || false);
        setNotes(trip.notes || '');
        setEntryMode('manual');
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingTripId(null);
        setManualDate('');
        setManualHours('');
        setIsSleepover(false);
        setNotes('');
        setEntryMode('timer');
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
                        <div className="timer-container" style={{ animation: 'fade-in 0.3s ease' }}>
                            <div className={`circular-timer-wrapper ${isTracking ? 'active pulse' : ''}`} style={{
                                '--progress': `${progress}%`,
                                transition: 'all 0.5s ease',
                                borderColor: isTracking ? 'var(--accent-color)' : '#333',
                                boxShadow: isTracking ? '0 0 30px var(--accent-glow)' : 'none'
                            }}>
                                <div className="timer-inner">
                                    <div className="timer-display">{formatTime(elapsed)}</div>
                                    <div className="timer-label">{isTracking ? 'משמרת פעילה' : 'מוכן להתחלה'}</div>
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
                                        style={{ bottom: '140px' }} // Highly visible
                                    >
                                        {isTracking ? '⏹' : '▶'}
                                    </button>
                                    {!isTracking && <div style={{ marginTop: '10px', color: '#666', fontSize: '0.9rem', position: 'absolute', bottom: '100px', width: '200px', textAlign: 'center' }}>לחץ להתחלה</div>}
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

                                        <div className="toggle-row" style={{ margin: '15px 0', display: 'flex', justifyContent: 'center' }}>
                                            <label className="toggle-label" style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                width: '100%',
                                                padding: '16px'
                                            }}>
                                                <span>🌙 לינה / נסיעות (+80₪)</span>
                                                <input type="checkbox" checked={isSleepover} onChange={(e) => setIsSleepover(e.target.checked)} />
                                                <span className="toggle-switch"></span>
                                            </label>
                                        </div>

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
                        <form onSubmit={handleManualSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', border: editingTripId ? '2px solid var(--accent-color)' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                <h3 style={{ margin: 0 }}>{editingTripId ? '✏️ עריכת משמרת' : '📝 הוספה ידנית'}</h3>
                                {editingTripId && (
                                    <button type="button" onClick={cancelEdit} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.9rem' }}>ביטול עריכה</button>
                                )}
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '5px' }}>תאריך המשמרת</label>
                                <input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} required style={{ marginTop: 0 }} />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '5px' }}>סה"כ שעות</label>
                                <input type="number" step="0.5" value={manualHours} onChange={(e) => setManualHours(e.target.value)} required placeholder="10.0" style={{ marginTop: 0 }} />
                            </div>

                            <div className="toggle-row" style={{ padding: '5px 0' }}>
                                <label className="toggle-label" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span>🌙 לינה / נסיעות (+80₪)</span>
                                    <input type="checkbox" checked={isSleepover} onChange={(e) => setIsSleepover(e.target.checked)} />
                                    <span className="toggle-switch"></span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>הערות ותיוג מהיר</label>
                                <div style={{ marginBottom: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {quickTags.map(tag => (
                                        <span
                                            key={tag}
                                            onClick={() => addTag(tag)}
                                            style={{
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                                color: 'var(--accent-color)'
                                            }}
                                        >
                                            + {tag}
                                        </span>
                                    ))}
                                </div>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows="2"
                                    placeholder="פרטים נוספים..."
                                    style={{ marginTop: 0 }}
                                />
                            </div>

                            <button type="submit" className="big-btn start-btn" style={{ marginTop: '10px', padding: '18px' }}>
                                {editingTripId ? 'עדכן משמרת 💾' : 'שמור משמרת ✅'}
                            </button>
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
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => startEditing(trip)}
                                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#aaa', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                                                title="ערוך"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => deleteTrip(trip.id)}
                                                style={{ background: 'rgba(255,100,100,0.1)', border: 'none', color: '#ff6666', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                                                title="מחק"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* PROFESSIONAL LOGBOOK VIEW */}
            {(viewMode === 'log' || viewMode === 'all') && (
                <div className="logbook-section card" style={{ marginTop: '30px', animation: 'fade-in 0.5s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>📖 יומן מבצעי (LogBook)</h3>
                        <button
                            onClick={() => setIsLogFormOpen(!isLogFormOpen)}
                            className="start-btn"
                            style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.9rem', width: 'auto' }}
                        >
                            {isLogFormOpen ? 'סגור' : '+ אירוע חדש'}
                        </button>
                    </div>

                    {isLogFormOpen && (
                        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', marginBottom: '25px', animation: 'fade-in 0.3s ease' }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '5px' }}>תאריך</label>
                                    <input
                                        type="date"
                                        value={logDate}
                                        onChange={(e) => setLogDate(e.target.value)}
                                        style={{ marginTop: 0 }}
                                    />
                                </div>
                                <div style={{ width: '100px' }}>
                                    <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '5px' }}>זמן</label>
                                    <input
                                        type="time"
                                        value={logTime}
                                        onChange={(e) => setLogTime(e.target.value)}
                                        style={{ marginTop: 0 }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={newEventText}
                                    onChange={(e) => setNewEventText(e.target.value)}
                                    placeholder="תיאור האירוע..."
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        borderRadius: '14px',
                                        border: '1px solid var(--border-glass)',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: 'white'
                                    }}
                                    onKeyPress={(e) => e.key === 'Enter' && addEvent()}
                                />
                                <button
                                    onClick={addEvent}
                                    className="start-btn"
                                    style={{
                                        width: '54px',
                                        borderRadius: '14px',
                                        fontSize: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    ✓
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="logbook-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {events.length === 0 ? (
                            <p style={{ color: '#666', textAlign: 'center', fontSize: '0.9rem', padding: '40px' }}>אין רישומים ביומן עדיין</p>
                        ) : (
                            Object.entries(
                                events.reduce((groups, event) => {
                                    const date = event.date;
                                    if (!groups[date]) groups[date] = [];
                                    groups[date].push(event);
                                    return groups;
                                }, {})
                            )
                                .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                                .map(([date, dayEvents]) => {
                                    const dateObj = new Date(date);
                                    const dayName = dateObj.toLocaleDateString('he-IL', { weekday: 'long' });
                                    const dateStr = dateObj.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' });

                                    return (
                                        <div key={date} className="log-day-group">
                                            <div style={{
                                                fontSize: '0.9rem',
                                                fontWeight: '700',
                                                color: 'var(--accent-color)',
                                                marginBottom: '10px',
                                                padding: '0 5px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}>
                                                <span>{dayName}, {dateStr}</span>
                                                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, var(--accent-color), transparent)', opacity: 0.3 }}></div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {dayEvents.sort((a, b) => b.time.localeCompare(a.time)).map(event => (
                                                    <div key={event.id} className="event-card glass-panel" style={{
                                                        padding: '12px 16px',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        borderRadius: '14px',
                                                        border: '1px solid rgba(255,255,255,0.05)',
                                                        position: 'relative'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <span style={{
                                                                fontSize: '0.75rem',
                                                                color: 'var(--accent-color)',
                                                                fontWeight: '800',
                                                                background: 'rgba(59, 130, 246, 0.1)',
                                                                padding: '2px 6px',
                                                                borderRadius: '6px',
                                                                fontFamily: 'monospace'
                                                            }}>
                                                                {event.time}
                                                            </span>
                                                            <span style={{ fontSize: '1rem', color: '#eee' }}>{event.text}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => deleteEvent(event.id)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: 'rgba(255,255,255,0.2)',
                                                                fontSize: '0.9rem',
                                                                cursor: 'pointer',
                                                                padding: '5px'
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.color = 'var(--danger-color)'}
                                                            onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.2)'}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>
            )}
        </div >
    );
}

export default JobTracker;
