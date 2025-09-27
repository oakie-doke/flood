// Demo data for flood risk assessment
// This file contains sample data for demonstration purposes

const DEMO_FLOOD_RISK_DATA = [
    // High-risk areas (coastal and low-lying regions)
    { lat: 29.7604, lng: -95.3698, risk: 'high', name: 'Houston, TX', elevation: 25, rainfall: 45 },
    { lat: 25.7617, lng: -80.1918, risk: 'high', name: 'Miami, FL', elevation: 2, rainfall: 38 },
    { lat: 30.2672, lng: -97.7431, risk: 'high', name: 'Austin, TX', elevation: 149, rainfall: 42 },
    { lat: 40.7128, lng: -74.0060, risk: 'high', name: 'New York, NY', elevation: 10, rainfall: 35 },
    { lat: 29.9511, lng: -90.0715, risk: 'high', name: 'New Orleans, LA', elevation: -2, rainfall: 48 },
    { lat: 33.7490, lng: -84.3880, risk: 'high', name: 'Atlanta, GA', elevation: 320, rainfall: 52 },
    
    // Medium-risk areas
    { lat: 39.9526, lng: -75.1652, risk: 'medium', name: 'Philadelphia, PA', elevation: 12, rainfall: 28 },
    { lat: 41.8781, lng: -87.6298, risk: 'medium', name: 'Chicago, IL', elevation: 179, rainfall: 32 },
    { lat: 34.0522, lng: -118.2437, risk: 'medium', name: 'Los Angeles, CA', elevation: 89, rainfall: 15 },
    { lat: 47.6062, lng: -122.3321, risk: 'medium', name: 'Seattle, WA', elevation: 56, rainfall: 25 },
    { lat: 39.7392, lng: -104.9903, risk: 'medium', name: 'Denver, CO', elevation: 1609, rainfall: 18 },
    
    // Low-risk areas (high elevation, low rainfall)
    { lat: 39.8283, lng: -98.5795, risk: 'low', name: 'Kansas City, KS', elevation: 265, rainfall: 12 },
    { lat: 44.9778, lng: -93.2650, risk: 'low', name: 'Minneapolis, MN', elevation: 264, rainfall: 8 },
    { lat: 40.7608, lng: -111.8910, risk: 'low', name: 'Salt Lake City, UT', elevation: 1288, rainfall: 5 },
    { lat: 35.4676, lng: -97.5164, risk: 'low', name: 'Oklahoma City, OK', elevation: 366, rainfall: 15 },
    { lat: 46.7296, lng: -94.6859, risk: 'low', name: 'Brainerd, MN', elevation: 371, rainfall: 6 }
];

const DEMO_SAFE_AREAS = [
    { lat: 40.0150, lng: -105.2705, name: 'Boulder, CO', elevation: 1655, risk: 'low' },
    { lat: 39.7392, lng: -104.9903, name: 'Denver, CO', elevation: 1609, risk: 'low' },
    { lat: 40.7608, lng: -111.8910, name: 'Salt Lake City, UT', elevation: 1288, risk: 'low' },
    { lat: 44.9778, lng: -93.2650, name: 'Minneapolis, MN', elevation: 264, risk: 'low' },
    { lat: 35.4676, lng: -97.5164, name: 'Oklahoma City, OK', elevation: 366, risk: 'low' }
];

const DEMO_TRAFFIC_CONDITIONS = {
    light: { color: '#10b981', description: 'Light traffic - normal travel times' },
    moderate: { color: '#f59e0b', description: 'Moderate traffic - slight delays expected' },
    heavy: { color: '#ef4444', description: 'Heavy traffic - significant delays expected' }
};

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEMO_FLOOD_RISK_DATA,
        DEMO_SAFE_AREAS,
        DEMO_TRAFFIC_CONDITIONS
    };
}
