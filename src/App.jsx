import { useState } from 'react'
import './App.css'
import Oppdrag from './components/Oppdrag'
import ForeldrePanel from './components/ForeldrePanel'

const startOppdrag = [
  { id: 1, tittel: "Rydd rommet ditt", poeng: 10 },
  { id: 2, tittel: "Hjelp til med middagen", poeng: 15 },
  { id: 3, tittel: "Les en bok", poeng: 20 },
  { id: 4, tittel: "Gå en tur ute", poeng: 10 },
  { id: 5, tittel: "Tegn noe kreativt", poeng: 15 },
]

function App() {
  const [oppdragListe, setOppdragListe] = useState(startOppdrag)
  const [fullforteIds, setFullforteIds] = useState(new Set())

  function toggleFullfort(id) {
    setFullforteIds(prev => {
      const neste = new Set(prev)
      neste.has(id) ? neste.delete(id) : neste.add(id)
      return neste
    })
  }

  function leggTilOppdrag(tittel, poeng) {
    const nyId = oppdragListe.length > 0
      ? Math.max(...oppdragListe.map(o => o.id)) + 1
      : 1
    setOppdragListe(prev => [...prev, { id: nyId, tittel, poeng }])
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
      <div className="foreldre-separator" />
      <ForeldrePanel onLeggTil={leggTilOppdrag} />
    </div>
  )
}

export default App
