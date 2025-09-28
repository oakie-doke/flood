# Elevation Data API Setup Guide

This guide explains how to set up and configure the robust elevation data system for the Flood Risk Assessment & Evacuation Planner.

## 🎯 Overview

The application now uses multiple elevation data sources with intelligent fallbacks to ensure accurate elevation data for flood risk assessment:

1. **USGS National Map API** (Primary - Free, High Accuracy)
2. **OpenElevation API** (Secondary - Free, Medium Accuracy)  
3. **Google Elevation API** (Optional - Requires API Key, High Accuracy)
4. **MapBox Elevation API** (Optional - Requires API Key, High Accuracy)

## 🚀 Quick Start

The application works out of the box with the free APIs (USGS and OpenElevation). No setup required!

## 🔧 Advanced Configuration

### 1. API Key Setup

To enable Google Maps or MapBox elevation data:

1. **Copy the config file:**
   ```bash
   cp config.js config.local.js
   ```

2. **Get API Keys:**
   - **Google Maps**: https://developers.google.com/maps/documentation/elevation/get-api-key
   - **MapBox**: https://www.mapbox.com/

3. **Update config.local.js:**
   ```javascript
   const CONFIG = {
       GOOGLE_MAPS_API_KEY: 'your-actual-google-api-key',
       MAPBOX_API_KEY: 'your-actual-mapbox-api-key',
       // ... other settings
   };
   ```

4. **Update HTML to use local config:**
   ```html
   <script src="config.local.js"></script>
   <script src="app.js"></script>
   ```

### 2. Configuration Options

```javascript
const CONFIG = {
    // Elevation API Configuration
    ELEVATION: {
        // Cache duration in milliseconds (1 hour = 3600000)
        CACHE_DURATION: 3600000,
        
        // API timeout in milliseconds (10 seconds)
        API_TIMEOUT: 10000,
        
        // Retry attempts for failed API calls
        MAX_RETRIES: 2,
        
        // Enable/disable specific elevation sources
        ENABLE_USGS: true,           // Free, high accuracy
        ENABLE_OPEN_ELEVATION: true,  // Free, medium accuracy
        ENABLE_GOOGLE: false,         // Requires API key
        ENABLE_MAPBOX: false          // Requires API key
    }
};
```

## 📊 Data Sources Comparison

| Source | Cost | Accuracy | Coverage | Speed | Notes |
|--------|------|----------|----------|-------|-------|
| **USGS** | Free | High | US Only | Fast | Government data, most reliable |
| **OpenElevation** | Free | Medium | Global | Medium | Community maintained |
| **Google** | Paid | High | Global | Fast | Requires API key, rate limits |
| **MapBox** | Paid | High | Global | Fast | Requires API key, rate limits |

## 🔄 How It Works

1. **Cache Check**: First checks if elevation data is cached and still valid
2. **API Fallback Chain**: Tries APIs in order of preference:
   - USGS (if enabled)
   - OpenElevation (if enabled)  
   - Google (if enabled and API key configured)
   - MapBox (if enabled and API key configured)
3. **Simulated Data**: If all APIs fail, uses realistic simulated data
4. **Caching**: Successful results are cached to avoid repeated API calls

## 🎨 User Interface

The status bar now shows:
- **Elevation**: Actual elevation value in meters
- **Data Source**: Which API provided the data (e.g., "USGS (high)")
- **Accuracy Level**: Data quality indicator (high/medium/low)

## 🛠 Troubleshooting

### Common Issues

1. **"All elevation APIs failed"**
   - Check internet connection
   - Verify API keys are correct (if using paid services)
   - Check browser console for specific error messages

2. **"API key not configured"**
   - Ensure API keys are properly set in config file
   - Check that config file is loaded before app.js

3. **Slow elevation loading**
   - Enable caching (default: 1 hour)
   - Consider using faster APIs (Google/MapBox)
   - Check network connection

### Debug Mode

Enable debug logging by opening browser console. You'll see:
- Which APIs are being tried
- Success/failure messages
- Cache hit/miss information
- Data source and accuracy details

## 🔒 Security Notes

- **Never commit API keys to version control**
- Use `config.local.js` for local development
- Add `config.local.js` to `.gitignore`
- Consider using environment variables for production

## 📈 Performance Tips

1. **Enable Caching**: Reduces API calls for repeated locations
2. **Use Free APIs First**: USGS and OpenElevation are fast and reliable
3. **Configure Timeouts**: Adjust based on your network conditions
4. **Monitor Usage**: Track API usage if using paid services

## 🌍 Global Coverage

- **USGS**: United States only (most accurate for US locations)
- **OpenElevation**: Global coverage (good for international locations)
- **Google/MapBox**: Global coverage (best for international locations)

For international users, consider enabling OpenElevation or paid APIs for better coverage outside the US.

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API keys are correct
3. Test with different locations
4. Check the network tab for failed requests

The system is designed to gracefully handle failures and always provide some elevation data, even if it's simulated.
