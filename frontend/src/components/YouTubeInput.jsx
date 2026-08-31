import { LinkIcon, XMarkIcon } from './Icons'

export default function YouTubeInput({ id = 'youtube-url', value, onChange, disabled }) {
  const handleClear = () => {
    onChange('')
    document.getElementById(id)?.focus()
  }

  return (
    <div className="relative w-full">
      <label htmlFor={id} className="sr-only">
        YouTube video URL
      </label>
      <LinkIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        id={id}
        name="youtubeUrl"
        type="text"
        autoComplete="off"
        spellCheck="false"
        placeholder="https://www.youtube.com/watch?v=..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-11 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:bg-slate-50 disabled:text-slate-400 sm:text-base"
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear URL input"
          className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
