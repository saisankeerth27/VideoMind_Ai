import { useMemo, useState } from 'react'
import { toParagraphs } from '../utils/transcriptFormat'
import CopyButton from './CopyButton'

function HighlightedText({ text, query }) {
  if (!query) return <>{text}</>
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="rounded bg-amber-200 px-0.5 text-slate-900">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

export default function TranscriptView({ transcript, downloadSlot }) {
  const [query, setQuery] = useState('')
  const content = typeof transcript === 'string' ? transcript : transcript?.content

  const paragraphs = useMemo(() => toParagraphs(content), [content])
  const trimmedQuery = query.trim()
  const matchCount = useMemo(() => {
    if (!trimmedQuery) return 0
    return paragraphs.reduce(
      (total, p) => total + (p.toLowerCase().match(new RegExp(trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'))?.length || 0),
      0,
    )
  }, [paragraphs, trimmedQuery])

  if (!content) {
    return (
      <div id="panel-transcript" role="tabpanel" aria-labelledby="tab-transcript" className="py-8 text-center text-sm text-slate-500">
        No transcript available.
      </div>
    )
  }

  return (
    <div id="panel-transcript" role="tabpanel" aria-labelledby="tab-transcript">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Full Transcript</p>
        <div className="flex items-center gap-2">
          <CopyButton text={content} label="Transcript" />
          {downloadSlot}
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor="transcript-search" className="sr-only">Search transcript</label>
        <input
          id="transcript-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ðŸ” Search transcript..."
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
        {trimmedQuery && (
          <p className="mt-1.5 text-xs font-medium text-slate-500" role="status">
            {matchCount} match{matchCount === 1 ? '' : 'es'} found
          </p>
        )}
      </div>

      <div
        tabIndex={0}
        aria-label="Video transcript, scrollable"
        className="mt-4 max-h-[30rem] overflow-y-auto rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:p-7"
      >
        <div className="mx-auto max-w-2xl space-y-5">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-[15px] leading-8 text-slate-700">
              <HighlightedText text={paragraph} query={trimmedQuery} />
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

