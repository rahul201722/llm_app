// This script calls the OpenRouter API, updates a file, commits, and pushes to GitHub.

require('dotenv').config();
const fs = require('fs');
const { execSync } = require('child_process');
const OpenAI = require('openai');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // Set this in your environment
const GITHUB_EMAIL = process.env.GITHUB_EMAIL; // Set this in your environment
const GITHUB_NAME = process.env.GITHUB_NAME; // Set this in your environment

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3001",
    "X-Title": "LLM Daily App",
  },
});

async function callOpenRouter() {
  try {
    // Check if a custom question is provided as command line argument
    const customQuestion = process.argv[2];
    let todaysQuestion;
    
    if (customQuestion) {
      todaysQuestion = customQuestion;
      console.log('Using custom question:', todaysQuestion);
    } else {
      // Load questions from external file
      let questions;
      try {
        const questionsData = fs.readFileSync('questions.json', 'utf8');
        questions = JSON.parse(questionsData);
      } catch (err) {
        // Fallback to default questions if file doesn't exist
        questions = [
          "Explain quantum entanglement in simple terms and give a real-world analogy that anyone can understand.",
          "If you could travel at the speed of light, how would time dilation affect your journey to the nearest star? Calculate with examples.",
          "Design a simple algorithm to solve the Tower of Hanoi puzzle with 4 disks. Show the steps.",
          "Explain how blockchain technology works and why it's considered secure. Use a pizza delivery analogy.",
          "Calculate the escape velocity needed to leave Earth's gravity and explain the physics behind it.",
          "If I flip a coin 100 times, what's the probability of getting exactly 60 heads? Show the mathematical reasoning.",
          "Explain machine learning in cooking terms - how would you 'train' a recipe to be perfect?",
          "Calculate how much energy the sun produces in one second and compare it to human energy consumption.",
          "Design a simple compression algorithm and explain how it reduces file sizes.",
          "If Earth suddenly stopped rotating, what would happen to the weather, oceans, and life? Be scientific but engaging."
        ];
      }
      
      // Generate a different interesting question each day
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      
      todaysQuestion = questions[dayOfYear % questions.length];
      console.log(`Today's question (day ${dayOfYear % questions.length + 1}):`, todaysQuestion);
    }
    
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3.1:free",
      messages: [
        {
          "role": "user",
          "content": todaysQuestion
        }
      ],
    });
    
    return completion;
  } catch (error) {
    console.error('OpenRouter API error:', error.message);
    
    // Try to get model list as fallback
    try {
      const models = await openai.models.list();
      const freeModels = models.data.filter(model => model.id.includes(':free'));
      const freeModelsList = freeModels.slice(0, 10).map(m => m.id).join(', ');
      
      return { 
        choices: [{ 
          message: { 
            content: `Daily update: ${new Date().toDateString()}\n\nOpenRouter currently has ${models.data.length} total models available.\n\nSome free models include: ${freeModelsList}\n\nFor complete list visit: https://openrouter.ai/models` 
          } 
        }],
        model_count: models.data.length,
        free_model_count: freeModels.length,
        timestamp: new Date().toISOString() 
      };
    } catch (fallbackError) {
      return { 
        choices: [{ 
          message: { 
            content: `Daily update: ${new Date().toDateString()} - Check https://openrouter.ai for the latest model updates and announcements.` 
          } 
        }],
        error: error.message, 
        timestamp: new Date().toISOString() 
      };
    }
  }
}async function main() {
  const result = await callOpenRouter();
  const timestamp = new Date().toISOString();
  const log = `Last run: ${timestamp}\nOpenRouter result: ${JSON.stringify(result)}\n`;
  fs.writeFileSync('llm_log.txt', log);

  try {
    execSync('git config user.email "' + GITHUB_EMAIL + '"');
    execSync('git config user.name "' + GITHUB_NAME + '"');
    execSync('git add llm_log.txt');
    execSync('git commit -m "Daily interesting updates: ' + timestamp + '"');
    execSync('git push');
    console.log('Pushed to GitHub!');
  } catch (err) {
    console.error('Git error:', err.message);
  }
}

main();
