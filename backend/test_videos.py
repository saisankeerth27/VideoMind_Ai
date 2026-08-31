import requests, json, sys

videos_to_test = [
    ('https://www.youtube.com/watch?v=LKf4sN8wOg4', 'test1'),
    ('https://www.youtube.com/watch?v=rfscVS0vtbw', 'test2'),
    ('https://www.youtube.com/watch?v=iLnmSACW_P4', 'test3'),
]

for url, label in videos_to_test:
    try:
        r = requests.post('http://localhost:8000/api/videos/process', json={'youtube_url': url}, timeout=30)
        data = r.json()
        if data.get('success'):
            vid = data['video']['youtube_id']
            transcript = data['transcript']['content']
            print(f'SUCCESS {label}: {vid}, len={len(transcript)}, words={len(transcript.split())}')
        else:
            print(f'FAIL {label}: {data.get("error", {}).get("code", "unknown")}')
    except Exception as e:
        print(f'ERROR {label}: {str(e)[:200]}')