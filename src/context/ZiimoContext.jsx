import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

const ZiimoContext = createContext(null)

const startOppdrag = [
  { id: 1, tittel: "Rydd rommet ditt",       poeng: 10, ikon: "🧹", varighet: "Medium", sted: "Inne", kategori: "fysisk",      beskrivelse: "Rydd og rens rommet ditt slik at det ser fint og ryddig ut. Legg alt på plass!" },
  { id: 2, tittel: "Hjelp til med middagen", poeng: 15, ikon: "🍳", varighet: "Medium", sted: "Inne", kategori: "sosial",      beskrivelse: "Hjelp de voksne med å lage middag eller dekke bordet. En ekte lagspiller!" },
  { id: 3, tittel: "Les en bok",             poeng: 20, ikon: "📚", varighet: "Lang",   sted: "Inne", kategori: "kreativitet", beskrivelse: "Sett deg ned og les en bok i minst 15 minutter. Hva handler den om?" },
  { id: 4, tittel: "Gå en tur ute",          poeng: 10, ikon: "🌳", varighet: "Rask",   sted: "Ute",  kategori: "natur",       beskrivelse: "Ta en liten tur utenfor og legg merke til alt du ser rundt deg i naturen." },
  { id: 5, tittel: "Tegn noe kreativt",      poeng: 15, ikon: "🎨", varighet: "Medium", sted: "Inne", kategori: "kreativitet", beskrivelse: "Tegn eller mal noe du synes er fint. La fantasien fly helt fritt!" },
]

function slaSammen(lagret) {
  return lagret.map(o => {
    const start = startOppdrag.find(s => s.id === o.id)
    return start ? { ...start, ...o } : o
  })
}

export function ZiimoProvider({ children }) {
  const [oppdragListe, setOppdragListe] = useState(() => {
    try {
      const lagret = localStorage.getItem('ziimo-oppdrag')
      return lagret ? slaSammen(JSON.parse(lagret)) : startOppdrag
    } catch { return startOppdrag }
  })

  const [fullforteIds, setFullforteIds] = useState(() => {
    try {
      const lagret = localStorage.getItem('ziimo-fullforte')
      return lagret ? new Set(JSON.parse(lagret)) : new Set()
    } catch { return new Set() }
  })

  const [ukentligData, setUkentligData] = useState(() => {
    try {
      const lagret = localStorage.getItem('ziimo-ukentlig')
      return lagret ? JSON.parse(lagret) : {}
    } catch { return {} }
  })

  const [barnNavn, setBarnNavn] = useState(() =>
    localStorage.getItem('ziimo-barnnavn') ?? ''
  )

  const [belonninger, setBelonninger] = useState(() => {
    try {
      const lagret = localStorage.getItem('ziimo-belonninger')
      return lagret ? JSON.parse(lagret) : []
    } catch { return [] }
  })

  const [filter, setFilter] = useState('alle')

  useEffect(() => { localStorage.setItem('ziimo-oppdrag',    JSON.stringify(oppdragListe))   }, [oppdragListe])
  useEffect(() => { localStorage.setItem('ziimo-fullforte',  JSON.stringify([...fullforteIds])) }, [fullforteIds])
  useEffect(() => { localStorage.setItem('ziimo-ukentlig',   JSON.stringify(ukentligData))   }, [ukentligData])
  useEffect(() => { localStorage.setItem('ziimo-barnnavn',   barnNavn)                       }, [barnNavn])
  useEffect(() => { localStorage.setItem('ziimo-belonninger', JSON.stringify(belonninger))   }, [belonninger])

  useEffect(() => {
    const controller = new AbortController()

    fetch('http://localhost:3001/api/oppdrag', { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(apiOppdrag => {
        setOppdragListe(prev => {
          const apiIds = new Set(apiOppdrag.map(o => o.id))
          const brukerOppdrag = prev.filter(o => !apiIds.has(o.id))
          return [...apiOppdrag, ...brukerOppdrag]
        })
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.warn('API ikke tilgjengelig – bruker lokal oppdragsliste:', err.message)
        }
      })

    return () => controller.abort()
  }, [])

  const toggleFullfort = useCallback((id) => {
    const iDag = new Date().toISOString().slice(0, 10)
    const blerFullfort = !fullforteIds.has(id)
    setFullforteIds(prev => {
      const neste = new Set(prev)
      blerFullfort ? neste.add(id) : neste.delete(id)
      return neste
    })
    setUkentligData(prev => ({
      ...prev,
      [iDag]: Math.max(0, (prev[iDag] ?? 0) + (blerFullfort ? 1 : -1)),
    }))
  }, [fullforteIds])

  const leggTilOppdrag = useCallback((tittel, poeng) => {
    setOppdragListe(prev => {
      const nyId = prev.length > 0 ? Math.max(...prev.map(o => o.id)) + 1 : 1
      return [...prev, { id: nyId, tittel, poeng, ikon: '⭐', varighet: 'Medium', sted: 'Inne', kategori: 'fysisk', beskrivelse: tittel }]
    })
  }, [])

  const lagreBarnNavn   = useCallback((navn)   => setBarnNavn(navn), [])
  const leggTilBelonning = useCallback((tekst) => setBelonninger(prev => [...prev, { id: Date.now(), tekst }]), [])
  const slettBelonning   = useCallback((id)    => setBelonninger(prev => prev.filter(b => b.id !== id)), [])

  const nullstillProgresjon = useCallback(() => {
    setFullforteIds(new Set())
    setUkentligData({})
  }, [])

  const slettAlleData = useCallback(() => {
    setOppdragListe(startOppdrag)
    setFullforteIds(new Set())
    setUkentligData({})
    setBarnNavn('')
    setBelonninger([])
    ;['ziimo-oppdrag', 'ziimo-fullforte', 'ziimo-ukentlig',
      'ziimo-barnnavn', 'ziimo-belonninger', 'ziimo-pin'].forEach(k => localStorage.removeItem(k))
  }, [])

  const antallUlaste = useMemo(() => {
    const BATCH = 3
    let count = BATCH
    while (count < oppdragListe.length) {
      const gruppe = oppdragListe.slice(count - BATCH, count)
      if (gruppe.every(o => fullforteIds.has(o.id))) count += BATCH
      else break
    }
    return Math.min(count, oppdragListe.length)
  }, [oppdragListe, fullforteIds])

  const lasteIds = useMemo(
    () => new Set(oppdragListe.slice(antallUlaste).map(o => o.id)),
    [oppdragListe, antallUlaste]
  )

  const totalePoeng = useMemo(
    () => oppdragListe.filter(o => fullforteIds.has(o.id)).reduce((s, o) => s + o.poeng, 0),
    [oppdragListe, fullforteIds]
  )

  const visteListe = useMemo(() => oppdragListe.filter(o => {
    if (filter === 'gjenstaaende') return !fullforteIds.has(o.id)
    if (filter === 'fullforte')   return  fullforteIds.has(o.id)
    return true
  }), [oppdragListe, fullforteIds, filter])

  const iDag = new Date().toISOString().slice(0, 10)
  const dagensFullfort = ukentligData[iDag] ?? 0

  return (
    <ZiimoContext.Provider value={{
      oppdragListe, fullforteIds, lasteIds, antallUlaste,
      totalePoeng, visteListe, dagensFullfort, ukentligData,
      filter, setFilter,
      barnNavn, belonninger,
      toggleFullfort, leggTilOppdrag,
      lagreBarnNavn, leggTilBelonning, slettBelonning,
      nullstillProgresjon, slettAlleData,
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
