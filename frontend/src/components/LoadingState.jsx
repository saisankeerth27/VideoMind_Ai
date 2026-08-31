import { CheckIcon } from './Icons'

const STEPS = [
  { id: 'validate', label: 'Validating YouTube URL' },
  { id: 'extract', label: 'Extracting transcript' },
  { id: 'summarize', label: 'Generating AI summary' },
  { id: 'navigate', label: 'Loading results' },
]

export default function LoadingState({ currentStep, chunkProgress }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-indigo-100/50 sm:p-8"
    >
      <div className="flex flex-col items-center text-center">
        <span
          aria-hidden
          className="h-12 w-12 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-600"
        />
        <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          Processing your video...
        </h3>
        <p className="mt-1.5 text-sm text-slate-500">
          {currentStep <= 1 ? 'Extracting the transcript.' : currentStep === 2 ? 'Generating AI summary.' : 'Almost ready.'}
        </p>
      </div>

      <ul className="mx-auto mt-8 w-full max-w-sm space-y-3.5 text-left">
        {STEPS.map((step, index) => {
          const isDone = index < currentStep
          const isActive = index === currentStep
          const isPending = index > currentStep

          return (
            <li key={step.id} className="flex items-center gap-3">
              {isDone && (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
              )}
              {isActive && (
                <span
                  aria-hidden
                  className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-indigo-100 border-t-indigo-600"
                />
              )}
              {isPending && (
                <span className="h-6 w-6 shrink-0 rounded-full border-2 border-slate-200" aria-hidden />
              )}
              <span
                className={`text-sm font-medium ${
                  isDone ? 'text-slate-500' : isActive ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {step.label}
                {isActive && chunkProgress && (
                  <span className="ml-1 text-xs text-indigo-600">{chunkProgress}</span>
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
