import { Link } from 'react-router-dom'
import { PlayCircleIcon } from './Icons'

const FOOTER_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '#' },
  { label: 'Privacy', to: '#' },
  { label: 'GitHub', to: '#' },
]

export default function Footer() {
  return (
    <footer id="about" className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:px-6 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
              <PlayCircleIcon className="h-4 w-4" />
            </span>
            <span className="font-bold text-slate-900">VideoMind Ai</span>
          </div>
          <p className="text-sm text-slate-500">Transform videos into knowledge.</p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} VideoMind Ai. All rights reserved.
      </div>
    </footer>
  )
}

