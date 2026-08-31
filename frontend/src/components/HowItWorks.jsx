import { AcademicCapIcon, ClipboardIcon, PencilSquareIcon } from './Icons'

const STEPS = [
  {
    number: '01',
    title: 'Paste',
    description: 'Paste your YouTube video URL into the input field above.',
    Icon: PencilSquareIcon,
  },
  {
    number: '02',
    title: 'Analyze',
    description:
      'The application extracts the transcript and generates an AI summary of the content.',
    Icon: ClipboardIcon,
  },
  {
    number: '03',
    title: 'Learn',
    description: 'Read, copy, or download the results and revisit key ideas anytime.',
    Icon: AcademicCapIcon,
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-slate-100 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
            Simple by design
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            How It Works
          </h2>
          <p className="mt-2.5 text-sm text-slate-500 sm:text-base">
            Three simple steps from video link to useful knowledge.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.number}
              className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                  <step.Icon className="h-5 w-5" />
                </span>
                <span
                  aria-hidden="true"
                  className="text-3xl font-extrabold text-slate-100 transition-colors group-hover:text-indigo-200"
                >
                  {step.number}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
