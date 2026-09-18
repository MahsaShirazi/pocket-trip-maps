import { divIcon } from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, Pane, TileLayer, useMap } from 'react-leaflet'
import type { Activity, Destination } from '../data/destinations'
import { ActivityOrbit } from './ActivityOrbit'

type ExploreMapProps = {
  destinations: Destination[]
  activeDestination: Destination | null
  visibleActivityIds: string[]
  activeActivity: Activity | null
  onSelect: (destination: Destination) => void
  onSelectActivity: (activity: Activity) => void
}

function MapFocus({ destination }: { destination: Destination | null }) {
  const map = useMap()

  useEffect(() => {
    if (destination) {
      map.flyTo(destination.coordinates, 12, { duration: 1.35 })
    } else {
      map.flyTo([54.35, -97.2], 5, { duration: 1.1 })
    }
  }, [destination, map])

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
  visibleActivityIds,
  activeActivity,
  onSelect,
  onSelectActivity,
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
            visibleActivityIds={visibleActivityIds}
            activeActivity={activeActivity}
            onSelect={onSelectActivity}
          />
        </Pane>
      )}
      <MapFocus destination={activeDestination} />
    </MapContainer>
  )
}
