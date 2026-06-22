import './FilterKnapper.css'

const filtre = [
  { verdi: 'alle', label: 'Alle oppdrag' },
  { verdi: 'gjenstaaende', label: 'Gjenstående' },
  { verdi: 'fullforte', label: 'Fullførte' },
]

function FilterKnapper({ aktivtFilter, onVelg }) {
  return (
    <div className="filter-knapper">
      {filtre.map(({ verdi, label }) => (
        <button
          key={verdi}
          className={`filter-knapp${aktivtFilter === verdi ? ' filter-knapp--aktiv' : ''}`}
          onClick={() => onVelg(verdi)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default FilterKnapper
