import { LANGUAGES, SUMMARY_LENGTHS } from '../config/languages'
import ErrorMessage from './ErrorMessage'
import GenerateButton from './GenerateButton'
import LoadingState from './LoadingState'
import YouTubeInput from './YouTubeInput'

export default function Hero({ youtubeUrl, onUrlChange, onGenerate, isLoading, processingStep, chunkProgress, error, onDismissError, selectedLanguage, onLanguageChange, summaryLength, onSummaryLengthChange }) {
  return (
    <section className="bg-app-gradient">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
          AI-Powered Video Summaries
        </span>

        <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          Turn YouTube Videos Into{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-500 bg-clip-text text-transparent">
            Knowledge
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Generate accurate transcripts and AI-powered summaries from YouTube videos in seconds.
        </p>

        <div className="mt-10">
          {isLoading ? (
            <LoadingState currentStep={processingStep} chunkProgress={chunkProgress} />
          ) : (
            <>
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  onGenerate(youtubeUrl)
                }}
                className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-indigo-100/40 sm:p-5"
              >
                <YouTubeInput value={youtubeUrl} onChange={onUrlChange} />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="w-full sm:w-auto">
                    <label htmlFor="home-language" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Language
                    </label>
                    <select
                      id="home-language"
                      value={selectedLanguage}
                      onChange={(e) => onLanguageChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>{l.name} ({l.english_name})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-auto">
                    <label htmlFor="home-summary-length" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Summary Length
                    </label>
                    <select
                      id="home-summary-length"
                      value={summaryLength}
                      onChange={(e) => onSummaryLengthChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    >
                      {SUMMARY_LENGTHS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-center">
                  <GenerateButton disabled={!youtubeUrl.trim()} />
                </div>
              </form>

              {error && (
                <div className="mx-auto mt-4 max-w-xl">
                  <ErrorMessage error={error} onDismiss={onDismissError} />
                </div>
              )}

              <p className="mt-4 text-sm text-slate-500">
                Paste a public YouTube video URL to get started.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
