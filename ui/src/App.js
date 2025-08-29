import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [log, setLog] = useState('Loading...');

  useEffect(() => {
    fetch('/api/log')
      .then(res => res.json())
      .then(data => setLog(data.log || 'No log found.'));
  }, []);

  return (
    <div className="App" style={{ fontFamily: 'sans-serif', padding: 32, maxWidth: 600, margin: 'auto' }}>
      <h1>Daily LLM Log</h1>
      <pre style={{ background: '#f4f4f4', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap' }}>{log}</pre>
    </div>
  );
}

export default App;
