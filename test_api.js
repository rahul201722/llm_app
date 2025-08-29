require('dotenv').config();

async function testAPI() {
  try {
    console.log('Testing OpenRouter API...');
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Available models count:', data.data?.length || 'Unknown');
      
      // Find free models
      const freeModels = data.data?.filter(model => model.pricing?.completion === '0' || model.id.includes(':free')) || [];
      console.log('Free models found:', freeModels.length);
      if (freeModels.length > 0) {
        console.log('Example free model:', freeModels[0].id);
      }
    } else {
      const error = await response.text();
      console.log('Error response:', error);
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAPI();
