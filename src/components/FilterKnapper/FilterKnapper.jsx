import { useZiimo } from '../../context/ZiimoContext'
import './FilterKnapper.css'

const filtre = [
  { verdi: 'alle', label: 'Alle oppdrag' },
  { verdi: 'gjenstaaende', label: 'Gjenstående' },
  { verdi: 'fullforte', label: 'Fullførte' },
]

function FilterKnapper() {
  const { filter, setFilter } = useZiimo()

  return (
    <div className="filter-knapper">
      {filtre.map(({ verdi, label }) => (
        <button
          key={verdi}
          className={`filter-knapp${filter === verdi ? ' filter-knapp--aktiv' : ''}`}
          aria-pressed={filter === verdi}
          onClick={() => setFilter(verdi)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default FilterKnapper
