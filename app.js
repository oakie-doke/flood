// Flood Risk Assessment & Evacuation Planner
class FloodRiskApp {
    constructor() {
        this.map = null;
        this.userLocation = null;
        this.floodRiskData = [];
        this.safeAreas = [];
        this.evacuationRoutes = [];
        this.currentRiskLevel = 'low';
        
        this.init();
    }

    async init() {
        this.initializeMap();
        this.setupEventListeners();
        await this.loadInitialData();
    }

    initializeMap() {
        // Initialize Leaflet map centered on the United States
        this.map = L.map('map').setView([39.8283, -98.5795], 4);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add satellite imagery option
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri'
        });

        // Add layer control
        const baseMaps = {
            "Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }),
            "Satellite": satelliteLayer
        };

        L.control.layers(baseMaps).addTo(this.map);
    }

    setupEventListeners() {
        // Location input
        document.getElementById('getLocationBtn').addEventListener('click', () => {
            this.getCurrentLocation();
        });

        document.getElementById('locationInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchLocation();
            }
        });

        // Risk assessment controls
        document.getElementById('showElevation').addEventListener('change', (e) => {
            this.toggleElevationData(e.target.checked);
        });

        document.getElementById('showRainfall').addEventListener('change', (e) => {
            this.toggleRainfallData(e.target.checked);
        });

        document.getElementById('showFloodRisk').addEventListener('change', (e) => {
            this.toggleFloodRiskData(e.target.checked);
        });

        // Evacuation controls
        document.getElementById('findSafeAreasBtn').addEventListener('click', () => {
            this.findSafeAreas();
        });

        document.getElementById('planEvacuationBtn').addEventListener('click', () => {
            this.planEvacuationRoute();
        });
    }

    async loadInitialData() {
        this.showLoading(true);
        
        try {
            // Load sample flood risk data for demonstration
            await this.loadFloodRiskData();
            this.updateRiskDisplay();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load flood risk data');
        } finally {
            this.showLoading(false);
        }
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            return;
        }

        this.showLoading(true);
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                this.userLocation = { lat, lng };
                this.map.setView([lat, lng], 10);
                
                // Add user location marker
                L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'user-marker',
                        html: '<div style="background: #3b82f6; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px;"></div>',
                        iconSize: [20, 20]
                    })
                }).addTo(this.map).bindPopup('Your Location');

                await this.assessLocationRisk(lat, lng);
                this.showSuccess('Location set successfully');
                this.showLoading(false);
            },
            (error) => {
                this.showError('Unable to retrieve your location');
                this.showLoading(false);
            }
        );
    }

    async searchLocation() {
        const query = document.getElementById('locationInput').value;
        if (!query.trim()) return;

        this.showLoading(true);
        
        try {
            // Use Nominatim for geocoding (free OpenStreetMap service)
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=us`);
            const data = await response.json();
            
            if (data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lng = parseFloat(result.lon);
                
                this.userLocation = { lat, lng };
                this.map.setView([lat, lng], 10);
                
                // Add location marker
                L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'user-marker',
                        html: '<div style="background: #3b82f6; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px;"></div>',
                        iconSize: [20, 20]
                    })
                }).addTo(this.map).bindPopup(result.display_name);

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

    async assessLocationRisk(lat, lng) {
        try {
            // Simulate elevation data (in a real app, this would come from USGS API)
            const elevation = await this.getElevationData(lat, lng);
            
            // Simulate rainfall data (in a real app, this would come from NOAA API)
            const rainfall = await this.getRainfallData(lat, lng);
            
            // Calculate flood risk
            const riskLevel = this.calculateFloodRisk(elevation, rainfall);
            
            // Update status bar
            document.getElementById('elevationValue').textContent = `${elevation}m`;
            document.getElementById('rainfallValue').textContent = `${rainfall}mm`;
            
            this.currentRiskLevel = riskLevel;
            this.updateRiskDisplay();
            
            // Add risk marker to map
            this.addRiskMarker(lat, lng, riskLevel);
            
        } catch (error) {
            console.error('Error assessing location risk:', error);
        }
    }

    async getElevationData(lat, lng) {
        try {
            // Use USGS National Map Elevation API
            const response = await fetch(
                `https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/identify?f=json&geometry=${lng},${lat}&geometryType=esriGeometryPoint&returnGeometry=false&imageDisplay=500,500,96&sr=4326`
            );
            
            if (!response.ok) {
                throw new Error('USGS API request failed');
            }
            
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                return Math.round(data.results[0].attributes.VALUE);
            } else {
                // Fallback to simulated data if API fails
                return this.getSimulatedElevation(lat, lng);
            }
        } catch (error) {
            console.warn('USGS elevation API unavailable, using simulated data:', error);
            return this.getSimulatedElevation(lat, lng);
        }
    }

    getSimulatedElevation(lat, lng) {
        // More realistic elevation simulation based on geographic location
        let baseElevation = 100;
        
        // Mountain regions
        if (lat > 40 && lng < -100) baseElevation += 1500; // Rocky Mountains
        if (lat > 35 && lat < 45 && lng > -85 && lng < -75) baseElevation += 800; // Appalachian Mountains
        if (lat > 30 && lat < 40 && lng > -120 && lng < -110) baseElevation += 1200; // Sierra Nevada
        
        // Coastal regions (lower elevation)
        if (Math.abs(lng) > 75 && lat < 35) baseElevation -= 50; // East Coast
        if (lng < -120 && lat < 40) baseElevation -= 30; // West Coast
        
        // Add some randomness for realism
        baseElevation += (Math.random() - 0.5) * 200;
        
        return Math.max(0, Math.round(baseElevation));
    }

    async getRainfallData(lat, lng) {
        try {
            // Use NOAA Weather API for real precipitation data
            const response = await fetch(
                `https://api.weather.gov/points/${lat},${lng}`
            );
            
            if (!response.ok) {
                throw new Error('NOAA API request failed');
            }
            
            const locationData = await response.json();
            const forecastUrl = locationData.properties.forecast;
            
            if (forecastUrl) {
                const forecastResponse = await fetch(forecastUrl);
                const forecastData = await forecastResponse.json();
                
                // Extract precipitation data from forecast
                const today = forecastData.properties.periods[0];
                if (today.probabilityOfPrecipitation && today.probabilityOfPrecipitation.value) {
                    return today.probabilityOfPrecipitation.value;
                }
            }
            
            // Fallback to simulated data
            return this.getSimulatedRainfall(lat, lng);
        } catch (error) {
            console.warn('NOAA weather API unavailable, using simulated data:', error);
            return this.getSimulatedRainfall(lat, lng);
        }
    }

    getSimulatedRainfall(lat, lng) {
        // More realistic rainfall simulation based on geographic location
        let baseRainfall = 0;
        
        // High rainfall regions
        if (lat > 25 && lat < 35 && lng > -90 && lng < -80) baseRainfall += 30; // Southeast
        if (lat > 40 && lat < 50 && lng > -125 && lng < -120) baseRainfall += 25; // Pacific Northwest
        if (lat > 20 && lat < 30 && lng > -85 && lng < -75) baseRainfall += 35; // Florida
        
        // Low rainfall regions
        if (lat > 35 && lat < 45 && lng > -120 && lng < -100) baseRainfall -= 10; // Southwest
        if (lat > 40 && lat < 50 && lng > -110 && lng < -95) baseRainfall -= 5; // Great Plains
        
        // Add seasonal variation and randomness
        const seasonalFactor = 1 + Math.sin(Date.now() / (365.25 * 24 * 60 * 60 * 1000) * 2 * Math.PI) * 0.3;
        baseRainfall *= seasonalFactor;
        baseRainfall += Math.random() * 20;
        
        return Math.max(0, Math.round(baseRainfall * 10) / 10);
    }

    calculateFloodRisk(elevation, rainfall) {
        // Simple flood risk calculation
        let riskScore = 0;
        
        // Elevation factor (lower elevation = higher risk)
        if (elevation < 50) riskScore += 3;
        else if (elevation < 100) riskScore += 2;
        else if (elevation < 200) riskScore += 1;
        
        // Rainfall factor
        if (rainfall > 40) riskScore += 3;
        else if (rainfall > 25) riskScore += 2;
        else if (rainfall > 10) riskScore += 1;
        
        // Determine risk level
        if (riskScore >= 5) return 'high';
        else if (riskScore >= 3) return 'medium';
        else return 'low';
    }

    updateRiskDisplay() {
        const riskElement = document.getElementById('riskLevel');
        const descriptionElement = document.getElementById('riskDescription');
        
        riskElement.className = `risk-level ${this.currentRiskLevel}`;
        riskElement.textContent = this.currentRiskLevel.charAt(0).toUpperCase() + this.currentRiskLevel.slice(1);
        
        const descriptions = {
            low: 'No immediate threat detected',
            medium: 'Moderate flood risk - monitor conditions',
            high: 'High flood risk - consider evacuation'
        };
        
        descriptionElement.textContent = descriptions[this.currentRiskLevel];
    }

    addRiskMarker(lat, lng, riskLevel) {
        const colors = {
            low: '#10b981',
            medium: '#f59e0b',
            high: '#ef4444'
        };
        
        L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'risk-marker',
                html: `<div style="background: ${colors[riskLevel]}; border: 3px solid white; border-radius: 50%; width: 16px; height: 16px;"></div>`,
                iconSize: [16, 16]
            })
        }).addTo(this.map).bindPopup(`Flood Risk: ${riskLevel.toUpperCase()}`);
    }

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

    getRiskColor(risk) {
        const colors = {
            low: '#10b981',
            medium: '#f59e0b',
            high: '#ef4444'
        };
        return colors[risk] || '#64748b';
    }

    toggleElevationData(show) {
        // Toggle elevation data display
        console.log('Elevation data toggled:', show);
    }

    toggleRainfallData(show) {
        // Toggle rainfall data display
        console.log('Rainfall data toggled:', show);
    }

    toggleFloodRiskData(show) {
        // Toggle flood risk data display
        console.log('Flood risk data toggled:', show);
    }

    async findSafeAreas() {
        if (!this.userLocation) {
            this.showError('Please set your location first');
            return;
        }

        this.showLoading(true);
        
        try {
            // Find safe areas (high elevation, low flood risk)
            this.safeAreas = await this.identifySafeAreas(this.userLocation);
            
            // Clear existing safe area markers
            this.map.eachLayer(layer => {
                if (layer.options && layer.options.className === 'safe-marker') {
                    this.map.removeLayer(layer);
                }
            });
            
            // Add safe area markers
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

    async identifySafeAreas(userLocation) {
        // Find safe areas from demo data (low risk, high elevation)
        const safeAreas = DEMO_SAFE_AREAS.filter(area => area.risk === 'low');
        
        // Sort by distance from user location
        safeAreas.sort((a, b) => {
            const distA = this.calculateDistance(userLocation, a);
            const distB = this.calculateDistance(userLocation, b);
            return distA - distB;
        });
        
        return safeAreas.slice(0, 3); // Return top 3 closest safe areas
    }

    async planEvacuationRoute() {
        if (!this.userLocation || this.safeAreas.length === 0) {
            this.showError('Please find safe areas first');
            return;
        }

        this.showLoading(true);
        
        try {
            // Find the best evacuation route
            const bestRoute = await this.calculateEvacuationRoute(this.userLocation, this.safeAreas);
            
            // Clear existing routes
            this.map.eachLayer(layer => {
                if (layer instanceof L.Polyline) {
                    this.map.removeLayer(layer);
                }
            });
            
            // Draw evacuation route
            if (bestRoute) {
                const routeLine = L.polyline(bestRoute.coordinates, {
                    color: '#3b82f6',
                    weight: 4,
                    opacity: 0.8
                }).addTo(this.map);
                
                routeLine.bindPopup(`Evacuation Route<br>Distance: ${bestRoute.distance}km<br>Estimated Time: ${bestRoute.time}`);
                
                // Add route markers
                L.marker(bestRoute.coordinates[0], {
                    icon: L.divIcon({
                        className: 'start-marker',
                        html: '<div style="background: #ef4444; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px;"></div>',
                        iconSize: [20, 20]
                    })
                }).addTo(this.map).bindPopup('Start');
                
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

    getSimulatedRoute(startLocation, safeAreas) {
        const destination = safeAreas[0];
        const distance = this.calculateDistance(startLocation, destination);
        const baseTime = distance * 1.5; // Assume 40 km/h average speed
        const trafficFactor = 1 + Math.random() * 0.5; // 0-50% traffic delay
        
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

    calculateDistance(point1, point2) {
        const R = 6371; // Earth's radius in km
        const dLat = (point2.lat - point1.lat) * Math.PI / 180;
        const dLng = (point2.lng - point1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    getTrafficConditions(estimatedTime) {
        // Simulate traffic conditions based on time of day and route complexity
        const hour = new Date().getHours();
        let trafficLevel = 'light';
        
        // Rush hour conditions
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
            trafficLevel = 'heavy';
        } else if (hour >= 10 && hour <= 16) {
            trafficLevel = 'moderate';
        }
        
        // Update traffic display
        document.getElementById('trafficValue').textContent = trafficLevel;
        
        return trafficLevel;
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        spinner.style.display = show ? 'block' : 'none';
    }

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
        
        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.remove();
            }
        }, 3000);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FloodRiskApp();
});
