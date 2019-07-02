#!/usr/bin/env node

const H = require('highland')
const JSONStream = require('JSONStream')
const argv = require('yargs').argv

const dimensionsCache = require('./dimensions.json')

const iiifIds = {}

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
  const dimensions = dimensionsCache[iiifId]

  if (!dimensions) {
    console.error(`Dimensions not found for: ${iiifId}`)
  }

  return dimensions
}

function isDuplicateIiifId (iiifId) {
  let duplicate = false
  if (iiifIds[iiifId]) {
    console.error(`Duplicate IIIF ID found: ${iiifId}`)
    duplicate = true
  }

  iiifIds[iiifId] = true

  return duplicate
}

function getPropertiesDisplay (feature) {
  const properties =  {
    photos: feature.properties.photos
      .filter((photo) => !isDuplicateIiifId(photo.iiifId))
      .map((photo) => ({
        iiifId: photo.iiifId,
        dimensions: getDimensions(photo.iiifId)
      }))
  }

  if (properties.photos.length === 0) {
    console.error(`Location without photos: ${feature.properties.number}, ${feature.properties.place}`)
  }

  return properties
}

function getPropertiesClient (feature) {
  const photos = feature.properties.photos
    .filter((photo) => !isDuplicateIiifId(photo.iiifId))

  if (photos.length === 0) {
    console.error(`Location without photos: ${feature.properties.number}, ${feature.properties.place}`)
    return
  }

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
  .filter((feature) => feature.properties !== undefined)
  .pipe(JSONStream.stringify(geojson.open, geojson.separator, geojson.close))
  .pipe(process.stdout)
