import { Navigate, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import { AppContext } from './hooks/appContext'
import { useAppState } from './hooks/useAppState'
import Home from './pages/Home'
import Results from './pages/Results'

function AppShell() {
  const state = useAppState()

  return (
    <AppContext.Provider value={state}>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AppContext.Provider>
  )
}

export default function App() {
  return <AppShell />
}
