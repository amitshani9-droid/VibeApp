import React from 'react';

function Budget({ totalEarnings, netEarnings, targetEarnings, tripCount, trips, shiftRate = 400 }) {
    const progressPercentage = Math.min((netEarnings / targetEarnings) * 100, 100);

    const remainingAmount = Math.max(0, targetEarnings - netEarnings);
    const averageNetPerTrip = 380; // Base 400 * 0.85 + Overtime average
    const remainingTrips = Math.ceil(remainingAmount / averageNetPerTrip);

    const handleShare = () => {
        // Calculate weekly stats
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Start of week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);

        const weeklyTrips = trips.filter(t => {
            const d = new Date(t.date);
            return d >= startOfWeek && d <= endOfWeek;
        });

        let weeklyGross = 0;
        let weeklyHours = 0;
        weeklyTrips.forEach(t => {
            const base = 400; // Simplified for share
            let pay = base;
            if (t.hours > 10) pay += (t.hours - 10) * 56;
            if (t.isSleepover) pay += 80;
            weeklyGross += pay;
            weeklyHours += t.hours;
        });
        const weeklyNet = (weeklyGross * 0.85).toLocaleString();
        const weekRange = `${startOfWeek.toLocaleDateString('he-IL')} - ${endOfWeek.toLocaleDateString('he-IL')}`;

        const message = `סיכום שבועי - Vibe 🚀\n📅 שבוע: ${weekRange}\n💰 נטו שנחסך השבוע: ₪${weeklyNet}\n🛣️ טיולים שבוצעו: ${weeklyTrips.length}\n🎯 התקדמות ליעד ה-50K: ${progressPercentage.toFixed(1)}%\nממשיכים בכל הכוח!`;

        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="section-container">
            <h2>בקרת תקציב</h2>

            <div className="card budget-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3>היעד: ₪50,000</h3>
                    <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{progressPercentage.toFixed(1)}%</span>
                </div>

                <div className="progress-bar-container">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span>עוד כ-<strong>{remainingTrips}</strong> טיולים ליעד ה-50,000 🚀</span>
                </div>
            </div>

            <div className="card stats-card">
                <div className="budget-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="stat-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '16px', textAlign: 'center' }}>
                        <span className="value" style={{ display: 'block', fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-color)', textShadow: '0 0 15px var(--accent-glow)' }}>
                            ₪{netEarnings.toLocaleString()}
                        </span>
                        <span className="label" style={{ fontSize: '0.9rem', color: '#aaa' }}>נחסך עד כה</span>
                    </div>
                    <div className="stat-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '16px', textAlign: 'center' }}>
                        <span className="value" style={{ display: 'block', fontSize: '1.6rem', fontWeight: '800', color: 'white' }}>
                            ₪{(targetEarnings - netEarnings).toLocaleString()}
                        </span>
                        <span className="label" style={{ fontSize: '0.9rem', color: '#aaa' }}>נותר ליעד</span>
                    </div>
                </div>
            </div>

            <div className="card info-card">
                <h3>מבנה שכר</h3>
                <ul className="earning-rules" style={{ listStyle: 'none', padding: '0' }}>
                    <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>💰</span>
                        <div><strong>שכר בסיס:</strong> 400₪ למשמרת (עד 10 שעות)</div>
                    </li>
                    <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>⏱</span>
                        <div><strong>שעות נוספות:</strong> 56₪ לשעה (החל מהשעה ה-10)</div>
                    </li>
                    <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🌙</span>
                        <div><strong>לינה:</strong> תוספת 80₪ ללילה</div>
                    </li>
                    <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🚀</span>
                        <div><strong>בונוס התמדה:</strong> 2,000₪ במשמרת ה-100</div>
                    </li>
                    <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>📈</span>
                        <div><strong>משמרת 100+:</strong> הבסיס עולה ל-420₪!</div>
                    </li>
                </ul>
            </div>

            <button
                onClick={handleShare}
                className="big-btn"
                style={{
                    background: '#25D366', // WhatsApp Green
                    color: 'white',
                    boxShadow: '0 0 20px rgba(37, 211, 102, 0.4)',
                    marginTop: '10px'
                }}
            >
                💬 שתף סיכום שבועי
            </button>
        </div>
    );
}

export default Budget;
