import './Hjem.css'
import Oppdrag from '../../components/Oppdrag/Oppdrag'
import FilterKnapper from '../../components/FilterKnapper/FilterKnapper'

function Hjem({ visteListe, fullforteIds, lasteIds, totalePoeng, filter, setFilter, toggleFullfort }) {
  return (
    <div className="hjem">
      <h1>Ziimo oppdrag</h1>
      <div className="poeng-teller">
        <span>Totale poeng:</span>
        <strong>{totalePoeng} ⭐</strong>
      </div>
      <FilterKnapper aktivtFilter={filter} onVelg={setFilter} />
      {visteListe.map((oppdrag) => (
        <Oppdrag
          key={oppdrag.id}
          tittel={oppdrag.tittel}
          poeng={oppdrag.poeng}
          fullfort={fullforteIds.has(oppdrag.id)}
          låst={lasteIds.has(oppdrag.id)}
          onToggle={() => toggleFullfort(oppdrag.id)}
        />
      ))}
    </div>
  )
}

export default Hjem
