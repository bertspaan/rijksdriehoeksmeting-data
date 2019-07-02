# Rijksdriehoeksmeting - Data

See: http://bertspaan.nl/rijksdriehoeksmeting

To create `locations.geojson`, download the `locations` cell from this Observable notebook: https://observablehq.com/@bertspaan/fotos-meetpunten-rijksdriehoeksmeting/.

Run `create-smaller-geojson.js` to create new versions of the GeoJSON file, tailered for the client and display applications on https://bertspaan.nl/rijksdriehoeksmeting:

    ./create-geojson-version.js -v client < locations.geojson > locations.client.geojson
    ./create-geojson-version.js -v display < locations.geojson > locations.display.geojson

Then, copy these files to https://github.com/bertspaan/rijksdriehoeksmeting.
