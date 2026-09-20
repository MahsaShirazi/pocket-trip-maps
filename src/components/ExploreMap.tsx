import { divIcon } from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, Pane, TileLayer, useMap } from 'react-leaflet'
import type { Activity, Destination } from '../data/destinations'
import { ActivityOrbit } from './ActivityOrbit'

const TOPO_TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
const DESTINATION_ZOOM = 12

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
  renderMapOrbit: boolean
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
  html: '<span class="destination-marker"><span></span></span>',
  iconSize: [42, 42],
  iconAnchor: [21, 51],
})

export function ExploreMap({
  destinations,
  activeDestination,
  renderMapOrbit,
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
      {activeDestination && renderMapOrbit && (
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
    </MapContainer>
  )
}
