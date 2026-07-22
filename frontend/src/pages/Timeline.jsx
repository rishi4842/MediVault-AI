import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Timeline.css';

const Timeline = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/history')
      .then(response => {
        setHistory(response.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching history for timeline:', err);
        setLoading(false);
      });
  }, []);

  const parseAnalysisContent = (rawAnalysis) => {
    if (!rawAnalysis) return { text: 'No clinical notes recorded.', condition: 'General Observation' };
    
    if (typeof rawAnalysis === 'object') {
      return {
        text: rawAnalysis.findings || rawAnalysis.analysis || JSON.stringify(rawAnalysis),
        condition: rawAnalysis.condition || 'Radiological Assessment'
      };
    }

    try {
      const parsed = JSON.parse(rawAnalysis);
      return {
        text: parsed.findings || parsed.analysis || rawAnalysis,
        condition: parsed.condition || 'Clinical Finding'
      };
    } catch (e) {
      return {
        text: rawAnalysis,
        condition: 'Radiological Scan Assessment'
      };
    }
  };

  const computeReportStatus = (analysisStr) => {
    const text = (analysisStr || '').toLowerCase();
    if (text.includes('high') || text.includes('critical') || text.includes('severe')) {
      return { label: 'Critical', badgeClass: 'badge-critical' };
    }
    if (text.includes('moderate')) {
      return { label: 'Moderate', badgeClass: 'badge-warning-orange' };
    }
    if (text.includes('mild') || text.includes('low')) {
      return { label: 'Mild', badgeClass: 'badge-warning-yellow' };
    }
    return { label: 'Normal', badgeClass: 'badge-normal' };
  };

  const sortedHistory = [...history].reverse();

  return (
    <div className="timeline-wrapper">
      <div className="ambient-background">
        <div className="glow-blob blob-1"></div>
        <div className="glow-blob blob-2"></div>
      </div>

      <div className="timeline-container">
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
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/upload" className="nav-link">Upload</Link>
            <Link to="/history" className="nav-link">History</Link>
            <Link to="/timeline" className="nav-link active">Timeline</Link>
            <Link to="/summary" className="nav-link">Summary</Link>
          </div>
        </nav>

        <main className="timeline-main">
          <div className="timeline-header">
            <span className="badge-pill">Chronological Health Tracking</span>
            <h2>Medical <span className="text-gradient">Timeline</span></h2>
            <p>Visualizing your medical scans and AI diagnostic milestones over time.</p>
          </div>

          {loading ? (
            <div className="glass-panel loading-state">
              <div className="spinner"></div>
              <p>Constructing medical timeline...</p>
            </div>
          ) : sortedHistory.length === 0 ? (
            <div className="glass-panel empty-state">
              <div className="empty-icon">📈</div>
              <h3>No chronological records available</h3>
              <p>Upload a medical report to initiate your health timeline.</p>
              <Link to="/upload" className="btn-premium-small" style={{marginTop: '16px', display: 'inline-block'}}>Upload Scan</Link>
            </div>
          ) : (
            <div className="vertical-timeline">
              {sortedHistory.map((item, idx) => {
                const status = computeReportStatus(item.analysis);
                const parsed = parseAnalysisContent(item.analysis);
                const imageUrl = item.image ? (item.image.startsWith('data:') ? item.image : `http://localhost:8000/${item.image}`) : null;

                return (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-node"></div>
                    <div className="glass-panel timeline-card">
                      <div className="timeline-card-header">
                        <span className="timeline-date">Scan Record #{sortedHistory.length - idx}</span>
                        <span className={`severity-tag ${status.badgeClass}`}>🟢 {status.label} Severity</span>
                      </div>

                      <div className="timeline-body">
                        <div className="timeline-thumb">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt="Scan" 
                              onError={(e) => { e.target.onerror = null; e.target.src = ''; e.target.parentNode.innerHTML = '<div class="no-image-ph">🩻</div>'; }}
                            />
                          ) : (
                            <div className="no-image-ph">🩻</div>
                          )}
                        </div>
                        <div className="timeline-details">
                          <h4>📁 {item.filename || 'Radiological Scan'}</h4>
                          <p className="timeline-diagnosis"><strong>Diagnosis:</strong> {parsed.condition}</p>
                          <p className="timeline-confidence"><strong>Status:</strong> AI Analysis Complete</p>
                          <p className="timeline-analysis-snippet">{parsed.text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <footer className="modern-footer">
          <p>© 2026 MediVault AI. Built for the future of healthcare.</p>
        </footer>
      </div>
    </div>
  );
};

export default Timeline;