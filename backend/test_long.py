"""Test with a long transcript to reproduce the summary failure."""
import sys
sys.path.insert(0, r'C:\Users\23jr1\Desktop\VideoMind_Ai\backend')

from app.services.ai_service import generate_summary
from app.utils.text_chunker import split_text_into_chunks

# Get the actual transcript from the existing video
import requests
r = requests.post('http://localhost:8000/api/videos/process', json={'youtube_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'})
data = r.json()
transcript = data['transcript']['content']

print(f"Original transcript length: {len(transcript)} chars")
print(f"Original transcript words: {len(transcript.split())}")

# Test with the actual transcript (short)
print("\n--- Testing with SHORT transcript ---")
try:
    result = generate_summary(transcript, "English", "detailed")
    print(f"  SUCCESS: overview len={len(result['overview'])}")
except Exception as e:
    print(f"  FAIL: {e}")

# Now create a LONG transcript by repeating it many times
# Simulate a 30-minute video (roughly 5000+ words)
long_transcript = transcript + "\n\n"
for i in range(30):
    long_transcript += transcript

print(f"\nLong transcript length: {len(long_transcript)} chars")
print(f"Long transcript words: {len(long_transcript.split())}")

# Check chunking
chunks = split_text_into_chunks(long_transcript, max_chars=12000)
print(f"Number of chunks: {len(chunks)}")
for i, c in enumerate(chunks[:5]):
    print(f"  Chunk {i}: {len(c)} chars")
print(f"  ...")
if len(chunks) > 5:
    print(f"  Chunk {len(chunks)-1}: {len(chunks[-1])} chars")

# Test with long transcript
print("\n--- Testing with LONG transcript ---")
try:
    result = generate_summary(long_transcript, "English", "detailed")
    print(f"  SUCCESS: overview len={len(result['overview'])}")
except Exception as e:
    print(f"  FAIL: {type(e).__name__}: {e}")