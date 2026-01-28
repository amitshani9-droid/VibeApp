import React, { useState, useEffect } from 'react';

function Equipment() {
    const initialGear = {
        gun: { label: 'נשק אישי', checked: false },
        ammo: { label: 'תחמושת (מחסניות)', checked: false },
        license: { label: 'רישיון נשק / תעודה', checked: false },
        uniform: { label: 'מדים ייצוגיים', checked: false },
        boots: { label: 'נעליים טקטיות', checked: false },
        water: { label: 'מים (3 ליטר)', checked: false },
        food: { label: 'אוכל למשמרת', checked: false },
        coffee: { label: 'פק"ל קפה', checked: false },
        powerbank: { label: 'סוללה ניידת (מטען)', checked: false },
        headphones: { label: 'אוזניות', checked: false },
    };

    const [gear, setGear] = useState(() => {
        const saved = localStorage.getItem('myGrowthApp_gear');
        return saved ? JSON.parse(saved) : initialGear;
    });

    useEffect(() => {
        localStorage.setItem('myGrowthApp_gear', JSON.stringify(gear));
    }, [gear]);

    const toggleGear = (key) => {
        setGear(prev => ({
            ...prev,
            [key]: { ...prev[key], checked: !prev[key].checked }
        }));
    };

    const resetGear = () => {
        if (window.confirm('האם לאפס את רשימת הציוד?')) {
            setGear(initialGear);
        }
    };

    const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'warning', text: '' }

    const allChecked = Object.values(gear).every(item => item.checked);

    useEffect(() => {
        if (allChecked) {
            setStatusMessage({ type: 'success', text: '✅ הכל מוכן! אפשר לצאת לטיול' });
        } else {
            setStatusMessage(null);
        }
    }, [gear, allChecked]);

    const checkReadiness = () => {
        if (!allChecked) {
            setStatusMessage({ type: 'warning', text: '⚠️ שים לב: חסר ציוד ברשימה!' });
            // Clear warning after 3 seconds
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    return (
        <div className="section-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>ציוד למשמרת</h2>
                <button
                    onClick={resetGear}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer' }}
                >
                    איפוס
                </button>
            </div>

            <div className="card" style={{ position: 'relative', paddingBottom: '60px' }}>
                <ul className="checklist">
                    {Object.entries(gear).map(([key, item]) => (
                        <li
                            key={key}
                            className={`checklist-item ${item.checked ? 'completed' : ''}`}
                            onClick={() => toggleGear(key)}
                        >
                            <div className="check-circle">{item.checked && '✓'}</div>
                            <div className="item-content">
                                <strong>{item.label}</strong>
                            </div>
                        </li>
                    ))}
                </ul>

                {statusMessage && (
                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        background: statusMessage.type === 'success' ? 'rgba(74, 144, 226, 0.1)' : 'rgba(255, 46, 46, 0.1)',
                        color: statusMessage.type === 'success' ? 'var(--accent-color)' : 'var(--danger-color)',
                        border: `1px solid ${statusMessage.type === 'success' ? 'var(--accent-color)' : 'var(--danger-color)'}`,
                        animation: 'fade-in 0.3s'
                    }}>
                        {statusMessage.text}
                    </div>
                )}

                {!allChecked && (
                    <button
                        onClick={checkReadiness}
                        className="big-btn"
                        style={{ marginTop: '20px', background: '#333', color: '#ccc', fontSize: '1rem' }}
                    >
                        🧐 בדיקת מוכנות
                    </button>
                )}
            </div>
        </div>
    );
}

export default Equipment;
