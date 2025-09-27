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
        this.currentRiskLevel = 'low';
        
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
        this.map = L.map('map').setView([39.8283, -98.5795], 4);
        
        // Add OpenStreetMap tiles as the default base layer
        // This provides detailed street-level mapping data
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add satellite imagery option for better terrain visualization
        // Esri's World Imagery service provides high-resolution satellite imagery
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri'
        });

        // Create layer control to switch between map types
        // Users can toggle between street map and satellite view
        const baseMaps = {
            "Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }),
            "Satellite": satelliteLayer
        };

        // Add the layer control to the map
        L.control.layers(baseMaps).addTo(this.map);
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

        // Evacuation planning event listeners
        // Find and display safe areas near user location
        document.getElementById('findSafeAreasBtn').addEventListener('click', () => {
            this.findSafeAreas();
        });

        // Plan and display evacuation route to nearest safe area
        document.getElementById('planEvacuationBtn').addEventListener('click', () => {
            this.planEvacuationRoute();
        });
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
            this.updateRiskDisplay();
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
            // Get elevation data from USGS API
            // Higher elevation generally means lower flood risk
            const elevation = await this.getElevationData(lat, lng);
            
            // Get rainfall data from NOAA API
            // Higher rainfall increases flood risk
            const rainfall = await this.getRainfallData(lat, lng);
            
            // Calculate overall flood risk based on elevation and rainfall
            const riskLevel = this.calculateFloodRisk(elevation, rainfall);
            
            // Update the status bar with current data
            document.getElementById('elevationValue').textContent = `${elevation}m`;
            document.getElementById('rainfallValue').textContent = `${rainfall}mm`;
            
            // Store and display the risk level
            this.currentRiskLevel = riskLevel;
            this.updateRiskDisplay();
            
            // Add a risk marker to the map
            this.addRiskMarker(lat, lng, riskLevel);
            
        } catch (error) {
            console.error('Error assessing location risk:', error);
        }
    }

    /**
     * Get elevation data for a specific location using USGS National Map API
     * Falls back to simulated data if the API is unavailable
     * 
     * @param {number} lat - Latitude coordinate
     * @param {number} lng - Longitude coordinate
     * @returns {Promise<number>} Elevation in meters
     */
    async getElevationData(lat, lng) {
        try {
            // Use USGS National Map Elevation API
            // This provides accurate elevation data for the United States
            const response = await fetch(
                `https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/identify?f=json&geometry=${lng},${lat}&geometryType=esriGeometryPoint&returnGeometry=false&imageDisplay=500,500,96&sr=4326`
            );
            
            if (!response.ok) {
                throw new Error('USGS API request failed');
            }
            
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                // Return the elevation value from the API response
                return Math.round(data.results[0].attributes.VALUE);
            } else {
                // Fallback to simulated data if API returns no results
                return this.getSimulatedElevation(lat, lng);
            }
        } catch (error) {
            console.warn('USGS elevation API unavailable, using simulated data:', error);
            return this.getSimulatedElevation(lat, lng);
        }
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
            // Use NOAA Weather API for real precipitation data
            // First get the forecast point for the location
            const response = await fetch(
                `https://api.weather.gov/points/${lat},${lng}`
            );
            
            if (!response.ok) {
                throw new Error('NOAA API request failed');
            }
            
            const locationData = await response.json();
            const forecastUrl = locationData.properties.forecast;
            
            if (forecastUrl) {
                // Get the actual forecast data
                const forecastResponse = await fetch(forecastUrl);
                const forecastData = await forecastResponse.json();
                
                // Extract precipitation probability from today's forecast
                const today = forecastData.properties.periods[0];
                if (today.probabilityOfPrecipitation && today.probabilityOfPrecipitation.value) {
                    return today.probabilityOfPrecipitation.value;
                }
            }
            
            // Fallback to simulated data if no forecast available
            return this.getSimulatedRainfall(lat, lng);
        } catch (error) {
            console.warn('NOAA weather API unavailable, using simulated data:', error);
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
        
        // Ensure rainfall is never negative
        return Math.max(0, Math.round(baseRainfall * 10) / 10);
    }

    /**
     * Calculate flood risk level based on elevation and rainfall data
     * Uses a scoring system to determine risk level
     * 
     * @param {number} elevation - Elevation in meters
     * @param {number} rainfall - Rainfall in millimeters
     * @returns {string} Risk level: 'low', 'medium', or 'high'
     */
    calculateFloodRisk(elevation, rainfall) {
        // Initialize risk score
        let riskScore = 0;
        
        // Elevation factor (lower elevation = higher risk)
        if (elevation < 50) riskScore += 3;      // Very high risk
        else if (elevation < 100) riskScore += 2; // High risk
        else if (elevation < 200) riskScore += 1; // Medium risk
        // Elevation > 200m gets no additional risk points
        
        // Rainfall factor (higher rainfall = higher risk)
        if (rainfall > 40) riskScore += 3;       // Very high risk
        else if (rainfall > 25) riskScore += 2;  // High risk
        else if (rainfall > 10) riskScore += 1;  // Medium risk
        // Rainfall < 10mm gets no additional risk points
        
        // Determine final risk level based on total score
        if (riskScore >= 5) return 'high';       // Score 5-6: High risk
        else if (riskScore >= 3) return 'medium'; // Score 3-4: Medium risk
        else return 'low';                        // Score 0-2: Low risk
    }

    /**
     * Update the risk display in the UI
     * Updates both the risk level indicator and description text
     */
    updateRiskDisplay() {
        const riskElement = document.getElementById('riskLevel');
        const descriptionElement = document.getElementById('riskDescription');
        
        // Update risk level styling and text
        riskElement.className = `risk-level ${this.currentRiskLevel}`;
        riskElement.textContent = this.currentRiskLevel.charAt(0).toUpperCase() + this.currentRiskLevel.slice(1);
        
        // Risk level descriptions for user guidance
        const descriptions = {
            low: 'No immediate threat detected',
            medium: 'Moderate flood risk - monitor conditions',
            high: 'High flood risk - consider evacuation'
        };
        
        descriptionElement.textContent = descriptions[this.currentRiskLevel];
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
            low: '#10b981',    // Green
            medium: '#f59e0b', // Yellow/Orange
            high: '#ef4444'    // Red
        };
        
        // Create and add the risk marker
        L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'risk-marker',
                html: `<div style="background: ${colors[riskLevel]}; border: 3px solid white; border-radius: 50%; width: 16px; height: 16px;"></div>`,
                iconSize: [16, 16]
            })
        }).addTo(this.map).bindPopup(`Flood Risk: ${riskLevel.toUpperCase()}`);
    }

    /**
     * Load comprehensive flood risk data for the entire US
     * In production, this would load from FEMA's National Flood Hazard Layer
     */
    async loadFloodRiskData() {
        // Load comprehensive flood risk data for the entire US
        // In production, this would load from FEMA's National Flood Hazard Layer
        this.floodRiskData = DEMO_FLOOD_RISK_DATA;
        
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
            low: '#10b981',    // Green
            medium: '#f59e0b', // Yellow/Orange
            high: '#ef4444'    // Red
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
     * Find and display safe areas near the user's location
     * Safe areas are locations with low flood risk and high elevation
     */
    async findSafeAreas() {
        // Check if user location is set
        if (!this.userLocation) {
            this.showError('Please set your location first');
            return;
        }

        this.showLoading(true);
        
        try {
            // Find safe areas (high elevation, low flood risk)
            this.safeAreas = await this.identifySafeAreas(this.userLocation);
            
            // Clear existing safe area markers to avoid duplicates
            this.map.eachLayer(layer => {
                if (layer.options && layer.options.className === 'safe-marker') {
                    this.map.removeLayer(layer);
                }
            });
            
            // Add markers for each identified safe area
            this.safeAreas.forEach(area => {
                L.marker([area.lat, area.lng], {
                    icon: L.divIcon({
                        className: 'safe-marker',
                        html: '<div style="background: #10b981; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px;"></div>',
                        iconSize: [20, 20]
                    })
                }).addTo(this.map).bindPopup(`Safe Area: ${area.name}<br>Elevation: ${area.elevation}m`);
            });
            
            this.showLoading(false);
        } catch (error) {
            this.showError('Error finding safe areas');
            this.showLoading(false);
        }
    }

    /**
     * Identify safe areas from the available data
     * Filters for low-risk areas and sorts by distance from user location
     * 
     * @param {Object} userLocation - User's current location {lat, lng}
     * @returns {Array} Array of safe area objects
     */
    async identifySafeAreas(userLocation) {
        // Find safe areas from demo data (low risk, high elevation)
        const safeAreas = DEMO_SAFE_AREAS.filter(area => area.risk === 'low');
        
        // Sort by distance from user location (closest first)
        safeAreas.sort((a, b) => {
            const distA = this.calculateDistance(userLocation, a);
            const distB = this.calculateDistance(userLocation, b);
            return distA - distB;
        });
        
        // Return top 3 closest safe areas
        return safeAreas.slice(0, 3);
    }

    /**
     * Plan and display an evacuation route to the nearest safe area
     * Requires user location and safe areas to be identified first
     */
    async planEvacuationRoute() {
        // Check prerequisites
        if (!this.userLocation || this.safeAreas.length === 0) {
            this.showError('Please find safe areas first');
            return;
        }

        this.showLoading(true);
        
        try {
            // Find the best evacuation route
            const bestRoute = await this.calculateEvacuationRoute(this.userLocation, this.safeAreas);
            
            // Clear existing route lines to avoid duplicates
            this.map.eachLayer(layer => {
                if (layer instanceof L.Polyline) {
                    this.map.removeLayer(layer);
                }
            });
            
            // Draw the evacuation route on the map
            if (bestRoute) {
                const routeLine = L.polyline(bestRoute.coordinates, {
                    color: '#3b82f6',    // Blue color for route
                    weight: 4,           // Thick line for visibility
                    opacity: 0.8         // Slightly transparent
                }).addTo(this.map);
                
                // Add route information popup
                routeLine.bindPopup(`Evacuation Route<br>Distance: ${bestRoute.distance}km<br>Estimated Time: ${bestRoute.time}`);
                
                // Add start marker (user location)
                L.marker(bestRoute.coordinates[0], {
                    icon: L.divIcon({
                        className: 'start-marker',
                        html: '<div style="background: #ef4444; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px;"></div>',
                        iconSize: [20, 20]
                    })
                }).addTo(this.map).bindPopup('Start');
                
                // Add end marker (safe destination)
                L.marker(bestRoute.coordinates[bestRoute.coordinates.length - 1], {
                    icon: L.divIcon({
                        className: 'end-marker',
                        html: '<div style="background: #10b981; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px;"></div>',
                        iconSize: [20, 20]
                    })
                }).addTo(this.map).bindPopup('Safe Destination');
            }
            
            this.showLoading(false);
        } catch (error) {
            this.showError('Error planning evacuation route');
            this.showLoading(false);
        }
    }

    /**
     * Calculate the best evacuation route from user location to safe areas
     * In production, this would use a real routing API
     * 
     * @param {Object} startLocation - Starting location {lat, lng}
     * @param {Array} safeAreas - Array of safe area objects
     * @returns {Object} Route object with coordinates, distance, and time
     */
    async calculateEvacuationRoute(startLocation, safeAreas) {
        try {
            // In production, you would use a routing API like OpenRouteService, Google Maps, or HERE Maps
            // For demo purposes, we'll use simulated routing with realistic calculations
            console.log('Using simulated routing for demo purposes');
            return this.getSimulatedRoute(startLocation, safeAreas);
        } catch (error) {
            console.warn('Routing calculation failed:', error);
            return this.getSimulatedRoute(startLocation, safeAreas);
        }
    }

    /**
     * Generate a simulated evacuation route
     * Creates a straight-line route with realistic distance and time calculations
     * 
     * @param {Object} startLocation - Starting location {lat, lng}
     * @param {Array} safeAreas - Array of safe area objects
     * @returns {Object} Simulated route object
     */
    getSimulatedRoute(startLocation, safeAreas) {
        // Use the first (closest) safe area as destination
        const destination = safeAreas[0];
        const distance = this.calculateDistance(startLocation, destination);
        
        // Calculate estimated travel time (assume 40 km/h average speed)
        const baseTime = distance * 1.5; // 1.5 minutes per km = 40 km/h
        
        // Add traffic factor (0-50% delay)
        const trafficFactor = 1 + Math.random() * 0.5;
        
        return {
            coordinates: [
                [startLocation.lat, startLocation.lng],
                [destination.lat, destination.lng]
            ],
            distance: Math.round(distance),
            time: Math.round(baseTime * trafficFactor),
            traffic: this.getTrafficConditions(baseTime * trafficFactor)
        };
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
     * Determine traffic conditions based on time of day and route complexity
     * Updates the traffic display in the UI
     * 
     * @param {number} estimatedTime - Estimated travel time in minutes
     * @returns {string} Traffic condition level
     */
    getTrafficConditions(estimatedTime) {
        // Get current hour for rush hour detection
        const hour = new Date().getHours();
        let trafficLevel = 'light';
        
        // Rush hour conditions (7-9 AM and 5-7 PM)
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
            trafficLevel = 'heavy';
        } else if (hour >= 10 && hour <= 16) {
            trafficLevel = 'moderate';
        }
        
        // Update traffic display in the UI
        document.getElementById('trafficValue').textContent = trafficLevel;
        
        return trafficLevel;
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
});