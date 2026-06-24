import { useState, useRef, useEffect, useCallback } from 'react'
import './Foreldre.css'
import { useZiimo } from '../../context/ZiimoContext'
import { ukensDager, beregnStreak } from '../../utils/dato'

const STANDARD_PIN = '1234'

/* ── PIN-innlogging ───────────────────────────── */
function PinInnlogging({ onSuksess }) {
  const [sifre, setSifre]     = useState(['', '', '', ''])
  const [feil, setFeil]       = useState('')
  const [rister, setRister]   = useState(false)
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)]

  useEffect(() => { refs[0].current?.focus() }, [])

  const verifiser = useCallback((nyeSifre) => {
    const pin = nyeSifre.join('')
    const lagretPin = localStorage.getItem('ziimo-pin') ?? STANDARD_PIN
    if (pin === lagretPin) {
      onSuksess()
    } else {
      setRister(true)
      setFeil('Feil PIN-kode. Prøv igjen.')
      setTimeout(() => {
        setRister(false)
        setSifre(['', '', '', ''])
        refs[0].current?.focus()
      }, 550)
    }
  }, [onSuksess])

  function handleInput(index, value) {
    if (!/^\d$/.test(value) && value !== '') return
    const nyeSifre = [...sifre]
    nyeSifre[index] = value
    setSifre(nyeSifre)
    setFeil('')
    if (value && index < 3) refs[index + 1].current?.focus()
    if (nyeSifre.every(s => s !== '')) verifiser(nyeSifre)
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !sifre[index] && index > 0) {
      const nyeSifre = [...sifre]
      nyeSifre[index - 1] = ''
      setSifre(nyeSifre)
      refs[index - 1].current?.focus()
    }
  }

  return (
    <div className="fp-pin-side">
      <div className="fp-pin-kort">
        <div className="fp-pin-ikon">👨‍👩‍👧</div>
        <h2 className="fp-pin-tittel">Foreldrepanel</h2>
        <p className="fp-pin-sub">Skriv inn PIN-koden for å fortsette</p>
        <div className={`fp-pin-bokser${rister ? ' fp-pin-rist' : ''}`}>
          {sifre.map((s, i) => (
            <input
              key={i}
              ref={refs[i]}
              className={`fp-pin-boks${rister ? ' fp-pin-boks-feil' : ''}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={s}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              aria-label={`Siffer ${i + 1}`}
            />
          ))}
        </div>
        <p className="fp-pin-feil" aria-live="polite">{feil}</p>
      </div>
    </div>
  )
}

/* ── Dashboard ────────────────────────────────── */
function Dashboard({ onLoggUt }) {
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
  const [gjeldendePin,   setGjeldendePin]   = useState('')
  const [nyttPin,        setNyttPin]        = useState('')
  const [pinMelding,     setPinMelding]     = useState('')
  const [visNullstill,   setVisNullstill]   = useState(false)

  const dager  = ukensDager()
  const iDag   = new Date().toISOString().slice(0, 10)
  const total  = fullforteIds.size
  const streak = beregnStreak(ukentligData)

  function lagreNavn() {
    lagreBarnNavn(navnInput.trim())
  }

  function handleLeggTilBelonning() {
    const t = belonningInput.trim()
    if (!t) return
    leggTilBelonning(t)
    setBelonningInput('')
  }

  function handleLeggTilOppdrag() {
    const t = oppdragInput.trim()
    const p = Number(poengInput)
    if (!t || p < 1) return
    leggTilOppdrag(t, p)
    setOppdragInput('')
    setPoengInput('')
  }

  function byttPin() {
    const lagretPin = localStorage.getItem('ziimo-pin') ?? STANDARD_PIN
    if (gjeldendePin !== lagretPin) {
      setPinMelding('Feil nåværende PIN-kode.')
      return
    }
    if (!/^\d{4}$/.test(nyttPin)) {
      setPinMelding('Ny PIN må være 4 siffer.')
      return
    }
    localStorage.setItem('ziimo-pin', nyttPin)
    setGjeldendePin('')
    setNyttPin('')
    setPinMelding('PIN oppdatert! ✅')
    setTimeout(() => setPinMelding(''), 3000)
  }

  function bekreftNullstill() {
    nullstillProgresjon()
    setVisNullstill(false)
  }

  return (
    <div className="fp-dashboard">
      <div className="fp-topprad">
        <button className="fp-tilbake-btn" onClick={onLoggUt}>← Logg ut</button>
        <h2 className="fp-dashboard-tittel">Foreldrepanel</h2>
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

      {/* Nytt oppdrag */}
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

      {/* Bytt PIN – krever nåværende PIN */}
      <div className="fp-stat-kort">
        <span className="fp-stat-etikett">Bytt PIN-kode</span>
        <div className="fp-input-rad fp-input-rad--mb">
          <input
            className="fp-tekst-input"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={gjeldendePin}
            placeholder="Nåværende PIN"
            onChange={e => { setGjeldendePin(e.target.value); setPinMelding('') }}
          />
        </div>
        <div className="fp-input-rad">
          <input
            className="fp-tekst-input"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={nyttPin}
            placeholder="Ny 4-sifret PIN"
            onChange={e => { setNyttPin(e.target.value); setPinMelding('') }}
            onKeyDown={e => e.key === 'Enter' && byttPin()}
          />
          <button className="fp-handling-btn" onClick={byttPin}>Lagre</button>
        </div>
        {pinMelding && (
          <p className={`fp-pin-melding${pinMelding.startsWith('Feil') ? ' fp-pin-melding--feil' : ''}`}>
            {pinMelding}
          </p>
        )}
      </div>

      {/* Nullstill */}
      <button className="btn fp-nullstill-btn" onClick={() => setVisNullstill(true)}>
        🗑 Nullstill progresjon
      </button>

      <div className={`fp-bekreft-overlay${visNullstill ? ' active' : ''}`}>
        <div className="fp-bekreft-kort">
          <p className="fp-bekreft-tekst">Er du sikker? Dette vil slette all fremgang.</p>
          <div className="fp-bekreft-knapper">
            <button className="btn fp-bekreft-avbryt" onClick={() => setVisNullstill(false)}>Avbryt</button>
            <button className="btn fp-bekreft-ok" onClick={bekreftNullstill}>Slett alt</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Foreldre() {
  const [loggetInn, setLoggetInn] = useState(false)
  return loggetInn
    ? <Dashboard onLoggUt={() => setLoggetInn(false)} />
    : <PinInnlogging onSuksess={() => setLoggetInn(true)} />
}

export default Foreldre
