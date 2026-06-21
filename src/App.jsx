import { useState } from 'react'
import './App.css'
import Oppdrag from './components/Oppdrag'

const oppdragListe = [
  { id: 1, tittel: "Rydd rommet ditt", poeng: 10 },
  { id: 2, tittel: "Hjelp til med middagen", poeng: 15 },
  { id: 3, tittel: "Les en bok", poeng: 20 },
  { id: 4, tittel: "Gå en tur ute", poeng: 10 },
  { id: 5, tittel: "Tegn noe kreativt", poeng: 15 },
]

function App() {
  const [fullforteIds, setFullforteIds] = useState(new Set())

  function toggleFullfort(id) {
    setFullforteIds(prev => {
      const neste = new Set(prev)
      neste.has(id) ? neste.delete(id) : neste.add(id)
      return neste
    })
  }

  const totalePoeng = oppdragListe
    .filter(o => fullforteIds.has(o.id))
    .reduce((sum, o) => sum + o.poeng, 0)

  return (
    <div className="app">
      <h1>Ziimo oppdrag</h1>
      <div className="poeng-teller">
        <span>Totale poeng:</span>
        <strong>{totalePoeng} ⭐</strong>
      </div>
      {oppdragListe.map((oppdrag) => (
        <Oppdrag
          key={oppdrag.id}
          tittel={oppdrag.tittel}
          poeng={oppdrag.poeng}
          fullfort={fullforteIds.has(oppdrag.id)}
          onToggle={() => toggleFullfort(oppdrag.id)}
        />
      ))}
    </div>
  )
}

export default App
