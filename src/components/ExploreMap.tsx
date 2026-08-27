import { divIcon } from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import type { Destination } from '../data/destinations'

type ExploreMapProps = {
  destinations: Destination[]
  activeDestination: Destination | null
  onSelect: (destination: Destination) => void
}

function MapFocus({ destination }: { destination: Destination | null }) {
  const map = useMap()

  useEffect(() => {
    if (destination) {
      map.flyTo(destination.coordinates, 12, { duration: 1.35 })
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
  onSelect,
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
      <MapFocus destination={activeDestination} />
    </MapContainer>
  )
}
