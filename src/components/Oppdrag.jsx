import './Oppdrag.css'

function Oppdrag({ tittel, poeng, fullfort, onToggle }) {
  return (
    <div className={`oppdrag-kort${fullfort ? ' oppdrag-kort--fullfort' : ''}`}>
      <p className="oppdrag-tittel">{tittel}</p>
      <p className="oppdrag-poeng">Poeng: {poeng} ⭐</p>
      <button className="oppdrag-knapp" onClick={onToggle}>
        {fullfort ? '✅ Fullført!' : 'Merk som fullført'}
      </button>
    </div>
  )
}

export default Oppdrag
