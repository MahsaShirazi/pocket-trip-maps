import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useMap } from 'react-leaflet'
import type { Activity, Destination } from '../data/destinations'

type ActivityOrbitProps = {
  destination: Destination
  activities: Activity[]
  visibleActivityIds: string[]
  activeActivity: Activity | null
  onSelect: (activity: Activity) => void
}

type OrbitStyle = CSSProperties & {
  '--orbit-delay': string
  '--activity-accent': string
}

export function ActivityOrbit({
  destination,
  activities,
  visibleActivityIds,
  activeActivity,
  onSelect,
}: ActivityOrbitProps) {
  const map = useMap()
  const [anchor, setAnchor] = useState(() =>
    map.latLngToLayerPoint(destination.coordinates),
  )
  const visibleIds = useMemo(() => new Set(visibleActivityIds), [visibleActivityIds])

  useEffect(() => {
    const updateAnchor = () => {
      setAnchor(map.latLngToLayerPoint(destination.coordinates))
    }

    updateAnchor()
    map.on('zoomend viewreset moveend resize', updateAnchor)

    return () => {
      map.off('zoomend viewreset moveend resize', updateAnchor)
    }
  }, [destination.coordinates, map])

  return (
    <div
      className="orbit-system"
      style={{ transform: `translate3d(${anchor.x}px, ${anchor.y}px, 0)` }}
      aria-label={`Activities around ${destination.name}`}
    >
      <div className="orbit-ring" aria-hidden="true" />
      <span className="destination-pin-label" aria-hidden="true">{destination.name}</span>

      {activities.map((activity, index) => {
        const delay = `${-(index * 36) / Math.max(activities.length, 1)}s`
        const style: OrbitStyle = {
          '--orbit-delay': delay,
          '--activity-accent': activity.accent,
        }
        const isVisible = visibleIds.has(activity.id)

        return (
          <div
            className={isVisible ? 'orbit-track' : 'orbit-track is-hidden'}
            style={style}
            key={activity.id}
            aria-hidden={!isVisible}
          >
            <button
              className={
                activeActivity?.id === activity.id
                  ? 'activity-bubble is-active'
                  : 'activity-bubble'
              }
              onClick={() => onSelect(activity)}
              aria-pressed={activeActivity?.id === activity.id}
              tabIndex={isVisible ? 0 : -1}
            >
              {activity.imageSrc ? (
                <img className="bubble-photo" src={activity.imageSrc} alt="" />
              ) : (
                <span className="bubble-icon" aria-hidden="true">{activity.icon}</span>
              )}
              <span className="bubble-copy">
                <strong>{activity.name}</strong>
                <span>{activity.duration}</span>
                <em>{activity.costShort}</em>
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
