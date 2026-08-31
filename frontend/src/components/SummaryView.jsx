import { CheckIcon, DocumentTextIcon, LightbulbIcon, ListBulletIcon } from './Icons'

function SectionCard({ icon, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-indigo-600">
        <span>{icon}</span>
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function BulletList({ items }) {
  return (
    <ul className="space-y-3.5">
      {(items || []).map((item, index) => (
        <li key={index} className="flex gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-[15px] leading-relaxed text-slate-700">{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function SummaryView({ summary, summaryLength = 'detailed' }) {
  if (!summary) {
    return (
      <div id="panel-summary" role="tabpanel" aria-labelledby="tab-summary" className="py-8 text-center text-sm text-slate-500">
        No summary available yet.
      </div>
    )
  }

  const concepts = (summary.important_concepts || []).map((c) =>
    typeof c === 'string' ? { name: c, explanation: '' } : c,
  )

  const lengthLabel = { short: 'Short', medium: 'Medium', detailed: 'Detailed' }[summaryLength] || 'Detailed'

  return (
    <div id="panel-summary" role="tabpanel" aria-labelledby="tab-summary" className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          {lengthLabel} Summary
        </span>
      </div>

      <SectionCard icon={<DocumentTextIcon className="h-4 w-4" />} title="Overview">
        {(summary.overview || '').split('\n\n').map((para, i) => (
          <p key={i} className="mb-3 text-[15px] leading-relaxed text-slate-700 last:mb-0">
            {para}
          </p>
        ))}
      </SectionCard>

      <SectionCard icon={<ListBulletIcon className="h-4 w-4" />} title="Key Points">
        <BulletList items={summary.key_points} />
      </SectionCard>

      {concepts.length > 0 && (
        <SectionCard icon={<LightbulbIcon className="h-4 w-4" />} title="Important Concepts">
          <div className="space-y-4">
            {concepts.map((concept, i) => (
              <div key={i} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="font-semibold text-slate-900">{concept.name}</p>
                {concept.explanation && (
                  <p className="mt-1 text-[14px] leading-relaxed text-slate-600">{concept.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {summary.detailed_explanation && (
        <SectionCard icon={<DocumentTextIcon className="h-4 w-4" />} title="Detailed Explanation">
          {summary.detailed_explanation.split('\n\n').map((para, i) => (
            <p key={i} className="mb-3 text-[15px] leading-relaxed text-slate-700 last:mb-0">
              {para}
            </p>
          ))}
        </SectionCard>
      )}

      <SectionCard icon={<CheckIcon className="h-4 w-4" />} title="Main Takeaways">
        <ul className="space-y-3">
          {(summary.main_takeaways || []).map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckIcon className="h-3 w-3" />
              </span>
              <span className="text-[15px] leading-relaxed text-slate-700">{t}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {summary.conclusion && (
        <SectionCard icon={<DocumentTextIcon className="h-4 w-4" />} title="Conclusion">
          <p className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4 text-[15px] leading-relaxed text-slate-700 ring-1 ring-indigo-100">
            {summary.conclusion}
          </p>
        </SectionCard>
      )}
    </div>
  )
}

