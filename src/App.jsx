import { useState } from 'react'

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
      <Oppdrag tittel="Rydd rommet ditt" poeng={10} />
      <Oppdrag tittel="Hjelp til med middagen" poeng={15} />
      <Oppdrag tittel="Les en bok" poeng={20} />
    </div>
  )
}

export default App