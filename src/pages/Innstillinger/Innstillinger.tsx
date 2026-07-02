import { useState, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import './Innstillinger.css'
import { useZiimo } from '../../context/ZiimoContext'
import { useAuth } from '../../context/AuthContext'
import { SK } from '../../utils/storage-keys'

interface ToggleSwitchProps {
  id: string
  sjekket: boolean
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  label: string
}

function ToggleSwitch({ id, sjekket, onChange, label }: ToggleSwitchProps) {
  return (
    <label className="toggle-switch" aria-label={label}>
      <input type="checkbox" id={id} checked={sjekket} onChange={onChange} />
      <span className="toggle-track"><span className="toggle-thumb" /></span>
    </label>
  )
}

function Innstillinger() {
  const { slettAlleData } = useZiimo()
  const { erInnlogget, loggUt } = useAuth()
  const navigate = useNavigate()

  const [moerktTema, setMoerktTema] = useState(
    () => localStorage.getItem(SK.theme) === 'dark'
  )
  const [lydeffekter, setLydeffekter] = useState(
    () => localStorage.getItem(SK.sound) !== 'off'
  )
  const [personvernApen, setPersonvernApen] = useState(false)
  const [visSlettDialog,  setVisSlettDialog]  = useState(false)

  function handleMoerktTema(e: ChangeEvent<HTMLInputElement>) {
    const dark = e.target.checked
    setMoerktTema(dark)
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem(SK.theme, 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem(SK.theme, 'light')
    }
  }

  function handleLydeffekter(e: ChangeEvent<HTMLInputElement>) {
    const paa = e.target.checked
    setLydeffekter(paa)
    localStorage.setItem(SK.sound, paa ? 'on' : 'off')
  }

  function bekreftSlettAlleData() {
    slettAlleData()
    setVisSlettDialog(false)
    navigate('/')
  }

  return (
    <div className="innstillinger-side">
      <h1>Innstillinger</h1>

      <div className="innstillinger-seksjon">
        <span className="innstillinger-seksjon-tittel">Utseende</span>
        <div className="innstillinger-rad">
          <div className="innstillinger-rad-info">
            <span className="innstillinger-rad-label">Mørkt tema</span>
            <span className="innstillinger-rad-sub">Bytt mellom lyst og mørkt</span>
          </div>
          <ToggleSwitch id="theme-toggle" sjekket={moerktTema} onChange={handleMoerktTema} label="Mørkt tema" />
        </div>
      </div>

      <div className="innstillinger-seksjon">
        <span className="innstillinger-seksjon-tittel">Lyd</span>
        <div className="innstillinger-rad">
          <div className="innstillinger-rad-info">
            <span className="innstillinger-rad-label">Lydeffekter</span>
            <span className="innstillinger-rad-sub">Spill av lyd når oppdrag fullføres</span>
          </div>
          <ToggleSwitch id="sound-toggle" sjekket={lydeffekter} onChange={handleLydeffekter} label="Lydeffekter" />
        </div>
      </div>

      <div className="innstillinger-seksjon">
        <span className="innstillinger-seksjon-tittel">Om Ziimo</span>
        <div className="innstillinger-rad">
          <span className="innstillinger-rad-label">Versjon</span>
          <span className="innstillinger-rad-verdi">1.0.0</span>
        </div>
        <div className="innstillinger-skillelinje" />
        <a className="innstillinger-rad innstillinger-rad-lenke" href="mailto:longumemil@gmail.com">
          <span className="innstillinger-rad-label">Send tilbakemelding</span>
          <span className="innstillinger-rad-pil">→</span>
        </a>
      </div>

      <div className="innstillinger-seksjon">
        <span className="innstillinger-seksjon-tittel">Personvern</span>
        <button
          className="innstillinger-rad innstillinger-rad-ekspander"
          onClick={() => setPersonvernApen(v => !v)}
          aria-expanded={personvernApen}
        >
          <span className="innstillinger-rad-label">Personvernerklæring</span>
          <span className={`innstillinger-rad-pil${personvernApen ? ' open' : ''}`}>›</span>
        </button>
        <div className={`innstillinger-ekspander-kropp${personvernApen ? ' open' : ''}`}>
          <p className="innstillinger-personvern-tekst">
            Uten innlogging lagres all data lokalt på enheten din ved hjelp av <em>localStorage</em>.
            Ingen data deles med tredjeparter.<br /><br />
            Ved bruk av foreldrekonto synkroniseres fremgang og autentiseringsdata med
            Ziimos server. Foreldre kan til enhver tid slette all lagret data fra innstillingsmenyen.
          </p>
        </div>
        <div className="innstillinger-skillelinje" />
        <button
          className="innstillinger-rad innstillinger-rad-fare"
          onClick={() => setVisSlettDialog(true)}
        >
          <span>🗑 Slett alle data</span>
        </button>
      </div>

      {erInnlogget && (
        <div className="innstillinger-seksjon">
          <span className="innstillinger-seksjon-tittel">Konto</span>
          <button
            className="innstillinger-rad innstillinger-rad-fare"
            onClick={() => { loggUt(); navigate('/login', { replace: true }) }}
          >
            <span>🚪 Logg ut av foreldrekonto</span>
          </button>
        </div>
      )}

      <div className={`dialog-overlay${visSlettDialog ? ' active' : ''}`}>
        <div className="dialog-kort">
          <p className="dialog-tekst">
            Er du sikker? Dette sletter <strong>all</strong> data, inkludert navn, belønninger og fremgang.
          </p>
          <div className="dialog-knapper">
            <button className="btn dialog-avbryt" onClick={() => setVisSlettDialog(false)}>
              Avbryt
            </button>
            <button className="btn dialog-slett" onClick={bekreftSlettAlleData}>
              Slett alt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Innstillinger
