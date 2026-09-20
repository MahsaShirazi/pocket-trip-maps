import { divIcon, type LatLngBoundsExpression } from 'leaflet'
import { useEffect } from 'react'
import {
  ImageOverlay,
  MapContainer,
  Marker,
  Pane,
  ScaleControl,
  TileLayer,
  useMap,
} from 'react-leaflet'
import type { Activity, Destination } from '../data/destinations'
import { ActivityOrbit } from './ActivityOrbit'

const TOPO_TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
const DESTINATION_ZOOM = 12
const PINAWA_ARTWORK_BOUNDS: LatLngBoundsExpression = [
  [49.9955, -96.1774],
  [50.2555, -95.5974],
]
const PINAWA_ARTWORK_FILES = ['pinawa-map-light.webp', 'pinawa-map-dark.webp']

function topoTileUrl(coordinates: [number, number], xOffset: number, yOffset: number) {
  const [latitude, longitude] = coordinates
  const tileCount = 2 ** DESTINATION_ZOOM
  const x = Math.floor(((longitude + 180) / 360) * tileCount) + xOffset
  const latitudeRadians = (latitude * Math.PI) / 180
  const y = Math.floor(
    ((1 - Math.asinh(Math.tan(latitudeRadians)) / Math.PI) / 2) * tileCount,
  ) + yOffset

  return TOPO_TILE_URL
    .replace('{z}', String(DESTINATION_ZOOM))
    .replace('{x}', String(x))
    .replace('{y}', String(y))
}

function DestinationTilePreloader({ destinations }: { destinations: Destination[] }) {
  useEffect(() => {
    const images: HTMLImageElement[] = []
    const timer = window.setTimeout(() => {
      PINAWA_ARTWORK_FILES.forEach((fileName) => {
        const image = new Image()
        image.decoding = 'async'
        image.fetchPriority = 'high'
        image.src = `${import.meta.env.BASE_URL}images/${fileName}`
        images.push(image)
      })

      destinations.forEach((destination) => {
        for (let yOffset = -2; yOffset <= 2; yOffset += 1) {
          for (let xOffset = -2; xOffset <= 2; xOffset += 1) {
            const image = new Image()
            image.decoding = 'async'
            image.fetchPriority = 'low'
            image.src = topoTileUrl(destination.coordinates, xOffset, yOffset)
            images.push(image)
          }
        }
      })
    }, 350)

    return () => {
      window.clearTimeout(timer)
      images.forEach((image) => {
        image.onload = null
        image.onerror = null
      })
    }
  }, [destinations])

  return null
}

type ExploreMapProps = {
  destinations: Destination[]
  activeDestination: Destination | null
  orbitVisible: boolean
  visibleActivityIds: string[]
  activeActivity: Activity | null
  onSelect: (destination: Destination) => void
  onSelectActivity: (activity: Activity) => void
  onMapArrival: () => void
}

function MapFocus({
  destination,
  onArrival,
}: {
  destination: Destination | null
  onArrival: () => void
}) {
  const map = useMap()

  useEffect(() => {
    let arrivalTimer: number | undefined
    let finishArrival: (() => void) | undefined

    if (destination) {
      finishArrival = () => {
        const isAtDestination =
          map.getZoom() === 12 &&
          map.distance(map.getCenter(), destination.coordinates) < 50

        if (!isAtDestination) return
        arrivalTimer = window.setTimeout(onArrival, 120)
      }

      map.stop()
      map.on('moveend', finishArrival)
      map.flyTo(destination.coordinates, 12, { duration: 2.8 })
    } else {
      const overviewCoordinates: [number, number] = [54.35, -97.2]
      const isAtOverview =
        map.getZoom() === 5 &&
        map.distance(map.getCenter(), overviewCoordinates) < 50

      if (!isAtOverview) {
        map.stop()
        map.flyTo(overviewCoordinates, 5, { duration: 1.35 })
      }
    }

    return () => {
      if (finishArrival) map.off('moveend', finishArrival)
      if (arrivalTimer !== undefined) window.clearTimeout(arrivalTimer)
    }
  }, [destination, map, onArrival])

  return null
}

const destinationIcon = divIcon({
  className: 'destination-marker-shell',
  html: '<span class="destination-marker"><span></span></span><strong class="destination-marker-label">Pinawa</strong>',
  iconSize: [120, 74],
  iconAnchor: [60, 21],
})

const parkIcon = divIcon({
  className: 'park-marker-shell',
  html: '<span class="park-tree" aria-hidden="true"><i></i><i></i><i></i></span><span class="park-marker-label">Whiteshell<br>Provincial Park</span>',
  iconSize: [128, 82],
  iconAnchor: [64, 41],
})

export function ExploreMap({
  destinations,
  activeDestination,
  orbitVisible,
  visibleActivityIds,
  activeActivity,
  onSelect,
  onSelectActivity,
  onMapArrival,
}: ExploreMapProps) {
  return (
    <MapContainer
      center={[54.35, -97.2]}
      zoom={5}
      minZoom={4}
      maxZoom={15}
      zoomControl={false}
      className="map"
      aria-label="Interactive map of Manitoba day-trip destinations"
    >
      <TileLayer
        attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> — Sources: Esri, TomTom, Garmin, FAO, NOAA, USGS, OpenStreetMap contributors, and the GIS User Community'
        url={TOPO_TILE_URL}
        keepBuffer={2}
        maxNativeZoom={18}
        updateWhenIdle={false}
        updateWhenZooming
        updateInterval={180}
      />
      <Pane name="destination-artwork" style={{ zIndex: 225 }}>
        {activeDestination && (
          <>
            <ImageOverlay
              bounds={PINAWA_ARTWORK_BOUNDS}
              className="destination-map-art destination-map-art-light"
              opacity={1}
              url={`${import.meta.env.BASE_URL}images/pinawa-map-light.webp`}
            />
            <ImageOverlay
              bounds={PINAWA_ARTWORK_BOUNDS}
              className="destination-map-art destination-map-art-dark"
              opacity={1}
              url={`${import.meta.env.BASE_URL}images/pinawa-map-dark.webp`}
            />
          </>
        )}
      </Pane>
      <DestinationTilePreloader destinations={destinations} />
      {destinations.map((destination) => (
        <Marker
          key={destination.id}
          position={destination.coordinates}
          icon={destinationIcon}
          eventHandlers={{ click: () => onSelect(destination) }}
          title={`Explore ${destination.name}`}
        />
      ))}
      {activeDestination && (
        <Pane name="park-label" style={{ zIndex: 450 }}>
          <Marker
            position={[50.105, -95.78]}
            icon={parkIcon}
            interactive={false}
          />
        </Pane>
      )}
      {activeDestination && (
        <Pane name="activity-orbit" style={{ zIndex: 590 }}>
          <ActivityOrbit
            destination={activeDestination}
            activities={activeDestination.activities}
            isRevealed={orbitVisible}
            visibleActivityIds={visibleActivityIds}
            activeActivity={activeActivity}
            onSelect={onSelectActivity}
          />
        </Pane>
      )}
      <MapFocus destination={activeDestination} onArrival={onMapArrival} />
      <ScaleControl position="bottomright" imperial={false} maxWidth={110} />
    </MapContainer>
  )
}
