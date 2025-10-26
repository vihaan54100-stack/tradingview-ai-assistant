// Content script for TradingView page integration
console.log('TradingView AI Assistant: Content script loaded');

// Function to extract chart data from TradingView
function extractChartData() {
  try {
    const data = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      symbol: null,
      price: null,
      change: null,
      changePercent: null,
      volume: null,
      chartType: null
    };

    // Extract symbol from URL or page
    const urlMatch = window.location.pathname.match(/\/chart\/([^\/]+)/);
    if (urlMatch) {
      data.symbol = urlMatch[1];
    }

    // Try to extract symbol from page elements
    const symbolElement = document.querySelector('[data-name="legend-source-title"]') ||
                          document.querySelector('.tv-symbol-header__symbol') ||
                          document.querySelector('[class*="symbol"]');
    if (symbolElement && symbolElement.textContent) {
      data.symbol = data.symbol || symbolElement.textContent.trim();
    }

    // Extract price information
    const priceElement = document.querySelector('[class*="lastPrice"]') ||
                        document.querySelector('[class*="price-value"]');
    if (priceElement) {
      data.price = priceElement.textContent.trim();
    }

    // Extract change information
    const changeElements = document.querySelectorAll('[class*="change"]');
    changeElements.forEach(el => {
      const text = el.textContent.trim();
      if (text.includes('%')) {
        data.changePercent = text;
      } else if (text.includes('+') || text.includes('−') || text.includes('-')) {
        data.change = text;
      }
    });

    // Extract volume if available
    const volumeElement = document.querySelector('[class*="volume"]');
    if (volumeElement) {
      data.volume = volumeElement.textContent.trim();
    }

    return data;
  } catch (error) {
    console.error('Error extracting chart data:', error);
    return null;
  }
}

// Function to extract portfolio data if on portfolio page
function extractPortfolioData() {
  try {
    const holdings = [];
    const rows = document.querySelectorAll('[class*="row"], tr[data-rowkey]');
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td, [class*="cell"]');
      if (cells.length > 0) {
        const holding = {
          symbol: null,
          quantity: null,
          price: null,
          value: null,
          change: null
        };
        
        // Extract data from cells (structure varies)
        cells.forEach(cell => {
          const text = cell.textContent.trim();
          if (text.match(/^[A-Z]{1,5}$/)) {
            holding.symbol = text;
          }
        });
        
        if (holding.symbol) {
          holdings.push(holding);
        }
      }
    });

    return holdings.length > 0 ? holdings : null;
  } catch (error) {
    console.error('Error extracting portfolio data:', error);
    return null;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getChartData') {
    const chartData = extractChartData();
    const portfolioData = extractPortfolioData();
    
    sendResponse({
      success: true,
      chartData: chartData,
      portfolioData: portfolioData,
      pageUrl: window.location.href
    });
  } else if (request.action === 'ping') {
    sendResponse({ success: true, message: 'Content script is active' });
  }
  
  return true; // Keep message channel open for async response
});

// Monitor for changes and cache data
let lastData = null;
setInterval(() => {
  const currentData = extractChartData();
  if (JSON.stringify(currentData) !== JSON.stringify(lastData)) {
    lastData = currentData;
    // Store in chrome.storage for quick access
    chrome.storage.local.set({ latestChartData: currentData });
  }
}, 2000); // Check every 2 seconds
