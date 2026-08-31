import { useState } from 'react'
import { ClockIcon, PlayCircleIcon } from './Icons'

export default function VideoInfo({ video }) {
  const [imageFailed, setImageFailed] = useState(false)
  if (!video) return null

  return (
    <section
      aria-label="Video information"
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:gap-6 sm:p-6"
    >
      {video.thumbnail_url && !imageFailed ? (
        <img
          src={video.thumbnail_url}
          alt={`Thumbnail for ${video.title || 'YouTube video'}`}
          onError={() => setImageFailed(true)}
          className="h-28 w-full rounded-xl object-cover sm:h-24 sm:w-40"
        />
      ) : (
        <div
          role="img"
          aria-label={`Placeholder thumbnail for ${video.title || 'YouTube video'}`}
          className="flex h-28 w-full shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 text-white/90 sm:h-24 sm:w-40"
        >
          <PlayCircleIcon className="h-10 w-10" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h2 className="break-words text-lg font-bold leading-snug tracking-tight text-slate-900">
          {video.title || 'YouTube Video'}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-100">
            YouTube
          </span>
          {video.duration && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
              <ClockIcon className="h-3.5 w-3.5" />
              {video.duration}
            </span>
          )}
          {video.youtube_url && (
            <a
              href={video.youtube_url}
              target="_blank"
              rel="noreferrer"
              className="max-w-[16rem] truncate rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-indigo-600 ring-1 ring-slate-200 hover:text-indigo-700 sm:max-w-xs"
            >
              {video.youtube_url}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
