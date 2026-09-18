import { maplibreGL } from '@maplibre/maplibre-gl-leaflet'
import mlcontour from 'maplibre-contour'
import * as maplibregl from 'maplibre-gl'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export type MapTheme = 'light' | 'space'

type VectorBaseMapProps = {
  theme: MapTheme
}

const STYLE_URLS: Record<MapTheme, string> = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  space: 'https://tiles.openfreemap.org/styles/dark',
}

const MAP_ATTRIBUTION =
  '<a href="https://openfreemap.org">OpenFreeMap</a> ' +
  '<a href="https://www.openmaptiles.org/">© OpenMapTiles</a> ' +
  'Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

const contourDem = new mlcontour.DemSource({
  url: 'https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png',
  encoding: 'mapbox',
  maxzoom: 12,
  worker: true,
  cacheSize: 80,
})

contourDem.setupMaplibre(maplibregl)

function setPaint(
  map: maplibregl.Map,
  layerId: string,
  property: string,
  value: unknown,
) {
  if (map.getLayer(layerId)) {
    map.setPaintProperty(layerId, property as Parameters<typeof map.setPaintProperty>[1], value as never)
  }
}

function styleLabels(map: maplibregl.Map, theme: MapTheme) {
  const textColor = theme === 'space' ? '#a9c8da' : '#49645d'
  const haloColor = theme === 'space' ? '#071927' : '#eef4ed'

  map.getStyle().layers.forEach((layer) => {
    if (layer.type !== 'symbol') return
    setPaint(map, layer.id, 'text-color', textColor)
    setPaint(map, layer.id, 'text-halo-color', haloColor)
    setPaint(map, layer.id, 'text-halo-width', theme === 'space' ? 1.25 : 1)
  })

  const waterLabels = [
    'water_name',
    'waterway_line_label',
    'water_name_point_label',
    'water_name_line_label',
  ]
  waterLabels.forEach((id) => setPaint(map, id, 'text-color', theme === 'space' ? '#64b4cf' : '#287d8a'))
}

function applyLightCartography(map: maplibregl.Map) {
  setPaint(map, 'background', 'background-color', '#dfe9e2')
  setPaint(map, 'water', 'fill-color', '#72c6ce')
  setPaint(map, 'waterway', 'line-color', '#64bac4')
  setPaint(map, 'park', 'fill-color', '#cee0d4')
  setPaint(map, 'landuse_park', 'fill-color', '#cee0d4')
  setPaint(map, 'landcover_wood', 'fill-color', '#d2e2d5')
  setPaint(map, 'landuse_residential', 'fill-color', '#e4ebe3')
  setPaint(map, 'building', 'fill-color', '#e6e7dc')
  setPaint(map, 'highway_minor', 'line-color', '#f5f2e8')
  setPaint(map, 'highway_major_casing', 'line-color', '#cbd6ce')
  setPaint(map, 'highway_major_inner', 'line-color', '#fffaf0')
  setPaint(map, 'highway_motorway_casing', 'line-color', '#c5d2ca')
  setPaint(map, 'highway_motorway_inner', 'line-color', '#fff7e8')
  styleLabels(map, 'light')
}

