# GeoJSApp
A first approach in using openlayers 3 to provide and generic interface for geoserver layers (or any  other ocg compatible map servers)

All you need to do to get it working is:

1. Changing the Config.js File by adding your geoserver address
2. Changing the GeoJsApp.js File by adding your geoserver address
3. Running the GeoJsApp.js proxy server in node.js 

GeoJsApp.js is a proxy server with cors

So far
- Automatically loads all geoserver layers
- There is a Bootstrap based Layer Switcher

