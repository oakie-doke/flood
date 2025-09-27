{
  // =============================================================================
  // PROJECT METADATA
  // =============================================================================
  
  // Project name - used for npm package identification
  // Should be unique and descriptive of the project's purpose
  "name": "flood-risk-assessment-evacuation-planner",
  
  // Semantic version number (major.minor.patch)
  // 1.0.0 indicates this is the first stable release
  "version": "1.0.0",
  
  // Brief description of what the project does
  // Used by npm and other package managers for discovery
  "description": "A comprehensive web application for flood risk assessment and evacuation planning using USGS, NOAA, and traffic data",
  
  // =============================================================================
  // APPLICATION ENTRY POINT
  // =============================================================================
  
  // Main entry point for the application
  // Points to the HTML file that serves as the application's starting point
  "main": "index.html",
  
  // =============================================================================
  // NPM SCRIPTS
  // =============================================================================
  // These commands can be executed using 'npm run <script-name>'
  // or 'yarn <script-name>' if using Yarn package manager
  
  "scripts": {
    // Development server using Python's built-in HTTP server
    // Usage: npm start
    // Port: 8000
    // Best for: Quick testing when Python is available
    "start": "python -m http.server 8000",
    
    // Production-ready static file server
    // Usage: npm run serve
    // Features: Better performance, compression, proper MIME types
    // Best for: Testing production builds locally
    "serve": "npx serve .",
    
    // Development server with live reload
    // Usage: npm run dev
    // Features: Auto-refresh on file changes, opens browser automatically
    // Best for: Active development with real-time updates
    "dev": "npx live-server --port=8000 --open=/index.html"
  },
  
  // =============================================================================
  // KEYWORDS FOR PACKAGE DISCOVERY
  // =============================================================================
  // These keywords help users find this package when searching
  // Used by npm, GitHub, and other package repositories
  
  "keywords": [
    "flood-risk",           // Core functionality: assessing flood risk
    "evacuation-planning",  // Emergency response and evacuation features
    "usgs",                 // US Geological Survey data integration
    "noaa",                 // National Oceanic and Atmospheric Administration data
    "traffic-data",         // Real-time traffic information
    "emergency-planning",   // Emergency preparedness and response
    "gis",                  // Geographic Information Systems
    "mapping"               // Interactive mapping and visualization
  ],
  
  // =============================================================================
  // PROJECT AUTHORSHIP
  // =============================================================================
  
  // Primary author or team responsible for the project
  "author": "FloodSafe Development Team",
  
  // =============================================================================
  // SOFTWARE LICENSE
  // =============================================================================
  
  // MIT License - permissive open source license
  // Allows: Commercial use, modification, distribution, private use
  // Requires: License and copyright notice
  // Prohibits: Liability and warranty
  "license": "MIT",
  
  // =============================================================================
  // PRODUCTION DEPENDENCIES
  // =============================================================================
  // Packages required for the application to run in production
  // These are installed when users install your package
  
  "dependencies": {
    // Leaflet - Open-source JavaScript library for interactive maps
    // Version: ^1.9.4 (compatible with 1.9.4, but allows patch updates)
    // Purpose: Provides mapping functionality, markers, popups, and layers
    // Features: Mobile-friendly, lightweight, plugin ecosystem
    "leaflet": "^1.9.4"
  },
  
  // =============================================================================
  // DEVELOPMENT DEPENDENCIES
  // =============================================================================
  // Packages only needed during development and testing
  // Not installed when users install your package
  
  "devDependencies": {
    // Live-server - Development server with live reload
    // Version: ^1.2.2
    // Purpose: Serves files during development with auto-refresh
    // Features: WebSocket-based live reload, CORS support, custom middleware
    "live-server": "^1.2.2",
    
    // Serve - Static file server for production builds
    // Version: ^14.2.1
    // Purpose: Serves static files with production-ready features
    // Features: Gzip compression, proper MIME types, security headers
    "serve": "^14.2.1"
  },
  
  // =============================================================================
  // RUNTIME REQUIREMENTS
  // =============================================================================
  
  // Node.js version requirements
  // Specifies the minimum Node.js version needed to run the application
  "engines": {
    "node": ">=14.0.0"  // Requires Node.js 14.0.0 or higher
  },
  
  // =============================================================================
  // SOURCE CODE REPOSITORY
  // =============================================================================
  
  // Git repository information
  // Used by npm and other tools to link to source code
  "repository": {
    "type": "git",  // Version control system type
    "url": "https://github.com/your-username/flood-risk-assessment.git"
  },
  
  // =============================================================================
  // ISSUE TRACKING
  // =============================================================================
  
  // URL for reporting bugs and issues
  // Used by npm and GitHub to provide issue reporting links
  "bugs": {
    "url": "https://github.com/your-username/flood-risk-assessment/issues"
  },
  
  // =============================================================================
  // PROJECT HOMEPAGE
  // =============================================================================
  
  // Main URL for project documentation and information
  // Used by npm and GitHub as the primary project link
  "homepage": "https://github.com/your-username/flood-risk-assessment#readme"
}