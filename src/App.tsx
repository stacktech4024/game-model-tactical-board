import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="app-hero" aria-labelledby="app-title">
        <p className="eyebrow">Canada Soccer Game Model</p>
        <h1 id="app-title">React shell is ready.</h1>
        <p className="lead">
          This scaffold keeps React focused on the app shell. The future pitch
          renderer will live in Pixi, and the scenario engine will own the
          truth.
        </p>
      </section>

      <section className="app-card" aria-labelledby="structure-title">
        <h2 id="structure-title">Checkpoint 1 scaffold</h2>
        <p>
          The root project layout is in place for app, domain, pitch, players,
          scenarios, simulation, renderers, pixi, layers, data, and styles.
        </p>
        <p>The next checkpoint can start filling in one slice at a time.</p>
      </section>
    </main>
  )
}

export default App
