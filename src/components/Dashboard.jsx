
import { useState, useEffect } from 'react';

function Dashboard({ totalNet, remainingTrips, currentStreak = 0, onStartShift, onLogManual }) {
    const GOAL = 50000;
    const progress = Math.min((totalNet / GOAL) * 100, 100);

    // Circular Progress Logic
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="section-container dashboard-container">
            <h2 className="dashboard-title">סקירה כללית</h2>

            {/* Goal Card */}
            <div className="card goal-card" style={{ animation: 'fade-in 0.4s ease' }}>
                <h3 style={{ marginBottom: '5px' }}>היעד לטיול הגדול</h3>
                <div className="circular-progress-container">
                    <svg width="220" height="220" viewBox="0 0 200 200">
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--accent-color)" />
                                <stop offset="100%" stopColor="#60a5fa" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {/* Background Circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="12"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth="12"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            transform="rotate(-90 100 100)"
                            style={{
                                transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                filter: 'drop-shadow(0 0 8px var(--accent-glow))'
                            }}
                        />
                        {/* Text */}
                        <text x="50%" y="45%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="2.2rem" fontWeight="800">
                            {Math.floor(progress)}%
                        </text>
                        <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fill="var(--text-secondary)" fontSize="0.9rem" fontWeight="500">
                            נחסך: ₪{totalNet.toLocaleString()}
                        </text>
                    </svg>
                </div>
                <div className="goal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', width: '100%', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59, 130, 246, 0.08)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <span style={{ fontSize: '1rem', fontWeight: '600', color: '#aaa' }}>רווח מצטבר:</span>
                            <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--accent-color)', letterSpacing: '1px' }}>₪{totalNet.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '12px 15px', borderRadius: '12px' }}>
                            <span style={{ fontSize: '0.9rem', color: '#888' }}>יעד סופי:</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>₪{GOAL.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="stats-row" style={{ animation: 'fade-in 0.5s ease' }}>
                <div className="card stat-card" style={{ borderRight: '3px solid var(--accent-color)' }}>
                    <div className="stat-icon">📅</div>
                    <div className="stat-value">{remainingTrips}</div>
                    <div className="stat-label">טיולים לסוף</div>
                </div>
                <div className="stat-card card" style={{ borderRight: '3px solid #f59e0b' }}> {/* Amber for streak */}
                    <div className="stat-icon">🔥</div>
                    <div className="stat-value">{currentStreak}</div>
                    <div className="stat-label">רצף של {currentStreak} ימים</div>
                </div>
            </div>

            {/* Big Action Buttons */}
            <div className="actions-container">
                <button className="massive-btn start-shift-btn" onClick={onStartShift}>
                    <span className="btn-icon">⏱️</span>
                    התחל משמרת
                </button>
                <div className="secondary-actions">
                    <button className="secondary-btn" onClick={onLogManual}>
                        📝 רישום ידני
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
