import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

export default function ResumeAtsAnalyzer() {
  const [jd, setJd] = useState('');
  const [resume, setResume] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('score');
  const [copiedTab, setCopiedTab] = useState(null);

  const handleAnalyze = async () => {
    if (!jd.trim() || !resume.trim()) {
      alert('Please paste both JD and Resume');
      return;
    }

    setLoading(true);
    setResults(null);
    setActiveTab('score');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jd, resume }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResults({
          error: true,
          status: '❌ Error',
          message: data.error || 'Something went wrong',
        });
        return;
      }

      setResults({
        error: false,
        atsScore: data.atsScore,
        roast: data.roast,
        analysis: data.analysis,
        optimization: data.optimization,
        coverLetter: data.coverLetter,
      });
    } catch (error) {
      setResults({
        error: true,
        status: '❌ Error',
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score < 40) return '#ff4757';
    if (score < 60) return '#ffa502';
    if (score < 75) return '#ffd93d';
    return '#2ed573';
  };

  const handleCopy = (text, tabName) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTab(tabName);
      setTimeout(() => setCopiedTab(null), 2000);
    });
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <h1>ResumeMatcher</h1>
          </div>
          <p className="tagline">AI-Powered Resume Analyzer & Cover Letter Generator</p>
        </div>
      </header>

      <div className="container">
        {/* Input Section */}
        <div className="input-section">
          <div className="input-wrapper">
            <div className="input-group">
              <label>
                <span className="label-icon">📋</span>
                Job Description
              </label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the full job description here..."
                rows="10"
                className="input-textarea"
              />
              <span className="char-count">{jd.length} characters</span>
            </div>

            <div className="input-group">
              <label>
                <span className="label-icon">📄</span>
                Your Resume
              </label>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste your resume text here..."
                rows="10"
                className="input-textarea"
              />
              <span className="char-count">{resume.length} characters</span>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="analyze-btn"
          >
            {loading ? (
              <>
                <span className="loader"></span>
                Analyzing...
              </>
            ) : (
              <>
                <span>⚡</span>
                Analyze & Score
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {results && !results.error && (
          <div className="results-section">
            {/* Tab Navigation */}
            <div className="tabs-container">
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'score' ? 'active' : ''}`}
                  onClick={() => setActiveTab('score')}
                >
                  <span>📊</span> Score
                </button>
                <button
                  className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analysis')}
                >
                  <span>📋</span> Analysis
                </button>
                <button
                  className={`tab ${activeTab === 'optimization' ? 'active' : ''}`}
                  onClick={() => setActiveTab('optimization')}
                >
                  <span>✨</span> Optimize
                </button>
                <button
                  className={`tab ${activeTab === 'coverLetter' ? 'active' : ''}`}
                  onClick={() => setActiveTab('coverLetter')}
                >
                  <span>✍️</span> Letter
                </button>
              </div>
            </div>

            {/* Score Tab */}
            {activeTab === 'score' && (
              <div className="tab-content score-content">
                <div className="ats-score-card">
                  <div className="score-display">
                    <div className="score-circle-wrapper">
                      <svg className="score-circle-svg" viewBox="0 0 200 200">
                        <circle
                          cx="100"
                          cy="100"
                          r="90"
                          fill="none"
                          stroke="#333"
                          strokeWidth="8"
                        />
                        <circle
                          cx="100"
                          cy="100"
                          r="90"
                          fill="none"
                          stroke={getScoreColor(results.atsScore)}
                          strokeWidth="8"
                          strokeDasharray={`${(results.atsScore / 100) * 565} 565`}
                          className="score-circle-progress"
                        />
                      </svg>
                      <div className="score-text">
                        <span className="score-number" style={{ color: getScoreColor(results.atsScore) }}>
                          {results.atsScore}
                        </span>
                        <span className="score-label">/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="roast-card">
                    <div className="roast-icon">🔥</div>
                    <p className="roast-message">"{results.roast}"</p>
                  </div>

                  <div className="score-meaning">
                    {results.atsScore >= 80 && <span className="badge excellent">✅ Excellent Fit</span>}
                    {results.atsScore >= 60 && results.atsScore < 80 && <span className="badge good">⚠️ Good Potential</span>}
                    {results.atsScore >= 40 && results.atsScore < 60 && <span className="badge fair">❌ Needs Work</span>}
                    {results.atsScore < 40 && <span className="badge poor">🚫 Poor Alignment</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <div className="tab-content">
                <div className="content-card analysis-card">
                  <div className="card-header">
                    <h2>📋 Detailed Analysis</h2>
                  </div>
                  <div className="markdown-content">
                    <ReactMarkdown>{results.analysis}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* Optimization Tab */}
            {activeTab === 'optimization' && (
              <div className="tab-content">
                <div className="content-card optimization-card">
                  <div className="card-header">
                    <h2>✨ Resume Optimization</h2>
                    <span className="card-subtitle">Only sections needing improvement are shown</span>
                  </div>
                  <div className="markdown-content">
                    <ReactMarkdown>{results.optimization}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* Cover Letter Tab */}
            {activeTab === 'coverLetter' && (
              <div className="tab-content">
                <div className="content-card cover-letter-card">
                  <div className="card-header">
                    <h2>✍️ Personalized Cover Letter</h2>
                    <button
                      className={`copy-btn ${copiedTab === 'coverLetter' ? 'copied' : ''}`}
                      onClick={() => handleCopy(results.coverLetter, 'coverLetter')}
                    >
                      {copiedTab === 'coverLetter' ? '✅ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <div className="markdown-content cover-letter-content">
                    <ReactMarkdown>{results.coverLetter}</ReactMarkdown>
                  </div>
                  <div className="usage-tip">
                    💡 Ready to use! Paste this in your application. Personalize the greeting if needed.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Results */}
        {results && results.error && (
          <div className="error-card">
            <div className="error-icon">❌</div>
            <h2>{results.status}</h2>
            <p>{results.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}