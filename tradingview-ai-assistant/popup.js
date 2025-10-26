// Popup script for chat interface
let chatHistory = [];
let currentChartData = null;

// DOM elements
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const settingsButton = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');
const saveSettingsButton = document.getElementById('save-settings');
const cancelSettingsButton = document.getElementById('cancel-settings');
const apiKeyInput = document.getElementById('api-key');
const modelSelect = document.getElementById('model-select');
const statusText = document.getElementById('status-text');
const currentSymbol = document.getElementById('current-symbol');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await checkTradingViewConnection();
  await loadChatHistory();
  setupEventListeners();
});

// Load settings from storage
async function loadSettings() {
  const settings = await chrome.storage.local.get(['apiKey', 'model']);
  if (settings.apiKey) {
    apiKeyInput.value = settings.apiKey;
  }
  if (settings.model) {
    modelSelect.value = settings.model;
  }
}

// Check connection to TradingView
async function checkTradingViewConnection() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('tradingview.com')) {
      updateStatus('⚠️ Please open TradingView', 'warning');
      return;
    }

    // Try to get chart data
    chrome.tabs.sendMessage(tab.id, { action: 'getChartData' }, (response) => {
      if (chrome.runtime.lastError) {
        updateStatus('⚠️ Reload TradingView page', 'warning');
        return;
      }
      
      if (response && response.success) {
        currentChartData = response.chartData;
        updateStatus('✓ Connected', 'connected');
        
        if (currentChartData && currentChartData.symbol) {
          currentSymbol.textContent = `${currentChartData.symbol} - ${currentChartData.price || 'Loading...'}`;
        }
      }
    });
  } catch (error) {
    console.error('Connection check failed:', error);
    updateStatus('⚠️ Connection failed', 'error');
  }
}

// Update status indicator
function updateStatus(text, status) {
  statusText.textContent = text;
  const indicator = document.getElementById('connection-status');
  indicator.className = `status-indicator status-${status}`;
}

// Setup event listeners
function setupEventListeners() {
  sendButton.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Quick action buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      handleQuickAction(action);
    });
  });

  // Settings modal
  settingsButton.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
  });

  cancelSettingsButton.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  saveSettingsButton.addEventListener('click', saveSettings);
}

// Handle quick actions
function handleQuickAction(action) {
  const messages = {
    analyze: 'Analyze the current chart and provide insights on the price action.',
    recommend: 'Based on the current chart, should I buy, sell, or place a put? Give me a clear recommendation.',
    trend: 'Is this market showing bullish or bearish trends? What should I watch for?'
  };

  userInput.value = messages[action];
  sendMessage();
}

// Send message
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Add user message to chat
  addMessageToChat('user', message);
  userInput.value = '';

  // Show loading
  const loadingId = addMessageToChat('assistant', 'Analyzing...', true);

  try {
    // Get latest chart data
    await refreshChartData();

    // Send to background script for AI processing
    const response = await chrome.runtime.sendMessage({
      action: 'chat',
      message: message,
      chartData: currentChartData,
      chatHistory: chatHistory
    });

    // Remove loading message
    removeMessage(loadingId);

    if (response.success) {
      addMessageToChat('assistant', response.message);
      chatHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: response.message }
      );
      saveChatHistory();
    } else {
      addMessageToChat('assistant', `Error: ${response.error || 'Failed to get response. Please check your API key in settings.'}`);
    }
  } catch (error) {
    removeMessage(loadingId);
    addMessageToChat('assistant', `Error: ${error.message}`);
  }
}

// Refresh chart data from content script
async function refreshChartData() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url.includes('tradingview.com')) {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getChartData' });
      if (response && response.success) {
        currentChartData = response.chartData;
      }
    }
  } catch (error) {
    console.error('Failed to refresh chart data:', error);
  }
}

// Add message to chat
function addMessageToChat(role, content, isLoading = false) {
  const messageId = `msg-${Date.now()}`;
  const messageDiv = document.createElement('div');
  messageDiv.id = messageId;
  messageDiv.className = `message ${role}-message ${isLoading ? 'loading' : ''}`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.textContent = content;
  
  messageDiv.appendChild(contentDiv);
  chatContainer.appendChild(messageDiv);
  
  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
  
  return messageId;
}

// Remove message
function removeMessage(messageId) {
  const message = document.getElementById(messageId);
  if (message) {
    message.remove();
  }
}

// Save settings
async function saveSettings() {
  const apiKey = apiKeyInput.value.trim();
  const model = modelSelect.value;

  if (!apiKey) {
    alert('Please enter an API key');
    return;
  }

  await chrome.storage.local.set({ apiKey, model });
  settingsModal.classList.add('hidden');
  alert('Settings saved successfully!');
}

// Load chat history
async function loadChatHistory() {
  const data = await chrome.storage.local.get(['chatHistory']);
  if (data.chatHistory) {
    chatHistory = data.chatHistory;
    // Optionally restore messages to UI
  }
}

// Save chat history
async function saveChatHistory() {
  await chrome.storage.local.set({ chatHistory });
}
