import { divIcon } from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, Pane, TileLayer, useMap } from 'react-leaflet'
import type { Activity, Destination } from '../data/destinations'
import { ActivityOrbit } from './ActivityOrbit'

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
        arrivalTimer = window.setTimeout(onArrival, 120)
      }

      map.stop()
      map.once('moveend', finishArrival)
      map.flyTo(destination.coordinates, 12, { duration: 2.8 })
    } else {
      map.stop()
      map.flyTo([54.35, -97.2], 5, { duration: 1.35 })
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
  iconAnchor: [21, 36],
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
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
