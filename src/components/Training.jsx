import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

function Training({ workoutTime = '19:00' }) {
    const [completed, setCompleted] = useState(false);
    const [checklist, setChecklist] = useState({});
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showSchedule, setShowSchedule] = useState(false);

    const todayDateKey = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY format for persistence key
    const currentHour = currentTime.getHours();
    const dayOfWeek = currentTime.getDay(); // 0 = Sunday, 1 = Monday, ...

    // Schedule Definition
    // 0:Sun, 1:Mon, 2:Tue, 3:Wed, 4:Thu, 5:Fri, 6:Sat
    const schedule = {
        0: { type: 'FBW', title: 'אימון כוח (FBW)', icon: '🏋️‍♂️' },
        1: { type: 'Swim', title: 'שחייה', icon: '🏊‍♂️' },
        2: { type: 'FBW', title: 'אימון כוח (FBW)', icon: '🏋️‍♂️' },
        3: { type: 'Swim', title: 'שחייה', icon: '🏊‍♂️' },
        4: { type: 'Rest', title: 'מנוחה', icon: '🧘‍♂️' },
        5: { type: 'FBW', title: 'אימון כוח (FBW)', icon: '🏋️‍♂️' },
        6: { type: 'Rest', title: 'מנוחה', icon: '🧘‍♂️' }
    };

    const todaysWorkout = schedule[dayOfWeek];
    const isRestDay = todaysWorkout.type === 'Rest';
    const isPost1900 = currentHour >= 19;

    // Load state from localStorage on mount
    useEffect(() => {
        const savedCompletion = localStorage.getItem(`myGrowthApp_training_complete_${todayDateKey}`);
        if (savedCompletion === 'true') {
            setCompleted(true);
        }

        const savedChecklist = localStorage.getItem(`myGrowthApp_training_checklist_${todayDateKey}`);
        if (savedChecklist) {
            setChecklist(JSON.parse(savedChecklist));
        }

        // Update time every minute to check for 19:00
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, [todayDateKey]);

    // Save checklist changes
    const toggleChecklistItem = (item) => {
        const newChecklist = { ...checklist, [item]: !checklist[item] };
        setChecklist(newChecklist);
        localStorage.setItem(`myGrowthApp_training_checklist_${todayDateKey}`, JSON.stringify(newChecklist));
    };

    // Handle Completion
    const handleComplete = () => {
        const newState = !completed;
        setCompleted(newState);
        localStorage.setItem(`myGrowthApp_training_complete_${todayDateKey}`, newState.toString());

        if (newState) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#4A90E2', '#ffffff'] // Steel Blue and White
            });
        }
    };

    // Checklist Items for FBW
    const fbwExercises = [
        { id: 'warmup', label: 'חימום: 5 דקות סיבובי מפרקים' },
        { id: 'squat', label: 'סקוואט: 3 סטים של 12-15 חזרות' },
        { id: 'pushups', label: 'שכיבות סמיכה: 3 סטים של 10-12 חזרות' },
        { id: 'pullups', label: 'מתח/חתירה אוסטרלית: 3 סטים של 10 חזרות' },
        { id: 'lunges', label: 'מכרעים: 2 סטים של 10 לכל רגל' },
        { id: 'plank', label: 'בטן (פלאנק): 3 סטים של 45 שניות' }
    ];

    return (
        <div className="section-container">
            <h2>אימון והכנה</h2>

            {/* Daily Status Card */}
            <div
                className={`card training-card ${completed ? 'completed-glow' : ''} ${!completed && isPost1900 && !isRestDay ? 'reminder-glow' : ''}`}
                style={{ position: 'relative', overflow: 'hidden' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{todaysWorkout.icon} {todaysWorkout.title}</h3>
                        <p style={{ margin: '5px 0 0', opacity: 0.7, fontSize: '0.9rem' }}>
                            {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    {completed && <span style={{ fontSize: '2rem' }}>✅</span>}
                </div>

                {/* Reminder Message */}
                {!completed && !isRestDay && isPost1900 && (
                    <div style={{
                        backgroundColor: 'rgba(74, 144, 226, 0.15)',
                        border: '1px solid var(--accent-color)',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>⏰</span>
                        <strong style={{ color: 'var(--accent-color)' }}>השעה 19:00 - הגיע זמן להתאמן!</strong>
                    </div>
                )}

                {/* FBW Checklist */}
                {!isRestDay && todaysWorkout.type === 'FBW' && (
                    <ul className="checklist">
                        {fbwExercises.map((ex) => (
                            <li
                                key={ex.id}
                                className={`checklist-item ${checklist[ex.id] ? 'completed' : ''}`}
                                onClick={() => toggleChecklistItem(ex.id)}
                            >
                                <div className="check-circle">{checklist[ex.id] && '✓'}</div>
                                <span className={checklist[ex.id] ? 'strikethrough' : ''}>
                                    {ex.label}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Swimming / Rest Generic Message */}
                {todaysWorkout.type === 'Swim' && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <p>צא לבריכה ושחות 40 דקות לפחות.</p>
                    </div>
                )}
                {isRestDay && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <p>יום מנוחה. תן לגוף להתאושש.</p>
                    </div>
                )}

                {/* Completion Toggle */}
                {!isRestDay && (
                    <div style={{ marginTop: '20px' }}>
                        <button
                            className={`big-btn ${completed ? '' : 'start-btn'}`}
                            onClick={handleComplete}
                            style={{ background: completed ? 'rgba(255,255,255,0.1)' : 'var(--accent-color)', color: completed ? '#aaa' : '#fff' }}
                        >
                            {completed ? 'בטל סיום אימון' : 'סיימתי אימון להיום!'}
                        </button>
                    </div>
                )}
            </div>

            {/* Weekly Schedule Overview - Toggle */}
            <div className="card" style={{ marginTop: '20px' }}>
                <div
                    onClick={() => setShowSchedule(!showSchedule)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                    <h3>📅 לו"ז שבועי</h3>
                    <span style={{ fontSize: '1.2rem' }}>{showSchedule ? '▲' : '▼'}</span>
                </div>

                {showSchedule && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '15px 0 0 0', display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fade-in 0.3s' }}>
                        {Object.entries(schedule).map(([dayIdx, data]) => {
                            const isToday = parseInt(dayIdx) === dayOfWeek;
                            const dayName = new Date(2024, 0, parseInt(dayIdx) + 7).toLocaleDateString('he-IL', { weekday: 'long' }); // Hack to get day name
                            return (
                                <li key={dayIdx} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    backgroundColor: isToday ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
                                    border: isToday ? '1px solid var(--accent-color)' : 'none'
                                }}>
                                    <span style={{ opacity: isToday ? 1 : 0.7 }}>{dayName}</span>
                                    <span style={{ fontWeight: isToday ? 'bold' : 'normal', color: isToday ? 'var(--accent-color)' : 'var(--text-primary)' }}>
                                        {data.title}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Training;
