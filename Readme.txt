This project was written using the following
- OpenLayers 3 mapping library
- Bootstrap, twitter's HTML, CSS, and JS framework, for the UI
- Proj4js  for coordinate transformations
- jQuery for dom manipulation and ajax requests


The file index.html contains the library references and web app markup
The file js/my-code.js the code I wrote for the assignment

Since the assignment recommended a time limit of 2 to 4 hours, the solution is purely a javascript one.
which means
- No backend modules to read data.
- No database was used to store the tab delimited info of the txt files.
- No GIS server was used to serve the spatial information

The applications has the following functions and specifications
- a Tree view of the displayed layers
- a Map, with default starting extent at Keyworth
- the Map supports pan/zoom-in/zoom-out via mouse clicks and scroll
- the Map uses EPSG:27700 British National Grid for minimal distortion, and partially compatibility with the data provided
- Search function that uses http://nominatim.openstreetmap.org/ json services
    * no like expression, only literals e.g. "Keyworth"
    * postcodes need a space e.g. "NG12 4EB"
    * an attempt was made so as the results to return items only within the UK, partially successful
- identify function by clicking in the center of the displayed location
    * if record an image the popup displays the image as well