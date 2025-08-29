// This script calls the OpenRouter API, updates a file, commits, and pushes to GitHub.

require('dotenv').config();
const fs = require('fs');
const { execSync } = require('child_process');
const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // Set this in your environment
const GITHUB_EMAIL = process.env.GITHUB_EMAIL; // Set this in your environment
const GITHUB_NAME = process.env.GITHUB_NAME; // Set this in your environment

async function callOpenRouter() {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.3-8b-instruct:free',
  messages: [{ role: 'user', content: 'What are the latest updates to free models available on OpenRouter?' }],
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('OpenRouter API error:', error.message);
    return null;
  }
}

async function main() {
  const result = await callOpenRouter();
  const timestamp = new Date().toISOString();
  const log = `Last run: ${timestamp}\nOpenRouter result: ${JSON.stringify(result)}\n`;
  fs.writeFileSync('llm_log.txt', log);

  try {
    execSync('git config user.email "' + GITHUB_EMAIL + '"');
    execSync('git config user.name "' + GITHUB_NAME + '"');
    execSync('git add llm_log.txt');
    execSync('git commit -m "Daily update: ' + timestamp + '"');
    execSync('git push');
    console.log('Pushed to GitHub!');
  } catch (err) {
    console.error('Git error:', err.message);
  }
}

main();
