import { SparklesIcon } from '../components/Icons'
import EmptyState from '../components/EmptyState'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import { useApp } from '../hooks/appContext'

export default function Home() {
  const {
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
    startProcessing,
    dismissError,
  } = useApp()

  return (
    <>
      <Hero
        youtubeUrl={youtubeUrl}
        onUrlChange={setYoutubeUrl}
        onGenerate={startProcessing}
        isLoading={isLoading}
        processingStep={processingStep}
        chunkProgress={chunkProgress}
        error={error}
        onDismissError={dismissError}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        summaryLength={summaryLength}
        onSummaryLengthChange={setSummaryLength}
      />

      <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
        <EmptyState
          icon={<SparklesIcon className="h-8 w-8" />}
          title="Ready to summarize your next video?"
          description="Paste a YouTube URL above and let AI turn the video into clear, useful information."
        />
      </section>

      <HowItWorks />
    </>
  )
}
