import React from 'react';

function SummaryCard({ totalHours, netEarnings, targetEarnings }) {
    const remainingToGoal = Math.max(0, targetEarnings - netEarnings);

    return (
        <div className="card summary-card" style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
            borderColor: 'var(--accent-color)',
            marginBottom: '20px',
            animation: 'fade-in 0.4s ease'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', textAlign: 'center' }}>
                <div className="summary-item">
                    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🕒</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>{totalHours.toFixed(1)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#aaa' }}>סה"כ שעות</div>
                </div>

                <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }}></div>

                <div className="summary-item">
                    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>💰</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-color)' }}>₪{netEarnings.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#aaa' }}>רווח נטו</div>
                </div>

                <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }}></div>

                <div className="summary-item">
                    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🎯</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f59e0b' }}>₪{remainingToGoal.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#aaa' }}>נותרו ליעד</div>
                </div>
            </div>
        </div>
    );
}

export default SummaryCard;
