// Background service worker for Chrome extension
console.log('TradingView AI Assistant: Background script loaded');

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'chat') {
    handleChatRequest(request)
      .then(response => sendResponse(response))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
});

// Handle chat requests with AI
async function handleChatRequest(request) {
  try {
    const { message, chartData, chatHistory } = request;
    
    // Get API key and model from storage
    const settings = await chrome.storage.local.get(['apiKey', 'model']);
    
    if (!settings.apiKey) {
      return {
        success: false,
        error: 'No API key found. Please set your OpenAI API key in settings.'
      };
    }

    // Prepare the system prompt for trading analysis
    const systemPrompt = `You are an expert trading assistant specializing in technical analysis and market insights. 
Your role is to:
- Analyze chart patterns and price movements
- Provide clear BUY, SELL, or PUT recommendations with reasoning
- Identify bullish or bearish market trends
- Suggest which markets or instruments to trade
- Analyze portfolio performance and profit/loss changes
- Explain trading strategies in simple, easy-to-understand terms

Always provide:
1. Clear recommendations (BUY/SELL/PUT)
2. Market sentiment (Bullish/Bearish/Neutral)
3. Key levels to watch (support/resistance)
4. Risk management advice
5. Reasoning based on technical analysis

Be concise but thorough. Use professional yet accessible language.`;

    // Build the context from chart data
    let contextMessage = '';
    if (chartData && chartData.symbol) {
      contextMessage = `Current Chart Data:
- Symbol: ${chartData.symbol}
- Current Price: ${chartData.price || 'N/A'}
- Change: ${chartData.change || 'N/A'} (${chartData.changePercent || 'N/A'})
- Volume: ${chartData.volume || 'N/A'}
- Timestamp: ${chartData.timestamp || 'N/A'}

`;
    }

    // Build messages array for API
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add relevant chat history (limit to last 10 messages)
    if (chatHistory && chatHistory.length > 0) {
      const recentHistory = chatHistory.slice(-10);
      messages.push(...recentHistory);
    }

    // Add current message with context
    messages.push({
      role: 'user',
      content: contextMessage + message
    });

    // Call OpenAI API
    const model = settings.model || 'gpt-4o-mini';
    const apiResponse = await callOpenAI(settings.apiKey, model, messages);

    return {
      success: true,
      message: apiResponse
    };
  } catch (error) {
    console.error('Chat request failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Call OpenAI API
async function callOpenAI(apiKey, model, messages) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Extension installation/update handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('TradingView AI Assistant installed');
    // Open welcome page or settings
    chrome.storage.local.set({
      installed: true,
      installDate: new Date().toISOString()
    });
  } else if (details.reason === 'update') {
    console.log('TradingView AI Assistant updated');
  }
});
