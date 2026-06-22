import { createContext, useContext, useState, useEffect } from 'react'

const ZiimoContext = createContext(null)

const startOppdrag = [
  { id: 1, tittel: "Rydd rommet ditt", poeng: 10 },
  { id: 2, tittel: "Hjelp til med middagen", poeng: 15 },
  { id: 3, tittel: "Les en bok", poeng: 20 },
  { id: 4, tittel: "Gå en tur ute", poeng: 10 },
  { id: 5, tittel: "Tegn noe kreativt", poeng: 15 },
]

export function ZiimoProvider({ children }) {
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
  const [filter, setFilter] = useState('alle')

  useEffect(() => {
    localStorage.setItem('ziimo-oppdrag', JSON.stringify(oppdragListe))
  }, [oppdragListe])

  useEffect(() => {
    localStorage.setItem('ziimo-fullforte', JSON.stringify([...fullforteIds]))
  }, [fullforteIds])

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

  const BATCH = 3
  let antallUlaste = BATCH
  while (antallUlaste < oppdragListe.length) {
    const gruppe = oppdragListe.slice(antallUlaste - BATCH, antallUlaste)
    if (gruppe.every(o => fullforteIds.has(o.id))) {
      antallUlaste += BATCH
    } else {
      break
    }
  }
  antallUlaste = Math.min(antallUlaste, oppdragListe.length)

  const lasteIds = new Set(oppdragListe.slice(antallUlaste).map(o => o.id))

  const totalePoeng = oppdragListe
    .filter(o => fullforteIds.has(o.id))
    .reduce((sum, o) => sum + o.poeng, 0)

  const visteListe = oppdragListe.filter(o => {
    if (filter === 'gjenstaaende') return !fullforteIds.has(o.id)
    if (filter === 'fullforte') return fullforteIds.has(o.id)
    return true
  })

  return (
    <ZiimoContext.Provider value={{
      oppdragListe,
      fullforteIds,
      lasteIds,
      totalePoeng,
      visteListe,
      filter,
      setFilter,
      toggleFullfort,
      leggTilOppdrag,
    }}>
      {children}
    </ZiimoContext.Provider>
  )
}

export function useZiimo() {
  const ctx = useContext(ZiimoContext)
  if (!ctx) throw new Error('useZiimo må brukes innenfor ZiimoProvider')
  return ctx
}
