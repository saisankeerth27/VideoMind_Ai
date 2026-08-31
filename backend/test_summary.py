import requests, json

r = requests.post('http://localhost:8000/api/videos/1/generate', json={'language_code': 'en', 'summary_length': 'detailed'})
data = r.json()
if data.get('success'):
    s = data.get('summary', {})
    print('SUCCESS: summary generated')
    print(f'  summary_length: {s.get("summary_length")}')
    print(f'  overview len: {len(s.get("overview", ""))}')
    print(f'  key_points count: {len(s.get("key_points", []))}')
    print(f'  concepts count: {len(s.get("important_concepts", []))}')
    print(f'  takeaways count: {len(s.get("main_takeaways", []))}')
    print(f'  has conclusion: {bool(s.get("conclusion"))}')
else:
    print(f'FAIL: {json.dumps(data, indent=2)}')