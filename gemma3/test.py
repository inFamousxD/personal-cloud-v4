import requests
import json

response = requests.post('http://localhost:11434/api/chat',
    json={
        "model": "gemma3:4b",
        "messages": [{"role": "user", "content": "How do I make a HTTP request in Python?"}],
        "stream": True
    },
    stream=True
)

for line in response.iter_lines():
    if line:
        chunk = json.loads(line)
        print(chunk['message']['content'], end='', flush=True)