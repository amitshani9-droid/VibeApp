import React, { useState, useEffect } from 'react';

function Equipment({ playClick }) {
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('vibe_equipment_list');
        if (saved) return JSON.parse(saved);
        return [
            { id: 1, name: 'פק"ל קפה', checked: false },
            { id: 2, name: 'מטען נייד', checked: false },
            { id: 3, name: 'בגדי עבודה', checked: false },
            { id: 4, name: 'כלי רחצה', checked: false },
        ];
    });

    useEffect(() => {
        localStorage.setItem('vibe_equipment_list', JSON.stringify(items));
    }, [items]);

    const toggleItem = (id) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
        if (playClick) playClick();
    };

    const resetList = () => {
        if (window.confirm('האם לאפס את כל הרשימה?')) {
            setItems(items.map(item => ({ ...item, checked: false })));
        }
    };

    return (
        <div className="section-container equipment-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ margin: 0 }}>🎒 ציוד לרכב / שטח</h2>
                <button
                    onClick={resetList}
                    style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer' }}
                >
                    איפוס רשימה
                </button>
            </div>

            <div className="card glass-panel" style={{ padding: '10px' }}>
                {items.map(item => (
                    <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`equipment-item ${item.checked ? 'checked' : ''}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '18px 15px',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: item.checked ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                        }}
                    >
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            border: '2px solid',
                            borderColor: item.checked ? 'var(--accent-color)' : '#444',
                            background: item.checked ? 'var(--accent-color)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            color: 'white',
                            transition: 'all 0.2s ease'
                        }}>
                            {item.checked && '✓'}
                        </div>
                        <span style={{
                            fontSize: '1.1rem',
                            color: item.checked ? '#888' : '#eee',
                            textDecoration: item.checked ? 'line-through' : 'none'
                        }}>
                            {item.name}
                        </span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
                כל השינויים נשמרים אוטומטית. 🚀
            </div>

            <style>{`
                .equipment-item:last-child { border-bottom: none !important; }
                .equipment-item:active { transform: scale(0.98); background: rgba(255,255,255,0.02); }
            `}</style>
        </div>
    );
}

export default Equipment;
