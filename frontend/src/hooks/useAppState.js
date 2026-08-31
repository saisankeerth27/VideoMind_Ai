import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateContent, getApiErrorMessage, processVideo } from '../services/api'
import { DEFAULT_LANGUAGE, DEFAULT_SUMMARY_LENGTH } from '../config/languages'
import { isValidYouTubeUrl } from '../utils/validation'

/**
 * Central application state.
 *
 * Single-click UX:
 * 1. User clicks Generate → single request extracts transcript + generates summary
 * 2. Results page shows both transcript and summary immediately
 * 3. Retry/Regenerate available on results page for recovery or new summaries
 */
export function useAppState() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_LANGUAGE)
  const [summaryLength, setSummaryLength] = useState(DEFAULT_SUMMARY_LENGTH)
  const [isLoading, setIsLoading] = useState(false)
  const [processingStep, setProcessingStep] = useState(-1)
  const [chunkProgress, setChunkProgress] = useState(null)
  const [error, setError] = useState(null)
  const [videoData, setVideoData] = useState(null)
  const [transcript, setTranscript] = useState(null)
  const [originalTranscript, setOriginalTranscript] = useState(null)
  const [summary, setSummary] = useState(null)
  const [summaryError, setSummaryError] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')
  const [isGeneratingLanguage, setIsGeneratingLanguage] = useState(false)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)

  const timersRef = useRef([])
  const navigate = useNavigate()

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => clearTimers, [])

  const schedule = (callback, delay) => {
    timersRef.current.push(setTimeout(callback, delay))
  }

  const dismissError = () => setError(null)
  const dismissSummaryError = () => setSummaryError(null)

  const resetSession = () => {
    clearTimers()
    setYoutubeUrl('')
    setIsLoading(false)
    setProcessingStep(-1)
    setChunkProgress(null)
    setError(null)
    setVideoData(null)
    setTranscript(null)
    setOriginalTranscript(null)
    setSummary(null)
    setSummaryError(null)
    setActiveTab('summary')
    setIsSummaryLoading(false)
  }

  const processAnotherVideo = () => {
    resetSession()
    navigate('/results')
    schedule(() => navigate('/'), 100)
  }

  const startProcessing = async (rawUrl) => {
    const url = (rawUrl || '').trim()
    if (!url) {
      setError({ title: 'URL required', message: 'Please paste a YouTube video URL first.' })
      return
    }
    if (!isValidYouTubeUrl(url)) {
      setError({ title: 'Invalid YouTube URL', message: 'Please enter a valid YouTube video link.' })
      return
    }

    setError(null)
    clearTimers()
    setIsLoading(true)
    setChunkProgress(null)
    setSummary(null)
    setSummaryError(null)

    try {
      // Step 1: Validate URL
      setProcessingStep(0)
      await new Promise((r) => setTimeout(r, 400))

      // Step 2-5: Single request — transcript + summary
      setProcessingStep(1)
      const data = await processVideo(url, {
        languageCode: selectedLanguage,
        summaryLength,
      })

      setVideoData(data.video)
      setOriginalTranscript(data.transcript)
      setTranscript(data.transcript)

      if (data.summary) {
        setSummary(data.summary)
        setSummaryError(null)
      } else if (data.summary_error) {
        setSummary(null)
        setSummaryError(data.summary_error)
      }

      // Step 5: Done — navigate to results
      setProcessingStep(4)
      schedule(() => {
        setActiveTab('summary')
        navigate('/results')
      }, 300)
    } catch (processErr) {
      setIsLoading(false)
      setProcessingStep(-1)
      setChunkProgress(null)
      setError({
        title: 'Could not process this video',
        message: getApiErrorMessage(processErr),
      })
    } finally {
      setIsLoading(false)
    }
  }

  /** Regenerate content on the results page for the currently chosen settings. */
  const generateForCurrentSettings = async ({ force = false } = {}) => {
    if (!videoData || isGeneratingLanguage) return
    setIsGeneratingLanguage(true)
    setIsSummaryLoading(true)
    setChunkProgress(null)
    try {
      const data = await generateContent(videoData.id, {
        languageCode: selectedLanguage,
        summaryLength,
        regenerateSummary: force,
      })
      setTranscript(data.transcript)
      if (data.summary) {
        setSummary(data.summary)
        setSummaryError(null)
      } else {
        setSummary(null)
        setSummaryError(data.summary_error?.message || 'AI summary generation failed.')
      }
      return { ok: true }
    } catch (err) {
      setSummaryError(getApiErrorMessage(err))
      return { ok: false }
    } finally {
      setIsGeneratingLanguage(false)
      setIsSummaryLoading(false)
      setChunkProgress(null)
    }
  }

  return {
    youtubeUrl,
    setYoutubeUrl,
    selectedLanguage,
    setSelectedLanguage,
    summaryLength,
    setSummaryLength,
    isLoading,
    processingStep,
    chunkProgress,
    error,
    videoData,
    transcript,
    originalTranscript,
    summary,
    setSummary,
    summaryError,
    setSummaryError,
    dismissSummaryError,
    activeTab,
    setActiveTab,
    isGeneratingLanguage,
    isSummaryLoading,
    generateForCurrentSettings,
    startProcessing,
    resetSession,
    processAnotherVideo,
    dismissError,
  }
}
