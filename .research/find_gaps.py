#!/usr/bin/env python3
"""Find dev-tool gaps. Match mine against bazaar cheap dev tools."""
import re

# My endpoints
cat = open('/Users/huda/Desktop/dev/tanship/apps/console/src/catalog.ts').read()
my_endpoints = set()
for m in re.finditer(r'path:\s*["\']([^"\']+)["\']', cat):
    my_endpoints.add(m.group(1))
print(f'My endpoints: {len(my_endpoints)}')

# Bazaar dev tools (the gpt55 set)
gpt55_tools = [
    'domain-extract','diff-lines','color-convert','x402-ping','x402-site-audit',
    'url-text','url-metadata','url-links','uri-codec','timestamp','sort-lines',
    'regex-match','query-parse','jwt-decode','json-validate','json-minify',
    'json-keys','http-status','html-strip','html-entity-codec','email-normalize',
]
print(f'\nBazaar gpt55 tools ({len(gpt55_tools)}):')
for t in gpt55_tools:
    in_mine = any(t in m for m in my_endpoints)
    print(f'  {"✓" if in_mine else "✗"} /v1/tools/{t}')

# Other popular patterns
print('\n=== Other bazaar cheap endpoints (single occurrence) ===')
other = [
    ('/v1/qr', 'qr code generator'),
    ('/v1/gas', 'gas price lookup'),
    ('/api/hash', 'hash function'),
    ('/api/robots-check', 'robots.txt parser'),
    ('/api/public-holidays', 'public holidays API'),
    ('/api/wayback-snapshot', 'wayback machine snapshot'),
    ('/api/fees', 'fee estimator'),
    ('/api/detect', 'language detection'),
    ('/v1/whales/latest', 'crypto whale alerts'),
    ('/v1/wallets/leaderboard', 'wallet leaderboard'),
    ('/v1/wallets/:address/history', 'wallet tx history'),
    ('/v1/intel/scan/:var1', 'intel scan'),
    ('/v1/analyze', 'general analyzer'),
    ('/api/agent/dispute-brief/x402', 'x402 dispute brief'),
    ('/v1/scan', 'security scan'),
]
for path, desc in other:
    in_mine = any(path.replace(':var1','').replace(':address','') in m or m.endswith(path.split('/')[-1]) for m in my_endpoints)
    print(f'  {"✓" if in_mine else "✗"} {path} — {desc}')

# my v1/tools family?
print('\nMy /v1/tools/... endpoints:')
for ep in sorted(my_endpoints):
    if '/v1/tools/' in ep or '/tools/' in ep or ep.startswith('/v1/dev/'):
        print(f'  {ep}')
