
import { useState, useEffect } from 'react';

function Dashboard({ totalNet, remainingTrips, onStartShift, onLogManual }) {
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
            <div className="card goal-card">
                <h3>היעד לטיול הגדול</h3>
                <div className="circular-progress-container">
                    <svg width="200" height="200" viewBox="0 0 200 200">
                        {/* Background Circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke="#333"
                            strokeWidth="15"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke="var(--accent-color)" // Steel Blue
                            strokeWidth="15"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            transform="rotate(-90 100 100)"
                            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                        />
                        {/* Text */}
                        <text x="50%" y="45%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="2rem" fontWeight="bold">
                            {Math.floor(progress)}%
                        </text>
                        <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" fill="#aaa" fontSize="1rem">
                            נחסך: ₪{totalNet.toLocaleString()}
                        </text>
                    </svg>
                </div>
                <div className="goal-footer">
                    <div>
                        <span className="goal-label">נותרו:</span>
                        <span className="goal-value">₪{(GOAL - totalNet).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="stats-row">
                <div className="card stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-value">{remainingTrips}</div>
                    <div className="stat-label">טיולים</div>
                </div>
                <div className="stat-card card"> {/* Assuming upcoming feature */}
                    <div className="stat-icon">🔥</div>
                    <div className="stat-value">3</div>
                    <div className="stat-label">רצף</div>
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
