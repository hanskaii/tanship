import json, urllib.request
url = "https://x402.tanship.dev/v1/services"
req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "Mozilla/5.0"})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    d = json.load(resp)
    services = d['data']['services']
    print(f'TOTAL: {len(services)} services')
    new_ids = ['agent.memory.longterm.get', 'agent.memory.longterm.delete', 'agent.memory.longterm.list', 'dev.slugify', 'dev.json-path']
    for sid in new_ids:
        match = [s for s in services if s['id'] == sid]
        if match:
            print(f'  ✓ {sid} = {match[0]["price"]} ({match[0]["path"]})')
        else:
            print(f'  ✗ {sid} NOT FOUND')
    # Check repriced
    recheck = ['rag.query', 'rag.answer', 'ai.chat', 'modal.sandbox.create', 'modal.sandbox.exec', 'modal.sandbox.status', 'modal.sandbox.terminate']
    for sid in recheck:
        match = [s for s in services if s['id'] == sid]
        if match:
            print(f'  R {sid} = {match[0]["price"]}')
except Exception as e:
    print(f'ERROR: {e}')