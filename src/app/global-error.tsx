'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#f7f1e7', color: '#2a241e' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <h1 style={{ fontSize: '1.75rem' }}>Something went wrong</h1>
          <p style={{ marginTop: '1rem', color: '#4a4038' }}>Please try reloading the page.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.5rem',
              background: '#b1552c',
              color: '#f9f5ec',
              padding: '0.75rem 1.5rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
