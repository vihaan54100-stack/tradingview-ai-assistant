# TradingView AI Assistant 📈🤖

A powerful Chrome extension that analyzes TradingView charts using ChatGPT AI to provide intelligent trading recommendations, market insights, and portfolio analysis.

## Features

- 🤖 **AI-Powered Analysis**: Leverages ChatGPT to analyze charts and market conditions
- 📊 **Chart Analysis**: Automatically extracts data from TradingView charts including price, volume, and changes
- 💡 **Smart Recommendations**: Get clear BUY/SELL/PUT recommendations with detailed reasoning
- 📈 **Trend Detection**: Identifies bullish or bearish market trends
- 💬 **Chat Interface**: Easy-to-use chatbot interface for natural conversations
- ⚡ **Quick Actions**: One-click buttons for common analysis tasks
- 🎯 **Real-time Data**: Monitors TradingView pages and updates data automatically
- 🔒 **Secure**: Your API key is stored locally and never shared

## Installation

### Prerequisites

1. Google Chrome or any Chromium-based browser
2. An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Steps

1. **Download the Extension**
   - Clone or download this repository to your local machine
   - Or download as ZIP and extract

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `tradingview-ai-assistant` folder

3. **Configure API Key**
   - Click the extension icon in your Chrome toolbar
   - Click the "⚙️ Settings" button
   - Enter your OpenAI API key
   - Select your preferred model (GPT-3.5 Turbo recommended for cost-effectiveness)
   - Click "Save"

4. **Add Icons (Optional but Recommended)**
   - See `icons/ICONS_README.txt` for instructions
   - Create or download PNG icons in sizes: 16x16, 48x48, 128x128
   - Place them in the `icons/` folder

## Usage

1. **Open TradingView**
   - Navigate to [TradingView.com](https://www.tradingview.com/)
   - Open any chart you want to analyze

2. **Launch the Assistant**
   - Click the extension icon in your Chrome toolbar
   - You should see "✓ Connected" status if on a TradingView page

3. **Start Analyzing**
   - Use the quick action buttons:
     - 📊 **Analyze Chart**: Get comprehensive chart analysis
     - 💡 **Get Recommendation**: Receive BUY/SELL/PUT advice
     - 📈 **Check Trend**: Identify bullish or bearish trends
   - Or type your own questions like:
     - "Should I buy or sell right now?"
     - "What's the market sentiment for this stock?"
     - "Where should I place my stop loss?"
     - "Is this a good entry point?"

4. **Review Recommendations**
   - The AI will analyze the chart data and provide:
     - Clear action recommendation (BUY/SELL/PUT)
     - Market sentiment (Bullish/Bearish/Neutral)
     - Key price levels to watch
     - Risk management advice
     - Detailed reasoning for the recommendation

## How It Works

1. **Content Script** (`content.js`)
   - Automatically injected into TradingView pages
   - Extracts chart data including symbol, price, volume, and changes
   - Monitors page for real-time updates

2. **Popup Interface** (`popup.html`, `popup.js`)
   - Clean, user-friendly chat interface
   - Manages user interactions and displays AI responses
   - Shows connection status and current symbol

3. **Background Worker** (`background.js`)
   - Handles communication with OpenAI API
   - Processes trading data and formats prompts
   - Manages chat history and context

4. **AI Processing**
   - Sends chart data + your question to ChatGPT
   - Uses specialized trading analysis prompts
   - Returns actionable insights and recommendations

## Configuration

### Settings Options

- **API Key**: Your OpenAI API key (required)
- **Model**: Choose between GPT-3.5 Turbo, GPT-4, or GPT-4 Turbo
  - GPT-3.5 Turbo: Fast and cost-effective
  - GPT-4: More advanced analysis
  - GPT-4 Turbo: Best performance (higher cost)

### API Costs

Using this extension makes API calls to OpenAI. Approximate costs:
- GPT-3.5 Turbo: ~$0.002 per request
- GPT-4: ~$0.03-0.06 per request
- GPT-4 Turbo: ~$0.01-0.03 per request

## Privacy & Security

- ✅ All data processing happens locally or through OpenAI's API
- ✅ Your API key is stored only in Chrome's local storage
- ✅ No data is sent to third-party servers (except OpenAI)
- ✅ Chart data is only extracted when you use the extension
- ✅ No personal information is collected or stored

## Troubleshooting

### "Please open TradingView" Warning
- Make sure you're on a TradingView.com page
- The extension only works on TradingView domains

### "Reload TradingView page" Warning
- Refresh the TradingView page to load the content script
- Wait a few seconds for the page to fully load

### API Key Errors
- Verify your API key is correct in Settings
- Check that your OpenAI account has available credits
- Ensure your API key has permissions for chat completions

### No Chart Data
- Some TradingView pages may have different layouts
- Try opening a different chart or refreshing the page
- The extension works best on standard chart pages

## Development

### Project Structure
```
tradingview-ai-assistant/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for API calls
├── content.js            # TradingView page integration
├── popup.html            # User interface
├── popup.js              # UI logic and event handlers
├── styles.css            # Styling
├── icons/                # Extension icons
│   └── ICONS_README.txt
└── README.md             # Documentation
```

### Tech Stack
- **Manifest V3**: Latest Chrome extension standard
- **Vanilla JavaScript**: No external dependencies
- **OpenAI API**: GPT-3.5/GPT-4 for analysis
- **Chrome APIs**: Storage, Tabs, Runtime, Scripting

### Contributing

Contributions are welcome! Feel free to:
- Report bugs or issues
- Suggest new features
- Submit pull requests
- Improve documentation

## Disclaimer

⚠️ **Important**: This tool is for educational and informational purposes only.

- Not financial advice
- Trading involves risk - you can lose money
- Always do your own research (DYOR)
- Don't invest more than you can afford to lose
- AI analysis is not 100% accurate
- Past performance doesn't guarantee future results

The developers are not responsible for any trading losses or decisions made using this tool.

## License

MIT License - Feel free to use, modify, and distribute.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section

## Roadmap

Future enhancements:
- [ ] Support for multiple chart timeframes
- [ ] Historical performance tracking
- [ ] Custom trading strategies
- [ ] Portfolio analysis features
- [ ] Integration with trading platforms
- [ ] Voice commands
- [ ] Multi-language support

---

**Made with ❤️ for traders who want AI-powered insights**
