'use client'
import { useState, useEffect } from 'react'
import { NavContext } from '@/lib/nav-context'
import PublicApp from '@/components/PublicApp'
import DashboardApp from '@/components/DashboardApp'

function App() {
  const [path, setPath] = useState('')

  useEffect(() => {
    setPath(window.location.pathname + window.location.search)
    const handler = () => setPath(window.location.pathname + window.location.search)
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  const navigate = (newPath) => {
    window.history.pushState({}, '', newPath)
    setPath(newPath)
    window.scrollTo(0, 0)
  }

  if (!path) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy">
      <div className="text-brand-gold text-2xl font-serif font-bold animate-pulse">DIAJEM</div>
    </div>
  )

  return (
    <NavContext.Provider value={{ path, navigate }}>
      {path.startsWith('/dashboard') ? <DashboardApp /> : <PublicApp />}
    </NavContext.Provider>
  )
}

export default App
