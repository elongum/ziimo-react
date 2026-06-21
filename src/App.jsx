import { useState } from 'react'

const oppdragListe = [
  { id: 1, tittel: "Rydd rommet ditt", poeng: 10 },
  { id: 2, tittel: "Hjelp til med middagen", poeng: 15 },
  { id: 3, tittel: "Les en bok", poeng: 20 },
  { id: 4, tittel: "Gå en tur ute", poeng: 10 },
  { id: 5, tittel: "Tegn noe kreativt", poeng: 15 },
]

function Oppdrag({ tittel, poeng }) {
  const [fullfort, setFullfort] = useState(false)

  return (
    <div style={{
      padding: '16px',
      margin: '8px',
      background: fullfort ? '#B9CDA1' : '#FDFAD5',
      borderRadius: '12px'
    }}>
      <p>{tittel}</p>
      <p>Poeng: {poeng} ⭐</p>
      <button onClick={() => setFullfort(!fullfort)}>
        {fullfort ? '✅ Fullført!' : 'Merk som fullført'}
      </button>
    </div>
  )
}

function App() {
  return (
    <div style={{ padding: '24px' }}>
      <h1>Ziimo oppdrag</h1>
      {oppdragListe.map((oppdrag) => (
        <Oppdrag
          key={oppdrag.id}
          tittel={oppdrag.tittel}
          poeng={oppdrag.poeng}
        />
      ))}
    </div>
  )
}

export default App