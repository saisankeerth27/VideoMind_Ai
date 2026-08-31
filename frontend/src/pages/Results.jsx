import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DownloadButtons from '../components/DownloadButtons'
import EmptyState from '../components/EmptyState'
import LanguageSelector from '../components/LanguageSelector'
import ResultTabs from '../components/ResultTabs'
import SummaryView from '../components/SummaryView'
import TranscriptView from '../components/TranscriptView'
import VideoInfo from '../components/VideoInfo'
import { ClipboardIcon, RefreshIcon, AlertTriangleIcon } from '../components/Icons'
import CopyButton from '../components/CopyButton'
import { summaryToText } from '../utils/formatters'
import { useApp } from '../hooks/appContext'

function SummaryLoadingCard() {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-8 text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600" />
      <h3 className="mt-4 text-base font-semibold text-indigo-900">Generating AI Summary</h3>
      <p className="mt-1.5 text-sm text-indigo-700/80">
        Analyzing the video content. This usually takes a few seconds.
      </p>
    </div>
  )
}

export default function Results() {
  const navigate = useNavigate()
  const {
    videoData,
    summary,
    transcript,
    originalTranscript,
    summaryError,
    activeTab,
    setActiveTab,
    processAnotherVideo,
    selectedLanguage,
    setSelectedLanguage,
    summaryLength,
    setSummaryLength,
    isGeneratingLanguage,
    isSummaryLoading,
    generateForCurrentSettings,
  } = useApp()

  const [viewingOriginal, setViewingOriginal] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  const handleGenerate = async () => {
    const result = await generateForCurrentSettings({})
    if (result?.ok) setViewingOriginal(false)
  }

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerating will use AI processing again. Continue?')) return
    setRegenerating(true)
    await generateForCurrentSettings({ force: true })
    setRegenerating(false)
  }

  if (!videoData) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
        <EmptyState
          icon={<ClipboardIcon className="h-6 w-6" />}
          title="Nothing to show yet"
          description="You haven't summarized a video in this session. Start by pasting a YouTube URL on the home page."
          action={
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Go to Home
            </button>
          }
        />
      </div>
    )
  }

  const activeTranscript = viewingOriginal
    ? { ...(originalTranscript || transcript), is_original: true }
    : transcript

  // Auto-switch to transcript tab if summary is still loading and no summary yet
  const effectiveTab = (!summary && isSummaryLoading) ? 'transcript' : activeTab

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <VideoInfo video={videoData} />

      {/* Summary error with retry */}
      {summaryError && !isSummaryLoading && (
        <div
          role="alert"
          className="mt-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Summary unavailable</p>
              <p className="text-sm text-amber-800">
                Transcript ready. We couldn't generate the AI summary. Please try again.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGeneratingLanguage}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
          >
            <RefreshIcon className={`h-3.5 w-3.5 ${isGeneratingLanguage ? 'animate-spin' : ''}`} />
            Retry Summary
          </button>
        </div>
      )}

      {/* Output language + length controls */}
      <div className="mt-6">
        <LanguageSelector
          language={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          summaryLength={summaryLength}
          onSummaryLengthChange={setSummaryLength}
          onGenerate={handleGenerate}
          isGenerating={isGeneratingLanguage}
          disabled={!videoData}
        />
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <ResultTabs activeTab={effectiveTab} onChange={(tab) => { setActiveTab(tab); setViewingOriginal(false) }} />
          <button
            type="button"
            onClick={() => setViewingOriginal((v) => !v)}
            aria-pressed={viewingOriginal}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              viewingOriginal
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-slate-300 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {viewingOriginal ? 'View Generated' : 'View Original'}
          </button>
        </div>

        <div className="mt-7">
          {effectiveTab === 'summary' ? (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-end gap-2 border-b border-slate-100 pb-4">
                {summary && <CopyButton text={summaryToText(summary, summaryLength)} label="Summary" />}
                {summary && (
                  <DownloadButtons videoId={videoData.id} languageCode={selectedLanguage} summary={summary} transcript={null} summaryLength={summaryLength} />
                )}
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={regenerating || isGeneratingLanguage || !summary}
                  title="Generates a new AI summary (uses additional API credits)"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshIcon className={`h-3.5 w-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>
              {isSummaryLoading && !summary ? (
                <SummaryLoadingCard />
              ) : (
                <SummaryView summary={summary} summaryLength={summaryLength} />
              )}
            </>
          ) : (
            <TranscriptView
              transcript={activeTranscript}
              downloadSlot={
                <DownloadButtons
                  videoId={videoData.id}
                  languageCode={selectedLanguage}
                  summary={null}
                  transcript={{ content: activeTranscript?.content }}
                />
              }
            />
          )}
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DownloadButtons
          videoId={videoData.id}
          languageCode={selectedLanguage}
          summary={summary}
          transcript={transcript}
          summaryLength={summaryLength}
        />
        <button
          type="button"
          onClick={processAnotherVideo}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Process Another Video
        </button>
      </div>
    </div>
  )
}
