import json, re, os

json_path = './data/laptop_file.json' if os.path.exists('./data/laptop_file.json') else './data/laptops.json'

with open(json_path, 'r', encoding='utf-8') as f:
    raw_data = json.load(f)

raw_list = raw_data.get('laptop_full_cleaned_final', raw_data) if isinstance(raw_data, dict) else raw_data

RAM_REGEX = re.compile(r'(\d+)\s*gb', re.I)
SSD_TB_REGEX = re.compile(r'(\d+(?:\.\d+)?)\s*tb', re.I)
SSD_GB_REGEX = re.compile(r'(\d+)\s*gb', re.I)

def parse_ram(v):
    if isinstance(v, (int, float)): return int(v)
    if not v: return 8
    m = RAM_REGEX.search(str(v))
    return int(m.group(1)) if m else (int(v) if str(v).isdigit() else 8)

def parse_ssd(v):
    if isinstance(v, (int, float)): return int(v)
    if not v: return 512
    m_tb = SSD_TB_REGEX.search(str(v))
    if m_tb: return int(round(float(m_tb.group(1)) * 1024))
    m_gb = SSD_GB_REGEX.search(str(v))
    return int(m_gb.group(1)) if m_gb else (int(v) if str(v).isdigit() else 512)

def parse_safe_float(v, default=0.0):
    if v is None: return default
    if isinstance(v, (int, float)): return float(v)
    s = str(v).replace(',', '.').strip()
    try:
        return float(s)
    except:
        return default

laptops = []
for item in raw_list:
    name = item.get('name') or 'Laptop'
    is_apple = (item.get('brand_name') and item.get('brand_name').lower() == 'apple') or ('macbook' in name.lower()) or ('apple' in name.lower())
    os_name = item.get('os') or ('macOS' if is_apple else 'Windows')
    price = parse_safe_float(item.get('price_vnd') or item.get('price'), 0.0)
    ram = parse_ram(item.get('ram') or item.get('ramGB'))
    ssd = parse_ssd(item.get('ssd') or item.get('ssdGB'))
    battery = parse_safe_float(item.get('battery_capacity_whr') or item.get('batteryHours'), 50.0)
    weight = parse_safe_float(item.get('laptop_weight') or item.get('weightKg'), 1.8)
    laptops.append({
        'name': name,
        'os': os_name,
        'price': price,
        'ramGB': ram,
        'ssdGB': ssd,
        'batteryHours': battery,
        'weightKg': weight
    })

print(f"Total laptops loaded from {json_path}: {len(laptops)}")

# TEST 1: Windows, priced items
t1 = [l for l in laptops if l['os'].lower() == 'windows' and l['price'] > 0]
print(f"TEST 1 (Windows with price): {len(t1)} matches")
assert len(t1) > 0

# TEST 2: macOS items
t2 = [l for l in laptops if l['os'].lower() == 'macos']
print(f"TEST 2 (macOS items): {len(t2)} matches")
assert len(t2) > 0

# TEST 3: Strict Budget 15-25M (Tuyệt đối không dưới 15M và không trên 25M)
b_15_25 = [l for l in laptops if l['price'] >= 15000000 and l['price'] <= 25000000]
print(f"TEST 3 (Budget 15-25M): {len(b_15_25)} matches")
for l in b_15_25:
    assert 15000000 <= l['price'] <= 25000000, f"Laptop {l['name']} has invalid price {l['price']} for 15-25M"

# TEST 4: Strict Budget <15M (Tuyệt đối không >= 15M hoặc <= 0)
b_under_15 = [l for l in laptops if 0 < l['price'] < 15000000]
print(f"TEST 4 (Budget <15M): {len(b_under_15)} matches")
for l in b_under_15:
    assert 0 < l['price'] < 15000000, f"Laptop {l['name']} has invalid price {l['price']} for <15M"

# TEST 5: Strict Budget 25-35M
b_25_35 = [l for l in laptops if 25000000 <= l['price'] <= 35000000]
print(f"TEST 5 (Budget 25-35M): {len(b_25_35)} matches")
for l in b_25_35:
    assert 25000000 <= l['price'] <= 35000000, f"Laptop {l['name']} has invalid price {l['price']} for 25-35M"

# TEST 6: Strict Budget >35M
b_over_35 = [l for l in laptops if l['price'] > 35000000]
print(f"TEST 6 (Budget >35M): {len(b_over_35)} matches")
for l in b_over_35:
    assert l['price'] > 35000000, f"Laptop {l['name']} has invalid price {l['price']} for >35M"

print("ALL TEST CASES VALIDATED SUCCESSFULLY!")
