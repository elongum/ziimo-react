import { NavLink } from 'react-router-dom'
import './Nav.css'

function Nav() {
  return (
    <nav className="nav" aria-label="Navigasjon">
      <NavLink to="/" end className={({ isActive }) => `nav-lenke${isActive ? ' nav-lenke--aktiv' : ''}`}>
        <span className="nav-ikon">🏠</span>
        <span className="nav-etikett">Hjem</span>
      </NavLink>
      <NavLink to="/oppdrag" className={({ isActive }) => `nav-lenke${isActive ? ' nav-lenke--aktiv' : ''}`}>
        <span className="nav-ikon">🎯</span>
        <span className="nav-etikett">Oppdrag</span>
      </NavLink>
    </nav>
  )
}

export default Nav
