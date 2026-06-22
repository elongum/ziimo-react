import { NavLink } from 'react-router-dom'
import './Nav.css'

function Nav() {
  return (
    <nav className="nav">
      <NavLink to="/" end className={({ isActive }) => `nav-lenke${isActive ? ' nav-lenke--aktiv' : ''}`}>
        🏠 Oppdrag
      </NavLink>
      <NavLink to="/foreldre" className={({ isActive }) => `nav-lenke${isActive ? ' nav-lenke--aktiv' : ''}`}>
        👨‍👩‍👧 Foreldre
      </NavLink>
    </nav>
  )
}

export default Nav
