import { useMemo, useState } from 'react';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/user', label: 'User Portal' },
  { href: '/admin', label: 'Admin Portal' }
];

function App() {
  const [status, setStatus] = useState({ loading: false, text: 'Press the button to query /health.' });

  const pillClass = useMemo(() => {
    if (status.loading) return 'pill pending';
    if (status.text.toLowerCase().includes('ok')) return 'pill ok';
    if (status.text.toLowerCase().includes('error')) return 'pill err';
    return 'pill';
  }, [status]);

  const checkHealth = async () => {
    setStatus({ loading: true, text: 'Checking service health...' });

    try {
      const res = await fetch('/health');
      const data = await res.json();

      if (!res.ok) {
        setStatus({ loading: false, text: `Error: ${data.error || 'Unknown error'}` });
        return;
      }

      setStatus({ loading: false, text: `OK at ${new Date(data.timestamp).toLocaleString()}` });
    } catch (err) {
      setStatus({ loading: false, text: `Error: ${err.message}` });
    }
  };

  return (
    <div className="page">
      <div className="ambient" aria-hidden="true" />
      <main className="shell">
        <header className="hero">
          <h1>InnovatEPAM React Frontend</h1>
          <p>
            This Vite app runs with React 19 and proxies API requests to the Express backend.
            Use it as a modern frontend base while keeping existing pages active.
          </p>
          <nav className="links" aria-label="Portal links">
            {quickLinks.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </nav>
        </header>

        <section className="panel">
          <div className="panel-head">
            <h2>Backend Check</h2>
            <span className={pillClass}>{status.loading ? 'Running' : 'Ready'}</span>
          </div>
          <p className="hint">Checks the same endpoint used by the server-side health monitor.</p>
          <button type="button" onClick={checkHealth} disabled={status.loading}>
            {status.loading ? 'Checking...' : 'Check /health'}
          </button>
          <div className="status">{status.text}</div>
        </section>
      </main>
    </div>
  );
}

export default App;
