import type { CSSProperties } from 'react'
import type { Activity, Destination } from '../data/destinations'

type ActivityOrbitProps = {
  destination: Destination
  activities: Activity[]
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
  activeActivity,
  onSelect,
}: ActivityOrbitProps) {
  return (
    <div className="orbit-system" aria-label={`Activities around ${destination.name}`}>
      <div className="orbit-ring" aria-hidden="true" />
      <span className="destination-pin-label" aria-hidden="true">{destination.name}</span>

      {activities.map((activity, index) => {
        const delay = `${-(index * 36) / Math.max(activities.length, 1)}s`
        const style: OrbitStyle = {
          '--orbit-delay': delay,
          '--activity-accent': activity.accent,
        }

        return (
          <div className="orbit-track" style={style} key={activity.id}>
            <button
              className={
                activeActivity?.id === activity.id
                  ? 'activity-bubble is-active'
                  : 'activity-bubble'
              }
              onClick={() => onSelect(activity)}
              aria-pressed={activeActivity?.id === activity.id}
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
