import { useState, useMemo } from 'react'
import './Oppdrag.css'
import { useZiimo } from '../../context/ZiimoContext'
import { spillFullfortLyd } from '../../utils/lyd'

const MELDINGER = [
  "Hei! Jeg er Ziimo! Jeg har reist langt for å utforske verden sammen med deg! 🚀",
  "Du er en ekte helt! La oss gjøre noe bra i dag! 🌟",
  "Hvert oppdrag gjør deg sterkere og klokere! 💪",
  "Fantastisk innsats! Du klarer dette! ✨",
  "La oss utforske verden sammen! 🌍",
  "Du er på vei til å bli en superhelt! 🦸",
]

const VARIGHET_KLASSE = { Rask: 'duration-rask', Medium: 'duration-medium', Lang: 'duration-lang' }
const KATEGORI_KLASSE = { fysisk: 'cat-fysisk', natur: 'cat-natur', kreativitet: 'cat-kreativitet', sosial: 'cat-sosial' }

function tilfeldigMelding(unntatt) {
  const andre = MELDINGER.filter(m => m !== unntatt)
  return andre[Math.floor(Math.random() * andre.length)]
}

function Oppdrag() {
  const { oppdragListe, fullforteIds, lasteIds, toggleFullfort } = useZiimo()
  const [varighetFilter, setVarighetFilter] = useState('Alle')
  const [stedFilter, setStedFilter]         = useState('Alle')
  const [startett, setStartett]             = useState(false)
  const [feirer, setFeirer]                 = useState(false)
  const [melding, setMelding]               = useState(MELDINGER[0])

  const filtrert = useMemo(() => oppdragListe.filter(o => {
    if (lasteIds.has(o.id)) return false
    if (varighetFilter !== 'Alle' && o.varighet !== varighetFilter) return false
    if (stedFilter     !== 'Alle' && o.sted     !== stedFilter)     return false
    return true
  }), [oppdragListe, lasteIds, varighetFilter, stedFilter])

  const gjeldende  = filtrert.find(o => !fullforteIds.has(o.id)) ?? null
  const alleFullfort = filtrert.length > 0 && filtrert.every(o => fullforteIds.has(o.id))

  function handleStart() { setStartett(true) }

  function handleFullfort() {
    if (!gjeldende) return
    toggleFullfort(gjeldende.id)
    spillFullfortLyd()
    setFeirer(true)
    setTimeout(() => setFeirer(false), 1200)
    setStartett(false)
    setMelding(m => tilfeldigMelding(m))
  }

  function setVarighet(v) { setVarighetFilter(v); setStartett(false) }
  function setSted(s)     { setStedFilter(s);     setStartett(false) }

  return (
    <div className="oppdrag-screen">

      <section className="filter-seksjon">
        <div className="filter-rad">
          <span className="filter-etikett">Tid</span>
          <div className="filter-chips">
            {['Alle', 'Rask', 'Medium', 'Lang'].map(v => (
              <button
                key={v}
                className={`filter-chip${varighetFilter === v ? ' active' : ''}`}
                aria-pressed={varighetFilter === v}
                onClick={() => setVarighet(v)}
              >
                {v === 'Rask' ? '⚡ Rask' : v === 'Medium' ? '⏱ Medium' : v === 'Lang' ? '🌟 Lang' : v}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-rad">
          <span className="filter-etikett">Sted</span>
          <div className="filter-chips">
            {['Alle', 'Ute', 'Inne'].map(v => (
              <button
                key={v}
                className={`filter-chip${stedFilter === v ? ' active' : ''}`}
                aria-pressed={stedFilter === v}
                onClick={() => setSted(v)}
              >
                {v === 'Ute' ? '🌳 Ute' : v === 'Inne' ? '🏠 Inne' : v}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="maskot-seksjon">
        <div className={`maskot-container${feirer ? ' celebrating' : ''}`}>
          <div className="deco-star s1">⭐</div>
          <div className="deco-star s2">🌟</div>
          <div className="deco-star s3">✨</div>
          <div className="deco-star s4">⭐</div>
          <img src="/ziimo.png" alt="Ziimo maskot" className="ziimo-bilde" />
        </div>
        <div className="snakkeboble">
          <p className="snakkeboble-tekst">{melding}</p>
        </div>
      </section>

      {filtrert.length === 0 ? (
        <div className="oppdrag-tom-state">
          <p>Ingen oppdrag passer dette filteret. Prøv et annet! 🔍</p>
        </div>
      ) : alleFullfort ? (
        <div className="oppdrag-ferdig-state">
          <p className="oppdrag-ferdig-emoji">🎉</p>
          <p className="oppdrag-ferdig-tittel">Supert!</p>
          <p className="oppdrag-ferdig-tekst">Du har fullført alle oppdrag i denne kategorien!</p>
        </div>
      ) : gjeldende ? (
        <>
          <section className="oppdrag-kort-seksjon">
            <div className="oppdrag-kort-wrapper appear">
              <div className="oppdrag-kort-topp">
                <div className="oppdrag-kort-badges">
                  <span className="mission-badge">Oppdrag</span>
                  <span className={`duration-badge ${VARIGHET_KLASSE[gjeldende.varighet] ?? ''}`}>
                    {gjeldende.varighet}
                  </span>
                  <span className={`category-badge ${KATEGORI_KLASSE[gjeldende.kategori] ?? ''}`}>
                    {gjeldende.kategori}
                  </span>
                </div>
                <span className="oppdrag-ikon">{gjeldende.ikon}</span>
              </div>
              <h2 className="oppdrag-tittel">{gjeldende.tittel}</h2>
              <p className="oppdrag-beskrivelse">{gjeldende.beskrivelse}</p>
              <p className="oppdrag-poeng-badge">⭐ {gjeldende.poeng} poeng</p>
            </div>
          </section>

          <section className="knapper-seksjon">
            {startett && (
              <button className="btn btn-complete" onClick={handleFullfort}>
                <span className="btn-emoji">✅</span>
                <span>Oppdrag fullført!</span>
              </button>
            )}
            <button className="btn btn-start" onClick={handleStart}>
              <span className="btn-emoji">🚀</span>
              <span>{startett ? 'Jeg holder på...' : 'Start oppdrag!'}</span>
            </button>
          </section>
        </>
      ) : null}
    </div>
  )
}

export default Oppdrag
