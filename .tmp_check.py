import json
import sys
import urllib.request

req = urllib.request.Request(
    "https://x402.tanship.dev/v1/services",
    headers={"Accept": "application/json"},
)
with urllib.request.urlopen(req, timeout=10) as r:
    d = json.load(r)
services = d.get("data", {}).get("services", [])
counts = {}
for s in services:
    p = s.get("price", "")
    counts[p] = counts.get(p, 0) + 1
print(f"Total services: {len(services)}")
print("PRICE DIST (after deploy):")
for p, c in sorted(counts.items()):
    print(f"  {p}: {c}")
batch = [s for s in services if s.get("id") == "ai.batch"]
print(f"ai.batch present: {bool(batch)}")
if batch:
    print("  details:", json.dumps(batch[0], indent=2)[:600])
low = [s for s in services if s.get("price") in ("$0.0005", "$0.001")]
print(f"Endpoints still at $0.001 or less: {len(low)}")
