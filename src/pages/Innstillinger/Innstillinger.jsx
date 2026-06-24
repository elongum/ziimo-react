import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Innstillinger.css'
import { useZiimo } from '../../context/ZiimoContext'

function ToggleSwitch({ id, sjekket, onChange, label }) {
  return (
    <label className="toggle-switch" aria-label={label}>
      <input type="checkbox" id={id} checked={sjekket} onChange={onChange} />
      <span className="toggle-track"><span className="toggle-thumb" /></span>
    </label>
  )
}

function Innstillinger() {
  const { slettAlleData } = useZiimo()
  const navigate = useNavigate()

  const [moerktTema, setMoerktTema] = useState(
    () => localStorage.getItem('ziimo-dark-mode') === 'true'
  )
  const [lydeffekter, setLydeffekter] = useState(
    () => localStorage.getItem('ziimo-sound') !== 'false'
  )
  const [personvernApen, setPersonvernApen] = useState(false)
  const [visSlettDialog,  setVisSlettDialog]  = useState(false)

  function handleMoerktTema(e) {
    setMoerktTema(e.target.checked)
    localStorage.setItem('ziimo-dark-mode', e.target.checked)
  }

  function handleLydeffekter(e) {
    setLydeffekter(e.target.checked)
    localStorage.setItem('ziimo-sound', e.target.checked)
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
            Ziimo lagrer all data lokalt på enheten din ved hjelp av <em>localStorage</em>.
            Ingen data sendes til eksterne servere, og ingen personopplysninger samles inn
            eller deles med tredjeparter.<br /><br />
            Foreldre kan til enhver tid slette all lagret data fra innstillingsmenyen.
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

      {/* Bekreftelsesdialog */}
      <div className={`innstillinger-overlay${visSlettDialog ? ' active' : ''}`}>
        <div className="innstillinger-dialog">
          <p className="innstillinger-dialog-tekst">
            Er du sikker? Dette sletter <strong>all</strong> data, inkludert navn, belønninger og fremgang.
          </p>
          <div className="innstillinger-dialog-knapper">
            <button className="btn innstillinger-avbryt-btn" onClick={() => setVisSlettDialog(false)}>
              Avbryt
            </button>
            <button className="btn innstillinger-slett-btn" onClick={bekreftSlettAlleData}>
              Slett alt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Innstillinger
