import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

function Training({ workoutTime, playSuccess, playClick }) {
    const todayDateKey = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY

    // --- State ---
    const [template, setTemplate] = useState(() => localStorage.getItem('vibe_training_template') || 'field');
    const [workouts, setWorkouts] = useState(() => {
        const saved = localStorage.getItem('vibe_training_workouts');
        if (saved) return JSON.parse(saved);

        // Default Templates
        return {
            field: [
                { id: 1, name: 'חימום מפרקים', sets: 1, reps: '5 דק', completedSets: [false] },
                { id: 2, name: 'סקוואט', sets: 3, reps: '15', completedSets: [false, false, false] },
                { id: 3, name: 'שכיבות סמיכה', sets: 3, reps: '12', completedSets: [false, false, false] },
                { id: 4, name: 'מתח/מתח אוסטרלי', sets: 3, reps: '10', completedSets: [false, false, false] },
                { id: 5, name: 'פלאנק', sets: 3, reps: '45 שנ', completedSets: [false, false, false] }
            ],
            gym: [
                { id: 101, name: 'לחיצת חזה', sets: 4, reps: '10', completedSets: [false, false, false, false] },
                { id: 102, name: 'סקוואט עם מוט', sets: 4, reps: '8', completedSets: [false, false, false, false] },
                { id: 103, name: 'דדליפט', sets: 3, reps: '8', completedSets: [false, false, false] },
                { id: 104, name: 'מתח עם משקל', sets: 3, reps: '6', completedSets: [false, false, false] }
            ]
        };
    });

    const [dailyNotes, setDailyNotes] = useState(() => {
        const saved = localStorage.getItem(`vibe_training_notes_${todayDateKey}`);
        return saved || '';
    });

    const [isEditMode, setIsEditMode] = useState(false);
    const [completed, setCompleted] = useState(() => {
        return localStorage.getItem(`vibe_training_complete_${todayDateKey}`) === 'true';
    });

    // --- Persistence ---
    useEffect(() => {
        localStorage.setItem('vibe_training_template', template);
    }, [template]);

    useEffect(() => {
        localStorage.setItem('vibe_training_workouts', JSON.stringify(workouts));
    }, [workouts]);

    useEffect(() => {
        localStorage.setItem(`vibe_training_notes_${todayDateKey}`, dailyNotes);
    }, [dailyNotes, todayDateKey]);

    useEffect(() => {
        localStorage.setItem(`vibe_training_complete_${todayDateKey}`, completed.toString());
    }, [completed, todayDateKey]);

    // --- Actions ---
    const toggleSet = (exerciseId, setIndex) => {
        setWorkouts(prev => ({
            ...prev,
            [template]: prev[template].map(ex => {
                if (ex.id === exerciseId) {
                    const newSets = [...ex.completedSets];
                    newSets[setIndex] = !newSets[setIndex];
                    return { ...ex, completedSets: newSets };
                }
                return ex;
            })
        }));
        if (playClick) playClick();
    };

    const addExercise = () => {
        const newEx = {
            id: Date.now(),
            name: 'תרגיל חדש',
            sets: 3,
            reps: '10',
            completedSets: [false, false, false]
        };
        setWorkouts(prev => ({
            ...prev,
            [template]: [...prev[template], newEx]
        }));
    };

    const deleteExercise = (id) => {
        if (window.confirm('למחוק תרגיל?')) {
            setWorkouts(prev => ({
                ...prev,
                [template]: prev[template].filter(ex => ex.id !== id)
            }));
        }
    };

    const updateExercise = (id, field, value) => {
        setWorkouts(prev => ({
            ...prev,
            [template]: prev[template].map(ex => {
                if (ex.id === id) {
                    const updated = { ...ex, [field]: value };
                    if (field === 'sets') {
                        const newSetsCount = parseInt(value) || 0;
                        updated.completedSets = Array(newSetsCount).fill(false);
                    }
                    return updated;
                }
                return ex;
            })
        }));
    };

    const handleComplete = () => {
        const newState = !completed;
        setCompleted(newState);
        if (newState) {
            if (playSuccess) playSuccess();
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#ffffff']
            });
        }
    };

    return (
        <div className="section-container training-refactor">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>אימון והכנה</h2>
                <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="secondary-btn"
                    style={{ padding: '8px 16px', fontSize: '0.85rem', width: 'auto', border: isEditMode ? '1px solid var(--accent-color)' : '1px solid var(--border-glass)' }}
                >
                    {isEditMode ? '✅ סיום עריכה' : '✏️ ערוך אימון'}
                </button>
            </div>

            {/* Template Toggle */}
            <div className="card" style={{ display: 'flex', gap: '10px', padding: '10px', marginBottom: '25px', background: 'var(--bg-glass-heavy)' }}>
                <button
                    onClick={() => setTemplate('field')}
                    style={{
                        flex: 1,
                        background: template === 'field' ? 'var(--accent-color)' : 'transparent',
                        color: template === 'field' ? 'white' : '#888',
                        padding: '12px',
                        borderRadius: '10px',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                    }}
                >
                    ⛺ אימון שטח
                </button>
                <button
                    onClick={() => setTemplate('gym')}
                    style={{
                        flex: 1,
                        background: template === 'gym' ? 'var(--accent-color)' : 'transparent',
                        color: template === 'gym' ? 'white' : '#888',
                        padding: '12px',
                        borderRadius: '10px',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                    }}
                >
                    🏋️ חדר כושר
                </button>
            </div>

            {/* Exercise List */}
            <div className="exercise-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                {workouts[template].map((ex) => (
                    <div key={ex.id} className="card" style={{ padding: '20px', marginBottom: 0, borderRight: '4px solid var(--accent-color)' }}>
                        {isEditMode ? (
                            <div className="edit-exercise-form" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        value={ex.name}
                                        onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                                        style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: 0 }}
                                    />
                                    <button onClick={() => deleteExercise(ex.id)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--danger-color)', cursor: 'pointer' }}>✕</button>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', color: '#aaa', display: 'block' }}>סטים</label>
                                        <input
                                            type="number"
                                            value={ex.sets}
                                            onChange={(e) => updateExercise(ex.id, 'sets', e.target.value)}
                                            style={{ marginTop: '5px' }}
                                        />
                                    </div>
                                    <div style={{ flex: 2 }}>
                                        <label style={{ fontSize: '0.75rem', color: '#aaa', display: 'block' }}>חזרות/משקל</label>
                                        <input
                                            type="text"
                                            value={ex.reps}
                                            onChange={(e) => updateExercise(ex.id, 'reps', e.target.value)}
                                            style={{ marginTop: '5px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="view-exercise-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>{ex.name}</h3>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: '600' }}>
                                            {ex.sets} סטים • {ex.reps} חזרות
                                        </p>
                                    </div>
                                </div>

                                {/* Live Set Tracker Buttons */}
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {ex.completedSets.map((isDone, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => toggleSet(ex.id, idx)}
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '50%',
                                                border: isDone ? 'none' : '2px solid rgba(255,255,255,0.1)',
                                                background: isDone ? 'var(--accent-color)' : 'rgba(255,255,255,0.03)',
                                                color: isDone ? 'white' : '#555',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '1rem',
                                                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                            }}
                                        >
                                            {isDone ? '✓' : idx + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {isEditMode && (
                    <button
                        onClick={addExercise}
                        className="secondary-btn"
                        style={{ padding: '15px', borderStyle: 'dashed', background: 'transparent' }}
                    >
                        + הוסף תרגיל חדש
                    </button>
                )}
            </div>

            {/* Daily Notes Section */}
            <div className="card">
                <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>📝 הערות לאימון של היום</h3>
                <textarea
                    value={dailyNotes}
                    onChange={(e) => setDailyNotes(e.target.value)}
                    placeholder="איך היה האימון? הרגשת חזק יותר?"
                    rows="3"
                    style={{ background: 'rgba(0,0,0,0.2)', marginBottom: '10px' }}
                />
            </div>

            {/* Bottom Final Action */}
            <div style={{ marginTop: '20px', paddingBottom: '40px' }}>
                <button
                    className={`big-btn ${completed ? '' : 'start-btn'}`}
                    onClick={handleComplete}
                    style={{
                        background: completed ? 'rgba(59, 130, 246, 0.15)' : 'var(--accent-color)',
                        color: completed ? 'var(--accent-color)' : '#fff',
                        boxShadow: completed ? 'none' : '0 10px 20px var(--accent-glow)'
                    }}
                >
                    {completed ? '✅ אימון הושלם! (בטל)' : 'סימון אימון כסיום'}
                </button>
            </div>
        </div>
    );
}

export default Training;
