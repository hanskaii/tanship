import re
with open('apps/console/src/catalog.ts') as f:
    content = f.read()

# Find all id: + price: pairs
lines = content.split('\n')
for i, line in enumerate(lines):
    m = re.match(r'\t\tid: "([^"]+)",\s*$', line)
    if m:
        sid = m.group(1)
        # next 5 lines
        block = '\n'.join(lines[i:i+7])
        pm = re.search(r'price: "([^"]+)"', block)
        if pm:
            print(f'{sid}  ->  {pm.group(1)}')