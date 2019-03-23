#!/usr/bin/env node

const H = require('highland')
const JSONStream = require('JSONStream')
const argv = require('yargs').argv

const dimensionsCache = require('./dimensions.json')

let getProperties

if (argv.v === 'display') {
  getProperties = getPropertiesDisplay
} else if (argv.v === 'client') {
  getProperties = getPropertiesClient
} else {
  console.error(`Set version with -v! Must be either display or client!!!`)
  process.exit(1)
}

function getDimensions (iiifId) {
  dimensions = dimensionsCache[iiifId]

  if (!dimensions) {
    console.error(`Dimensions not found for: ${iiifId}`)
  }

  return dimensions
}

function getPropertiesDisplay (feature) {
  return {
    photos: feature.properties.photos.map((photo) => ({
      iiifId: photo.iiifId,
      dimensions: getDimensions(photo.iiifId)
    }))
  }
}

function getPropertiesClient (feature) {
  return null
}

const features = process.stdin.pipe(JSONStream.parse('features.*'))

const geojson = {
  open: '{"type":"FeatureCollection","features":[',
  close: ']}\n',
  separator: ',\n'
}

function roundCoordinate (c) {
  return parseFloat(c.toFixed(7))
}

let id = 0

H(features)
  .map((feature) => ({
    type: 'Feature',
    id: id++,
    properties: getProperties(feature),
    geometry: {
      type: 'Point',
      coordinates: feature.geometry.coordinates.map(roundCoordinate)
    }
  }))
  .pipe(JSONStream.stringify(geojson.open, geojson.separator, geojson.close))
  .pipe(process.stdout)
