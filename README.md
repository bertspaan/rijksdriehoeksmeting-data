# Rijksdriehoeksmeting - Data

Data: https://observablehq.com/d/dfe574b87ae16220

To create `locations.geojson`: use _Download GeoJSON_ in Notebook.

Run `create-smaller-geojson.js` to create new versions of the GeoJSON file, tailered for the client and display applications on https://bertspaan.nl/rijksdriehoeksmeting:

    ./create-geojson-version.js -v client < locations.geojson > locations.client.geojson
    ./create-geojson-version.js -v display < locations.geojson > locations.display.geojson
