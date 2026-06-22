import { useState } from 'react'
import { useZiimo } from '../../context/ZiimoContext'
import './ForeldrePanel.css'

function ForeldrePanel() {
  const { leggTilOppdrag } = useZiimo()
  const [tittel, setTittel] = useState('')
  const [poeng, setPoeng] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!tittel.trim() || Number(poeng) < 1) return
    leggTilOppdrag(tittel.trim(), Number(poeng))
    setTittel('')
    setPoeng('')
  }

  return (
    <section className="foreldre-panel">
      <h2>For foreldre</h2>
      <p className="foreldre-ingress">Legg til nye oppdrag for barnet ditt.</p>
      <form className="foreldre-skjema" onSubmit={handleSubmit}>
        <label className="foreldre-label">
          Tittel
          <input
            className="foreldre-input"
            type="text"
            value={tittel}
            onChange={e => setTittel(e.target.value)}
            placeholder="F.eks. Vann blomstene"
          />
        </label>
        <label className="foreldre-label">
          Poeng
          <input
            className="foreldre-input"
            type="number"
            value={poeng}
            onChange={e => setPoeng(e.target.value)}
            placeholder="F.eks. 10"
            min="1"
          />
        </label>
        <button className="foreldre-knapp" type="submit">
          Legg til oppdrag
        </button>
      </form>
    </section>
  )
}

export default ForeldrePanel
