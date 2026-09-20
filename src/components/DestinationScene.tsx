import { useMemo, type CSSProperties } from 'react'
import type { Activity, Destination } from '../data/destinations'

type DestinationSceneProps = {
  destination: Destination
  isRevealed: boolean
  visibleActivityIds: string[]
  activeActivity: Activity | null
  onSelectActivity: (activity: Activity) => void
}

type OrbitStyle = CSSProperties & {
  '--orbit-delay': string
  '--activity-accent': string
}

const ORBIT_DURATION_SECONDS = 48

export function DestinationScene({
  destination,
  isRevealed,
  visibleActivityIds,
  activeActivity,
  onSelectActivity,
}: DestinationSceneProps) {
  const visibleIds = useMemo(() => new Set(visibleActivityIds), [visibleActivityIds])

  return (
    <section className="destination-scene" aria-label={`Illustrated map of ${destination.name}`}>
      <img
        className="destination-scene-map destination-scene-map-light"
        src={`${import.meta.env.BASE_URL}images/pinawa-scene-light.webp`}
        alt=""
      />
      <img
        className="destination-scene-map destination-scene-map-dark"
        src={`${import.meta.env.BASE_URL}images/pinawa-scene-dark.webp`}
        alt=""
      />

      <div className="destination-scene-shade" aria-hidden="true" />

      <div className="scene-destination-anchor" aria-label={`${destination.name} map centre`}>
        <span className="scene-destination-marker"><span /></span>
        <strong>{destination.name}</strong>
      </div>

      <div className="scene-park-marker" aria-label="Whiteshell Provincial Park">
        <span className="scene-park-tree" aria-hidden="true"><i /><i /><i /></span>
        <span>Whiteshell<br />Provincial Park</span>
      </div>

      <div className="scene-scale" aria-label="Approximate map scale">
        <span>0</span><span>5</span><span>10 km</span>
        <i aria-hidden="true" />
      </div>

      <div
        className="orbit-system destination-orbit"
        aria-label={`Activities around ${destination.name}`}
        aria-hidden={!isRevealed}
      >
        <div className={isRevealed ? 'orbit-reveal is-visible' : 'orbit-reveal'}>
          <div className="orbit-ring" aria-hidden="true" />

          {destination.activities.map((activity, index) => {
            const delay = `${-(index * ORBIT_DURATION_SECONDS) / Math.max(destination.activities.length, 1)}s`
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
                  onClick={() => onSelectActivity(activity)}
                  aria-pressed={activeActivity?.id === activity.id}
                  tabIndex={isRevealed && isVisible ? 0 : -1}
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
      </div>
    </section>
  )
}
