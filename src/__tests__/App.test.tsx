import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { ZiimoProvider } from '../context/ZiimoContext'
import Hjem from '../pages/Hjem/Hjem'
import Login from '../pages/Login/Login'

// Mock fetch – ingen nettverkskall i tester
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [],
  }))
  localStorage.clear()
})

function HjemWrapper() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <ZiimoProvider>
          <Hjem />
        </ZiimoProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}

function LoginWrapper() {
  return (
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('Hjem-siden', () => {
  it('rendrer uten å krasje', () => {
    const { container } = render(<HjemWrapper />)
    expect(container).toBeTruthy()
  })

  it('viser hilsenen til Ziimo', () => {
    render(<HjemWrapper />)
    expect(screen.getByText(/god dag/i)).toBeInTheDocument()
  })

  it('viser "Start dagens oppdrag"-knappen', () => {
    render(<HjemWrapper />)
    expect(screen.getByRole('button', { name: /oppdrag/i })).toBeInTheDocument()
  })
})

describe('Login-siden', () => {
  it('rendrer uten å krasje', () => {
    const { container } = render(<LoginWrapper />)
    expect(container).toBeTruthy()
  })

  it('viser Ziimo-logoen', () => {
    render(<LoginWrapper />)
    expect(screen.getByText('Ziimo')).toBeInTheDocument()
  })

  it('viser "Logg inn"- og "Registrer"-faner', () => {
    render(<LoginWrapper />)
    // "Logg inn" finnes både som fane og som submit-knapp – sjekk begge
    expect(screen.getAllByRole('button', { name: /logg inn/i }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: /registrer/i })).toBeInTheDocument()
  })
})
