import './Oppdrag.css'

function Oppdrag({ tittel, poeng, fullfort, låst, onToggle }) {
  const klassenavn = [
    'oppdrag-kort',
    fullfort ? 'oppdrag-kort--fullfort' : '',
    låst ? 'oppdrag-kort--last' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={klassenavn}>
      <p className="oppdrag-tittel">{tittel}</p>
      <p className="oppdrag-poeng">Poeng: {poeng} ⭐</p>
      {låst ? (
        <p className="oppdrag-last-melding">🔒 Fullfør forrige oppdrag for å låse opp</p>
      ) : (
        <button className="oppdrag-knapp" onClick={onToggle}>
          {fullfort ? '✅ Fullført!' : 'Merk som fullført'}
        </button>
      )}
    </div>
  )
}

export default Oppdrag
