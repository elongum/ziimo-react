import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'
import { useAuth } from '../../context/AuthContext'

const API = 'http://localhost:3001/api/auth'

function Login() {
  const { loggInn } = useAuth()
  const navigate    = useNavigate()

  const [aktifTab,  setAktifTab]  = useState('logginn')
  const [laster,    setLaster]    = useState(false)
  const [feil,      setFeil]      = useState('')

  const [innNavn,   setInnNavn]   = useState('')
  const [innEpost,  setInnEpost]  = useState('')
  const [innPassord, setInnPassord] = useState('')

  function byttTab(tab) {
    setAktifTab(tab)
    setFeil('')
  }

  async function handleLoggInn(e) {
    e.preventDefault()
    setFeil('')
    setLaster(true)
    try {
      const res  = await fetch(`${API}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ epost: innEpost, passord: innPassord }),
      })
      const data = await res.json()
      if (!res.ok) { setFeil(data.error || 'Noe gikk galt.'); return }
      loggInn(data.token, data.bruker)
      navigate('/foreldre', { replace: true })
    } catch {
      setFeil('Kunne ikke nå serveren. Er backend kjørende?')
    } finally {
      setLaster(false)
    }
  }

  async function handleRegistrer(e) {
    e.preventDefault()
    setFeil('')
    setLaster(true)
    try {
      const regRes = await fetch(`${API}/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ navn: innNavn, epost: innEpost, passord: innPassord }),
      })
      const regData = await regRes.json()
      if (!regRes.ok) { setFeil(regData.error || 'Noe gikk galt.'); return }

      const loginRes = await fetch(`${API}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ epost: innEpost, passord: innPassord }),
      })
      const loginData = await loginRes.json()
      if (!loginRes.ok) { setAktifTab('logginn'); return }
      loggInn(loginData.token, loginData.bruker)
      navigate('/foreldre', { replace: true })
    } catch {
      setFeil('Kunne ikke nå serveren. Er backend kjørende?')
    } finally {
      setLaster(false)
    }
  }

  return (
    <div className="login-side">
      <div className="login-logo">Ziimo</div>

      <div className="login-kort">
        <div className="login-ikon">👨‍👩‍👧</div>

        <div className="login-tabs">
          <button
            className={`login-tab${aktifTab === 'logginn' ? ' login-tab--aktiv' : ''}`}
            onClick={() => byttTab('logginn')}
          >
            Logg inn
          </button>
          <button
            className={`login-tab${aktifTab === 'registrer' ? ' login-tab--aktiv' : ''}`}
            onClick={() => byttTab('registrer')}
          >
            Registrer
          </button>
        </div>

        {aktifTab === 'logginn' ? (
          <form className="login-form" onSubmit={handleLoggInn}>
            <label className="login-label">
              Epost
              <input
                className="login-input"
                type="email"
                value={innEpost}
                onChange={e => setInnEpost(e.target.value)}
                placeholder="din@epost.no"
                autoComplete="email"
                required
              />
            </label>
            <label className="login-label">
              Passord
              <input
                className="login-input"
                type="password"
                value={innPassord}
                onChange={e => setInnPassord(e.target.value)}
                placeholder="Minst 8 tegn"
                autoComplete="current-password"
                required
              />
            </label>
            {feil && <p className="login-feil" role="alert">{feil}</p>}
            <button className="login-knapp" type="submit" disabled={laster}>
              {laster ? 'Logger inn...' : 'Logg inn'}
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleRegistrer}>
            <label className="login-label">
              Navn
              <input
                className="login-input"
                type="text"
                value={innNavn}
                onChange={e => setInnNavn(e.target.value)}
                placeholder="Ditt navn"
                autoComplete="name"
                required
              />
            </label>
            <label className="login-label">
              Epost
              <input
                className="login-input"
                type="email"
                value={innEpost}
                onChange={e => setInnEpost(e.target.value)}
                placeholder="din@epost.no"
                autoComplete="email"
                required
              />
            </label>
            <label className="login-label">
              Passord
              <input
                className="login-input"
                type="password"
                value={innPassord}
                onChange={e => setInnPassord(e.target.value)}
                placeholder="Minst 8 tegn"
                autoComplete="new-password"
                required
              />
            </label>
            {feil && <p className="login-feil" role="alert">{feil}</p>}
            <button className="login-knapp" type="submit" disabled={laster}>
              {laster ? 'Oppretter konto...' : 'Opprett konto'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login
