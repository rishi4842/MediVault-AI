import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-wrapper">
      <div className="ambient-background">
        <div className="glow-blob blob-1"></div>
        <div className="glow-blob blob-2"></div>
        <div className="glow-blob blob-3"></div>
      </div>

      <div className="home-container">
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
            <Link to="/" className="nav-link active">Home</Link>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/upload" className="nav-link">Upload</Link>
            <Link to="/history" className="nav-link">History</Link>
            <Link to="/timeline" className="nav-link">Timeline</Link>
            <Link to="/summary" className="nav-link">Summary</Link>
            <Link to="/upload" className="btn-premium-small">Try it Now</Link>
          </div>
        </nav>

        <header className="hero-section">
          <div className="hero-left animate-on-scroll slide-up">
            <div className="version-badge pulse-border">
              <span className="live-dot"></span>
              Gemini AI Integration Live
            </div>
            <h2 className="hero-title">
              AI Powered <br />
              <span className="text-gradient-vibrant">Medical Report Analyzer</span>
            </h2>
            <p className="hero-subtitle">
              Analyze X-rays instantly using advanced generative AI. A premium, secure control panel to track your medical history, evaluate severity, and generate professional PDF summaries.
            </p>
            <div className="hero-actions">
              <Link to="/upload" className="btn-premium-large ripple-btn">
                <span>Upload Report</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link to="/dashboard" className="btn-outline-glow">
                View Dashboard
              </Link>
            </div>
          </div>
          
          <div className="hero-right animate-on-scroll fade-in">
            <div className="ai-scanner-showcase">
              <div className="scanner-glass-panel">
                <div className="panel-header">
                  <div className="mac-dots"><span></span><span></span><span></span></div>
                  <div className="panel-title">gemini_vision_analysis.exe</div>
                </div>
                <div className="panel-content">
                  <div className="xray-graphic">
                    <div className="ribcage"></div>
                    <div className="scanning-laser"></div>
                    <div className="ai-node node-1"><span></span></div>
                    <div className="ai-node node-2"><span></span></div>
                    <div className="ai-node node-3 anomaly"><span></span></div>
                  </div>
                </div>
              </div>
              
              <div className="floating-ui diag-card glass-panel float-slow">
                <div className="ui-icon purple-glow">🔮</div>
                <div className="ui-text">
                  <h4>Gemini Vision Pro</h4>
                  <p>Processing image arrays...</p>
                </div>
              </div>

              <div className="floating-ui result-card glass-panel float-fast delay-1">
                <div className="ui-icon red-glow pulse-icon">⚠️</div>
                <div className="ui-text">
                  <h4>Analysis Complete</h4>
                  <p>Severity: Normal / Low Risk</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Real / Safe Statistics Row */}
        <section className="stats-row animate-on-scroll slide-up delay-1">
          <div className="stat-card glass-panel hover-lift">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Vault Storage</h3>
              <p>Medical Reports</p>
            </div>
          </div>
          <div className="stat-card glass-panel hover-lift">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <h3>Fast Analysis</h3>
              <p>Real-Time Engine</p>
            </div>
          </div>
          <div className="stat-card glass-panel hover-lift">
            <div className="stat-icon">🤖</div>
            <div className="stat-info">
              <h3>Gemini AI</h3>
              <p>Powered Core</p>
            </div>
          </div>
          <div className="stat-card glass-panel hover-lift">
            <div className="stat-icon">🔒</div>
            <div className="stat-info">
              <h3>Secure Vault</h3>
              <p>Encrypted Records</p>
            </div>
          </div>
        </section>

        <section className="benefits-section animate-on-scroll slide-up">
          <div className="section-header">
            <h2 className="glow-text">Next-Generation Healthcare</h2>
            <p>Everything you need to analyze, track, and export medical data.</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card glass-panel group-hover">
              <div className="b-icon">🧠</div>
              <h3>Intelligent Diagnostics</h3>
              <p>Upload any medical scan and let our AI break down conditions, severity levels, and actionable recommendations instantly.</p>
            </div>
            <div className="benefit-card glass-panel group-hover">
              <div className="b-icon">📈</div>
              <h3>Visual Timeline</h3>
              <p>Don't just look at isolated reports. See your health journey mapped out on a beautiful, connected chronological timeline.</p>
            </div>
            <div className="benefit-card glass-panel group-hover">
              <div className="b-icon">📄</div>
              <h3>One-Click PDF</h3>
              <p>Generate clean, formatted, and professional PDF summaries of your AI analysis to share with your actual healthcare providers.</p>
            </div>
          </div>
        </section>

        <section className="tech-stack-section animate-on-scroll zoom-in">
          <div className="glass-panel stack-container">
            <h3>Powered by Modern Technologies</h3>
            <div className="stack-logos">
              <div className="tech-item"><span>⚛️</span> React (Vite)</div>
              <div className="tech-item"><span>⚡</span> FastAPI</div>
              <div className="tech-item"><span>🐍</span> Python</div>
              <div className="tech-item highlight"><span>✨</span> Google Gemini</div>
            </div>
          </div>
        </section>

        <footer className="modern-footer">
          <div className="footer-content">
            <div className="logo-icon-glow small">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <p>© 2026 MediVault AI. Built for the future of healthcare.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;