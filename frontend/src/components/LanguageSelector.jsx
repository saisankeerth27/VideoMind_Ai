import { LANGUAGES, SUMMARY_LENGTHS } from '../config/languages'

function Select({ id, label, value, onChange, options, disabled }) {
    return (
        <div className="w-full sm:w-auto">
            <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {label}
            </label>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:bg-slate-50 disabled:text-slate-400"
            >
                {options.map((opt) => (
                    <option key={opt.value ?? opt.code} value={opt.value ?? opt.code}>
                        {opt.label ?? `${opt.name} (${opt.english_name})`}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default function LanguageSelector({
    language,
    onLanguageChange,
    summaryLength,
    onSummaryLengthChange,
    disabled,
    
    onGenerate,
    isGenerating,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <Select
                    id="output-language"
                    label="Output Language"
                    value={language}
                    onChange={onLanguageChange}
                    options={LANGUAGES}
                    disabled={disabled || isGenerating}
                />
                <Select
                    id="summary-length"
                    label="Summary Length"
                    value={summaryLength}
                    onChange={onSummaryLengthChange}
                    options={SUMMARY_LENGTHS}
                    disabled={disabled || isGenerating}
                />
                {onGenerate && (
                    <button
                        type="button"
                        onClick={onGenerate}
                        disabled={disabled || isGenerating}
                        className="inline-flex h-[42px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-500 hover:to-violet-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        {isGenerating ? (
                            <>
                                <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                Generating...
                            </>
                        ) : (
                            'Generate'
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}

