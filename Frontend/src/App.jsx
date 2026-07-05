import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

// ─── [TẠM THỜI] Health-check component — xóa sau khi xác nhận CORS OK ──────
// Gọi /api/actuator/health để kiểm tra backend đang chạy và CORS đã đúng.
// Nếu nhận {"status":"UP"} mà không bị lỗi CORS → kết nối frontend-backend OK.
function HealthCheck() {
  const [health, setHealth] = useState({ status: 'Checking...', detail: '' })

  useEffect(() => {
    const BACKEND = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:8080/api'
    fetch(`${BACKEND}/actuator/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => setHealth({ status: data.status, detail: JSON.stringify(data, null, 2) }))
      .catch((err) => setHealth({ status: 'ERROR', detail: err.message }))
  }, [])

  const color = health.status === 'UP' ? '#4ade80' : health.status === 'Checking...' ? '#facc15' : '#f87171'
  return (
    <div id="health-check-temp" style={{ margin: '1rem auto', maxWidth: 480, textAlign: 'left', background: '#1e1e2e', borderRadius: 10, padding: '1rem', border: `1px solid ${color}` }}>
      <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 13, color: '#aaa' }}>
        [TEMP] Backend Health → <strong style={{ color }}>{health.status}</strong>
      </p>
      {health.detail && (
        <pre style={{ margin: '0.5rem 0 0', fontSize: 11, color: '#cdd6f4', overflowX: 'auto' }}>{health.detail}</pre>
      )}
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* [TEMP] Xóa dòng này sau khi xác nhận CORS OK */}
      <HealthCheck />

      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
