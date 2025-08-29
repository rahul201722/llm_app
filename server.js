// Minimal Express server to serve llm_log.txt for the React UI
const express = require('express');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/log', (req, res) => {
  const logPath = path.join(__dirname, 'llm_log.txt');
  if (fs.existsSync(logPath)) {
    const log = fs.readFileSync(logPath, 'utf8');
    res.json({ log });
  } else {
    res.json({ log: 'No log found.' });
  }
});

app.post('/api/run-question', (req, res) => {
  const { question } = req.body;
  
  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'Question is required' });
  }
  
  try {
    // Run the script with the custom question
    const command = `node daily_llm_push.js "${question.replace(/"/g, '\\"')}"`;
    execSync(command, { cwd: __dirname });
    
    res.json({ success: true, message: 'Question processed successfully' });
  } catch (error) {
    console.error('Error running custom question:', error.message);
    res.status(500).json({ error: 'Failed to process question: ' + error.message });
  }
});

app.use(express.static(path.join(__dirname, 'ui', 'build')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'ui', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
