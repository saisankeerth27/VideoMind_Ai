import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BarsIcon, PlayCircleIcon, XMarkIcon } from './Icons'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'How It Works', to: '/', sectionId: 'how-it-works' },
  { label: 'About', to: '/', sectionId: 'about' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleNavClick = (link) => (event) => {
    setMenuOpen(false)
    if (link.sectionId) {
      event.preventDefault()
      if (location.pathname !== '/') {
        navigate('/')
        setTimeout(() => scrollToSection(link.sectionId), 80)
      } else {
        scrollToSection(link.sectionId)
      }
    }
  }

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
            <PlayCircleIcon className="h-5 w-5" />
          </span>
          <span className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            VideoMind Ai
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.sectionId ? `/#${link.sectionId}` : link.to}
              onClick={handleNavClick(link)}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <BarsIcon className="h-6 w-6" />}
        </button>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.sectionId ? `/#${link.sectionId}` : link.to}
                onClick={handleNavClick(link)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-indigo-600"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

