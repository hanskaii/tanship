#!/usr/bin/env python3
import json, sys, collections

data = json.load(open('/Users/huda/Desktop/dev/tanship/.research/flat.json'))
print(f'Total items: {len(data)}')

# Sample structure
if data:
    print('Keys:', list(data[0].keys()))
    print('Sample:', json.dumps(data[0], indent=2)[:600])

# Keyword frequency in names/descriptions
names = collections.Counter()
keywords = ['pdf','ocr','summariz','translat','image','video','audio','sentiment',
            'classif','extract','parse','json','web','search','screenshot','seo',
            'spam','toxic','moderation','embed','rag','vector','sql','query',
            'eth','btc','base','usdc','token','nft','gas','price','chart',
            'cve','threat','vuln','domain','ssl','dns','whois','email','phone',
            'hash','encrypt','decrypt','sign','verify','tx','calldata','abi',
            'function','event','log','block','receipt','qr','barcode','markdown',
            'html','css','svg','cron','jwt','uuid','slug','favicon','og',
            'twitter','reddit','youtube','rss','weather','geo','ip','location',
            'tz','qrcode','slack','discord','telegram','notif','webhook','http',
            'user-agent','header','cookie','session','auth','login','sso',
            'rate','limit','quota','cost','estimate','budget','spend','burn']

for item in data:
    n = (item.get('name') or item.get('description') or '').lower()
    for kw in keywords:
        if kw in n:
            names[kw] += 1
            break

print('\n=== KEYWORD FREQUENCY ===')
for k, c in names.most_common(40):
    print(f'  {c:4d} {k}')

# Cheapest items
price_map = {}
for item in data:
    url = item.get('url') or ''
    p = item.get('price_usdc') or item.get('price') or 999
    if url not in price_map:
        price_map[url] = p

by_price = sorted(price_map.items(), key=lambda x: float(x[1]) if x[1] else 999)
print('\n=== CHEAPEST 30 ===')
for url, p in by_price[:30]:
    print(f'  ${p} {url}')

# Unique domains
domains = collections.Counter()
for item in data:
    url = item.get('url') or ''
    try:
        host = url.split('/')[2] if '://' in url else url.split('/')[0]
    except:
        host = '?'
    domains[host] += 1
print('\n=== DOMAINS (top 20) ===')
for h, c in domains.most_common(20):
    print(f'  {c:4d} {h}')
