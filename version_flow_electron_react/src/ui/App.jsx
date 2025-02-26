import './App.css'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Home from './components/Home'


function App() {

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Home />} />
        </Routes>
      </HashRouter>

    </>
  )
}

export default App
