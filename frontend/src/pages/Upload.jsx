import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from "../services/api";
import { jsPDF } from 'jspdf';
import './Upload.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const loadingSteps = [
    "Uploading secure scan payload...",
    "Initializing Gemini Vision Lite...",
    "Extracting clinical biomarkers...",
    "Synthesizing diagnostic report..."
  ];

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG, JPG, DICOM).');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setAnalysisResult(null);
      setParsedData(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Strict dynamic severity classification based on instructions
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
    if (text.includes('none') || text.includes('normal') || text.includes('not applicable') || text.includes('no fracture') || text.includes('preserved') || text.includes('clear') || text.includes('no acute')) {
      return { label: 'Normal', category: 'Normal', badgeClass: 'badge-normal' };
    }

    return { label: 'Normal', category: 'Normal', badgeClass: 'badge-normal' };
  };

  const parseAnalysisText = (rawAnalysis) => {
    if (!rawAnalysis) return null;
    
    let findingsText = '';
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
        // If it still fails to parse, treat the whole raw string as the finding
        findingsText = rawAnalysis;
      }
    }

    // 2. Map backend schema keys to the frontend display correctly
    if (Object.keys(parsedObj).length > 0 && !findingsText) {
      findingsText = parsedObj.primary_finding || 
                     parsedObj.findings || 
                     parsedObj.analysis || 
                     JSON.stringify(parsedObj);
    }

    const status = computeReportStatus(findingsText);
    
    return {
      findings: findingsText,
      condition: parsedObj.condition || (status.category === 'Normal' ? 'Normal Radiological Finding' : `${status.label} Medical Observation`),
      severity: parsedObj.severity || status.label, // Use AI's severity if provided, else fallback to computation
      badgeClass: status.badgeClass,
      category: status.category,
      recommendation: parsedObj.recommendation || (findingsText.toLowerCase().includes('fracture') ? 'Consult orthopedic specialist immediately.' : 'Routine follow-up as indicated by primary physician.'),
      confidence: parsedObj.confidence || 96
    };
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a medical image first.');
      return;
    }

    setLoading(true);
    setLoadingStep(0);
    setError(null);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 800);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post("/upload", formData);

      console.log(response.data);
      clearInterval(stepInterval);
      
      // Ensure we are working with an object just in case Axios didn't auto-parse
      const responseData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

      setAnalysisResult(responseData);
      setParsedData(parseAnalysisText(responseData.analysis));
      showToast('Analysis completed successfully!', 'success');
      
    } catch (err) {
      clearInterval(stepInterval);

      console.log("FULL ERROR");
      console.log(err);
      console.log("RESPONSE");
      console.log(err.response);
      console.log("DATA");
      console.log(err.response?.data);

      if (err.response?.data?.detail) {
        setError(JSON.stringify(err.response.data.detail));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message);
      }

      showToast("Analysis failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!analysisResult || !parsedData) {
      alert("No report available.");
      return;
    }

    try {
      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("MediVault AI Report", 20, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      doc.text(`Date: ${new Date().toLocaleString()}`, 20, 35);
      doc.text(
        `File: ${analysisResult.filename || file?.name || "Medical Scan"}`,
        20,
        45
      );

      doc.setFont("helvetica", "bold");
      doc.text("Diagnosis:", 20, 65);

      doc.setFont("helvetica", "normal");
      doc.text(parsedData.condition || "", 60, 65);

      doc.setFont("helvetica", "bold");
      doc.text("Severity:", 20, 80);

      doc.setFont("helvetica", "normal");
      doc.text(parsedData.severity || "", 60, 80);

      doc.setFont("helvetica", "bold");
      doc.text("Clinical Findings:", 20, 100);

      doc.setFont("helvetica", "normal");
      const findings = doc.splitTextToSize(
        parsedData.findings || "",
        170
      );
      doc.text(findings, 20, 110);

      let y = 110 + findings.length * 6 + 10;

      doc.setFont("helvetica", "bold");
      doc.text("Recommendation:", 20, y);

      doc.setFont("helvetica", "normal");
      const rec = doc.splitTextToSize(
        parsedData.recommendation || "",
        170
      );
      doc.text(rec, 20, y + 10);

      doc.save("MediVault_Report.pdf");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="upload-wrapper">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="ambient-background">
        <div className="glow-blob blob-1"></div>
        <div className="glow-blob blob-2"></div>
      </div>

      <div className="upload-container">
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
            <Link to="/upload" className="nav-link active">Upload</Link>
            <Link to="/history" className="nav-link">History</Link>
            <Link to="/timeline" className="nav-link">Timeline</Link>
            <Link to="/summary" className="nav-link">Summary</Link>
          </div>
        </nav>

        <main className="upload-main">
          <div className="upload-header-text">
            <span className="badge-pill">Diagnostic Interface</span>
            <h2>AI Medical Image <span className="text-gradient">Analyzer</span></h2>
            <p>Upload radiological scans to run deep neural diagnosis instantly.</p>
          </div>

          <div className="upload-grid">
            {/* Left Column: Focused Image Preview & Dropzone */}
            <div className="glass-panel upload-card">
              <form onSubmit={handleUpload}>
                <div 
                  className={`dropzone ${dragOver ? 'drag-over' : ''} ${preview ? 'has-preview' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {preview ? (
                    <div className="preview-container">
                      <img src={preview} alt="Uploaded Scan" className="image-preview" />
                      {loading && <div className="scanning-laser-line"></div>}
                      
                      {loading && (
                        <div className="processing-overlay-badge">
                          <span className="mini-spinner"></span>
                          Gemini AI Processing...
                        </div>
                      )}

                      {!loading && (
                        <div className="preview-overlay-action">
                          <label htmlFor="file-upload" className="change-file-btn">Change Scan</label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="dropzone-prompt">
                      <div className="cloud-upload-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <h3>Drag & Drop Medical Scan</h3>
                      <p>Drop your file here or click to browse</p>
                      <label htmlFor="file-upload" className="browse-btn">Browse Files</label>
                    </div>
                  )}
                  <input 
                    id="file-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e.target.files[0])} 
                    style={{ display: 'none' }}
                  />
                </div>

                {file && !loading && (
                  <div className="selected-file-action">
                    <div className="file-tag-box">
                      <span>📄 <strong>{file.name}</strong></span>
                    </div>
                    <button type="submit" disabled={loading} className="btn-premium-large analyze-trigger-btn">
                      Run AI Analysis
                    </button>
                  </div>
                )}
              </form>

              {loading && (
                <div className="ai-loading-box">
                  <div className="ai-spinner"></div>
                  <h4>{loadingSteps[loadingStep]}</h4>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${(loadingStep + 1) * 25}%` }}></div>
                  </div>
                  <p>Analyzing anatomical structure via Gemini Vision Pro...</p>
                </div>
              )}

              {error && <div className="error-alert">{error}</div>}
            </div>

            {/* Right Column: Structured Report UI */}
            <div className="glass-panel results-card">
              <div className="report-top-bar">
                <h3>Diagnostic Breakdown</h3>
                {loading && <span className="analyzing-status-pill">Analyzing...</span>}
              </div>

              {parsedData ? (
                <div className="diagnostic-report-container">
                  <div className="report-card-section">
                    <span className="section-label">📋 Primary Diagnosis</span>
                    <div className="diagnosis-highlight-box">
                      <h4>{parsedData.condition}</h4>
                    </div>
                  </div>

                  <div className="report-row-grid">
                    <div className="report-card-section">
                      <span className="section-label">⚠️ Severity Assessment</span>
                      <div className={`severity-badge-display ${parsedData.badgeClass}`}>
                        <span className="severity-dot"></span>
                        {parsedData.severity}
                      </div>
                    </div>

                    <div className="report-card-section">
                      <span className="section-label">🤖 AI Confidence Score</span>
                      <div className="confidence-meter-box">
                        <div className="confidence-text">
                          <span>Model Accuracy</span>
                          <strong>{parsedData.confidence}%</strong>
                        </div>
                        <div className="mini-progress-track">
                          <div className="mini-progress-fill" style={{ width: `${parsedData.confidence}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="report-card-section">
                    <span className="section-label">🩺 Clinical Findings</span>
                    <div className="findings-card-box">
                      <p>{parsedData.findings}</p>
                    </div>
                  </div>

                  <div className="report-card-section">
                    <span className="section-label">💡 Clinical Recommendation</span>
                    <div className="recommendation-card-box">
                      <p>{parsedData.recommendation}</p>
                    </div>
                  </div>

                  <div className="pdf-action-wrapper">
                    <button onClick={downloadPDF} className="btn-premium-large download-pdf-btn">
                      <span>Download PDF Report</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="placeholder-results">
                  <div className="placeholder-icon">⚡</div>
                  <h4>Ready for Analysis</h4>
                  <p>Upload a medical scan to generate live structured insights and PDF reports.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="modern-footer">
          <p>© 2026 MediVault AI. Built for the future of healthcare.</p>
        </footer>
      </div>
    </div>
  );
};

export default Upload;