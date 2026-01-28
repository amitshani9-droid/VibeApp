import React from 'react';

function Settings({
    userName, setUserName,
    employeeId, setEmployeeId,
    startDate, setStartDate,
    savingsGoal, setSavingsGoal,
    shiftRate, setShiftRate,
    workoutTime, setWorkoutTime,
    soundEnabled, setSoundEnabled,
    onReset, onExport, onExportPDF
}) {
    return (
        <div className="section-container">
            <h2>הגדרות</h2>

            <div className="card" style={{ marginBottom: '20px', background: 'rgba(0, 100, 0, 0.2)', borderColor: 'var(--accent-color)' }}>
                <h3>📊 נתונים ודוחות</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                        onClick={onExport}
                        className="big-btn"
                        style={{ background: '#2E7D32', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        <span style={{ fontSize: '1.2rem' }}>📑</span>
                        ייצוא דוח לאקסל (Excel)
                    </button>
                    <button
                        onClick={onExportPDF}
                        className="big-btn"
                        style={{ background: '#C62828', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        <span style={{ fontSize: '1.2rem' }}>📕</span>
                        ייצוא דוח ל-PDF
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
                <h3>👤 פרטים אישיים</h3>
                <div className="settings-row">
                    <label>שם מלא</label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="ישראל ישראלי"
                        className="glass-input"
                    />
                </div>
                <div className="settings-row">
                    <label>מספר עובד</label>
                    <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="123456"
                        className="glass-input"
                    />
                </div>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
                <h3>🏔️ המסע</h3>
                <div className="settings-row">
                    <label>תאריך התחלה</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="glass-input"
                    />
                </div>
                <div className="settings-row">
                    <label>יעד חיסכון (₪)</label>
                    <input
                        type="number"
                        value={savingsGoal}
                        onChange={(e) => setSavingsGoal(Number(e.target.value))}
                        className="glass-input"
                    />
                </div>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
                <h3>💼 שכר ועבודה</h3>
                <div className="settings-row">
                    <label>תעריף משמרת (₪)</label>
                    <input
                        type="number"
                        value={shiftRate}
                        onChange={(e) => setShiftRate(Number(e.target.value))}
                        className="glass-input"
                    />
                </div>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
                <h3>🔔 התראות</h3>
                <div className="settings-row">
                    <label>תזכורת אימון</label>
                    <input
                        type="time"
                        value={workoutTime}
                        onChange={(e) => setWorkoutTime(e.target.value)}
                        className="glass-input"
                    />
                </div>
                <div className="settings-row">
                    <label className="toggle-label" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '1rem', color: '#fff' }}>צלילי ממשק (UI Sounds)</span>
                            <span style={{ fontSize: '0.75rem', color: '#888' }}>משוב קולי בלחצנים ופעולות</span>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="checkbox"
                                checked={soundEnabled}
                                onChange={(e) => setSoundEnabled(e.target.checked)}
                                style={{
                                    position: 'absolute',
                                    opacity: 0,
                                    width: '100%',
                                    height: '100%',
                                    cursor: 'pointer',
                                    zIndex: 2,
                                    margin: 0
                                }}
                            />
                            <span className="toggle-switch"></span>
                        </div>
                    </label>
                </div>
            </div>

            <div className="card" style={{ borderColor: 'var(--danger-color)', background: 'rgba(255, 68, 68, 0.05)' }}>
                <h3 style={{ color: 'var(--danger-color)' }}>⚠️ איזור סכנה</h3>
                <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '15px' }}>
                    פעולה זו תמחק את כל הנתונים השמורים במכשיר זה ללא אפשרות שחזור.
                </p>
                <button
                    onClick={() => {
                        if (window.confirm('האם אתה בטוח שברצונך לאפס את כל הנתונים? פעולה זו היא בלתי הפיכה.')) {
                            onReset();
                        }
                    }}
                    style={{
                        background: 'var(--danger-color)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        width: '100%',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    איפוס נתונים מלא
                </button>
            </div>

            <style>{`
                .settings-row {
                    margin-bottom: 15px;
                }
                .settings-row label {
                    display: block;
                    margin-bottom: 5px;
                    color: #aaa;
                    font-size: 0.9rem;
                }
                .glass-input {
                    width: 100%;
                    padding: 10px;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 1rem;
                    font-family: inherit;
                }
                .glass-input:focus {
                    outline: none;
                    border-color: var(--accent-color);
                }
            `}</style>
        </div>
    );
}

export default Settings;
