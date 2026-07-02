import { CSSProperties } from 'react'
import { useZiimo } from '../../context/ZiimoContext'
import { ukensDager } from '../../utils/dato'

function UkentligFremgang() {
  const { ukentligData } = useZiimo()
  const dager = ukensDager()
  const iDag = new Date().toISOString().slice(0, 10)
  const ukensTotal = dager.reduce((sum, d) => sum + (ukentligData[d.dato] ?? 0), 0)
  const maxTall = Math.max(1, ...dager.map(d => ukentligData[d.dato] ?? 0))

  return (
    <div className="prog-card">
      <div className="prog-card-row">
        <span className="prog-label">Ukens fremgang</span>
        <span className="prog-fraction">
          {ukensTotal}<span className="prog-fraction-denom"> totalt</span>
        </span>
      </div>
      <div className="weekly-chart">
        {dager.map(d => {
          const tall = ukentligData[d.dato] ?? 0
          const hoyde = tall > 0 ? `${(tall / maxTall) * 100}%` : '0%'
          return (
            <div key={d.dato} className="week-col">
              <div
                className={`week-bar-fill${d.dato === iDag ? ' is-today' : ''}`}
                style={{ '--bar-height': hoyde } as CSSProperties}
              />
            </div>
          )
        })}
      </div>
      <div className="weekly-day-labels">
        {dager.map(d => (
          <span key={d.dato} className={`week-day-label${d.dato === iDag ? ' is-today' : ''}`}>
            {d.etikett}
          </span>
        ))}
      </div>
    </div>
  )
}

export default UkentligFremgang
