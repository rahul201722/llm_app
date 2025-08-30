import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [log, setLog] = useState('Loading...');
  const [lastUpdated, setLastUpdated] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showDefaultQuestions, setShowDefaultQuestions] = useState(false);
  const [defaultQuestions, setDefaultQuestions] = useState([]);

  useEffect(() => {
    fetchLog();
    fetchDefaultQuestions();
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

  const fetchDefaultQuestions = () => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => {
        setDefaultQuestions(data.questions || []);
      })
      .catch(err => {
        console.error('Error loading default questions:', err);
      });
  };

  const selectDefaultQuestion = (question) => {
    setCustomQuestion(question);
    setShowDefaultQuestions(false);
    console.log('Selected default question:', question);
  };

  const runCustomQuestion = async () => {
    console.log('Button clicked! Question:', customQuestion);
    
    if (!customQuestion.trim()) {
      alert('Please enter a question first!');
      return;
    }
    
    setIsRunning(true);
    console.log('Starting request...');
    
    try {
      console.log('Sending question:', customQuestion);
      
      const response = await fetch('/api/run-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: customQuestion }),
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Success:', result);
        alert('Question sent successfully! Check the log in a few seconds.');
        
        // Wait a moment for the script to complete, then refresh
        setTimeout(() => {
          fetchLog();
          setCustomQuestion('');
          setIsRunning(false);
        }, 5000); // Increased timeout
      } else {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        setIsRunning(false);
        alert('Failed to run custom question: ' + errorData);
      }
    } catch (error) {
      console.error('Network error:', error);
      setIsRunning(false);
      alert('Network error: ' + error.message);
    }
  };

  const testButton = () => {
    console.log('Test button clicked!');
    alert('Button is working!');
  };

  const formatContent = (content) => {
    if (!content) return '';
    return content.split('\n').map((line, i) => (
      <div key={i} className={line.startsWith('Some free models') ? 'model-list' : ''}>
        {line}
      </div>
    ));
  };

  const extractQuestion = (content) => {
    if (!content) return 'Daily Science Question';
    
    // Try to infer the topic from the response
    if (content.includes('photosynthesis')) return 'Photosynthesis & Molecular Biology';
    if (content.includes('time dilation') || content.includes('relativity')) return 'Physics: Time Dilation & Relativity';
    if (content.includes('quantum')) return 'Quantum Physics';
    if (content.includes('algorithm')) return 'Computer Science: Algorithms';
    if (content.includes('blockchain')) return 'Technology: Blockchain';
    if (content.includes('probability')) return 'Mathematics: Probability';
    if (content.includes('machine learning')) return 'AI & Machine Learning';
    if (content.includes('compression')) return 'Computer Science: Data Compression';
    if (content.includes('Earth') && content.includes('rotating')) return 'Astronomy: Earth Sciences';
    
    return 'Daily Science Question';
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <h1 className="title">
              <span className="icon">�</span>
              Interactive LLM Learning
            </h1>
            <p className="subtitle">
              Ask any question or explore daily science topics with AI
            </p>
            <div className="status-badge">
              <span className="status-dot"></span>
              Last updated: {lastUpdated}
            </div>
          </div>
        </header>

        <div className="dashboard">
          {/* Custom Question Input */}
          <div className="question-input-section">
            <h2>🤔 Ask Your Own Question</h2>
            <div className="input-group">
              <textarea
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ask anything: science, math, technology, philosophy..."
                className="question-input"
                rows="3"
              />
              <div className="button-row">
                <button 
                  onClick={runCustomQuestion}
                  disabled={!customQuestion.trim() || isRunning}
                  className={`ask-button ${isRunning ? 'running' : ''}`}
                  type="button"
                >
                  {isRunning ? '🤖 Thinking...' : '🚀 Ask AI'}
                </button>
                <button 
                  onClick={() => setShowDefaultQuestions(!showDefaultQuestions)}
                  className="ask-button secondary"
                  type="button"
                >
                  📋 Browse Questions
                </button>
                <button 
                  onClick={testButton}
                  className="ask-button test"
                  type="button"
                >
                  🧪 Test
                </button>
              </div>
            </div>
            
            {showDefaultQuestions && (
              <div className="default-questions-panel">
                <div className="panel-header">
                  <h3>📚 Choose from Default Questions</h3>
                  <button 
                    onClick={() => setShowDefaultQuestions(false)}
                    className="close-btn"
                  >
                    ✕
                  </button>
                </div>
                <div className="questions-list">
                  {defaultQuestions.map((question, index) => (
                    <div 
                      key={index}
                      onClick={() => selectDefaultQuestion(question)}
                      className="question-item"
                    >
                      <div className="question-number">{index + 1}</div>
                      <div className="question-text">{question}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="quick-examples">
              <span>Quick examples:</span>
              <button 
                onClick={() => {
                  setCustomQuestion("Explain black holes in simple terms");
                  console.log('Set question: Explain black holes in simple terms');
                }}
                className="example-btn"
              >
                Black Holes
              </button>
              <button 
                onClick={() => {
                  setCustomQuestion("How does cryptocurrency mining work?");
                  console.log('Set question: How does cryptocurrency mining work?');
                }}
                className="example-btn"
              >
                Crypto Mining
              </button>
              <button 
                onClick={() => {
                  setCustomQuestion("What is the biggest unsolved math problem?");
                  console.log('Set question: What is the biggest unsolved math problem?');
                }}
                className="example-btn"
              >
                Math Mysteries
              </button>
            </div>
          </div>

          {parsedData && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">📅</div>
                <div className="stat-label">Daily Learning</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">🎯</div>
                <div className="stat-label">Custom Questions</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {parsedData.timestamp ? new Date(parsedData.timestamp).toLocaleDateString() : 'Today'}
                </div>
                <div className="stat-label">Last Response</div>
              </div>
            </div>
          )}

          <div className="content-section">
            <div className="section-header">
              <h2>
                📚 {parsedData?.choices?.[0]?.message?.content ? 
                  extractQuestion(parsedData.choices[0].message.content) : 
                  'Latest Response'}
              </h2>
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
                <div className="response-meta">
                  <span className="meta-item">
                    🤖 Model: {parsedData.model?.split('/').pop() || 'AI Assistant'}
                  </span>
                  <span className="meta-item">
                    ⏱️ {new Date(parsedData.timestamp || Date.now()).toLocaleString()}
                  </span>
                </div>
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
                <span>Auto-runs daily at 9:00 AM</span>
              </div>
              <div className="info-item">
                <span className="info-icon">📊</span>
                <span>All responses saved to GitHub</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🧠</span>
                <span>Ask anything, anytime</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🔄</span>
                <span>Real-time learning platform</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
