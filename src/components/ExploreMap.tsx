import { divIcon } from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, Pane, useMap } from 'react-leaflet'
import type { Activity, Destination } from '../data/destinations'
import { ActivityOrbit } from './ActivityOrbit'
import { VectorBaseMap, type MapTheme } from './VectorBaseMap'

type ExploreMapProps = {
  destinations: Destination[]
  activeDestination: Destination | null
  orbitVisible: boolean
  visibleActivityIds: string[]
  activeActivity: Activity | null
  onSelect: (destination: Destination) => void
  onSelectActivity: (activity: Activity) => void
  onMapArrival: () => void
  theme: MapTheme
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
  orbitVisible,
  visibleActivityIds,
  activeActivity,
  onSelect,
  onSelectActivity,
  onMapArrival,
  theme,
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
      <VectorBaseMap theme={theme} />
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
