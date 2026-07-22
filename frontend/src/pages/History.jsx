import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    axios.get('http://localhost:8000/history')
      .then(response => {
        setHistory(response.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching history:', err);
        setError('Failed to load medical history from backend.');
        setLoading(false);
      });
  }, []);

  // Robust cleaner to strip out raw JSON formatting and extract plain text
  const cleanAnalysisText = (raw) => {
    if (!raw) return 'No clinical notes recorded.';
    
    let textStr = raw;
    if (typeof raw === 'object') {
      textStr = raw.findings || raw.analysis || JSON.stringify(raw);
    }

    // Remove markdown code blocks if present (e.g. ```json ... ```)
    textStr = textStr.replace(/```json/gi, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(textStr);
      // If it successfully parses, extract findings or condition values instead of showing JSON
      if (typeof parsed === 'object' && parsed !== null) {
        const findings = parsed.findings || parsed.analysis || '';
        const condition = parsed.condition || '';
        const recommendation = parsed.recommendation || '';
        
        let combined = '';
        if (condition) combined += `Diagnosis: ${condition}. `;
        if (findings) combined += `Findings: ${findings} `;
        if (recommendation) combined += `Recommendation: ${recommendation}`;
        
        return combined.trim() || JSON.stringify(parsed);
      }
    } catch (e) {
      // Not strict JSON, let's clean up any lingering raw curly braces or quotes manually if it looks like raw JSON text
    }

    // Clean up raw JSON syntax characters if they leaked through as a string
    return textStr
      .replace(/[{}]/g, '')
      .replace(/"findings"\s*:/gi, 'Findings:')
      .replace(/"condition"\s*:/gi, 'Condition:')
      .replace(/"severity"\s*:/gi, 'Severity:')
      .replace(/"recommendation"\s*:/gi, 'Recommendation:')
      .replace(/["\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const downloadReportPDF = (report) => {
    const doc = new jsPDF();
    const cleanText = cleanAnalysisText(report.analysis);
    
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("MEDIVAULT AI", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(168, 85, 247);
    doc.text("CLINICAL DIAGNOSTIC REPORT", 20, 28);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated Date: ${new Date().toLocaleString()}`, 20, 50);
    doc.text(`Source Filename: ${report.filename || 'Scan.jpg'}`, 20, 56);

    doc.setLineWidth(0.3);
    doc.setStrokeColor(220, 220, 220);
    doc.line(20, 62, 190, 62);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text("AI ANALYSIS:", 20, 75);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(cleanText, 170);
    doc.text(splitText, 20, 85);

    doc.save(`MediVault-Report-${report.filename || Date.now()}.pdf`);
  };

  const computeReportStatus = (analysisStr) => {
    const text = (analysisStr || '').toLowerCase();

    if (text.includes('high') || text.includes('critical') || text.includes('severe')) {
      return { label: 'Critical', category: 'Critical', badgeClass: 'badge-critical' };
    }
    if (text.includes('moderate')) {
      return { label: 'Moderate', category: 'Warning', badgeClass: 'badge-warning-orange' };
    }
    if (text.includes('mild') || text.includes('low')) {
      return { label: 'Mild', category: 'Warning', badgeClass: 'badge-warning-yellow' };
    }
    return { label: 'Normal', category: 'Normal', badgeClass: 'badge-normal' };
  };

  const filteredReports = history.filter(item => {
    const cleanText = cleanAnalysisText(item.analysis).toLowerCase();
    const matchesSearch = (item.filename || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cleanText.includes(searchQuery.toLowerCase());
    
    const computed = computeReportStatus(item.analysis);
    if (filterType === 'All') return matchesSearch;
    return matchesSearch && computed.category.toLowerCase() === filterType.toLowerCase();
  }).reverse();

  return (
    <div className="history-wrapper">
      <div className="ambient-background">
        <div className="glow-blob blob-1"></div>
        <div className="glow-blob blob-2"></div>
      </div>

      <div className="history-container">
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
            <Link to="/history" className="nav-link active">History</Link>
            <Link to="/timeline" className="nav-link">Timeline</Link>
            <Link to="/summary" className="nav-link">Summary</Link>
          </div>
        </nav>

        <main className="history-main">
          <div className="history-header">
            <div>
              <span className="badge-pill">Patient Record Vault</span>
              <h2>Medical <span className="text-gradient">History</span></h2>
              <p>Secure archive of all uploaded radiological scans and Gemini AI diagnostic records.</p>
            </div>
          </div>

          <div className="glass-panel controls-bar">
            <div className="search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input 
                type="text" 
                placeholder="Search reports by filename or findings..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-group">
              {['All', 'Normal', 'Warning', 'Critical'].map(cat => (
                <button 
                  key={cat} 
                  className={`filter-btn ${filterType === cat ? 'active' : ''}`}
                  onClick={() => setFilterType(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="glass-panel loading-state">
              <div className="spinner"></div>
              <p>Decrypting medical vault records...</p>
            </div>
          ) : error ? (
            <div className="glass-panel error-state">
              <p>{error}</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="glass-panel empty-state">
              <div className="empty-icon">📂</div>
              <h3>No medical reports found</h3>
              <p>Try adjusting your search query or upload a new scan.</p>
              <Link to="/upload" className="btn-premium-small" style={{marginTop: '16px', display: 'inline-block'}}>Upload Scan</Link>
            </div>
          ) : (
            <div className="reports-grid">
              {filteredReports.map((report, idx) => {
                const status = computeReportStatus(report.analysis);
                const cleanText = cleanAnalysisText(report.analysis);
                const imageUrl = report.image ? (report.image.startsWith('data:') ? report.image : `http://localhost:8000/${report.image}`) : null;
                
                return (
                  <div key={idx} className="glass-panel report-item-card">
                    <div className="report-thumb-box">
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
                    
                    <div className="report-card-content">
                      <div className="card-top-meta">
                        <span className="file-title">{report.filename || `Scan Report`}</span>
                        <span className={`severity-tag ${status.badgeClass}`}>
                          {status.category === 'Normal' ? '🟢' : status.category === 'Warning' ? '🟡' : '🔴'} {status.label}
                        </span>
                      </div>

                      <div className="analysis-preview">
                        <p>{cleanText}</p>
                      </div>

                      <div className="card-actions-row">
                        <button onClick={() => downloadReportPDF(report)} className="btn-download-pdf prominent-pdf-btn">
                          <span>Download PDF Report</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        </button>
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

export default History;