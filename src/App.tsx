import { useMemo, useState, type CSSProperties } from 'react'
import { ExploreMap } from './components/ExploreMap'
import {
  categoryLabels,
  destinations,
  type Activity,
  type ActivityCategory,
  type Destination,
} from './data/destinations'

type CategoryFilter = ActivityCategory | 'all'

function App() {
  const [activeDestination, setActiveDestination] = useState<Destination | null>(null)
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null)
  const [category, setCategory] = useState<CategoryFilter>('all')

  const visibleActivities = useMemo(() => {
    if (!activeDestination) return []
    if (category === 'all') return activeDestination.activities
    return activeDestination.activities.filter((activity) => activity.category === category)
  }, [activeDestination, category])

  const selectDestination = (destination: Destination) => {
    setActiveDestination(destination)
    setActiveActivity(null)
  }

  return (
    <main className="app-shell">
      <ExploreMap
        destinations={destinations}
        activeDestination={activeDestination}
        onSelect={selectDestination}
      />

      <header className="brand-bar">
        <div className="brand-mark" aria-hidden="true">
          <span />
        </div>
        <div>
          <p className="brand-name">Pocket Trip Maps</p>
          <p className="tagline">A little more life, close to home.</p>
        </div>
      </header>

      <aside className="explore-panel" aria-label="Explore destinations">
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

            <div className="activity-list">
              {visibleActivities.length > 0 ? (
                visibleActivities.map((activity, index) => (
                  <button
                    key={activity.id}
                    className={activeActivity?.id === activity.id ? 'activity-card is-active' : 'activity-card'}
                    onClick={() => setActiveActivity(activity)}
                    style={{ '--activity-accent': activity.accent } as CSSProperties}
                  >
                    <span className="activity-number">0{index + 1}</span>
                    <span className="activity-icon" aria-hidden="true">{activity.icon}</span>
                    <span className="activity-main">
                      <strong>{activity.name}</strong>
                      <span>{activity.duration}</span>
                    </span>
                    <span className="activity-arrow" aria-hidden="true">→</span>
                  </button>
                ))
              ) : (
                <p className="empty-filter">No Pinawa activities in this category yet.</p>
              )}
            </div>
          </section>
        )}
      </aside>

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
            <p className="verification-note">Practical details will be linked to current official sources before public launch.</p>
          </div>
        </section>
      )}

      <div className="prototype-note">Pinawa prototype · details in progress</div>
    </main>
  )
}

export default App
