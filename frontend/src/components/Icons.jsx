const iconProps = (className) => ({
  className,
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
})

export function ChevronDownIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

export function SparklesIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z" />
      <path d="M19 14l.9 2.1 2.1.9-2.1.9L19 20l-.9-2.1-2.1-.9 2.1-.9L19 14z" />
    </svg>
  )
}

export function LinkIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  )
}

export function PlayCircleIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M10 8l6 4-6 4V8z" />
    </svg>
  )
}

export function CheckIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

export function CheckCircleIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <path d="M22 4L12 14.01l-3-3" />
    </svg>
  )
}

export function CopyIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}

export function DownloadIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  )
}

export function AlertTriangleIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

export function XMarkIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

export function BarsIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  )
}

export function ClockIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

export function DocumentTextIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  )
}

export function ListBulletIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  )
}

export function LightbulbIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 00-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0012 2z" />
    </svg>
  )
}

export function ClipboardIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    </svg>
  )
}

export function RefreshIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M21 12a9 9 0 11-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  )
}

export function PencilSquareIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

export function AcademicCapIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M22 10L12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
    </svg>
  )
}
