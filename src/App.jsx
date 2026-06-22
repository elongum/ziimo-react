import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { ZiimoProvider } from './context/ZiimoContext'
import Hjem from './pages/Hjem/Hjem'
import Foreldre from './pages/Foreldre/Foreldre'
import Nav from './components/Nav/Nav'

function App() {
  return (
    <BrowserRouter>
      <ZiimoProvider>
        <div className="app">
          <Routes>
            <Route path="/" element={<Hjem />} />
            <Route path="/foreldre" element={<Foreldre />} />
          </Routes>
          <Nav />
        </div>
      </ZiimoProvider>
    </BrowserRouter>
  )
}

export default App
