import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { API_BASE } from '../utils/api'
import { SK } from '../utils/storage-keys'

export interface Oppdrag {
  id: number
  tittel: string
  poeng: number
  ikon: string
  varighet: string
  sted: string
  kategori: string
  beskrivelse: string
}

export interface Belonning {
  id: number
  tekst: string
}

interface ProgresjonRad {
  oppdrag_id: number
  fullfort_dato: string
}

interface ZiimoContextValue {
  oppdragListe: Oppdrag[]
  fullforteIds: Set<number>
  lasteIds: Set<number>
  antallUlaste: number
  totalePoeng: number
  visteListe: Oppdrag[]
  dagensFullfort: number
  ukentligData: Record<string, number>
  filter: string
  setFilter: (filter: string) => void
  barnNavn: string
  belonninger: Belonning[]
  toggleFullfort: (id: number) => void
  leggTilOppdrag: (tittel: string, poeng: number) => void
  lagreBarnNavn: (navn: string) => void
  leggTilBelonning: (tekst: string) => void
  slettBelonning: (id: number) => void
  nullstillProgresjon: () => void
  slettAlleData: () => void
}

const ZiimoContext = createContext<ZiimoContextValue | null>(null)

const startOppdrag: Oppdrag[] = [
  { id: 1, tittel: "Rydd rommet ditt",       poeng: 10, ikon: "🧹", varighet: "Medium", sted: "Inne", kategori: "fysisk",      beskrivelse: "Rydd og rens rommet ditt slik at det ser fint og ryddig ut. Legg alt på plass!" },
  { id: 2, tittel: "Hjelp til med middagen", poeng: 15, ikon: "🍳", varighet: "Medium", sted: "Inne", kategori: "sosial",      beskrivelse: "Hjelp de voksne med å lage middag eller dekke bordet. En ekte lagspiller!" },
  { id: 3, tittel: "Les en bok",             poeng: 20, ikon: "📚", varighet: "Lang",   sted: "Inne", kategori: "kreativitet", beskrivelse: "Sett deg ned og les en bok i minst 15 minutter. Hva handler den om?" },
  { id: 4, tittel: "Gå en tur ute",          poeng: 10, ikon: "🌳", varighet: "Rask",   sted: "Ute",  kategori: "natur",       beskrivelse: "Ta en liten tur utenfor og legg merke til alt du ser rundt deg i naturen." },
  { id: 5, tittel: "Tegn noe kreativt",      poeng: 15, ikon: "🎨", varighet: "Medium", sted: "Inne", kategori: "kreativitet", beskrivelse: "Tegn eller mal noe du synes er fint. La fantasien fly helt fritt!" },
]

function slaSammen(lagret: Oppdrag[]): Oppdrag[] {
  return lagret.map(o => {
    const start = startOppdrag.find(s => s.id === o.id)
    return start ? { ...start, ...o } : o
  })
}

function byggUkentligData(progresjonRader: ProgresjonRad[]): Record<string, number> {
  const ukentlig: Record<string, number> = {}
  progresjonRader.forEach(({ fullfort_dato }) => {
    ukentlig[fullfort_dato] = (ukentlig[fullfort_dato] ?? 0) + 1
  })
  return ukentlig
}

