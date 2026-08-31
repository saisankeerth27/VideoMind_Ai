/**
 * Convert structured summary/transcript objects into
 * plain text for copy-to-clipboard and client-side TXT downloads.
 */

export function summaryToText(summary, summaryLength = 'detailed') {
  if (!summary) return ''
  const lengthLabel = { short: 'Short', medium: 'Medium', detailed: 'Detailed' }[summaryLength] || 'Detailed'
  const lines = ['Video Summary', '=============', '', `Length: ${lengthLabel}`, '', 'Overview:', summary.overview || '']

  const keyPoints = summary.key_points || summary.keyPoints || []
  if (keyPoints.length) {
    lines.push('', 'Key Points:')
    keyPoints.forEach((point, i) => lines.push(`${i + 1}. ${point}`))
  }

  const concepts = summary.important_concepts || summary.importantConcepts || []
  if (concepts.length) {
    lines.push('', 'Important Concepts:')
    for (const c of concepts) {
      if (typeof c === 'object' && c.name) {
        lines.push(`${c.name}${c.explanation ? `\n   ${c.explanation}` : ''}`)
      } else {
        lines.push(`- ${c}`)
      }
    }
  }

  const detailed = summary.detailed_explanation || summary.detailedExplanation
  if (detailed) lines.push('', 'Detailed Explanation:', detailed)

  const takeaways = summary.main_takeaways || summary.mainTakeaways || []
  if (takeaways.length) {
    lines.push('', 'Main Takeaways:')
    takeaways.forEach((t, i) => lines.push(`${i + 1}. ${t}`))
  }

  if (summary.conclusion) lines.push('', 'Conclusion:', summary.conclusion)
  return lines.join('\n')
}

export function transcriptToText(transcript) {
  const content = typeof transcript === 'string' ? transcript : transcript?.content
  if (!content) return ''
  return content
}
