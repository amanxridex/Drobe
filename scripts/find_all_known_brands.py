import re

with open(r'C:\Users\User\.gemini\antigravity-ide\brain\332716db-ce87-46f5-ad9a-273548ee217f\scratch\main.dart.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Let's search for all occurrences of brand/ or brands/
matches = set(re.findall(r'brand[s]?[\/|_]([a-zA-Z0-9_\-]+)', text))
print("Brand path matches:", matches)

# Also let's search for lookbook banners or brands mentioned in comments or string tables
# Search for uppercase brand names or known brands
known = ['POWERLOOK', 'SNITCH', 'THOMAS', 'ON3MILE', 'F/KN', 'CHUPPS', 'KOALA', 'BEAR', 'SOJANYA', 'VEIRDO', 'BONKERS', 'BEWAKOOF', 'THE SOULED STORE', 'BLUORNG', 'BURROW', 'GLOOT', 'DAMENSCH', 'XYXX', 'FUGIE', 'URBAN MONKEY', 'TURTLE', 'PETER ENGLAND', 'ARROW', 'FLYING MACHINE', 'MUFTI', 'KILLER', 'SPYKAR', 'ROADSTER', 'HIGHLANDER', 'LOCOMOTIVE']

found = []
for k in known:
    if k.lower() in text.lower():
        found.append(k)

print("Known D2C fashion brands found in JS bundle:", found)
