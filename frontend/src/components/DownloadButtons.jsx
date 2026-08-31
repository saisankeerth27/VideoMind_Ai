import { useEffect, useRef, useState } from 'react'
import { downloadFile, downloadUrls } from '../services/api'
import { downloadTextFile } from '../utils/download'
import { summaryToText, transcriptToText } from '../utils/formatters'
import { ChevronDownIcon } from './Icons'

/**
 * PDF-primary download menu.
 * kind: "summary" | "transcript" | "complete"
 */
export default function DownloadButtons({ videoId, languageCode, summary, transcript, summaryLength = 'detailed' }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(null) // null | 'generating' | 'done'
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!videoId) return null

  const pdfItems = [
    { label: 'Summary PDF', url: downloadUrls.summaryPdf(videoId, languageCode, summaryLength), enabled: !!summary },
    { label: 'Transcript PDF', url: downloadUrls.transcriptPdf(videoId, languageCode), enabled: !!transcript },
    { label: 'Complete Analysis PDF', url: downloadUrls.completePdf(videoId, languageCode, summaryLength), enabled: !!(summary && transcript) },
  ]

  const txtItems = [
    { label: 'Summary TXT', content: summaryToText(summary, summaryLength), filename: `videomind-summary-${languageCode}-${summaryLength}.txt` },
    { label: 'Transcript TXT', content: transcriptToText(transcript), filename: `videomind-transcript-${languageCode}.txt` },
  ]

  const handlePdf = (item) => {
    if (!item.enabled) return
    setOpen(false)
    setStatus('generating')
    downloadFile(item.url)
    // Browser handles the actual save; brief feedback for UX
    setTimeout(() => setStatus('done'), 1200)
    setTimeout(() => setStatus(null), 3200)
  }

  const handleTxt = (item) => {
    setOpen(false)
    downloadTextFile(item.filename, item.content)
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-500 hover:to-violet-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        {status === 'generating' ? 'Generating PDF...' : status === 'done' ? 'PDF downloaded ✓' : 'Download PDF'}
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <p className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            PDF Documents
          </p>
          {pdfItems.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => handlePdf(item)}
              disabled={!item.enabled}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-white"
            >
              📄 {item.label}
            </button>
          ))}
          <p className="border-y border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            More formats
          </p>
          {txtItems.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => handleTxt(item)}
              disabled={!item.content}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              📃 {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
