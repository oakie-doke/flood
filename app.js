/**
 * Flood Risk Assessment & Evacuation Planner
 * 
 * This application provides real-time flood risk assessment and evacuation planning
 * for users in the United States. It integrates multiple data sources including
 * USGS elevation data, NOAA weather data, and FEMA flood risk information to
 * help users make informed decisions during flood emergencies.
 * 
 * Key Features:
 * - Real-time location-based flood risk assessment
 * - Interactive map with multiple data layers
 * - Safe area identification and evacuation route planning
 * - Integration with government APIs for accurate data
 * 
 * @author HackGT Team
 * @version 1.0.0
 */
class FloodRiskApp {
    /**
     * Initialize the Flood Risk Assessment application
     * Sets up core properties and initializes the application
     */
    constructor() {
        // Core map instance for displaying geographic data
        this.map = null;
        
        // User's current or selected location coordinates
        this.userLocation = null;
        
        // Array of flood risk data points loaded from external sources
        this.floodRiskData = [];
        
        // Identified safe areas for evacuation planning
        this.safeAreas = [];
        
        // Calculated evacuation routes from user location to safe areas
        this.evacuationRoutes = [];
        
        // Current assessed risk level for the user's location
        this.currentRiskLevel = 'unknown';
        
        // Current risk score for display
        this.currentRiskScore = null;
        
        // Safer location data for directions
        this.saferLocation = null;
        
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application by setting up the map, event listeners, and loading initial data
     * This is the main entry point after constructor
     */
    async init() {
        this.initializeMap();
        this.setupEventListeners();
        await this.loadInitialData();
    }

    /**
     * Initialize the Leaflet map with base layers and controls
     * Sets up both street map and satellite imagery options
     */
    initializeMap() {
        // Initialize Leaflet map centered on the United States
        // Coordinates: 39.8283°N, 98.5795°W (geographic center of the US)
        // Zoom level 4 provides a good overview of the entire country
        this.map = L.map('map', {
            center: [39.8283, -98.5795],
            zoom: 4,
            zoomControl: false,   // Enable zoom controls (+ and - buttons)
        });
        
        // Add OpenStreetMap tiles as the default base layer
        // This provides detailed street-level mapping data
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    }

    /**
     * Set up all event listeners for user interactions
     * Handles location input, risk assessment controls, and evacuation planning
     */
    setupEventListeners() {
        // Location input event listeners
        // Get current location using browser's geolocation API
        document.getElementById('getLocationBtn').addEventListener('click', () => {
            this.getCurrentLocation();
        });

        // Search for location using the search button
        document.getElementById('searchLocationBtn').addEventListener('click', () => {
            this.searchLocation();
        });

        // Handle Enter key press in location input field
        document.getElementById('locationInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchLocation();
            }
        });

        // Risk assessment control event listeners
        // Toggle elevation data display on/off
        document.getElementById('showElevation').addEventListener('change', (e) => {
            this.toggleElevationData(e.target.checked);
        });

        // Toggle rainfall data display on/off
        document.getElementById('showRainfall').addEventListener('change', (e) => {
            this.toggleRainfallData(e.target.checked);
        });

        // Toggle flood risk data display on/off
        document.getElementById('showFloodRisk').addEventListener('change', (e) => {
            this.toggleFloodRiskData(e.target.checked);
        });

