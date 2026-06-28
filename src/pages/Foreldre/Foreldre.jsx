import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Foreldre.css'
import { useZiimo } from '../../context/ZiimoContext'
import { useAuth } from '../../context/AuthContext'
import { ukensDager, beregnStreak } from '../../utils/dato'

function Foreldre() {
  const navigate = useNavigate()
  const { loggUt, bruker } = useAuth()
  const {
    fullforteIds, ukentligData,
    barnNavn, belonninger,
    lagreBarnNavn, leggTilBelonning, slettBelonning,
    nullstillProgresjon, leggTilOppdrag,
  } = useZiimo()

  const [navnInput,      setNavnInput]      = useState(barnNavn)
  const [belonningInput, setBelonningInput] = useState('')
  const [oppdragInput,   setOppdragInput]   = useState('')
  const [poengInput,     setPoengInput]     = useState('')
  const [visNullstill,   setVisNullstill]   = useState(false)

  const dager  = ukensDager()
  const iDag   = new Date().toISOString().slice(0, 10)
  const total  = fullforteIds.size
  const streak = beregnStreak(ukentligData)

  function handleLoggUt() {
    loggUt()
    navigate('/login', { replace: true })
  }

  function lagreNavn() { lagreBarnNavn(navnInput.trim()) }

  function handleLeggTilBelonning() {
    const t = belonningInput.trim()
    if (!t) return
    leggTilBelonning(t)
    setBelonningInput('')
  }

  function handleLeggTilOppdrag() {
    const t = oppdragInput.trim()
    const p = parseInt(poengInput, 10)
    if (!t || !Number.isInteger(p) || p < 1 || p > 1000) return
    leggTilOppdrag(t, p)
    setOppdragInput('')
    setPoengInput('')
  }

  return (
    <div className="fp-dashboard">
      <div className="fp-topprad">
        <button className="fp-tilbake-btn" onClick={handleLoggUt}>← Logg ut</button>
        <h2 className="fp-dashboard-tittel">
          {bruker?.navn ? `Hei, ${bruker.navn}` : 'Foreldrepanel'}
        </h2>
      </div>

      {/* Barnets navn */}
      <div className="fp-stat-kort">
        <label className="fp-stat-etikett" htmlFor="barnnavn-input">Barnets navn</label>
        <div className="fp-input-rad">
          <input
            id="barnnavn-input"
            className="fp-tekst-input"
            type="text"
            value={navnInput}
            maxLength={20}
            placeholder="Skriv navn..."
            autoComplete="off"
            onChange={e => setNavnInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lagreNavn()}
          />
          <button className="fp-handling-btn" onClick={lagreNavn}>Lagre</button>
        </div>
      </div>

      {/* Legg til oppdrag */}
      <div className="fp-stat-kort">
        <span className="fp-stat-etikett">Legg til oppdrag</span>
        <div className="fp-input-rad fp-input-rad--mb">
          <input
            className="fp-tekst-input"
            type="text"
            value={oppdragInput}
            maxLength={50}
            placeholder="Oppdragnavn..."
            autoComplete="off"
            onChange={e => setOppdragInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLeggTilOppdrag()}
          />
          <input
            className="fp-tekst-input fp-poeng-input"
            type="number"
            value={poengInput}
            min={1}
            placeholder="Poeng"
            onChange={e => setPoengInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLeggTilOppdrag()}
          />
        </div>
        <button className="fp-handling-btn fp-handling-btn-full" onClick={handleLeggTilOppdrag}>
          Legg til oppdrag
        </button>
      </div>

      {/* Belønninger */}
      <div className="fp-stat-kort">
        <span className="fp-stat-etikett">Belønninger</span>
        <div className="fp-input-rad">
          <input
            className="fp-tekst-input"
            type="text"
            value={belonningInput}
            maxLength={60}
            placeholder="F.eks. 30 min ekstra skjermtid"
            autoComplete="off"
            onChange={e => setBelonningInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLeggTilBelonning()}
          />
          <button className="fp-handling-btn" onClick={handleLeggTilBelonning}>Legg til</button>
        </div>
        {belonninger.length === 0 ? (
          <p className="fp-belonning-tom">Ingen belønninger lagt til ennå.</p>
        ) : (
          <ul className="fp-belonning-liste">
            {belonninger.map(b => (
              <li key={b.id} className="fp-belonning-element">
                <span className="fp-belonning-tekst">{b.tekst}</span>
                <button
                  className="fp-belonning-slett"
                  onClick={() => slettBelonning(b.id)}
                  aria-label="Slett belønning"
                >✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Statistikk */}
      <div className="fp-stat-kort">
        <span className="fp-stat-etikett">Totalt fullførte oppdrag</span>
        <span className="fp-stat-verdi">{total}</span>
      </div>

      <div className="fp-stat-kort">
        <span className="fp-stat-etikett">Aktive dager denne uken</span>
        <div className="fp-uke-prikker">
          {dager.map(d => (
            <div
              key={d.dato}
              className={[
                'fp-dag-prikk',
                (ukentligData[d.dato] ?? 0) > 0 ? 'fp-dag-prikk-aktiv' : '',
                d.dato === iDag ? 'fp-dag-prikk-i-dag' : '',
              ].filter(Boolean).join(' ')}
            >
              <span className="fp-dag-etikett">{d.etikett}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fp-stat-kort">
        <span className="fp-stat-etikett">Ukentlig streak</span>
        <div className="fp-streak-rad">
          <span className="fp-stat-verdi">{streak}</span>
          <span className="fp-streak-enhet">uker på rad</span>
        </div>
      </div>

      {/* Nullstill */}
      <button className="btn fp-nullstill-btn" onClick={() => setVisNullstill(true)}>
        🗑 Nullstill progresjon
      </button>

      <div className={`dialog-overlay${visNullstill ? ' active' : ''}`}>
        <div className="dialog-kort">
          <p className="dialog-tekst">Er du sikker? Dette vil slette all fremgang.</p>
          <div className="dialog-knapper">
            <button className="btn dialog-avbryt" onClick={() => setVisNullstill(false)}>Avbryt</button>
            <button className="btn dialog-slett" onClick={() => { nullstillProgresjon(); setVisNullstill(false) }}>Slett alt</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Foreldre
