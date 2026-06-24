import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { ZiimoProvider } from './context/ZiimoContext'
import Hjem from './pages/Hjem/Hjem'
import OppdragSide from './pages/Oppdrag/Oppdrag'
import Foreldre from './pages/Foreldre/Foreldre'
import Innstillinger from './pages/Innstillinger/Innstillinger'
import Header from './components/Header/Header'
import Nav from './components/Nav/Nav'

function App() {
  return (
    <BrowserRouter>
      <ZiimoProvider>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/"               element={<Hjem />} />
            <Route path="/oppdrag"        element={<OppdragSide />} />
            <Route path="/foreldre"       element={<Foreldre />} />
            <Route path="/innstillinger"  element={<Innstillinger />} />
          </Routes>
          <Nav />
        </div>
      </ZiimoProvider>
    </BrowserRouter>
  )
}

export default App
