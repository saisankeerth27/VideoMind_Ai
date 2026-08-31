export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
      {icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600">
          {icon}
        </div>
      )}
      <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
      {description && (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">{description}</p>
      )}
      {action && <div className="mt-7">{action}</div>}
    </div>
  )
}