function addDarkTopography(map: maplibregl.Map) {
  const firstLabel = map.getStyle().layers.find((layer) => layer.type === 'symbol')?.id

  if (!map.getSource('pocket-trip-hillshade')) {
    map.addSource('pocket-trip-hillshade', {
      type: 'raster-dem',
      encoding: 'mapbox',
      tiles: [contourDem.sharedDemProtocolUrl],
      tileSize: 256,
      maxzoom: 12,
    })
  }

  if (!map.getLayer('pocket-trip-relief')) {
    map.addLayer(
      {
        id: 'pocket-trip-relief',
        type: 'hillshade',
        source: 'pocket-trip-hillshade',
        paint: {
          'hillshade-exaggeration': 0.22,
          'hillshade-shadow-color': '#020a11',
          'hillshade-highlight-color': '#2b6474',
          'hillshade-accent-color': '#0b3f53',
          'hillshade-illumination-direction': 320,
        },
      },
      firstLabel,
    )
  }

  if (!map.getSource('pocket-trip-contours')) {
    map.addSource('pocket-trip-contours', {
      type: 'vector',
      tiles: [
        contourDem.contourProtocolUrl({
          thresholds: {
            4: [100, 500],
            5: [100, 500],
            6: [50, 200],
            7: [50, 200],
            8: [20, 100],
            9: [20, 100],
            10: [10, 50],
            11: [10, 50],
            12: [5, 20],
            13: [5, 20],
            14: [5, 20],
            15: [5, 20],
          },
          contourLayer: 'contours',
          elevationKey: 'ele',
          levelKey: 'level',
          overzoom: 1,
        }),
      ],
      maxzoom: 15,
    })
  }

  if (!map.getLayer('pocket-trip-contour-lines')) {
    map.addLayer(
      {
        id: 'pocket-trip-contour-lines',
        type: 'line',
        source: 'pocket-trip-contours',
        'source-layer': 'contours',
        paint: {
          'line-color': '#62b6cd',
          'line-opacity': ['match', ['get', 'level'], 1, 0.2, 0.1],
          'line-width': ['match', ['get', 'level'], 1, 0.85, 0.45],
        },
      },
      firstLabel,
    )
  }
}

function applySpaceCartography(map: maplibregl.Map) {
  setPaint(map, 'background', 'background-color', '#061826')
  setPaint(map, 'water', 'fill-color', '#115d86')
  setPaint(map, 'waterway', 'line-color', '#1e6e91')
  setPaint(map, 'landcover_wood', 'fill-color', '#092635')
  setPaint(map, 'park', 'fill-color', '#0b2b39')
  setPaint(map, 'landuse_park', 'fill-color', '#0b2b39')
  setPaint(map, 'landuse_residential', 'fill-color', '#0a1f2e')
  setPaint(map, 'building', 'fill-color', '#0c2332')
  setPaint(map, 'highway_path', 'line-color', '#18364a')
  setPaint(map, 'highway_minor', 'line-color', '#1d3d52')
  setPaint(map, 'highway_major_casing', 'line-color', '#284c63')
  setPaint(map, 'highway_major_inner', 'line-color', '#17364b')
  setPaint(map, 'highway_motorway_casing', 'line-color', '#31546a')
  setPaint(map, 'highway_motorway_inner', 'line-color', '#1a3b51')
  setPaint(map, 'boundary_state', 'line-color', '#2e566d')
  setPaint(map, 'boundary_3', 'line-color', '#2e566d')
  setPaint(map, 'boundary_2', 'line-color', '#3b647a')
  styleLabels(map, 'space')
  addDarkTopography(map)
}

function applyCartography(map: maplibregl.Map, theme: MapTheme) {
  if (theme === 'space') applySpaceCartography(map)
  else applyLightCartography(map)
}

export function VectorBaseMap({ theme }: VectorBaseMapProps) {
  const map = useMap()

  useEffect(() => {
    const layer = maplibreGL({
      style: STYLE_URLS[theme],
      attributionControl: false,
      fadeDuration: 180,
    }).addTo(map)
    const vectorMap = layer.getMaplibreMap()
    const handleStyleLoad = () => applyCartography(vectorMap, theme)

    vectorMap.on('style.load', handleStyleLoad)
    if (vectorMap.isStyleLoaded()) handleStyleLoad()
    map.attributionControl.addAttribution(MAP_ATTRIBUTION)

    return () => {
      vectorMap.off('style.load', handleStyleLoad)
      map.attributionControl.removeAttribution(MAP_ATTRIBUTION)
      layer.remove()
    }
  }, [map, theme])

  return null
}
