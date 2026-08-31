const TABS = [
  { id: 'summary', label: 'Summary' },
  { id: 'transcript', label: 'Transcript' },
]

export default function ResultTabs({ activeTab, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Result views"
      className="inline-flex w-full max-w-xs rounded-xl bg-slate-100 p-1 sm:w-auto"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`flex-1 rounded-lg px-5 py-2 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:flex-none ${
              isActive
                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
