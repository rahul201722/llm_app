require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3001",
    "X-Title": "LLM Daily App",
  },
});

async function testOpenAISDK() {
  try {
    console.log('Testing with OpenAI SDK...');
    
    // Try a simple model first
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello!" }],
      max_tokens: 50
    });
    
    console.log('Success!');
    console.log('Response:', completion.choices[0].message.content);
    
  } catch (error) {
    console.log('Error:', error.message);
    console.log('Status:', error.status);
    
    // If that fails, try to list models
    try {
      console.log('\nTrying to list models...');
      const models = await openai.models.list();
      console.log('Models available:', models.data.length);
    } catch (modelError) {
      console.log('Model list error:', modelError.message);
    }
  }
}

testOpenAISDK();