        // Note: Get Directions button event listener will be attached when safer city is displayed

    }


    /**
     * Load initial application data and set up the interface
     * This includes flood risk data and initial UI updates
     */
    async loadInitialData() {
        this.showLoading(true);
        
        try {
            // Load sample flood risk data for demonstration purposes
            // In production, this would load real-time data from FEMA
            await this.loadFloodRiskData();
            // Note: updateRiskDisplay() will be called after risk assessment is performed
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load flood risk data');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Get the user's current location using the browser's geolocation API
     * Updates the map view and assesses flood risk for the location
     */
    async getCurrentLocation() {
        // Check if geolocation is supported by the browser
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            return;
        }

        this.showLoading(true);
        
        // Request current position with success and error callbacks
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                // Extract coordinates from the position object
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Store user location and update map view
                this.userLocation = { lat, lng };
                this.map.setView([lat, lng], 10); // Zoom level 10 for city-level detail
                
                // Add a custom marker for the user's location
                L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'user-marker',
                        html: '<div style="background: #3b82f6; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px;"></div>',
                        iconSize: [20, 20]
                    })
                }).addTo(this.map).bindPopup('Your Location');

                // Assess flood risk for the current location
                await this.assessLocationRisk(lat, lng);
                this.showSuccess('Location set successfully');
                this.showLoading(false);
            },
            (error) => {
                // Handle geolocation errors
                this.showError('Unable to retrieve your location');
                this.showLoading(false);
            }
        );
    }

    /**
     * Search for a location using the Nominatim geocoding service
     * Allows users to search for any location by name or address
     * 
     * @param {string} query - The location search query
     */
    async searchLocation() {
        const query = document.getElementById('locationInput').value;
        if (!query.trim()) return;

        this.showLoading(true);
        
        try {
            // Use Nominatim for geocoding (free OpenStreetMap service)
            // Restrict search to US locations for better accuracy
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=us`);
            const data = await response.json();
            
            if (data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lng = parseFloat(result.lon);
                
                // Update user location and map view
                this.userLocation = { lat, lng };
                this.map.setView([lat, lng], 10);
                
                // Add location marker with display name
                L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'user-marker',
                        html: '<div style="background: #3b82f6; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px;"></div>',
                        iconSize: [20, 20]
                    })
                }).addTo(this.map).bindPopup(result.display_name);

                // Assess flood risk for the searched location
                await this.assessLocationRisk(lat, lng);
                this.showSuccess('Location found and risk assessed');
            } else {
                this.showError('Location not found');
            }
        } catch (error) {
            this.showError('Error searching for location');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Assess flood risk for a given location
     * Combines elevation and rainfall data to determine risk level
     * 
     * @param {number} lat - Latitude coordinate
     * @param {number} lng - Longitude coordinate
     */
    async assessLocationRisk(lat, lng) {
        try {
            console.log(`🚀 DEBUG: Starting location risk assessment for coordinates: ${lat}, ${lng}`);
            
            // Get elevation data from multiple reliable APIs
            // Higher elevation generally means lower flood risk
            const elevationData = await this.getElevationData(lat, lng);
            
            // Get rainfall data from NOAA API
            // Higher rainfall increases flood risk
            console.log(`🌊 DEBUG: Starting rainfall data request for location: ${lat}, ${lng}`);
            const rainfall = await this.getRainfallData(lat, lng);
            console.log(`📈 DEBUG: Received rainfall data: ${rainfall}mm`);
            
            // Calculate overall flood risk based on elevation, rainfall, and proximity to water
            const riskData = await this.calculateFloodRisk(elevationData.elevation, rainfall, lat, lng);
            
            // Update the status bar with current data
            document.getElementById('elevationValue').textContent = `${elevationData.elevation}m`;
            document.getElementById('rainfallValue').textContent = `${rainfall}mm`;
            
            // Store elevation data source for reference
            this.currentElevationSource = elevationData.source;
            this.currentElevationAccuracy = elevationData.accuracy;
            
            // Store the risk data
            this.currentRiskLevel = riskData.level;
            this.currentRiskScore = riskData.score;
            console.log(`📊 DEBUG: Risk level set to: "${riskData.level}", Score: ${riskData.score.toFixed(2)}`);
            
            // Update the risk display
            this.updateRiskDisplay();
            
            // Add a risk marker to the map
            this.addRiskMarker(lat, lng, riskData.level);
            
        } catch (error) {
            console.error('Error assessing location risk:', error);
        }
    }

    /**
     * Get elevation data for a specific location using multiple reliable APIs
     * Tries multiple sources in order of reliability and accuracy
     * 
     * @param {number} lat - Latitude coordinate
     * @param {number} lng - Longitude coordinate
     * @returns {Promise<Object>} Object containing elevation and data source
     */
    async getElevationData(lat, lng) {
        // Check cache first
        const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        const cached = this.getCachedElevation(cacheKey);
        if (cached) {
            return cached;
        }

        // Try multiple elevation APIs in order of preference
        const elevationSources = [];
        
        // Add enabled elevation sources based on configuration
        if (window.CONFIG && window.CONFIG.ELEVATION.ENABLE_USGS) {
            elevationSources.push(() => this.getUSGSElevation(lat, lng));
        }
        if (window.CONFIG && window.CONFIG.ELEVATION.ENABLE_OPEN_ELEVATION) {
            elevationSources.push(() => this.getOpenElevationData(lat, lng));
        }
        if (window.CONFIG && window.CONFIG.ELEVATION.ENABLE_GOOGLE) {
            elevationSources.push(() => this.getGoogleElevation(lat, lng));
        }
        if (window.CONFIG && window.CONFIG.ELEVATION.ENABLE_MAPBOX) {
            elevationSources.push(() => this.getMapBoxElevation(lat, lng));
        }
        
        // Fallback to default sources if no config is available
        if (elevationSources.length === 0) {
            elevationSources.push(
                () => this.getUSGSElevation(lat, lng),
                () => this.getOpenElevationData(lat, lng)
            );
        }

        for (const source of elevationSources) {
            try {
                const result = await source();
                if (result && result.elevation !== null) {
                    // Cache the result
                    this.cacheElevation(cacheKey, result);
                    return result;
                }
            } catch (error) {
                console.warn('Elevation API failed:', error.message);
                continue;
            }
        }

        // If all APIs fail, use simulated data
        console.warn('All elevation APIs failed, using simulated data');
        const simulatedResult = {
            elevation: this.getSimulatedElevation(lat, lng),
            source: 'simulated',
            accuracy: 'low'
        };
        this.cacheElevation(cacheKey, simulatedResult);
        return simulatedResult;
    }

    /**
     * Get elevation data from USGS National Map API
     * 
     * @param {number} lat - Latitude coordinate
     * @param {number} lng - Longitude coordinate
     * @returns {Promise<Object>} Elevation data object
     */
    async getUSGSElevation(lat, lng) {
        const response = await fetch(
            `https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/identify?f=json&geometry=${lng},${lat}&geometryType=esriGeometryPoint&returnGeometry=false&imageDisplay=500,500,96&sr=4326`
        );
        
        if (!response.ok) {
            throw new Error('USGS API request failed');
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            return {
                elevation: Math.round(data.results[0].attributes.VALUE),
                source: 'USGS',
                accuracy: 'high'
            };
        }
        
        throw new Error('No elevation data from USGS');
    }

    /**
     * Get elevation data from OpenElevation API (free, no API key required)
     * 
     * @param {number} lat - Latitude coordinate
     * @param {number} lng - Longitude coordinate
     * @returns {Promise<Object>} Elevation data object
     */
    async getOpenElevationData(lat, lng) {
        const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                locations: [{ latitude: lat, longitude: lng }]
            })
        });
        
        if (!response.ok) {
            throw new Error('OpenElevation API request failed');
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0 && data.results[0].elevation !== null) {
            return {
                elevation: Math.round(data.results[0].elevation),
                source: 'OpenElevation',
                accuracy: 'medium'
            };
        }
        
        throw new Error('No elevation data from OpenElevation');
    }

    /**
     * Get elevation data from Google Elevation API (requires API key)
     * 
     * @param {number} lat - Latitude coordinate
     * @param {number} lng - Longitude coordinate
     * @returns {Promise<Object>} Elevation data object
     */
    async getGoogleElevation(lat, lng) {
        // Note: This requires a Google Maps API key
        const apiKey = window.CONFIG ? window.CONFIG.GOOGLE_MAPS_API_KEY : 'YOUR_GOOGLE_MAPS_API_KEY';
        
        if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
            throw new Error('Google API key not configured');
        }
        
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lng}&key=${apiKey}`
        );
        
        if (!response.ok) {
            throw new Error('Google Elevation API request failed');
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0 && data.results[0].elevation !== null) {
            return {
                elevation: Math.round(data.results[0].elevation),
                source: 'Google',
                accuracy: 'high'
            };
        }
        
        throw new Error('No elevation data from Google');
    }

    /**
     * Get elevation data from MapBox Elevation API (requires API key)
     * 
     * @param {number} lat - Latitude coordinate
     * @param {number} lng - Longitude coordinate
     * @returns {Promise<Object>} Elevation data object
     */
    async getMapBoxElevation(lat, lng) {
        // Note: This requires a MapBox API key
        const apiKey = window.CONFIG ? window.CONFIG.MAPBOX_API_KEY : 'YOUR_MAPBOX_API_KEY';
        
        if (!apiKey || apiKey === 'YOUR_MAPBOX_API_KEY') {
            throw new Error('MapBox API key not configured');
        }
        
        const response = await fetch(
            `https://api.mapbox.com/v4/mapbox.terrain-rgb/${Math.floor(lng + 180) / 360 * 512}/${Math.floor((90 - lat) / 180) * 512}.pngraw?access_token=${apiKey}`
        );
        
        if (!response.ok) {
            throw new Error('MapBox Elevation API request failed');
        }
        
        // MapBox terrain-rgb requires image processing to extract elevation
        // This is a simplified implementation
        throw new Error('MapBox elevation processing not implemented');
    }

    /**
     * Cache elevation data to avoid repeated API calls
     * 
     * @param {string} key - Cache key (lat,lng)
     * @param {Object} data - Elevation data to cache
     */
    cacheElevation(key, data) {
        if (!this.elevationCache) {
            this.elevationCache = new Map();
        }
        
        // Cache for configured duration (default 1 hour)
        const cacheDuration = window.CONFIG ? window.CONFIG.ELEVATION.CACHE_DURATION : 3600000;
        this.elevationCache.set(key, {
            data: data,
            timestamp: Date.now(),
            expiry: cacheDuration
        });
    }

    /**
     * Get cached elevation data if still valid
     * 
     * @param {string} key - Cache key (lat,lng)
     * @returns {Object|null} Cached elevation data or null if expired/not found
     */
    getCachedElevation(key) {
        if (!this.elevationCache) {
            return null;
        }
        
        const cached = this.elevationCache.get(key);
        if (!cached) {
            return null;
        }
        
        // Check if cache is still valid
        if (Date.now() - cached.timestamp > cached.expiry) {
            this.elevationCache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    /**
     * Generate simulated elevation data based on geographic location
     * Uses realistic elevation patterns for different US regions
     * 
     * @param {number} lat - Latitude coordinate
     * @param {number} lng - Longitude coordinate
     * @returns {number} Simulated elevation in meters
     */
    getSimulatedElevation(lat, lng) {
        // Start with base elevation
        let baseElevation = 100;
        
        // Mountain regions - significantly higher elevation
        if (lat > 40 && lng < -100) baseElevation += 1500; // Rocky Mountains
        if (lat > 35 && lat < 45 && lng > -85 && lng < -75) baseElevation += 800; // Appalachian Mountains
        if (lat > 30 && lat < 40 && lng > -120 && lng < -110) baseElevation += 1200; // Sierra Nevada
        
        // Coastal regions - lower elevation
        if (Math.abs(lng) > 75 && lat < 35) baseElevation -= 50; // East Coast
        if (lng < -120 && lat < 40) baseElevation -= 30; // West Coast
        
        // Add randomness for more realistic variation
        baseElevation += (Math.random() - 0.5) * 200;
        
        // Ensure elevation is never negative
        return Math.max(0, Math.round(baseElevation));
    }

    /**
     * Get rainfall data for a specific location using NOAA Weather API
     * Falls back to simulated data if the API is unavailable
     * 
     * @param {number} lat - Latitude coordinate
     * @param {number} lng - Longitude coordinate
     * @returns {Promise<number>} Rainfall in millimeters
     */
    async getRainfallData(lat, lng) {
        try {
            // Use NWS National Forecast API for real precipitation data
            console.log(`🌤️ DEBUG: First NOAA API call - Getting forecast point for coordinates: ${lat}, ${lng}`);
            
            const response = await fetch(
                `https://api.weather.gov/points/${lat},${lng}`,
                {
                    headers: {
                        'User-Agent': 'floodwatch-app/1.0 (contact@floodwatch.com)'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`NWS API request failed: ${response.status}`);
            }
            
            const locationData = await response.json();
            console.log(`📍 DEBUG: First NOAA API response - City: ${locationData.properties.relativeLocation?.properties?.city || 'Unknown'}, State: ${locationData.properties.relativeLocation?.properties?.state || 'Unknown'}, Coordinates: ${lat}, ${lng}`);
            
            const forecastUrl = locationData.properties.forecast;
            
            if (forecastUrl) {
                console.log(`🌦️ DEBUG: Second NOAA API call - Getting forecast data from: ${forecastUrl}`);
                
                // Get the actual forecast data from NWS National Forecast API
                const forecastResponse = await fetch(forecastUrl, {
                    headers: {
                        'User-Agent': 'floodwatch-app/1.0 (contact@floodwatch.com)'
                    }
                });
                
                if (forecastResponse.ok) {
                    const forecastData = await forecastResponse.json();
                    
                    // Calculate 24-hour rainfall from forecast periods
                    let totalRainfall = 0;
                    const periods = forecastData.properties.periods;
                    
                    console.log(`📊 DEBUG: Analyzing ${periods.length} forecast periods for rainfall data`);
                    
                    for (let i = 0; i < Math.min(periods.length, 4); i++) {
                        const period = periods[i];
                        console.log(`🔍 DEBUG: Period ${i + 1} - ${period.name}: "${period.detailedForecast}"`);
                        
                        // Check for precipitation-related terms in the forecast
                        const forecastText = period.detailedForecast.toLowerCase();
                        const hasPrecipitation = forecastText.includes('rain') || 
                                                forecastText.includes('shower') || 
                                                forecastText.includes('storm') || 
                                                forecastText.includes('thunderstorm') || 
                                                forecastText.includes('precipitation') ||
                                                forecastText.includes('drizzle') ||
                                                forecastText.includes('sprinkle');
                        
                        if (hasPrecipitation) {
                            // Estimate rainfall based on forecast description
                            let periodRainfall = 0;
                            if (forecastText.includes('heavy') || forecastText.includes('severe')) {
                                periodRainfall = 15;
                            } else if (forecastText.includes('moderate') || forecastText.includes('steady')) {
                                periodRainfall = 8;
                            } else {
                                periodRainfall = 3;
                            }
                            
                            totalRainfall += periodRainfall;
                            console.log(`💧 DEBUG: Period ${i + 1} rainfall estimate: ${periodRainfall}mm (${forecastText.includes('heavy') || forecastText.includes('severe') ? 'heavy' : forecastText.includes('moderate') || forecastText.includes('steady') ? 'moderate' : 'light'} precipitation)`);
                        } else {
                            console.log(`☀️ DEBUG: Period ${i + 1} - No precipitation detected in forecast`);
                        }
                    }
                    totalRainfall *= 100;
                    const finalRainfall = Math.round(totalRainfall * 10) / 10;
                    console.log(`🌧️ DEBUG: Final rainfall value from second NOAA API call: ${finalRainfall}mm`);
                    
                    return finalRainfall;
                }
            }
            
            // Fallback to simulated data if no forecast available
            console.log(`⚠️ DEBUG: No forecast URL available, using simulated rainfall data`);
            return this.getSimulatedRainfall(lat, lng);
        } catch (error) {
            console.warn('NWS National Forecast API unavailable, using simulated data:', error);
            console.log(`🔄 DEBUG: Falling back to simulated rainfall data due to API error`);
            return this.getSimulatedRainfall(lat, lng);
        }
    }

    /**
     * Generate simulated rainfall data based on geographic location
     * Uses realistic rainfall patterns for different US regions
     * 
     * @param {number} lat - Latitude coordinate
     * @param {number} lng - Longitude coordinate
     * @returns {number} Simulated rainfall in millimeters
     */
    getSimulatedRainfall(lat, lng) {
        // Start with base rainfall
        let baseRainfall = 0;
        
        // High rainfall regions
        if (lat > 25 && lat < 35 && lng > -90 && lng < -80) baseRainfall += 30; // Southeast
        if (lat > 40 && lat < 50 && lng > -125 && lng < -120) baseRainfall += 25; // Pacific Northwest
        if (lat > 20 && lat < 30 && lng > -85 && lng < -75) baseRainfall += 35; // Florida
        
        // Low rainfall regions
        if (lat > 35 && lat < 45 && lng > -120 && lng < -100) baseRainfall -= 10; // Southwest
        if (lat > 40 && lat < 50 && lng > -110 && lng < -95) baseRainfall -= 5; // Great Plains
        
        // Add seasonal variation based on current date
        // Simulates higher rainfall in spring/fall, lower in summer/winter
        const seasonalFactor = 1 + Math.sin(Date.now() / (365.25 * 24 * 60 * 60 * 1000) * 2 * Math.PI) * 0.3;
        baseRainfall *= seasonalFactor;
        
        // Add random variation for realism
        baseRainfall += Math.random() * 20;
        
        baseRainfall *= 100;
        // Ensure rainfall is never negative
        return Math.max(0, Math.round(baseRainfall * 10) / 10);
    }

    /**
     * Calculate flood risk level using two key factors
     * Considers elevation and rainfall only
     * 
     * @param {number} elevation - Elevation in meters
     * @param {number} rainfall - Rainfall in millimeters
     * @returns {string} Risk level: 'very-low', 'low', 'medium', 'high', or 'very-high'
     */
    async calculateFloodRisk(elevation, rainfall, lat, lng) {
        // Initialize risk factors
        const riskFactors = {
            elevation: 0,
            rainfall: 0
        };
        
        // 1. ELEVATION FACTOR (Weight: 40%)
        // Lower elevation increases flood risk
        if (elevation < 3) {
            riskFactors.elevation = 15*20/3; // Very high risk - very low elevation, could be flooded by an increase in sea level
        }else if (elevation < 10) {
            riskFactors.elevation = 10*20/3; // Very high risk - coastal/low-lying areas
        } else if (elevation < 20) {
            riskFactors.elevation = 8*20/3;  // High risk - flood plains
        } else if (elevation < 50) {
            riskFactors.elevation = 4*20/3;  // Medium-high risk
        } else if (elevation < 100) {
            riskFactors.elevation = 2*20/3;  // Medium risk
        } else if (elevation < 200) {
            riskFactors.elevation = 1*20/3;  // Low-medium risk
        } else {
            riskFactors.elevation = 0;  // Very low risk - high elevation
        }
        
        // 2. RAINFALL FACTOR (Weight: 60%)
        // Recent and forecasted rainfall intensity - primary risk factor
        if (rainfall > 200) {
            riskFactors.rainfall = 15*20/3; // Very high risk - extreme rainfall
        } else if (rainfall > 100) {
            riskFactors.rainfall = 10*20/3;  // High risk - heavy rainfall
        } else if (rainfall > 50) {
            riskFactors.rainfall = 8*20/3;  // Medium-high risk in low elevation areas
        } else if (rainfall > 25) {
            riskFactors.rainfall = 4*20/3;  // Medium risk in low elevation areas
        } else if (rainfall > 10) {
            riskFactors.rainfall = 2*20/3;  // Low risk in low elevation areas
        } else {
            riskFactors.rainfall = 0;  // Very low risk - minimal rainfall
        }
        
        // Calculate weighted total risk score (0-100)
        const weights = {
            elevation: 0.40,
            rainfall: 0.60
        };
        
        let totalRiskScore = 0;
        for (const [factor, value] of Object.entries(riskFactors)) {
            totalRiskScore += value * weights[factor];
        }
        
        // Check proximity to water and double the risk if within 10 miles
        const nearWater = await this.isNearWater(lat, lng);
        if (nearWater) {
            totalRiskScore *= 2;
            console.log(`🌊 DEBUG: Location is within 10 miles of water - risk score doubled to ${totalRiskScore.toFixed(2)}`);
        }
        
        // Debug: Log the calculated risk score and factors
        console.log(`🔍 DEBUG: Risk calculation - Elevation: ${riskFactors.elevation} (weight: 20%), Rainfall: ${riskFactors.rainfall} (weight: 80%), Near Water: ${nearWater}, Total Score: ${totalRiskScore.toFixed(2)}`);
        
        // Determine risk level based on total score
        let riskLevel;
        if (totalRiskScore >= 10*20/3) riskLevel = 'very-high';
        else if (totalRiskScore >= 8*20/3) riskLevel = 'high';
        else if (totalRiskScore >= 6*20/3) riskLevel = 'medium';
        else riskLevel = 'low';
        
        return {
            level: riskLevel,
            score: totalRiskScore
        };
    }
    
    /**
     * Check if a location is within 10 miles of ocean or lake
     * 
     * @param {number} lat - Latitude coordinate
     * @param {number} lng - Longitude coordinate
     * @returns {Promise<boolean>} True if within 10 miles of water
     */
    async isNearWater(lat, lng) {
        try {
            // Search for water features within 10 miles using Nominatim
            const searchRadius = 0.15; // Approximately 10 miles in degrees
            
            // Search for oceans, seas, lakes, and other water bodies
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=&lat=${lat}&lon=${lng}&radius=${searchRadius}&featuretype=water&limit=10&addressdetails=1`
            );
            
            const data = await response.json();
            
            // Check if any water features were found
            const hasWater = data.some(place => {
                const address = place.address;
                return address.ocean || address.sea || address.lake || 
                       place.type === 'water' || place.class === 'water';
            });
            
            console.log(`🌊 DEBUG: Water proximity check - Found ${data.length} water features, Near water: ${hasWater}`);
            return hasWater;
            
        } catch (error) {
            console.warn('Error checking water proximity:', error);
            return false; // Default to false if API fails
        }
    }

    /**
     * Update the risk display in the UI
     * Shows risk score and level based on calculated values
     */
    updateRiskDisplay() {
        const riskScoreElement = document.getElementById('riskScoreValue');
        const riskLevelElement = document.getElementById('riskLevelText');
        const riskDescriptionElement = document.getElementById('riskLevelDescription');
        
        if (this.currentRiskScore !== null) {
            // Update risk score display
            riskScoreElement.textContent = this.currentRiskScore.toFixed(1);
            
            // Update risk level display
            riskLevelElement.textContent = this.currentRiskLevel.charAt(0).toUpperCase() + this.currentRiskLevel.slice(1).replace('-', ' ');
            riskLevelElement.className = `risk-level-text ${this.currentRiskLevel}`;
            
            // Update risk description
        const descriptions = {
                'low': 'Minimal flood risk - safe conditions',
                'medium': 'Moderate flood risk - monitor conditions',
                'high': 'High flood risk - prepare for potential flooding',
                'very-high': 'Very high flood risk - immediate evacuation recommended'
            };
            riskDescriptionElement.textContent = descriptions[this.currentRiskLevel] || 'Risk assessment completed';
            
            // Search for safer cities if risk is high or very high
            if (this.currentRiskLevel === 'high' || this.currentRiskLevel === 'very-high') {
                this.searchForSaferCity();
            } else {
                this.hideSaferCityDisplay();
            }
        } else {
            // No assessment performed yet
            riskScoreElement.textContent = '--';
            riskLevelElement.textContent = 'No Assessment';
            riskLevelElement.className = 'risk-level-text no-assessment';
            riskDescriptionElement.textContent = 'Enter a location to assess flood risk';
            this.hideSaferCityDisplay();
        }
    }
    
    /**
     * Search for a safer city with lower risk level
     * Searches in 8 directions (cardinal + diagonal) at 20-mile increments up to 160 miles
     */
    async searchForSaferCity() {
        if (!this.userLocation) return;
        
        console.log('🔍 DEBUG: Searching for safer city in 8 directions...');
        
        // Show loading spinner
        this.showSaferSearchLoading();
        this.hideSaferCityDisplay();
        
        try {
            const directions = [
                { name: 'North', latOffset: 1, lngOffset: 0 },
                { name: 'South', latOffset: -1, lngOffset: 0 },
                { name: 'East', latOffset: 0, lngOffset: 1 },
                { name: 'West', latOffset: 0, lngOffset: -1 },
                { name: 'Northeast', latOffset: 1, lngOffset: 1 },
                { name: 'Northwest', latOffset: 1, lngOffset: -1 },
                { name: 'Southeast', latOffset: -1, lngOffset: 1 },
                { name: 'Southwest', latOffset: -1, lngOffset: -1 }
            ];
            
            // Search in 20-mile increments up to 160 miles
            for (let distance = 20; distance <= 160; distance += 20) {
                console.log(`🔍 DEBUG: Searching at ${distance} miles...`);
                
                for (const direction of directions) {
                    const testLocation = this.calculateLocationAtDistance(
                        this.userLocation.lat,
                        this.userLocation.lng,
                        direction.latOffset,
                        direction.lngOffset,
                        distance
                    );
                    
                    try {
                        // Get elevation and rainfall data for the test location
                        const elevationData = await this.getElevationData(testLocation.lat, testLocation.lng);
                        const rainfall = await this.getRainfallData(testLocation.lat, testLocation.lng);
                        
                        // Calculate risk for this location
                        const riskData = await this.calculateFloodRisk(elevationData.elevation, rainfall, testLocation.lat, testLocation.lng);
                        
                        console.log(`🔍 DEBUG: ${direction.name} ${distance}mi - Risk: ${riskData.level}, Score: ${riskData.score.toFixed(2)}`);
                        
                        // Check if this location has medium risk or lower
                        if (riskData.level === 'low' || riskData.level === 'medium') {
                            // Get city name for this location
                            const cityName = await this.getCityName(testLocation.lat, testLocation.lng);
                            
                            // Check if the city has a proper name (not just coordinates)
                            const isCoordinateName = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(cityName);
                            
                            if (isCoordinateName) {
                                console.log(`⚠️ DEBUG: Location has no proper city name (${cityName}), continuing search...`);
                                continue; // Skip this location and keep searching
                            }
                            
                            console.log(`✅ DEBUG: Found safer city: ${cityName} (${riskData.level} risk)`);
                            
                            // Hide loading spinner and display the safer city
                            this.hideSaferSearchLoading();
                            this.displaySaferCity(cityName, distance, direction.name, riskData.level, testLocation);
                            return;
                        }
                    } catch (error) {
                        console.warn(`⚠️ DEBUG: Error checking ${direction.name} ${distance}mi:`, error);
                        continue;
                    }
                }
            }
            
            console.log('❌ DEBUG: No safer city found within 160 miles');
            this.hideSaferSearchLoading();
            this.hideSaferCityDisplay();
            this.showNoSafeAlternatives();
        } catch (error) {
            console.error('❌ DEBUG: Error during safer city search:', error);
            this.hideSaferSearchLoading();
            this.hideSaferCityDisplay();
            this.showNoSafeAlternatives();
        }
    }
    
    /**
     * Calculate coordinates at a specific distance and direction
     * 
     * @param {number} lat - Starting latitude
     * @param {number} lng - Starting longitude
     * @param {number} latOffset - Latitude direction (-1 for south, 1 for north)
     * @param {number} lngOffset - Longitude direction (-1 for west, 1 for east)
     * @param {number} distanceMiles - Distance in miles
     * @returns {Object} New coordinates {lat, lng}
     */
    calculateLocationAtDistance(lat, lng, latOffset, lngOffset, distanceMiles) {
        const R = 3959; // Earth's radius in miles
        const distanceRadians = distanceMiles / R;
        
        const newLat = lat + (latOffset * distanceRadians * 180 / Math.PI);
        const newLng = lng + (lngOffset * distanceRadians * 180 / Math.PI / Math.cos(lat * Math.PI / 180));
        
        return { lat: newLat, lng: newLng };
    }
    
    /**
     * Get city name for given coordinates using reverse geocoding
     * 
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Promise<string>} City name
     */
    async getCityName(lat, lng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await response.json();
            
            if (data.address) {
                return data.address.city || 
                       data.address.town || 
                       data.address.village || 
                       data.address.county || 
                       `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
            }
            
            return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
        } catch (error) {
            console.warn('Error getting city name:', error);
            return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
        }
    }
    
    /**
     * Display the safer city information
     * 
     * @param {string} cityName - Name of the safer city
     * @param {number} distance - Distance in miles
     * @param {string} direction - Direction (North, South, East, West)
     * @param {string} riskLevel - Risk level of the safer city
     * @param {Object} coordinates - Coordinates of the safer location
     */
    displaySaferCity(cityName, distance, direction, riskLevel, coordinates = null) {
        const saferCityDisplay = document.getElementById('saferCityDisplay');
        const saferCityName = document.getElementById('saferCityName');
        const saferCityDistance = document.getElementById('saferCityDistance');
        
        saferCityName.textContent = cityName;
        saferCityDistance.textContent = `${distance} miles ${direction} (${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} risk)`;
        
        // Store the safer location coordinates for directions
        if (coordinates) {
            this.saferLocation = coordinates;
        }
        
        saferCityDisplay.style.display = 'block';
        
        // Hide the no safe alternatives message since we found a safer city
        this.hideNoSafeAlternatives();
        
        // Debug: Check if button is now visible and clickable
        const getDirectionsBtn = document.getElementById('getDirectionsBtn');
        console.log('🗺️ DEBUG: Button after display:', getDirectionsBtn);
        console.log('🗺️ DEBUG: Button style.display:', getDirectionsBtn ? getDirectionsBtn.style.display : 'N/A');
        
        // Attach event listener to the button
        if (getDirectionsBtn) {
            // Remove any existing event listeners by cloning the element
            const newButton = getDirectionsBtn.cloneNode(true);
            getDirectionsBtn.parentNode.replaceChild(newButton, getDirectionsBtn);
            
            // Add new event listener to the fresh button
            newButton.addEventListener('click', () => {
                console.log('🗺️ DEBUG: Get Directions button clicked (from displaySaferCity)');
                this.openGoogleMapsDirections();
            });
        }
    }
    
    /**
     * Hide the safer city display
     */
    hideSaferCityDisplay() {
        const saferCityDisplay = document.getElementById('saferCityDisplay');
        saferCityDisplay.style.display = 'none';
        // Also hide the no safe alternatives message
        this.hideNoSafeAlternatives();
    }

    /**
     * Show the safer search loading spinner
     */
    showSaferSearchLoading() {
        const saferSearchLoading = document.getElementById('saferSearchLoading');
        saferSearchLoading.style.display = 'block';
    }

    /**
     * Hide the safer search loading spinner
     */
    hideSaferSearchLoading() {
        const saferSearchLoading = document.getElementById('saferSearchLoading');
        saferSearchLoading.style.display = 'none';
    }

    /**
     * Show the no safe alternatives message
     */
    showNoSafeAlternatives() {
        const noSafeAlternatives = document.getElementById('noSafeAlternatives');
        noSafeAlternatives.style.display = 'block';
    }

    /**
     * Hide the no safe alternatives message
     */
    hideNoSafeAlternatives() {
        const noSafeAlternatives = document.getElementById('noSafeAlternatives');
        noSafeAlternatives.style.display = 'none';
    }

    /**
     * Open Google Maps with directions from current location to safer location
     */
    openGoogleMapsDirections() {
        console.log('🗺️ DEBUG: openGoogleMapsDirections() called');
        console.log('🗺️ DEBUG: userLocation:', this.userLocation);
        console.log('🗺️ DEBUG: saferLocation:', this.saferLocation);
        
        if (!this.userLocation || !this.saferLocation) {
            console.error('Missing location data for directions');
            this.showError('Unable to get directions - location data missing');
            return;
        }

        // Format coordinates for Google Maps URL
        const origin = `${this.userLocation.lat},${this.userLocation.lng}`;
        const destination = `${this.saferLocation.lat},${this.saferLocation.lng}`;
        
        // Create Google Maps directions URL
        const directionsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
        
        console.log('🗺️ DEBUG: Opening Google Maps directions:', directionsUrl);
        
        // Open in new tab
        window.open(directionsUrl, '_blank');
    }

    /**
     * Add a risk marker to the map for a specific location
     * 
     * @param {number} lat - Latitude coordinate
     * @param {number} lng - Longitude coordinate
     * @param {string} riskLevel - Risk level ('low', 'medium', 'high')
     */
    addRiskMarker(lat, lng, riskLevel) {
        // Color coding for different risk levels
        const colors = {
            'very-low': '#22c55e',  // Bright green
            'low': '#10b981',       // Green
            'medium': '#f59e0b',    // Yellow/Orange
            'high': '#f97316',      // Orange
            'very-high': '#ef4444'  // Red
        };
        
        // Create and add the risk marker
        L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'risk-marker',
                html: `<div style="background: ${colors[riskLevel]}; border: 3px solid white; border-radius: 50%; width: 16px; height: 16px;"></div>`,
                iconSize: [16, 16]
            })
        }).addTo(this.map).bindPopup(`Flood Risk: ${riskLevel.toUpperCase().replace('-', ' ')}`);
    }

    /**
     * Load comprehensive flood risk data for the entire US
     * In production, this would load from FEMA's National Flood Hazard Layer
     */
    async loadFloodRiskData() {
        // Load comprehensive flood risk data for the entire US
        // In production, this would load from FEMA's National Flood Hazard Layer
        this.floodRiskData = []; // Initialize as empty array for now
        
        // Add flood risk markers to map with enhanced information
        this.floodRiskData.forEach(location => {
            const marker = L.marker([location.lat, location.lng], {
                icon: L.divIcon({
                    className: 'risk-marker',
                    html: `<div style="background: ${this.getRiskColor(location.risk)}; border: 3px solid white; border-radius: 50%; width: 16px; height: 16px;"></div>`,
                    iconSize: [16, 16]
                })
            }).addTo(this.map);
            
            // Create detailed popup with location information
            marker.bindPopup(`
                <div style="min-width: 200px;">
                    <h4 style="margin: 0 0 8px 0; color: ${this.getRiskColor(location.risk)};">${location.name}</h4>
                    <p style="margin: 4px 0;"><strong>Risk Level:</strong> ${location.risk.toUpperCase()}</p>
                    <p style="margin: 4px 0;"><strong>Elevation:</strong> ${location.elevation}m</p>
                    <p style="margin: 4px 0;"><strong>Rainfall (24h):</strong> ${location.rainfall}mm</p>
                </div>
            `);
        });
    }

    /**
     * Get the color associated with a risk level
     * 
     * @param {string} risk - Risk level ('low', 'medium', 'high')
     * @returns {string} Hex color code
     */
    getRiskColor(risk) {
        const colors = {
            'very-low': '#22c55e',  // Bright green
            'low': '#10b981',       // Green
            'medium': '#f59e0b',    // Yellow/Orange
            'high': '#f97316',      // Orange
            'very-high': '#ef4444'  // Red
        };
        return colors[risk] || '#64748b'; // Default gray if risk level not recognized
    }

    /**
     * Toggle elevation data display on/off
     * Currently logs the state change (placeholder for future implementation)
     * 
     * @param {boolean} show - Whether to show elevation data
     */
    toggleElevationData(show) {
        // Toggle elevation data display
        // TODO: Implement actual elevation data layer toggling
        console.log('Elevation data toggled:', show);
    }

    /**
     * Toggle rainfall data display on/off
     * Currently logs the state change (placeholder for future implementation)
     * 
     * @param {boolean} show - Whether to show rainfall data
     */
    toggleRainfallData(show) {
        // Toggle rainfall data display
        // TODO: Implement actual rainfall data layer toggling
        console.log('Rainfall data toggled:', show);
    }

    /**
     * Toggle flood risk data display on/off
     * Currently logs the state change (placeholder for future implementation)
     * 
     * @param {boolean} show - Whether to show flood risk data
     */
    toggleFloodRiskData(show) {
        // Toggle flood risk data display
        // TODO: Implement actual flood risk data layer toggling
        console.log('Flood risk data toggled:', show);
    }


    /**
     * Calculate the distance between two geographic points using the Haversine formula
     * 
     * @param {Object} point1 - First point {lat, lng}
     * @param {Object} point2 - Second point {lat, lng}
     * @returns {number} Distance in kilometers
     */
    calculateDistance(point1, point2) {
        const R = 6371; // Earth's radius in kilometers
        
        // Convert degrees to radians
        const dLat = (point2.lat - point1.lat) * Math.PI / 180;
        const dLng = (point2.lng - point1.lng) * Math.PI / 180;
        
        // Haversine formula
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c; // Distance in kilometers
    }


    /**
     * Show or hide the loading spinner
     * 
     * @param {boolean} show - Whether to show the loading spinner
     */
    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        spinner.style.display = show ? 'block' : 'none';
    }

    /**
     * Display an error notification to the user
     * Creates a styled error message that auto-dismisses after 5 seconds
     * 
     * @param {string} message - Error message to display
     */
    showError(message) {
        // Create a more user-friendly error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div style="background: #fee2e2; border: 1px solid #fca5a5; color: #dc2626; padding: 1rem; border-radius: 8px; margin: 1rem; position: fixed; top: 20px; right: 20px; z-index: 10000; max-width: 300px;">
                <strong>⚠️ Error:</strong> ${message}
                <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: #dc2626; cursor: pointer; font-size: 1.2rem;">×</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    /**
     * Display a success notification to the user
     * Creates a styled success message that auto-dismisses after 3 seconds
     * 
     * @param {string} message - Success message to display
     */
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-notification';
        successDiv.innerHTML = `
            <div style="background: #d1fae5; border: 1px solid #a7f3d0; color: #059669; padding: 1rem; border-radius: 8px; margin: 1rem; position: fixed; top: 20px; right: 20px; z-index: 10000; max-width: 300px;">
                <strong>✅ Success:</strong> ${message}
                <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: #059669; cursor: pointer; font-size: 1.2rem;">×</button>
            </div>
        `;
        document.body.appendChild(successDiv);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.remove();
            }
        }, 3000);
    }
}

// Initialize the application when the DOM is loaded
// This ensures all HTML elements are available before the app starts
document.addEventListener('DOMContentLoaded', () => {
    new FloodRiskApp();
    
    // Initialize info button functionality
    const infoButton = document.getElementById('infoButton');
    const infoModal = document.getElementById('infoModal');
    const closeInfoModal = document.getElementById('closeInfoModal');
    
    // Show info modal when info button is clicked
    if (infoButton) {
        infoButton.addEventListener('click', () => {
            infoModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    }
    
    // Hide info modal when close button is clicked
    if (closeInfoModal) {
        closeInfoModal.addEventListener('click', () => {
            infoModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore background scrolling
        });
    }
    
    // Hide info modal when clicking outside the modal content
    if (infoModal) {
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) {
                infoModal.style.display = 'none';
                document.body.style.overflow = 'auto'; // Restore background scrolling
            }
        });
    }
    
    // Hide info modal when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && infoModal.style.display === 'flex') {
            infoModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore background scrolling
        }
    });
});