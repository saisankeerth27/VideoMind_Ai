import { SparklesIcon } from './Icons'

export default function GenerateButton({ onClick, disabled, isLoading }) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-sm sm:w-auto sm:text-base"
    >
      {isLoading ? (
        <>
          <span
            aria-hidden
            className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
          Generating...
        </>
      ) : (
        <>
          <SparklesIcon className="h-5 w-5" />
          Generate Summary
        </>
      )}
    </button>
  )
}
