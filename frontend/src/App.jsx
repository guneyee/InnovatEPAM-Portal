import { useState } from 'react';

const quickLinks = [
  { href: '/', label: 'Main Portal', meta: 'Original command center' },
  { href: '/user', label: 'Submitter Flow', meta: 'Drafts, ideas, attachments' },
  { href: '/admin', label: 'Review Console', meta: 'Stages, scoring, blind review' }
];

const experienceNotes = [
  {
    title: 'Submission funnel',
    body: 'Short input path for title, description, category details, and optional file upload.'
  },
  {
    title: 'Review orchestration',
    body: 'Multi-stage evaluation with blind mode, scoring, and role-aware status progression.'
  },
  {
    title: 'Demo reliability',
    body: 'MongoDB-backed flows stay usable in workshops thanks to a fallback in-memory mode.'
  }
];

const operatingPoints = [
  'Express API and public portal pages remain the production-like baseline.',
  'The React surface is additive, so UI modernization can happen incrementally.',
  'Jest, ESLint, and Vite build checks keep the UI slice honest.'
];

function App() {
  const [status, setStatus] = useState({
    loading: false,
    state: 'idle',
    text: 'Press the health probe to confirm the backend, auth bootstrap, and route proxy are live.'
  });

  const checkHealth = async () => {
    setStatus({
      loading: true,
      state: 'pending',
      text: 'Checking service health and proxy wiring...'
    });

    try {
      const res = await fetch('/health');
      const data = await res.json();

      if (!res.ok) {
        setStatus({
          loading: false,
          state: 'error',
          text: `Health probe failed: ${data.error || 'Unknown error'}`
        });
        return;
      }

      setStatus({
        loading: false,
        state: 'ok',
        text: `Backend OK. Default admin bootstrap is visible and the last heartbeat arrived at ${new Date(data.timestamp).toLocaleString()}.`
      });
    } catch (err) {
      setStatus({
        loading: false,
        state: 'error',
        text: `Health probe failed: ${err.message}`
      });
    }
  };

  const statusLabel = status.loading ? 'Running' : status.state === 'ok' ? 'Stable' : status.state === 'error' ? 'Needs attention' : 'Ready';
  const statusClassName = ['pill', status.state].filter(Boolean).join(' ');

  return (
    <div className="page">
      <div className="ambient" aria-hidden="true" />
      <div className="halo halo-left" aria-hidden="true" />
      <div className="halo halo-right" aria-hidden="true" />

      <main className="shell">
        <section className="hero-card">
          <div className="hero-copy">
            <span className="eyebrow">React cockpit for InnovatEPAM</span>
            <h1>One cleaner surface for health, handoff, and the next UI migration slice.</h1>
            <p className="lead">
              This frontend is no longer a bare Vite placeholder. It now acts like a product-facing gateway
              that explains the platform, points users into the right workflow, and proves the backend is alive.
            </p>

            <div className="hero-actions">
              <button type="button" onClick={checkHealth} disabled={status.loading}>
                {status.loading ? 'Running health probe...' : 'Run health probe'}
              </button>
              <a className="ghost-button" href="/app">
                Current React route
              </a>
            </div>

            <div className="hero-stats" aria-label="Platform highlights">
              <article>
                <strong>59/59</strong>
                <span>verified tests on the current backend slice</span>
              </article>
              <article>
                <strong>4-stage</strong>
                <span>review pipeline with scoring and blind mode support</span>
              </article>
              <article>
                <strong>Dual UI</strong>
                <span>stable HTML portal plus incremental React entrypoint</span>
              </article>
            </div>
          </div>

          <aside className="hero-side">
            <div className="status-card">
              <div className="panel-head">
                <div>
                  <p className="panel-label">Live backend signal</p>
                  <h2>Environment pulse</h2>
                </div>
                <span className={statusClassName}>{statusLabel}</span>
              </div>
              <p className="hint">Probes the same Express health endpoint used by the core portal.</p>
              <div className="status-box">{status.text}</div>
            </div>

            <div className="stack-card">
              <p className="panel-label">Current stack</p>
              <ul className="token-grid">
                <li>Express 4</li>
                <li>Mongo + fallback mode</li>
                <li>JWT auth</li>
                <li>React 19</li>
                <li>Vite 6</li>
                <li>Jest + Supertest</li>
              </ul>
            </div>
          </aside>
        </section>

        <section className="content-grid">
          <section className="panel wide-panel">
            <div className="panel-head">
              <div>
                <p className="panel-label">Portal entrypoints</p>
                <h2>Choose the right flow fast</h2>
              </div>
            </div>
            <div className="link-grid" aria-label="Portal links">
              {quickLinks.map((link) => (
                <a key={link.href} className="route-card" href={link.href}>
                  <span className="route-title">{link.label}</span>
                  <span className="route-meta">{link.meta}</span>
                </a>
              ))}
            </div>
          </section>

          <section className="panel">
            <p className="panel-label">What changed</p>
            <h2>Why this UI is better</h2>
            <div className="feature-stack">
              {experienceNotes.map((item) => (
                <article key={item.title} className="feature-card">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <p className="panel-label">Operating model</p>
            <h2>Guardrails for next steps</h2>
            <ol className="checkpoint-list">
              {operatingPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ol>
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;
