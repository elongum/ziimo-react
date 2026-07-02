import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'
import { useAuth } from '../../context/AuthContext'
import { Bruker } from '../../context/AuthContext'
import { API_BASE } from '../../utils/api'

const API = `${API_BASE}/auth`

interface LoginApiResponse {
  token: string
  bruker: Bruker
  error?: string
}

function Login() {
  const { loggInn } = useAuth()
  const navigate    = useNavigate()

  const [aktifTab,  setAktifTab]  = useState<'logginn' | 'registrer'>('logginn')
  const [laster,    setLaster]    = useState(false)
  const [feil,      setFeil]      = useState('')

  const [innNavn,   setInnNavn]   = useState('')
  const [innEpost,  setInnEpost]  = useState('')
  const [innPassord, setInnPassord] = useState('')

  function byttTab(tab: 'logginn' | 'registrer') {
    setAktifTab(tab)
    setFeil('')
  }

  async function handleLoggInn(e: React.FormEvent) {
    e.preventDefault()
    setFeil('')
    setLaster(true)
    try {
      const res  = await fetch(`${API}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ epost: innEpost, passord: innPassord }),
      })
      const data = await res.json() as LoginApiResponse
      if (!res.ok) { setFeil(data.error || 'Noe gikk galt.'); return }
      loggInn(data.token, data.bruker)
      navigate('/foreldre', { replace: true })
    } catch {
      setFeil('Kunne ikke nå serveren. Er backend kjørende?')
    } finally {
      setLaster(false)
    }
  }

  async function handleRegistrer(e: React.FormEvent) {
    e.preventDefault()
    setFeil('')
    setLaster(true)
    try {
      const regRes = await fetch(`${API}/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ navn: innNavn, epost: innEpost, passord: innPassord }),
      })
      const regData = await regRes.json() as { error?: string }
      if (!regRes.ok) { setFeil(regData.error || 'Noe gikk galt.'); return }

      const loginRes = await fetch(`${API}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ epost: innEpost, passord: innPassord }),
      })
      const loginData = await loginRes.json() as LoginApiResponse
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
                placeholder="8–72 tegn"
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
                placeholder="8–72 tegn"
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
