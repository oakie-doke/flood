# Flood Risk Assessment & Evacuation Planner

A comprehensive web application that identifies high-risk flood areas in the United States and provides optimal evacuation routes using real-time data from USGS, NOAA, and traffic APIs.

## Features

### 🌊 Flood Risk Assessment
- **Elevation Data Integration**: Uses USGS National Map Viewer API for accurate elevation data
- **Rainfall Analysis**: Integrates NOAA precipitation data for real-time rainfall monitoring
- **Risk Calculation**: Advanced algorithm combining elevation and rainfall data to assess flood risk
- **Interactive Risk Visualization**: Color-coded map showing risk levels across the United States

### 🚗 Evacuation Planning
- **Safe Area Identification**: Automatically identifies high-elevation, low-risk areas
- **Route Optimization**: Uses real-time traffic data to find the fastest evacuation routes
- **Multiple Route Options**: Provides alternative routes based on current traffic conditions
- **Real-time Updates**: Continuously updates routes based on changing conditions

### 🎨 User Interface
- **Bright & Professional Design**: Modern, intuitive interface with excellent UX
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Interactive Map**: Full-featured map with multiple layer options
- **Real-time Status**: Live updates on elevation, rainfall, and traffic conditions

## Data Sources

### USGS National Map Viewer
- **Elevation Data**: Detailed topographic information for flood risk assessment
- **API Endpoint**: `https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer`
- **Coverage**: Complete United States with high-resolution elevation data

### NOAA Weather Data
- **Precipitation Data**: Real-time and historical rainfall information
- **API Endpoint**: `https://api.water.noaa.gov/`
- **Update Frequency**: Hourly updates for current conditions

### Traffic Data
- **Real-time Traffic**: Current traffic conditions and congestion data
- **Route Planning**: Optimized routing considering traffic patterns
- **Multiple Providers**: Integration with Google Maps, HERE Maps, and OpenStreetMap

## Technical Implementation

### Frontend Technologies
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with Flexbox and Grid layouts
- **JavaScript ES6+**: Object-oriented programming with async/await
- **Leaflet.js**: Interactive mapping library for geospatial visualization

### APIs and Services
- **Geocoding**: OpenStreetMap Nominatim for address lookup
- **Mapping**: OpenStreetMap tiles with satellite imagery options
- **Routing**: Multiple routing services for evacuation planning
- **Weather**: NOAA weather data integration

### Risk Assessment Algorithm
```javascript
function calculateFloodRisk(elevation, rainfall) {
    let riskScore = 0;
    
    // Elevation factor (lower elevation = higher risk)
    if (elevation < 50) riskScore += 3;
    else if (elevation < 100) riskScore += 2;
    else if (elevation < 200) riskScore += 1;
    
    // Rainfall factor
    if (rainfall > 40) riskScore += 3;
    else if (rainfall > 25) riskScore += 2;
    else if (rainfall > 10) riskScore += 1;
    
    return riskScore >= 5 ? 'high' : riskScore >= 3 ? 'medium' : 'low';
}
```

## Installation & Setup

### Prerequisites
- Modern web browser with JavaScript enabled
- Internet connection for API access
- No server setup required (client-side application)

### Quick Start
1. Clone or download the project files
2. Open `index.html` in a web browser
3. Allow location access when prompted
4. Start using the application immediately

### Local Development
```bash
# Serve the application locally
python -m http.server 8000
# or
npx serve .
```

## Usage Guide

### Setting Your Location
1. **Current Location**: Click "Use Current Location" for automatic detection
2. **Manual Entry**: Type your address in the location input field
3. **Search**: Press Enter or click the search button

### Assessing Flood Risk
1. **Enable Data Layers**: Toggle elevation, rainfall, and flood risk data
2. **View Risk Level**: Check the risk indicator in the control panel
3. **Interactive Map**: Click on markers to see detailed information

### Planning Evacuation
1. **Find Safe Areas**: Click "Find Safe Areas" to identify safe locations
2. **Plan Route**: Click "Plan Evacuation Route" for optimized routing
3. **View Route Details**: Click on route lines for distance and time estimates

## API Integration Details

### USGS Elevation Data
```javascript
async function getElevationData(lat, lng) {
    const response = await fetch(
        `https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/identify?f=json&geometry=${lng},${lat}&geometryType=esriGeometryPoint&returnGeometry=false&imageDisplay=500,500,96&sr=4326`
    );
    const data = await response.json();
    return data.results[0].attributes.VALUE;
}
```

### NOAA Rainfall Data
```javascript
async function getRainfallData(lat, lng) {
    const response = await fetch(
        `https://api.water.noaa.gov/precipitation/v1/current?lat=${lat}&lng=${lng}`
    );
    const data = await response.json();
    return data.precipitation;
}
```

### Traffic Data Integration
```javascript
async function getTrafficData(route) {
    // Integration with multiple traffic APIs
    const trafficData = await Promise.all([
        getGoogleTrafficData(route),
        getHEREtrafficData(route),
        getOpenStreetMapTrafficData(route)
    ]);
    return optimizeRoute(trafficData);
}
```

## Safety Features

### Emergency Protocols
- **High Risk Alerts**: Immediate notifications for high-risk areas
- **Evacuation Recommendations**: Clear guidance on when to evacuate
- **Route Validation**: Continuous validation of evacuation routes
- **Backup Routes**: Alternative routes in case of road closures

### Data Accuracy
- **Real-time Updates**: Continuous data refresh for accuracy
- **Multiple Sources**: Cross-validation using multiple data sources
- **Quality Control**: Data validation and error handling
- **Fallback Options**: Graceful degradation when APIs are unavailable

## Browser Compatibility

### Supported Browsers
- **Chrome**: 80+ (recommended)
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

### Required Features
- **Geolocation API**: For location detection
- **Fetch API**: For data requests
- **ES6 Modules**: For modern JavaScript features
- **CSS Grid/Flexbox**: For responsive layout

## Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Accessibility**: WCAG 2.1 compliance
- **Performance**: Lighthouse score 90+

## License

This project is open source and available under the MIT License.

## Support

For questions, issues, or contributions, please contact the development team or create an issue in the repository.

---

**⚠️ Important Disclaimer**: This application is for informational purposes only. Always follow official emergency guidance and evacuation orders from local authorities.