function authHeaders(token: string): Record<string, string> {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export function ZiimoProvider({ children }: { children: ReactNode }) {
  const { token, loggUt } = useAuth()

  const [oppdragListe, setOppdragListe] = useState<Oppdrag[]>(() => {
    try {
      const lagret = localStorage.getItem(SK.oppdrag)
      return lagret ? slaSammen(JSON.parse(lagret) as Oppdrag[]) : startOppdrag
    } catch { return startOppdrag }
  })

  const [fullforteIds, setFullforteIds] = useState<Set<number>>(() => {
    try {
      const lagret = localStorage.getItem(SK.fullforte)
      return lagret ? new Set<number>(JSON.parse(lagret) as number[]) : new Set()
    } catch { return new Set() }
  })

  const [ukentligData, setUkentligData] = useState<Record<string, number>>(() => {
    try {
      const lagret = localStorage.getItem(SK.ukentlig)
      return lagret ? JSON.parse(lagret) as Record<string, number> : {}
    } catch { return {} }
  })

  const [barnNavn, setBarnNavn]       = useState<string>(() => localStorage.getItem(SK.barnNavn) ?? '')
  const [belonninger, setBelonninger] = useState<Belonning[]>(() => {
    try {
      const lagret = localStorage.getItem(SK.belonninger)
      return lagret ? JSON.parse(lagret) as Belonning[] : []
    } catch { return [] }
  })

  const [filter, setFilter] = useState('alle')

  // ── Persistering til localStorage ─────────────
  useEffect(() => { localStorage.setItem(SK.oppdrag,     JSON.stringify(oppdragListe))    }, [oppdragListe])
  useEffect(() => { localStorage.setItem(SK.fullforte,   JSON.stringify([...fullforteIds])) }, [fullforteIds])
  useEffect(() => { localStorage.setItem(SK.ukentlig,    JSON.stringify(ukentligData))    }, [ukentligData])
  useEffect(() => { localStorage.setItem(SK.barnNavn,    barnNavn)                        }, [barnNavn])
  useEffect(() => { localStorage.setItem(SK.belonninger, JSON.stringify(belonninger))     }, [belonninger])

  // ── Hent oppdragsliste fra API ─────────────────
  useEffect(() => {
    const controller = new AbortController()
    fetch(`${API_BASE}/oppdrag`, { signal: controller.signal })
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json() as Promise<Oppdrag[]> })
      .then(apiOppdrag => {
        setOppdragListe(prev => {
          const apiIds = new Set(apiOppdrag.map(o => o.id))
          return [...apiOppdrag, ...prev.filter(o => !apiIds.has(o.id))]
        })
      })
      .catch(err => { if ((err as Error).name !== 'AbortError') console.warn('Oppdrag API utilgjengelig:', (err as Error).message) })
    return () => controller.abort()
  }, [])

  // ── Hent progresjon fra API ved innlogging ─────
  useEffect(() => {
    if (!token) return
    const controller = new AbortController()

    fetch(`${API_BASE}/progresjon`, { headers: authHeaders(token), signal: controller.signal })
      .then(res => {
        if (res.status === 401) { loggUt(); return null }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ProgresjonRad[]>
      })
      .then(rader => {
        if (!rader) return
        const ids      = new Set(rader.map(r => r.oppdrag_id))
        const ukentlig = byggUkentligData(rader)
        setFullforteIds(ids)
        setUkentligData(ukentlig)
      })
      .catch(err => { if ((err as Error).name !== 'AbortError') console.warn('Progresjon API utilgjengelig:', (err as Error).message) })

    return () => controller.abort()
  }, [token, loggUt])

  // ── Toggle fullført – optimistisk + API-sync ───
  const toggleFullfort = useCallback((id: number) => {
    const iDag        = new Date().toISOString().slice(0, 10)
    const blerFullfort = !fullforteIds.has(id)

    // Optimistisk oppdatering
    setFullforteIds(prev => {
      const neste = new Set(prev)
      blerFullfort ? neste.add(id) : neste.delete(id)
      return neste
    })
    setUkentligData(prev => ({
      ...prev,
      [iDag]: Math.max(0, (prev[iDag] ?? 0) + (blerFullfort ? 1 : -1)),
    }))

    if (!token) return  // Kun localStorage for ikke-innloggede

    const url    = blerFullfort ? `${API_BASE}/progresjon` : `${API_BASE}/progresjon/${id}`
    const method = blerFullfort ? 'POST' : 'DELETE'
    const body   = blerFullfort ? JSON.stringify({ oppdrag_id: id, fullfort_dato: iDag }) : undefined

    fetch(url, { method, headers: authHeaders(token), body })
      .then(res => {
        if (res.status === 401) loggUt()
        if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`)
      })
      .catch(err => {
        // Rull tilbake ved feil
        console.warn('Progresjon-synk feilet, ruller tilbake:', (err as Error).message)
        setFullforteIds(prev => {
          const rull = new Set(prev)
          blerFullfort ? rull.delete(id) : rull.add(id)
          return rull
        })
        setUkentligData(prev => ({
          ...prev,
          [iDag]: Math.max(0, (prev[iDag] ?? 0) + (blerFullfort ? -1 : 1)),
        }))
      })
  }, [fullforteIds, token, loggUt])

  const leggTilOppdrag = useCallback((tittel: string, poeng: number) => {
    setOppdragListe(prev => {
      const nyId = prev.length > 0 ? Math.max(...prev.map(o => o.id)) + 1 : 1
      return [...prev, { id: nyId, tittel, poeng, ikon: '⭐', varighet: 'Medium', sted: 'Inne', kategori: 'fysisk', beskrivelse: tittel }]
    })
  }, [])

  const lagreBarnNavn    = useCallback((navn: string)  => setBarnNavn(navn), [])
  const leggTilBelonning = useCallback((tekst: string) => setBelonninger(prev => [...prev, { id: Date.now(), tekst }]), [])
  const slettBelonning   = useCallback((id: number)    => setBelonninger(prev => prev.filter(b => b.id !== id)), [])

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
    ;[SK.oppdrag, SK.fullforte, SK.ukentlig, SK.barnNavn, SK.belonninger]
      .forEach(k => localStorage.removeItem(k))
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

export function useZiimo(): ZiimoContextValue {
  const ctx = useContext(ZiimoContext)
  if (!ctx) throw new Error('useZiimo må brukes innenfor ZiimoProvider')
  return ctx
}
