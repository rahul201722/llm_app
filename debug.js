require('dotenv').config();
console.log('API Key:', process.env.OPENROUTER_API_KEY ? 'Found' : 'Missing');
console.log('Email:', process.env.GITHUB_EMAIL);
console.log('Name:', process.env.GITHUB_NAME);

const axios = require('axios');

async function testOpenRouter() {
  try {
    console.log('Making API call...');
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [{ role: 'user', content: 'Hello!' }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'LLM Daily App'
        },
      }
    );
    console.log('Success!', response.data);
  } catch (error) {
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }
}

testOpenRouter();
