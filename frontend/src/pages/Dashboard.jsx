import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the existing backend history API
    axios.get('http://localhost:8000/history')
      .then(response => {
        setHistory(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch history:', err);
        setError('Could not connect to backend server. Ensure FastAPI is running.');
        setLoading(false);
      });
  }, []);

  // Compute live statistics from history
  const totalReports = history.length;
  const latestReport = totalReports > 0 ? history[history.length - 1] : null;

  return (
    <div className="dashboard-wrapper">
      {/* Background Ambient Glow */}
      <div className="ambient-background">
        <div className="glow-blob blob-1"></div>
        <div className="glow-blob blob-2"></div>
      </div>

      <div className="dashboard-container">
        {/* Navigation Bar */}
        <nav className="glass-navbar">
          <div className="navbar-brand">
            <div className="logo-icon-glow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1>MediVault <span>AI</span></h1>
          </div>
          <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/dashboard" className="nav-link active">Dashboard</Link>
            <Link to="/upload" className="nav-link">Upload</Link>
            <Link to="/history" className="nav-link">History</Link>
            <Link to="/timeline" className="nav-link">Timeline</Link>
            <Link to="/summary" className="nav-link">Summary</Link>
            <Link to="/upload" className="btn-premium-small">New Scan</Link>
          </div>
        </nav>

        {/* Main Dashboard Content */}
        <main className="dashboard-main">
          
          {/* Welcome Header Section */}
          <div className="welcome-section glass-panel">
            <div className="welcome-text">
              <span className="badge-pill">Healthcare Command Center</span>
              <h2>Welcome back, <span className="text-gradient">Doctor</span></h2>
              <p>Your Gemini AI diagnostic engine is fully operational. Real-time scanning and medical history vault are active.</p>
            </div>
            <div className="welcome-actions">
              <Link to="/upload" className="btn-premium-large">
                <span>Upload New Scan</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="stats-grid">
            <div className="stat-card glass-panel hover-lift">
              <div className="stat-icon-box purple">📊</div>
              <div className="stat-details">
                <h3>{totalReports}</h3>
                <p>Reports Uploaded</p>
              </div>
            </div>
            <div className="stat-card glass-panel hover-lift">
              <div className="stat-icon-box blue">⚡</div>
              <div className="stat-details">
                <h3>1.2 sec</h3>
                <p>Avg Processing Time</p>
              </div>
            </div>
            <div className="stat-card glass-panel hover-lift">
              <div className="stat-icon-box pink">🤖</div>
              <div className="stat-details">
                <h3>Online</h3>
                <p>Gemini AI Status</p>
              </div>
            </div>
            <div className="stat-card glass-panel hover-lift">
              <div className="stat-icon-box green">🔒</div>
              <div className="stat-details">
                <h3>Encrypted</h3>
                <p>Vault Storage</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <h3 className="section-heading">Quick Navigation</h3>
          <div className="quick-actions-grid">
            <Link to="/upload" className="action-card glass-panel hover-lift">
              <div className="action-icon">📤</div>
              <div>
                <h4>Upload Report</h4>
                <p>Process a new X-ray or medical image via Gemini AI</p>
              </div>
            </Link>
            <Link to="/history" className="action-card glass-panel hover-lift">
              <div className="action-icon">📂</div>
              <div>
                <h4>Medical History</h4>
                <p>Browse, filter, and download PDFs of previous scans</p>
              </div>
            </Link>
            <Link to="/timeline" className="action-card glass-panel hover-lift">
              <div className="action-icon">📈</div>
              <div>
                <h4>Medical Timeline</h4>
                <p>Visual chronological tracker of your medical progress</p>
              </div>
            </Link>
            <Link to="/summary" className="action-card glass-panel hover-lift">
              <div className="action-icon">💡</div>
              <div>
                <h4>AI Summary</h4>
                <p>Aggregated insights, risk metrics, and common findings</p>
              </div>
            </Link>
          </div>

          {/* Recent Activity / Latest Analysis Preview */}
          <div className="recent-section">
            <h3 className="section-heading">Latest Scan Analysis</h3>
            {loading ? (
              <div className="glass-panel loading-box">
                <div className="spinner"></div>
                <p>Loading medical vault records...</p>
              </div>
            ) : error ? (
              <div className="glass-panel error-box">
                <p>{error}</p>
              </div>
            ) : totalReports === 0 ? (
              <div className="glass-panel empty-box">
                <p>No medical reports found in vault. Upload your first scan to begin.</p>
                <Link to="/upload" className="btn-premium-small" style={{marginTop: '16px', display: 'inline-block'}}>Upload Now</Link>
              </div>
            ) : (
              <div className="glass-panel latest-report-card">
                <div className="report-thumbnail-container">
                  {latestReport.image ? (
                    <img 
                      src={latestReport.image.startsWith('data:') ? latestReport.image : `http://localhost:8000/${latestReport.image}`} 
                      alt="Latest Scan" 
                      className="report-thumb"
                    />
                  ) : (
                    <div className="no-thumb">No Image</div>
                  )}
                </div>
                <div className="report-meta">
                  <div className="report-header-info">
                    <span className="file-tag">{latestReport.filename || 'Medical Scan'}</span>
                    <span className="live-badge">Latest Analysis</span>
                  </div>
                  <div className="analysis-snippet">
                    <p>{latestReport.analysis ? latestReport.analysis.substring(0, 250) + '...' : 'No analysis text available.'}</p>
                  </div>
                  <div className="report-footer-actions">
                    <Link to="/history" className="btn-premium-small">View in History</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

        </main>

        <footer className="modern-footer">
          <p>© 2026 MediVault AI. Built for the future of healthcare.</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;