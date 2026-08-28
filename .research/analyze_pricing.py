#!/usr/bin/env python3
import csv, collections, re

with open('/Users/huda/Desktop/dev/tanship/.research/paid_sorted.tsv') as f:
    reader = csv.reader(f, delimiter='\t')
    rows = list(reader)

print(f'Total: {len(rows)}')

# Cluster by host + endpoint path
def path_bucket(url):
    """Bucket by path family: /v1/foo/{id} -> /v1/foo/*"""
    parts = url.split('/')
    # /v1/foo/123/abc -> /v1/foo/{id}
    bucket = []
    for p in parts[3:]:  # skip https://host
        if p.isdigit() or re.match(r'^[0-9a-f]{20,}$', p):
            bucket.append('{id}')
        else:
            bucket.append(p)
    return '/' + '/'.join(bucket)

buckets = collections.Counter()
bucket_prices = collections.defaultdict(list)
bucket_names = {}
for price_str, url, name in rows:
    try:
        price_usd = int(price_str) / 1_000_000  # 100 = 0.0001, 1000000 = 1.0
    except:
        continue
    b = path_bucket(url)
    buckets[b] += 1
    bucket_prices[b].append(price_usd)
    if b not in bucket_names:
        bucket_names[b] = url

# Sort by frequency
print('\n=== TOP 50 MOST-OFFERED ENDPOINT PATTERNS ===')
print(f'{"count":>5}  {"min$":>8}  {"med$":>8}  {"max$":>8}  pattern')
for b, c in buckets.most_common(50):
    prices = sorted(bucket_prices[b])
    mn, med, mx = prices[0], prices[len(prices)//2], prices[-1]
    print(f'{c:>5}  ${mn:>7.4f}  ${med:>7.4f}  ${mx:>7.4f}  {b[:60]}')

# Endpoint families where there's clear pricing pressure
print('\n=== SAMPLES (first 5 endpoints) ===')
for b, c in buckets.most_common(30):
    prices = sorted(bucket_prices[b])
    mn = prices[0]
    sample_url = bucket_names[b]
    print(f'  count={c:3d} min=${mn:.4f} e.g. {sample_url[:80]}')

# What I currently sell
my_endpoints = set()
import json
cat = open('/Users/huda/Desktop/dev/tanship/apps/console/src/catalog.ts').read()
for m in re.finditer(r'path:\s*["\']([^"\']+)["\']', cat):
    my_endpoints.add(m.group(1))
print(f'\nMy endpoints: {len(my_endpoints)}')
for ep in sorted(my_endpoints)[:20]:
    print(f'  {ep}')
