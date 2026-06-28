import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import { AuthProvider }   from './context/AuthContext'
import { ZiimoProvider }  from './context/ZiimoContext'
import Hjem               from './pages/Hjem/Hjem'
import OppdragSide        from './pages/Oppdrag/Oppdrag'
import Foreldre           from './pages/Foreldre/Foreldre'
import Innstillinger      from './pages/Innstillinger/Innstillinger'
import Login              from './pages/Login/Login'
import Header             from './components/Header/Header'
import Nav                from './components/Nav/Nav'
import KrevAuth           from './components/KrevAuth/KrevAuth'

function AppInnhold() {
  const { pathname } = useLocation()
  const erLogin = pathname === '/login'

  return (
    <div className="app">
      {!erLogin && <Header />}
      <Routes>
        <Route path="/"              element={<Hjem />} />
        <Route path="/oppdrag"       element={<OppdragSide />} />
        <Route path="/innstillinger" element={<Innstillinger />} />
        <Route path="/login"         element={<Login />} />
        <Route
          path="/foreldre"
          element={
            <KrevAuth>
              <Foreldre />
            </KrevAuth>
          }
        />
      </Routes>
      {!erLogin && <Nav />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ZiimoProvider>
          <AppInnhold />
        </ZiimoProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
