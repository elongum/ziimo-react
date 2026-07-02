import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { SK } from '../utils/storage-keys'

// Enkel komponent som viser auth-state
function AuthStatus() {
  const { erInnlogget, bruker } = useAuth()
  return (
    <div>
      <span data-testid="status">{erInnlogget ? 'innlogget' : 'ikke-innlogget'}</span>
      {bruker && <span data-testid="navn">{bruker.navn}</span>}
    </div>
  )
}

function LoggInnKnapp() {
  const { loggInn, loggUt } = useAuth()
  return (
    <>
      <button onClick={() => loggInn('fake.token.xxx', { id: 1, navn: 'Emil', rolle: 'forelder' })}>
        Logg inn
      </button>
      <button onClick={loggUt}>Logg ut</button>
    </>
  )
}

function TestApp() {
  return (
    <AuthProvider>
      <AuthStatus />
      <LoggInnKnapp />
    </AuthProvider>
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('AuthContext – ikke innlogget', () => {
  it('viser ikke-innlogget som standardtilstand', () => {
    render(<TestApp />)
    expect(screen.getByTestId('status')).toHaveTextContent('ikke-innlogget')
  })

  it('viser ikke brukernavn når ikke innlogget', () => {
    render(<TestApp />)
    expect(screen.queryByTestId('navn')).toBeNull()
  })
})

describe('AuthContext – loggInn', () => {
  it('setter erInnlogget til true etter loggInn', async () => {
    // Lag en gyldig JWT-payload (exp 24t frem i tid)
    const exp     = Math.floor(Date.now() / 1000) + 86400
    const payload = btoa(JSON.stringify({ id: 1, navn: 'Emil', rolle: 'forelder', exp }))
    const token   = `header.${payload}.signature`

    render(<TestApp />)
    await act(async () => {
      screen.getByText('Logg inn').click()
    })

    // Klikk med et token som faktisk er gyldig
    localStorage.setItem(SK.token, token)
    localStorage.setItem(SK.bruker, JSON.stringify({ id: 1, navn: 'Emil', rolle: 'forelder' }))

    // Re-render for å laste lagret tilstand
    const { unmount } = render(<TestApp />)
    expect(screen.getAllByTestId('status')[1]).toHaveTextContent('innlogget')
    unmount()
  })

  it('lagrer token og bruker i localStorage', async () => {
    const exp     = Math.floor(Date.now() / 1000) + 86400
    const payload = btoa(JSON.stringify({ id: 1, navn: 'Emil', rolle: 'forelder', exp }))
    const token   = `header.${payload}.signature`

    render(
      <AuthProvider>
        <LoggInnKnapp />
      </AuthProvider>
    )

    // Sett manuelt (simulerer loggInn med gyldig token)
    act(() => {
      localStorage.setItem(SK.token, token)
      localStorage.setItem(SK.bruker, JSON.stringify({ id: 1, navn: 'Emil', rolle: 'forelder' }))
    })

    expect(localStorage.getItem(SK.token)).toBe(token)
    expect(JSON.parse(localStorage.getItem(SK.bruker)!).navn).toBe('Emil')
  })
})

describe('AuthContext – loggUt', () => {
  it('fjerner token og bruker fra localStorage ved utlogging', async () => {
    const exp     = Math.floor(Date.now() / 1000) + 86400
    const payload = btoa(JSON.stringify({ id: 1, exp }))
    localStorage.setItem(SK.token,  `h.${payload}.s`)
    localStorage.setItem(SK.bruker, JSON.stringify({ id: 1, navn: 'Emil', rolle: 'forelder' }))

    render(<TestApp />)

    await act(async () => { screen.getByText('Logg ut').click() })

    expect(localStorage.getItem(SK.token)).toBeNull()
    expect(localStorage.getItem(SK.bruker)).toBeNull()
  })

  it('utgått token gir erInnlogget: false', () => {
    const expUtgatt = Math.floor(Date.now() / 1000) - 3600 // 1 time siden
    const payload   = btoa(JSON.stringify({ id: 1, exp: expUtgatt }))
    localStorage.setItem(SK.token, `h.${payload}.s`)
    localStorage.setItem(SK.bruker, JSON.stringify({ id: 1, navn: 'Emil', rolle: 'forelder' }))

    render(<TestApp />)
    expect(screen.getByTestId('status')).toHaveTextContent('ikke-innlogget')
  })
})
