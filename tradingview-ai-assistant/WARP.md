# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TradingView AI Assistant is a **Chrome Extension (Manifest V3)** that integrates ChatGPT with TradingView charts to provide AI-powered trading analysis and recommendations. The extension uses vanilla JavaScript with no external dependencies or build tools.

## Architecture

### Core Components

**Three-part messaging architecture:**

1. **content.js** - Content script injected into TradingView pages
   - Extracts chart data (symbol, price, volume, changes) via DOM queries
   - Listens for messages from popup via `chrome.runtime.onMessage`
   - Polls for data changes every 2 seconds and caches to `chrome.storage.local`
   - Also attempts to extract portfolio data from trading pages

2. **popup.js/popup.html** - Extension popup UI
   - Chat interface for user interactions
   - Manages chat history and settings modal
   - Communicates with both content script (for chart data) and background worker (for AI processing)
   - Uses `chrome.tabs.sendMessage` to get data from content script
   - Uses `chrome.runtime.sendMessage` to send AI requests to background worker

3. **background.js** - Service worker
   - Handles OpenAI API calls via `chrome.runtime.onMessage` listener
   - Processes trading data and formats prompts with system context
   - Manages chat history (last 10 messages) and includes chart context in AI prompts
   - No direct DOM access or UI

### Message Flow

```
popup.js → content.js (getChartData)
popup.js → background.js (chat with chartData + message)
background.js → OpenAI API → response → popup.js
```

### Data Storage

Uses `chrome.storage.local` for:
- API key and model selection (settings)
- Chat history
- Latest chart data (cached by content script)

## Development Commands

### Loading the Extension

Since this is a Chrome extension with no build process:

```powershell
# 1. Open Chrome and navigate to chrome://extensions/
# 2. Enable "Developer mode" toggle
# 3. Click "Load unpacked" and select this directory
```

### Reloading After Changes

```powershell
# After modifying code:
# - Go to chrome://extensions/
# - Click the refresh icon on the extension card
# - For content script changes: also refresh the TradingView page
```

### Testing

No automated test framework exists. Manual testing workflow:
1. Load extension in Chrome
2. Navigate to https://www.tradingview.com/chart/
3. Open extension popup
4. Configure API key in settings
5. Test quick actions and chat functionality

## Key Constraints

### Chrome Extension Manifest V3 Requirements

- Service workers only (no background pages)
- All API calls must be in background worker
- Content scripts run in isolated context
- Must use message passing between components

### TradingView Integration

- DOM selectors are fragile and may break if TradingView updates their UI
- Key selectors in content.js:
  - `[data-name="legend-source-title"]` - symbol name
  - `[class*="lastPrice"]` - current price
  - `[class*="change"]` - price changes
  - URL pattern: `/chart/([^/]+)` for symbol extraction

### OpenAI API

- API key stored in local storage (not synced)
- Supports GPT-3.5-turbo, GPT-4, GPT-4-turbo-preview
- Max tokens: 1000 per response
- Temperature: 0.7
- System prompt in background.js defines trading assistant behavior

## File Structure

- `manifest.json` - Extension configuration, permissions, content script registration
- `background.js` - Service worker for API communication
- `content.js` - TradingView page data extraction
- `popup.html` - Chat interface structure
- `popup.js` - UI logic and message coordination
- `styles.css` - Complete styling (no CSS framework)
- `icons/` - Extension icons (16x16, 48x48, 128x128 PNG)

## Common Modifications

### Changing Data Extraction

Modify `extractChartData()` in `content.js` - update DOM selectors if TradingView UI changes.

### Modifying AI Behavior

Edit the `systemPrompt` in `background.js` `handleChatRequest()` function - controls AI personality and response format.

### Adding Quick Actions

1. Add button in `popup.html` quick-actions section with `data-action` attribute
2. Add message template in `popup.js` `handleQuickAction()` function
3. No changes needed in background.js

### Changing API Parameters

Modify `callOpenAI()` in `background.js` - temperature, max_tokens, model selection.

## Important Notes

- No build process, bundler, or package manager required
- All code is vanilla JavaScript
- Chrome APIs used: storage, tabs, runtime, scripting
- Extension only works on TradingView.com domains (host permissions)
- API keys are never synced or transmitted except to OpenAI
