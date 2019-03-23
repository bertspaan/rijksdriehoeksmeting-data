#!/usr/bin/env node

const fs = require('fs')
const H = require('highland')
const JSONStream = require('JSONStream')
const axios = require('axios')

const dimensionsCache = require('./dimensions.json')


function timeout (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getManifestUrl (iiifId) {
  return `https://dlc.services/iiif-img/7/1/${iiifId}/info.json`
}

async function cacheDimensions (photos) {
  photos.forEach(async (photo) => {
    const iiifId = photo.iiifId
    if (!dimensionsCache[iiifId]) {
      await timeout(500)

      try {
        const reponse = await axios.get(getManifestUrl(iiifId))
        const manifest = reponse.data

        const dimensions = [
          manifest.width,
          manifest.height
        ]

        dimensionsCache[iiifId] = dimensions

        console.error(`Dimensions found: ${iiifId} = ${dimensions}`)
        fs.writeFileSync('dimensions.json', JSON.stringify(dimensionsCache, null, 2), 'utf8')
      } catch (err) {
        console.error(`Failed reading manifest from server: ${iiifId}`)
      }
    } else {
      console.error(`Cache hit: ${iiifId}`)
    }
  })

  fs.writeFileSync('dimensions.json', JSON.stringify(dimensionsCache, null, 2), 'utf8')
}

const features = process.stdin.pipe(JSONStream.parse('features.*'))

  H(features)
    .map((feature) => feature.properties.photos)
    .flatten()
    .toArray(cacheDimensions)
