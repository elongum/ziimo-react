import './Hjem.css'
import { useZiimo } from '../../context/ZiimoContext'
import Oppdrag from '../../components/Oppdrag/Oppdrag'
import FilterKnapper from '../../components/FilterKnapper/FilterKnapper'

function Hjem() {
  const { visteListe, totalePoeng } = useZiimo()

  return (
    <div className="hjem">
      <h1>Ziimo oppdrag</h1>
      <div className="poeng-teller">
        <span>Totale poeng:</span>
        <strong>{totalePoeng} ⭐</strong>
      </div>
      <FilterKnapper />
      {visteListe.map((oppdrag) => (
        <Oppdrag key={oppdrag.id} id={oppdrag.id} />
      ))}
    </div>
  )
}

export default Hjem
