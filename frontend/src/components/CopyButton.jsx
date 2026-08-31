import { useEffect, useRef, useState } from 'react'
import { CheckIcon, CopyIcon } from './Icons'

export default function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard API can be blocked (e.g. insecure context) — fall back gracefully
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      } catch {
        return
      }
    }
    setCopied(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied to clipboard' : `Copy ${label.toLowerCase()} to clipboard`}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
        copied
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-slate-300 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
      }`}
    >
      {copied ? (
        <>
          <CheckIcon className="h-3.5 w-3.5" />
          Copied ✓
        </>
      ) : (
        <>
          <CopyIcon className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </button>
  )
}
