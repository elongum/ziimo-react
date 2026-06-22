import { useState, useEffect } from 'react'
import './App.css'
import Oppdrag from './components/Oppdrag/Oppdrag'
import ForeldrePanel from './components/ForeldrePanel/ForeldrePanel'
import FilterKnapper from './components/FilterKnapper/FilterKnapper'

const startOppdrag = [
  { id: 1, tittel: "Rydd rommet ditt", poeng: 10 },
  { id: 2, tittel: "Hjelp til med middagen", poeng: 15 },
  { id: 3, tittel: "Les en bok", poeng: 20 },
  { id: 4, tittel: "Gå en tur ute", poeng: 10 },
  { id: 5, tittel: "Tegn noe kreativt", poeng: 15 },
]

function App() {
  const [oppdragListe, setOppdragListe] = useState(() => {
    try {
      const lagret = localStorage.getItem('ziimo-oppdrag')
      return lagret ? JSON.parse(lagret) : startOppdrag
    } catch {
      return startOppdrag
    }
  })
  const [fullforteIds, setFullforteIds] = useState(() => {
    try {
      const lagret = localStorage.getItem('ziimo-fullforte')
      return lagret ? new Set(JSON.parse(lagret)) : new Set()
    } catch {
      return new Set()
    }
  })

  function toggleFullfort(id) {
    setFullforteIds(prev => {
      const neste = new Set(prev)
      neste.has(id) ? neste.delete(id) : neste.add(id)
      return neste
    })
  }

  function leggTilOppdrag(tittel, poeng) {
    setOppdragListe(prev => {
      const nyId = prev.length > 0
        ? Math.max(...prev.map(o => o.id)) + 1
        : 1
      return [...prev, { id: nyId, tittel, poeng }]
    })
  }

  useEffect(() => {
    localStorage.setItem('ziimo-oppdrag', JSON.stringify(oppdragListe))
  }, [oppdragListe])

  useEffect(() => {
    localStorage.setItem('ziimo-fullforte', JSON.stringify([...fullforteIds]))
  }, [fullforteIds])

  const [filter, setFilter] = useState('alle')

  const totalePoeng = oppdragListe
    .filter(o => fullforteIds.has(o.id))
    .reduce((sum, o) => sum + o.poeng, 0)

  const visteListe = oppdragListe.filter(o => {
    if (filter === 'gjenstaaende') return !fullforteIds.has(o.id)
    if (filter === 'fullforte') return fullforteIds.has(o.id)
    return true
  })

  return (
    <div className="app">
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
          onToggle={() => toggleFullfort(oppdrag.id)}
        />
      ))}
      <hr className="foreldre-separator" />
      <ForeldrePanel onLeggTil={leggTilOppdrag} />
    </div>
  )
}

export default App
