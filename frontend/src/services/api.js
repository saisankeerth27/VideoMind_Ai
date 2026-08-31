import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
})

export async function processVideo(youtubeUrl, { languageCode, summaryLength } = {}) {
  const body = { youtube_url: youtubeUrl }
  if (languageCode) body.language_code = languageCode
  if (summaryLength) body.summary_length = summaryLength
  const response = await api.post('/api/videos/process', body)
  return response.data
}

export async function generateContent(videoId, { languageCode = 'en', summaryLength = 'detailed', regenerateSummary = false, regenerateTranslation = false } = {}) {
  const response = await api.post(
    `/api/videos/${videoId}/generate?regenerate_summary=${regenerateSummary}&regenerate_translation=${regenerateTranslation}`,
    { language_code: languageCode, summary_length: summaryLength },
  )
  return response.data
}

export async function generateSummary(videoId, { languageCode, summaryLength = 'detailed', regenerate = false } = {}) {
  const body = {}
  if (languageCode) body.language_code = languageCode
  if (summaryLength) body.summary_length = summaryLength
  const response = await api.post(`/api/videos/${videoId}/summary?regenerate=${regenerate}`, body)
  return response.data
}

export async function getVideo(videoId) {
  const response = await api.get(`/api/videos/${videoId}`)
  return response.data
}

export async function getTranscript(videoId) {
  const response = await api.get(`/api/videos/${videoId}/transcript`)
  return response.data
}

// PDFs are generated server-side; the browser downloads via Content-Disposition.
function triggerBackendDownload(path) {
  const anchor = document.createElement('a')
  anchor.href = `${API_BASE_URL}${path}`
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

export const downloadUrls = {
  summaryPdf: (videoId, langCode, summaryLength = 'detailed') => `/api/videos/${videoId}/summary/pdf?language_code=${langCode}&summary_length=${summaryLength}`,
  transcriptPdf: (videoId, langCode) => `/api/videos/${videoId}/transcript/pdf?language_code=${langCode}`,
  originalTranscriptPdf: (videoId) => `/api/videos/${videoId}/transcript/pdf/original`,
  completePdf: (videoId, langCode, summaryLength = 'detailed') => `/api/videos/${videoId}/pdf?language_code=${langCode}&summary_length=${summaryLength}`,
}

export function downloadFile(urlPath) {
  triggerBackendDownload(urlPath)
}

const FRIENDLY_MESSAGES = {
  INVALID_YOUTUBE_URL: 'Please enter a valid YouTube URL.',
  VIDEO_NOT_FOUND: "We couldn't access this YouTube video.",
  TRANSCRIPT_UNAVAILABLE: "This video does not have an accessible transcript.",
  TRANSCRIPT_FETCH_FAILED: "We couldn't retrieve the transcript. Please try again.",
  EXTERNAL_SERVICE_ERROR: 'The transcript service is temporarily unavailable. Please try again later.',
  DATABASE_ERROR: 'A database error occurred. Please try again.',
  AI_RATE_LIMIT: 'AI processing is temporarily busy. Please try again shortly.',
  AI_QUOTA_EXCEEDED: 'AI generation credits are exhausted on the configured account.',
  AI_TIMEOUT: 'Summary generation took too long. Please try again.',
  AI_API_ERROR: 'The external service is temporarily unavailable.',
  AI_AUTHENTICATION_ERROR: 'Summary generation is not available right now.',
  INVALID_LANGUAGE: 'Selected language is not supported.',
  TRANSLATION_FAILED: 'Translation could not be completed. Please try again.',
  INTERNAL_SERVER_ERROR: 'The server encountered an unexpected error. Please try again.',
  SUMMARY_GENERATION_FAILED: 'AI summary generation failed. Please try again.',
}

export function getApiErrorMessage(error) {
  const code = error?.response?.data?.error?.code
  if (code && FRIENDLY_MESSAGES[code]) return FRIENDLY_MESSAGES[code]
  if (error?.response?.data?.error?.message) return error.response.data.error.message

  if (error?.code === 'ECONNABORTED') return 'The request timed out. Please try again.'

  if (!error?.response) {
    return 'Cannot connect to the FastAPI backend. Make sure the backend is running.'
  }

  const status = error.response.status
  if (status === 400) return 'Invalid request.'
  if (status === 404) return 'The requested resource could not be found.'
  if (status === 422) return 'The request data is invalid.'
  if (status === 503) return 'The external service is temporarily unavailable.'
  if (status === 500) return 'Something went wrong while processing the video.'
  return 'Something went wrong. Please try again.'
}
