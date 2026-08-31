import { AlertTriangleIcon, XMarkIcon } from './Icons'

export default function ErrorMessage({ error, onDismiss }) {
  if (!error) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
    >
      <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-red-800">{error.title}</p>
        {error.message && <p className="mt-0.5 text-sm text-red-700">{error.message}</p>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="-m-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-100 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
