import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [log, setLog] = useState('Loading...');
  const [lastUpdated, setLastUpdated] = useState('');
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    fetchLog();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLog, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLog = () => {
    fetch('/api/log')
      .then(res => res.json())
      .then(data => {
        setLog(data.log || 'No log found.');
        setLastUpdated(new Date().toLocaleTimeString());
        
        // Try to parse the OpenRouter result
        try {
          const lines = data.log.split('\n');
          const resultLine = lines.find(line => line.startsWith('OpenRouter result:'));
          if (resultLine) {
            const jsonStr = resultLine.replace('OpenRouter result: ', '');
            const parsed = JSON.parse(jsonStr);
            setParsedData(parsed);
          }
        } catch (e) {
          // Ignore parsing errors
        }
      })
      .catch(err => {
        setLog('Error loading log: ' + err.message);
        setLastUpdated(new Date().toLocaleTimeString());
      });
  };

  const formatContent = (content) => {
    if (!content) return '';
    return content.split('\n').map((line, i) => (
      <div key={i} className={line.startsWith('Some free models') ? 'model-list' : ''}>
        {line}
      </div>
    ));
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <h1 className="title">
              <span className="icon">🤖</span>
              Daily LLM Tracker
            </h1>
            <p className="subtitle">
              Automated OpenRouter model monitoring & GitHub activity
            </p>
            <div className="status-badge">
              <span className="status-dot"></span>
              Last updated: {lastUpdated}
            </div>
          </div>
        </header>

        <div className="dashboard">
          {parsedData && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{parsedData.model_count || 0}</div>
                <div className="stat-label">Total Models</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{parsedData.free_model_count || 0}</div>
                <div className="stat-label">Free Models</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {parsedData.timestamp ? new Date(parsedData.timestamp).toLocaleDateString() : 'Today'}
                </div>
                <div className="stat-label">Last Check</div>
              </div>
            </div>
          )}

          <div className="content-section">
            <div className="section-header">
              <h2>Latest Update</h2>
              <button className="refresh-btn" onClick={fetchLog}>
                <span className="refresh-icon">🔄</span>
                Refresh
              </button>
            </div>
            
            {parsedData?.choices?.[0]?.message?.content ? (
              <div className="content-card">
                <div className="content-text">
                  {formatContent(parsedData.choices[0].message.content)}
                </div>
                {parsedData.choices[0].message.content.includes('https://openrouter.ai/models') && (
                  <div className="action-buttons">
                    <a 
                      href="https://openrouter.ai/models" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="cta-button"
                    >
                      View All Models →
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="content-card">
                <pre className="raw-log">{log}</pre>
              </div>
            )}
          </div>

          <div className="footer-info">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-icon">⏰</span>
                <span>Runs daily at 9:00 AM</span>
              </div>
              <div className="info-item">
                <span className="info-icon">📊</span>
                <span>Auto-commits to GitHub</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🔄</span>
                <span>Real-time model tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
