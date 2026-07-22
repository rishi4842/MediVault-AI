import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from "../services/api";
import { jsPDF } from 'jspdf';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    api.get('/history')
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

  // New: Parse analysis like Upload.jsx does
  const parseAnalysisText = (rawAnalysis) => {
    if (!rawAnalysis) return null;
    
    let parsedObj = {};

    // 1. Safely handle the stringified JSON (and potential markdown from Gemini)
    if (typeof rawAnalysis === 'object') {
      parsedObj = rawAnalysis;
    } else {
      try {
        // Strip out ```json and ``` if the AI accidentally wrapped the response
        const cleanString = rawAnalysis.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsedObj = JSON.parse(cleanString);
      } catch (e) {
        // If it still fails to parse, return null
        return null;
      }
    }

    // 2. Extract findings text for status computation
    const findingsText = parsedObj.findings || 
                         parsedObj.primary_finding || 
                         parsedObj.analysis || 
                         JSON.stringify(parsedObj);

    const status = computeReportStatus(findingsText);
    
    return {
      document_type: parsedObj.document_type || 'Medical Document',
      condition: parsedObj.condition || (status.category === 'Normal' ? 'Normal Finding' : `${status.label} Finding`),
      findings: findingsText,
      severity: parsedObj.severity || status.label,
      medications: parsedObj.medications || 'None',
      badgeClass: status.badgeClass,
      category: status.category,
      recommendation: parsedObj.recommendation || 'Consult with your healthcare provider for further evaluation.',
      confidence: parsedObj.confidence || 96
    };
  };

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
    if (!report) {
      alert("No report available.");
      return;
    }

    try {
      const doc = new jsPDF();
      const parsedData = parseAnalysisText(report.analysis);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("MediVault AI Report", 20, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      doc.text(`Date: ${new Date().toLocaleString()}`, 20, 35);
      doc.text(`File: ${report.filename || "Medical Document"}`, 20, 45);

      let y = 60;

      if (parsedData && parsedData.document_type) {
        doc.setFont("helvetica", "bold");
        doc.text("Document Type:", 20, y);

        doc.setFont("helvetica", "normal");
        doc.text(parsedData.document_type, 80, y);
        y += 15;
      }

      doc.setFont("helvetica", "bold");
      doc.text("Diagnosis:", 20, y);

      doc.setFont("helvetica", "normal");
      doc.text(parsedData?.condition || "Unknown", 80, y);
      y += 15;

      doc.setFont("helvetica", "bold");
      doc.text("Severity:", 20, y);

      doc.setFont("helvetica", "normal");
      doc.text(parsedData?.severity || "Unknown", 80, y);
      y += 15;

      doc.setFont("helvetica", "bold");
      doc.text("Clinical Findings:", 20, y);

      doc.setFont("helvetica", "normal");
      const findings = doc.splitTextToSize(
        parsedData?.findings || "",
        170
      );
      doc.text(findings, 20, y + 10);

      y = y + 10 + findings.length * 6 + 10;

      if (parsedData && parsedData.medications && parsedData.medications !== 'None') {
        doc.setFont("helvetica", "bold");
        doc.text("Medications:", 20, y);

        doc.setFont("helvetica", "normal");
        const meds = doc.splitTextToSize(
          parsedData.medications || "",
          170
        );
        doc.text(meds, 20, y + 10);

        y = y + 10 + meds.length * 6 + 10;
      }

      doc.setFont("helvetica", "bold");
      doc.text("Recommendation:", 20, y);

      doc.setFont("helvetica", "normal");
      const rec = doc.splitTextToSize(
        parsedData?.recommendation || "",
        170
      );
      doc.text(rec, 20, y + 10);

      doc.save(`MediVault-Report-${report.filename || Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const computeReportStatus = (analysisStr) => {
    const text = (analysisStr || '').toLowerCase();

    // Check for clear NORMAL indicators first to avoid false positives
    if ((text.includes('normal') || text.includes('no fracture') || text.includes('no abnormality') || text.includes('no abnormal') || text.includes('unremarkable')) && 
        !(text.includes('fracture') && text.includes('normal')) &&
        !text.includes('moderate') &&
        !text.includes('severe') &&
        !text.includes('critical') &&
        !text.includes('high')) {
      return { label: 'Normal', category: 'Normal', badgeClass: 'badge-normal' };
    }

    // Then check severity levels
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
                const parsedData = parseAnalysisText(report.analysis);
                const cleanText = cleanAnalysisText(report.analysis);
                const imageUrl = report.image ? (report.image.startsWith('data:') ? report.image : `https://medivault-ai-backend.onrender.com/${report.image}`) : null;
                
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
                        <span className="file-title">{report.filename || `Medical Report`}</span>
                        <span className={`severity-tag ${status.badgeClass}`}>
                          {status.category === 'Normal' ? '🟢' : status.category === 'Warning' ? '🟡' : '🔴'} {status.label}
                        </span>
                      </div>

                      {parsedData && (
                        <div className="card-meta-info">
                          <small>📄 {parsedData.document_type}</small>
                          {parsedData.condition && <small>📋 {parsedData.condition}</small>}
                        </div>
                      )}

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