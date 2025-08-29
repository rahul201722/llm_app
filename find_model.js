require('dotenv').config();

async function findWorkingModel() {
  try {
    // Get list of models
    const modelsResponse = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}` }
    });
    
    const modelsData = await modelsResponse.json();
    const freeModels = modelsData.data.filter(model => 
      (model.pricing?.completion === '0' || model.id.includes(':free')) &&
      !model.id.includes('image') && // Exclude image models
      !model.id.includes('vision') // Exclude vision models
    );
    
    console.log('Testing free text models...');
    
    for (const model of freeModels.slice(0, 5)) { // Test first 5
      try {
        console.log(`Testing model: ${model.id}`);
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": "http://localhost:3001",
            "X-Title": "LLM Daily App",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": model.id,
            "messages": [{ "role": "user", "content": "Hello!" }],
            "max_tokens": 50
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS with ${model.id}`);
          console.log('Response:', data.choices?.[0]?.message?.content || 'No content');
          break;
        } else {
          console.log(`❌ Failed with ${model.id}: ${response.status}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`❌ Error with ${model.id}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Failed to test models:', error.message);
  }
}

findWorkingModel();
