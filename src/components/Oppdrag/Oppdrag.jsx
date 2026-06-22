import { useZiimo } from '../../context/ZiimoContext'
import './Oppdrag.css'

function Oppdrag({ id }) {
  const { oppdragListe, fullforteIds, lasteIds, toggleFullfort } = useZiimo()
  const oppdrag = oppdragListe.find(o => o.id === id)
  const fullfort = fullforteIds.has(id)
  const låst = lasteIds.has(id)

  const klassenavn = [
    'oppdrag-kort',
    fullfort ? 'oppdrag-kort--fullfort' : '',
    låst ? 'oppdrag-kort--last' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={klassenavn}>
      <p className="oppdrag-tittel">{oppdrag.tittel}</p>
      <p className="oppdrag-poeng">Poeng: {oppdrag.poeng} ⭐</p>
      {låst ? (
        <p className="oppdrag-last-melding">🔒 Fullfør forrige oppdrag for å låse opp</p>
      ) : (
        <button className="oppdrag-knapp" onClick={() => toggleFullfort(id)}>
          {fullfort ? '✅ Fullført!' : 'Merk som fullført'}
        </button>
      )}
    </div>
  )
}

export default Oppdrag
