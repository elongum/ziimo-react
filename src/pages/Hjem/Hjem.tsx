import './Hjem.css'
import { useNavigate } from 'react-router-dom'
import DagligFremgang from '../../components/DagligFremgang/DagligFremgang'
import UkentligFremgang from '../../components/UkentligFremgang/UkentligFremgang'
import { useZiimo } from '../../context/ZiimoContext'
import { DAG_MAL } from '../../utils/dato'

function Hjem() {
  const navigate = useNavigate()
  const { dagensFullfort, antallUlaste, barnNavn } = useZiimo()
  const alleFullfortIdag = antallUlaste > 0 && dagensFullfort >= Math.min(antallUlaste, DAG_MAL)

  return (
    <div className="hjem">

      <div className="hjem-hero">
        <div className="hjem-maskot-container">
          <img src="/ziimo.png" alt="Ziimo maskot" className="hjem-maskot" />
        </div>
        <div className="hjem-velkommen">
          <p className="hjem-hilsen">God dag, {barnNavn || 'utforsker'}!</p>
          <p className="hjem-sub">Ziimo er klar for et nytt eventyr!</p>
        </div>
      </div>

      <DagligFremgang />
      <UkentligFremgang />

      <button className="btn btn-cta" onClick={() => navigate('/oppdrag')}>
        <span className="btn-emoji">🚀</span>
        <span>{alleFullfortIdag ? 'Se alle oppdrag!' : 'Start dagens oppdrag!'}</span>
      </button>

    </div>
  )
}

export default Hjem
