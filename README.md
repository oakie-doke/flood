# Flood Risk Assessment & Evacuation Planner

A comprehensive web application that identifies high-risk flood areas in the United States and provides optimal evacuation routes using real-time data from the National Oceanic and Atmospheric Administration, United States Geological Survey Map Viewer, and Nominatim.

## Features

###  Flood Risk Assessment
- **Elevation Data Integration**: Uses USGS National Map Viewer API for accurate elevation data at every named location in the United States.
- **Rainfall Analysis**: Integrates NOAA precipitation forecast data for real-time rainfall monitoring.
- **Risk Calculation**: Contains an algorithm to calculate the risk based on elevation, rainfall, and proximity to water.
- **Interactive Risk Visualization**: Color-coded map showing risk levels at different inputted locations across the United States.

###  Evacuation Planning
- **Safe Area Identification**: Automatically low-risk areas after inputting a city in eminent danger of flooding.
- **Route Optimization**: Uses real-time traffic data to find the fastest evacuation routes through Google Maps.
- **Multiple Route Options**: Provides alternative routes based on current traffic conditions.
- **Real-time Updates**: Continuously updates routes based on changing conditions.

###  User Interface
- **Bright & Professional Design**: Modern, intuitive interface with excellent UX
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Interactive Map**: Full-featured map with multiple layer options
- **Real-time Status**: Live updates on elevation, rainfall, and traffic conditions

## Data Sources

### USGS National Map Viewer
- **Elevation Data**: Detailed topographic information for flood risk assessment
- **API Endpoint**: `https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer`
- **Coverage**: Complete United States (including territories) with high-resolution elevation data

### NOAA Weather Data
- **Precipitation Data**: Real-time and forecasted and historical rainfall information
- **API Endpoint**: `https://api.water.noaa.gov/`
- **Update Frequency**: Hourly updates for current conditions

## Technical Implementation

### Frontend Technologies
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with Flexbox and Grid layouts
- **JavaScript ES6+**: Object-oriented programming with async/await
- **Leaflet.js**: Interactive mapping library for geospatial visualization

### APIs and Services
- **Geocoding**: OpenStreetMap Nominatim for address lookup
- **Mapping**: OpenStreetMap tiles with satellite imagery options
- **Elevation**: USGS National Map Viewer API for determining elevation
- **Weather**: NOAA weather data integration

## Installation & Setup

### Prerequisites
- Modern web browser with JavaScript enabled
- Internet connection for API access
- No server setup required (client-side application)
- Redirecting between pages must be enabled to use the automatic connection to Google Maps

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
1. **Automatic Risk Evaluation**: View the Risk Level indicator to determine danger
2. **Interactive Map**: Add additional markers to determine conditions in locations across the United States

### Planning Evacuation
1. **Find Safe Areas**: Safe areas are automatically determined when risk is High or Very High
2. **Plan Route**: Click "Get Directions" for optimized routing to a nearby safe area
3. **Connectivity**: Open directions in Google Maps to alter routes at your discretion

### Data Accuracy
- **Real-time Updates**: Continuous data refresh for accuracy
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

**Important Disclaimer**: This application is for informational purposes only. Always follow official emergency guidance and evacuation orders from local authorities even when contradicted by the model.

