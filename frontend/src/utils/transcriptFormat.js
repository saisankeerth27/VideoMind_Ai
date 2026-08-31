/** Split raw transcript text into readable paragraphs without altering wording. */
export function toParagraphs(content) {
  const text = (content || '').replace(/\s+/g, ' ').trim()
  if (!text) return []

  if (text.includes('\n\n')) {
    return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  }

  const sentences = text.match(/[^.!?।]+[.!?।]*/g) || [text]
  const paragraphs = []
  let buffer = []
  let count = 0
  for (const sentence of sentences) {
    buffer.push(sentence.trim())
    count += 1
    if (count >= 4) {
      paragraphs.push(buffer.join(' '))
      buffer = []
      count = 0
    }
  }
  if (buffer.length) paragraphs.push(buffer.join(' '))
  return paragraphs
}
