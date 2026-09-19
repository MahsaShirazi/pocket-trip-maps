import * as L from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

type MapTheme = 'light' | 'space'

type VectorGridFactory = {
  protobuf: (url: string, options: Record<string, unknown>) => L.GridLayer
}

type LeafletWithVectorGrid = typeof L & {
  vectorGrid?: VectorGridFactory
  canvas: typeof L.canvas & {
    tile?: (...args: unknown[]) => L.Renderer
  }
}

type TileJson = {
  tiles?: string[]
  maxzoom?: number
  vector_layers?: Array<{ id: string }>
}

// Leaflet's ESM namespace is read-only, while VectorGrid augments `window.L`.
// Keep one mutable facade so the plugin remains available after theme changes.
const leafletRuntime = { ...L } as LeafletWithVectorGrid

const OPEN_FREE_MAP_TILEJSON = 'https://tiles.openfreemap.org/planet'
const OPEN_FREE_MAP_ATTRIBUTION =
  '&copy; <a href="https://openfreemap.org/">OpenFreeMap</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>'

export function StyledWaterLayer({ theme }: { theme: MapTheme }) {
  const map = useMap()

  useEffect(() => {
    const controller = new AbortController()
    let waterLayer: L.GridLayer | undefined
    let attributionAdded = false

    const addWaterLayer = async () => {
      try {
        // VectorGrid expects Leaflet on the browser global. Loading it lazily keeps
        // the ordinary raster map independent, so it remains available as a fallback.
        ;(window as typeof window & { L?: LeafletWithVectorGrid }).L = leafletRuntime
        await import('leaflet.vectorgrid')

        const response = await fetch(OPEN_FREE_MAP_TILEJSON, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Water tiles returned ${response.status}`)

        const tileJson = (await response.json()) as TileJson
        const tileUrl = tileJson.tiles?.[0]
        const vectorGrid = leafletRuntime.vectorGrid
        const rendererFactory = leafletRuntime.canvas.tile
        if (!tileUrl || !vectorGrid || !rendererFactory || controller.signal.aborted) return

        if (!map.getPane('styled-water')) {
          const pane = map.createPane('styled-water')
          pane.classList.add('styled-water-pane')
          pane.style.zIndex = '210'
          pane.style.pointerEvents = 'none'
        }

        const waterColor = theme === 'space' ? '#1d709b' : '#70c2c6'
        const vectorTileLayerStyles: Record<string, unknown> = Object.fromEntries(
          (tileJson.vector_layers ?? []).map(({ id }) => [id, []]),
        )

        vectorTileLayerStyles.water = {
          fill: true,
          fillColor: waterColor,
          fillOpacity: 1,
          stroke: false,
          weight: 0,
        }
        vectorTileLayerStyles.waterway = {
          color: waterColor,
          opacity: 1,
          weight: 1.25,
        }

        waterLayer = vectorGrid.protobuf(tileUrl, {
          pane: 'styled-water',
          rendererFactory,
          interactive: false,
          maxNativeZoom: tileJson.maxzoom ?? 14,
          vectorTileLayerStyles,
        })

        if (controller.signal.aborted) return
        waterLayer.addTo(map)
        map.attributionControl.addAttribution(OPEN_FREE_MAP_ATTRIBUTION)
        attributionAdded = true
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('The enhanced water styling could not be loaded.', error)
        }
      }
    }

    void addWaterLayer()

    return () => {
      controller.abort()
      if (waterLayer) waterLayer.removeFrom(map)
      if (attributionAdded) {
        map.attributionControl.removeAttribution(OPEN_FREE_MAP_ATTRIBUTION)
      }
    }
  }, [map, theme])

  return null
}
