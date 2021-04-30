import requests
import json
import os
headers = {
  'Content-Type': 'application/json',
  'humbase-auth-api-key': 'test-auth-api-key',
  'humbase-store-api-key': 'test-store-api-key'
}
body = json.loads(os.environ.get('BODY'))
payload = json.dumps({
  'token': body['token']
})
r = requests.post("http://localhost:8888/api/v0/auth/verify", headers=headers, data=payload)
res = r.json()
if res["status"] != 'valid':
    print(json.dumps({
        "status": "error",
    }))
    exit()

email = res['email']

r = requests.get("http://localhost:8888/api/v0/store/" + email, headers=headers)
res = r.json()
data = {}
if 'data' in res:
    if res['data'] is not None:
        data = res['data']

if 'todo' not in data:
    data['todo'] = []

print(json.dumps(data))
