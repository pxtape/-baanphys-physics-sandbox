export function App() {
  return (
    <div className="application">
      <header className="brand">
        <span className="brand-mark" aria-hidden="true">b.</span>
        <span>BaanPhys <span className="brand-detail">/ Physics Sandbox</span></span>
      </header>

      <main id="main-content" className="welcome">
        <p className="eyebrow">Physics teaching workspace</p>
        <h1>A place to build<br />and explore physics.</h1>
        <p className="introduction">
          The workspace foundation is ready. Scene creation and simulation
          controls will arrive in the next development tasks.
        </p>
        <div className="scope-note">
          <span className="status-dot" aria-hidden="true" />
          <p>Foundation preview · Scene editing is not available yet.</p>
        </div>
      </main>

      <footer className="footer">
        <span>BaanPhys Physics Sandbox</span>
        <span>Built for understanding.</span>
      </footer>
    </div>
  );
}
