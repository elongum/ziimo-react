export const DAG_MAL = 3

interface DagInfo {
  dato: string
  etikett: string
}

const DAG_ETIKETTER = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']

export function ukensDager(): DagInfo[] {
  const iDag = new Date()
  const dagNr = (iDag.getDay() + 6) % 7
  const mandag = new Date(iDag)
  mandag.setDate(iDag.getDate() - dagNr)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mandag)
    d.setDate(mandag.getDate() + i)
    return { dato: d.toISOString().slice(0, 10), etikett: DAG_ETIKETTER[i] }
  })
}

export function beregnStreak(ukentligData: Record<string, number>): number {
  let streak = 0
  const iDag = new Date()
  for (let uke = 0; uke < 52; uke++) {
    const dagNr = (iDag.getDay() + 6) % 7
    const mandag = new Date(iDag)
    mandag.setDate(iDag.getDate() - dagNr - uke * 7)
    const harAktivitet = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mandag)
      d.setDate(mandag.getDate() + i)
      return d.toISOString().slice(0, 10)
    }).some(dato => (ukentligData[dato] ?? 0) > 0)
    if (harAktivitet) streak++
    else if (uke > 0) break
  }
  return streak
}
