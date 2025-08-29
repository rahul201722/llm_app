// Minimal Express server to serve llm_log.txt for the React UI
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/api/log', (req, res) => {
  const logPath = path.join(__dirname, 'llm_log.txt');
  if (fs.existsSync(logPath)) {
    const log = fs.readFileSync(logPath, 'utf8');
    res.json({ log });
  } else {
    res.json({ log: 'No log found.' });
  }
});

app.use(express.static(path.join(__dirname, 'ui', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'ui', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
