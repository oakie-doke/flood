/**
 * Configuration file for Flood Risk Assessment & Evacuation Planner
 * 
 * This file contains API keys and configuration settings for the application.
 * Copy this file to config.local.js and add your actual API keys.
 * 
 * IMPORTANT: Never commit API keys to version control!
 */

const CONFIG = {
    // Google Maps API Key (for elevation data)
    // Get your key from: https://developers.google.com/maps/documentation/elevation/get-api-key
    GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY',
    
    // MapBox API Key (for elevation data)
    // Get your key from: https://www.mapbox.com/
    MAPBOX_API_KEY: 'YOUR_MAPBOX_API_KEY',
    
    // Elevation API Configuration
    ELEVATION: {
        // Cache duration in milliseconds (1 hour = 3600000)
        CACHE_DURATION: 3600000,
        
        // API timeout in milliseconds (10 seconds)
        API_TIMEOUT: 10000,
        
        // Retry attempts for failed API calls
        MAX_RETRIES: 2,
        
        // Enable/disable specific elevation sources
        ENABLE_USGS: true,
        ENABLE_OPEN_ELEVATION: true,
        ENABLE_GOOGLE: false, // Requires API key
        ENABLE_MAPBOX: false  // Requires API key
    },
    
    // Weather API Configuration
    WEATHER: {
        // NOAA API timeout in milliseconds
        API_TIMEOUT: 10000,
        
        // Retry attempts for failed API calls
        MAX_RETRIES: 2
    },
    
    // Map Configuration
    MAP: {
        // Default map center (United States)
        DEFAULT_CENTER: [39.8283, -98.5795],
        DEFAULT_ZOOM: 4,
        
        // Location search zoom level
        LOCATION_ZOOM: 10
    }
};

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
