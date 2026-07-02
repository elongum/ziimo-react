import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useZiimo } from '../../context/ZiimoContext'
import { useAuth } from '../../context/AuthContext'
import './Header.css'

const DAGER   = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag']
const MANEDER = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des']

function formaterDato(): string {
  const d = new Date()
  return `${DAGER[d.getDay()]}. ${d.getDate()}. ${MANEDER[d.getMonth()]}`
}

interface MenyPunkt {
  ikon: string
  label: string
  til: string
}

const MENY_PUNKTER: (MenyPunkt | null)[] = [
  { ikon: '🏠', label: 'Hjem',          til: '/' },
  { ikon: '🎯', label: 'Oppdrag',       til: '/oppdrag' },
  null,
  { ikon: '👨‍👩‍👧', label: 'Foreldrepanel', til: '/foreldre' },
  { ikon: '⚙️', label: 'Innstillinger', til: '/innstillinger' },
]

function Header() {
  const [menuApen, setMenuApen] = useState(false)
  const { totalePoeng } = useZiimo()
  const { bruker }      = useAuth()
  const navigate        = useNavigate()
  const { pathname }    = useLocation()

  function naviger(til: string) {
    setMenuApen(false)
    navigate(til)
  }

  const erHjem           = pathname === '/'
  const erOppdrag        = pathname === '/oppdrag'
  const erForeldreSide   = pathname === '/foreldre' || pathname === '/innstillinger'

  return (
    <>
      <header className="header">
        <div className="logo">Ziimo</div>

        <div className="header-right">
          {erHjem && (
            <div className="dato-chip">{formaterDato()}</div>
          )}
          {erOppdrag && (
            <div className="poeng-chip">
              <span>⭐</span>
              <span className="poeng-chip-tall">{totalePoeng}</span>
              <span className="poeng-chip-etikett">poeng</span>
            </div>
          )}
          {erForeldreSide && bruker && (
            <div className="bruker-chip">
              <span className="bruker-chip-ikon">👤</span>
              <span className="bruker-chip-navn">{bruker.navn}</span>
            </div>
          )}

          <button
            className={`hamburger-btn${menuApen ? ' is-open' : ''}`}
            onClick={() => setMenuApen(v => !v)}
            aria-label="Meny"
            aria-expanded={menuApen}
          >
            <span className="hb-line" />
            <span className="hb-line" />
            <span className="hb-line" />
          </button>
        </div>
      </header>

      {menuApen && (
        <div className="meny-bakgrunn" onClick={() => setMenuApen(false)} />
      )}

      <div className={`dropdown-meny${menuApen ? ' open' : ''}`} role="menu">
        {MENY_PUNKTER.map((punkt, i) =>
          punkt === null ? (
            <div key={i} className="dropdown-skillelinje" />
          ) : (
            <button
              key={punkt.til}
              className="dropdown-element"
              role="menuitem"
              onClick={() => naviger(punkt.til)}
            >
              <span className="dropdown-ikon">{punkt.ikon}</span>
              <span>{punkt.label}</span>
            </button>
          )
        )}
      </div>
    </>
  )
}

export default Header
