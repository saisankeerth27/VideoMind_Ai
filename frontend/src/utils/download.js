/**
 * Trigger a browser file download for the given text content.
 * Used in Phase 2 for client-side .txt downloads; Phase 3 will
 * add backend-powered downloads (including PDF).
 */
export function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
