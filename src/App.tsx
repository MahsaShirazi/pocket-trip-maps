import { useCallback, useEffect, useMemo, useState } from 'react'
import { DestinationScene } from './components/DestinationScene'
import { ExploreMap } from './components/ExploreMap'
import {
  categoryLabels,
  destinations,
  type Activity,
  type ActivityCategory,
  type Destination,
} from './data/destinations'

type CategoryFilter = ActivityCategory | 'all'
type ThemeMode = 'light' | 'space'

function App() {
  const scenePreviewEnabled = useMemo(
    () => new URLSearchParams(window.location.search).get('preview') === 'scene',
    [],
  )
  const [activeDestination, setActiveDestination] = useState<Destination | null>(null)
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null)
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [orbitVisible, setOrbitVisible] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>(() =>
    window.localStorage.getItem('pocket-trip-theme') === 'space' ? 'space' : 'light',
  )

  useEffect(() => {
    window.localStorage.setItem('pocket-trip-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!scenePreviewEnabled) return

    const images = ['pinawa-scene-light.webp', 'pinawa-scene-dark.webp'].map((fileName) => {
      const image = new Image()
      image.decoding = 'async'
      image.fetchPriority = 'high'
      image.src = `${import.meta.env.BASE_URL}images/${fileName}`
      return image
    })

    return () => {
      images.forEach((image) => {
        image.onload = null
        image.onerror = null
      })
    }
  }, [scenePreviewEnabled])

  const visibleActivities = useMemo(() => {
    if (!activeDestination) return []
    if (category === 'all') return activeDestination.activities
    return activeDestination.activities.filter((activity) => activity.category === category)
  }, [activeDestination, category])

  const selectDestination = (destination: Destination) => {
    if (activeDestination?.id === destination.id) return

    setOrbitVisible(false)
    setActiveDestination(destination)
    setActiveActivity(null)
  }

  const revealOrbit = useCallback(() => setOrbitVisible(true), [])

  return (
    <main className={`app-shell theme-${theme}`}>
      <aside className="explore-panel" aria-label="Explore destinations">
        <header className="brand-bar">
          <div className="brand-mark" aria-hidden="true">
            <span />
          </div>
          <div>
            <p className="brand-name">Pocket Trip Maps</p>
            <p className="tagline">A little more life, close to home.</p>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setTheme((current) => current === 'light' ? 'space' : 'light')}
            aria-pressed={theme === 'space'}
            aria-label={theme === 'space' ? 'Switch to light map' : 'Switch to dark map'}
            title={theme === 'space' ? 'Switch to light map' : 'Switch to dark map'}
          >
            <span className="theme-toggle-icon" aria-hidden="true">
              {theme === 'space' ? '☀' : '✦'}
            </span>
            <span>{theme === 'space' ? 'Light' : 'Dark'}</span>
          </button>
        </header>

        <div className="panel-topline">
          <span className="eyebrow">Manitoba · first edition</span>
          <span className="place-count">01 place</span>
        </div>

        {!activeDestination ? (
          <section className="welcome-state">
            <p className="kicker">Your next free day</p>
            <h1>Where could it take you?</h1>
            <p className="welcome-copy">
              Start with the map. Pick a place, then see what fits your time, energy,
              and budget.
            </p>
            <button className="primary-action" onClick={() => selectDestination(destinations[0])}>
              Explore Pinawa
              <span aria-hidden="true">↗</span>
            </button>
            <p className="map-hint"><span /> Or choose the glowing pin</p>
          </section>
        ) : (
          <section className="destination-state">
            <button
              className="back-button"
              onClick={() => {
                setOrbitVisible(false)
                setActiveDestination(null)
                setActiveActivity(null)
              }}
            >
              <span aria-hidden="true">←</span> Manitoba
            </button>

            <p className="kicker">{activeDestination.region}</p>
            <h1>{activeDestination.name}</h1>
            <p className="destination-copy">{activeDestination.shortDescription}</p>
            <div className="drive-note"><span aria-hidden="true">⌖</span>{activeDestination.driveNote}</div>

            <div className="filter-row" aria-label="Filter activities">
              {(Object.keys(categoryLabels) as CategoryFilter[]).map((key) => (
                <button
                  key={key}
                  className={category === key ? 'filter-chip is-active' : 'filter-chip'}
                  aria-pressed={category === key}
                  onClick={() => {
                    setCategory(key)
                    setActiveActivity(null)
                  }}
                >
                  {categoryLabels[key]}
                </button>
              ))}
            </div>

            <div className="activity-list" aria-label={`Activities in ${activeDestination.name}`}>
              <div className="activity-list-heading">
                <h2>Activities</h2>
                <span>{visibleActivities.length}</span>
              </div>
              {visibleActivities.length > 0 ? (
                visibleActivities.map((activity) => (
                  <button
                    key={activity.id}
                    className={
                      activeActivity?.id === activity.id
                        ? 'activity-card is-active'
                        : 'activity-card'
                    }
                    onClick={() => setActiveActivity(activity)}
                  >
                    <span
                      className="activity-card-thumb"
                      style={{ backgroundColor: activity.accent }}
                      aria-hidden="true"
                    >
                      {activity.imageSrc ? <img src={activity.imageSrc} alt="" /> : activity.icon}
                    </span>
                    <span className="activity-card-copy">
                      <strong>{activity.name}</strong>
                      <span>{activity.duration} · {activity.costShort}</span>
                    </span>
                    <span className="activity-card-arrow" aria-hidden="true">→</span>
                  </button>
                ))
              ) : (
                <p className="empty-filter">No activities in this category yet.</p>
              )}
            </div>

            <div className="orbit-prompt">
              <span aria-hidden="true">↻</span>
              <div>
                <strong>Explore on the map</strong>
                <p>
                  Choose one of the moving activity bubbles around {activeDestination.name}
                  to see its practical details.
                </p>
              </div>
            </div>
            <p className="price-note">*Price and access details still need current verification.</p>
          </section>
        )}
      </aside>

      <section className="map-stage" aria-label="Map exploration area">
        <ExploreMap
          destinations={destinations}
          activeDestination={activeDestination}
          renderMapOrbit={!scenePreviewEnabled}
          orbitVisible={orbitVisible}
          visibleActivityIds={visibleActivities.map((activity) => activity.id)}
          activeActivity={activeActivity}
          onSelect={selectDestination}
          onSelectActivity={setActiveActivity}
          onMapArrival={revealOrbit}
        />

        {scenePreviewEnabled && activeDestination && (
          <DestinationScene
            destination={activeDestination}
            isRevealed={orbitVisible}
            visibleActivityIds={visibleActivities.map((activity) => activity.id)}
            activeActivity={activeActivity}
            onSelectActivity={setActiveActivity}
          />
        )}

        <div className="map-compass" aria-label="Map orientation: north is up">
          <span>N</span>
          <i aria-hidden="true" />
        </div>

        {activeDestination && visibleActivities.length === 0 && (
          <p className="map-empty-filter">No activities in this category yet.</p>
        )}

        {activeActivity && (
          <section className="activity-detail" aria-live="polite">
            <button className="detail-close" onClick={() => setActiveActivity(null)} aria-label="Close activity details">×</button>
            <div className="detail-accent" style={{ background: activeActivity.accent }} aria-hidden="true">
              <span>{activeActivity.icon}</span>
            </div>
            <div className="detail-content">
              <p className="eyebrow">A Pinawa possibility</p>
              <h2>{activeActivity.name}</h2>
              <p>{activeActivity.summary}</p>
              <div className="detail-facts">
                <div><span>Time</span><strong>{activeActivity.duration}</strong></div>
                <div><span>Cost</span><strong>{activeActivity.cost}</strong></div>
              </div>
              <div className="bring-list">
                <span>Bring</span>
                <ul>{activeActivity.bring.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              {activeActivity.imageCredit && activeActivity.imageSourceUrl && (
                <p className="photo-credit">
                  Temporary representative photo:{' '}
                  <a href={activeActivity.imageSourceUrl} target="_blank" rel="noreferrer">
                    {activeActivity.imageCredit}
                  </a>
                </p>
              )}
              <p className="verification-note">Practical details will be linked to current official sources before public launch.</p>
            </div>
          </section>
        )}

        <div className="prototype-note">Pinawa prototype · details in progress</div>
      </section>
    </main>
  )
}

export default App
