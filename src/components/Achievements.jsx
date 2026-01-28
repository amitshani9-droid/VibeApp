import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

function Achievements({ netEarnings, tripCount, overtimeCount }) {

    const badges = [
        {
            id: 'first10k',
            title: 'מדרגה ראשונה',
            desc: 'הרווחת מעל 10,000₪ נטו',
            icon: '🥉',
            condition: netEarnings >= 10000
        },
        {
            id: 'overtime',
            title: 'מלך השעות',
            desc: '10 משמרות עם שעות נוספות',
            icon: '⚡',
            condition: overtimeCount >= 10
        },
        {
            id: 'halfway',
            title: 'חצי דרך',
            desc: 'הגעת ל-25,000₪ נטו!',
            icon: '🥈',
            condition: netEarnings >= 25000
        },
        {
            id: 'century',
            title: 'מועדון ה-100',
            desc: 'השלמת 100 משמרות',
            icon: '💯',
            condition: tripCount >= 100
        },
        {
            id: 'mission',
            title: 'המשימה הושלמה',
            desc: 'יעד של 50,000₪ הושג!',
            icon: '🏆',
            condition: netEarnings >= 50000
        }
    ];

    useEffect(() => {
        if (netEarnings >= 50000) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [netEarnings]);

    return (
        <div className="section-container">
            <h2>היכל התהילה</h2>
            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>הישגים ואבני דרך במסע שלך.</p>

            <div className="badges-grid">
                {badges.map(badge => (
                    <div key={badge.id} className={`badge-card ${badge.condition ? 'unlocked' : 'locked'}`}>
                        <div className="badge-icon">{badge.icon}</div>
                        <div style={{ flex: 1, marginRight: '20px' }}>
                            <h3 style={{ marginBottom: '4px', color: badge.condition ? 'white' : '#777', fontSize: '1.1rem' }}>{badge.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: badge.condition ? '#ccc' : '#555' }}>{badge.desc}</p>
                        </div>
                        {badge.condition && <div className="unlock-glow"></div>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Achievements;
