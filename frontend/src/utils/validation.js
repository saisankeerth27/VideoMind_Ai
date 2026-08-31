const YOUTUBE_URL_PATTERN =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}([&#?][^\s]*)?|youtube\.com\/shorts\/[A-Za-z0-9_-]{11}([&#?][^\s]*)?|youtube\.com\/embed\/[A-Za-z0-9_-]{11}([&#?][^\s]*)?|youtu\.be\/[A-Za-z0-9_-]{11}([&#?][^\s]*)?)$/

/**
 * Frontend-only validation that accepts standard YouTube URL shapes:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - URLs without http:// scheme
 * - URLs with &list=, &index=, &t=, ?si= parameters
 */
export function isValidYouTubeUrl(url) {
  return YOUTUBE_URL_PATTERN.test((url || '').trim())
}
