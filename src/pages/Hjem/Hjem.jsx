import './Hjem.css'
import { useZiimo } from '../../context/ZiimoContext'
import Oppdrag from '../../components/Oppdrag/Oppdrag'
import FilterKnapper from '../../components/FilterKnapper/FilterKnapper'

const tomMelding = {
  alle: 'Ingen oppdrag ennå – foreldre kan legge til oppdrag! 📋',
  gjenstaaende: 'Alle oppdrag er fullført – så flink du er! 🎉',
  fullforte: 'Ingen fullførte oppdrag ennå – du klarer det! 💪',
}

function Hjem() {
  const { visteListe, totalePoeng, filter } = useZiimo()

  return (
    <div className="hjem">
      <h1>Ziimo oppdrag</h1>
      <div className="poeng-teller">
        <span>Totale poeng:</span>
        <strong>{totalePoeng} ⭐</strong>
      </div>
      <FilterKnapper />
      {visteListe.length === 0 ? (
        <p className="hjem-tom">{tomMelding[filter]}</p>
      ) : (
        visteListe.map((oppdrag) => (
          <Oppdrag key={oppdrag.id} id={oppdrag.id} />
        ))
      )}
    </div>
  )
}

export default Hjem
