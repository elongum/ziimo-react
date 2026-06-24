import { useZiimo } from '../../context/ZiimoContext'
import { DAG_MAL } from '../../utils/dato'

function DagligFremgang() {
  const { dagensFullfort, antallUlaste } = useZiimo()
  const mal = Math.min(antallUlaste, DAG_MAL)
  const fullfort = Math.min(dagensFullfort, mal)
  const prosent = mal > 0 ? (fullfort / mal) * 100 : 0

  return (
    <div className="prog-card">
      <div className="prog-card-row">
        <span className="prog-label">Dagens oppdrag</span>
        <span className="prog-fraction">
          {fullfort}<span className="prog-fraction-denom"> av {mal}</span>
        </span>
      </div>
      <div className="daily-pips">
        {Array.from({ length: mal }, (_, i) => (
          <div key={i} className={`pip${i < fullfort ? ' pip-done' : ''}`} />
        ))}
      </div>
      <div className="daily-bar-track">
        <div className="daily-bar-fill" style={{ width: `${prosent}%` }} />
      </div>
    </div>
  )
}

export default DagligFremgang
