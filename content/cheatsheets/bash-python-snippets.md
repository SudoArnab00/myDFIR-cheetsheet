# Bash / Python Snippets for IR

## Bash

### Bulk IOC search across log files
```bash
# Search multiple log files for a list of IOCs
grep -Ff iocs.txt /var/log/*.log

# Search recursively with filename shown
grep -rn -Ff iocs.txt /var/log/
```

### Extract unique IPs from a log file
```bash
grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' access.log | sort -u
```

### Quick timeline from multiple log sources (sort by timestamp)
```bash
cat auth.log syslog | sort -k1,3 > timeline.txt
```

### Hash every file in a directory tree, output CSV
```bash
find . -type f -exec sha256sum {} \; | awk '{print $2","$1}' > hashes.csv
```

### Watch a log file live, filtered
```bash
tail -f /var/log/auth.log | grep -i "failed"
```

## Python

### Parse IOCs from a text blob (quick extraction during triage)
```python
import re

text = open("report.txt").read()

ips = re.findall(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', text)
domains = re.findall(r'\b[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b', text)
hashes_sha256 = re.findall(r'\b[a-fA-F0-9]{64}\b', text)
hashes_md5 = re.findall(r'\b[a-fA-F0-9]{32}\b', text)

print(set(ips))
```

### Bulk-check IPs against a local blocklist file
```python
blocklist = set(open("blocklist.txt").read().splitlines())
observed_ips = set(open("observed_ips.txt").read().splitlines())

matches = observed_ips & blocklist
print(f"Matched {len(matches)} known-bad IPs:")
for ip in matches:
    print(ip)
```

### Parse Windows Event Log exports (CSV) for a specific EventID
```python
import csv

with open("security_events.csv") as f:
    reader = csv.DictReader(f)
    failed_logons = [row for row in reader if row.get("EventID") == "4625"]

from collections import Counter
by_account = Counter(row["TargetUserName"] for row in failed_logons)
for account, count in by_account.most_common(10):
    print(f"{account}: {count}")
```

### Quick file entropy check (spot packed/encrypted malware)
```python
import math
from collections import Counter

def entropy(data: bytes) -> float:
    if not data:
        return 0.0
    counts = Counter(data)
    length = len(data)
    return -sum((c / length) * math.log2(c / length) for c in counts.values())

with open("suspicious_file", "rb") as f:
    data = f.read()
print(f"Entropy: {entropy(data):.2f}")  # >7.5 often indicates packing/encryption
```

### Simple JSON log correlation by timestamp window
```python
import json
from datetime import datetime, timedelta

def load_events(path):
    with open(path) as f:
        return [json.loads(line) for line in f]

events = load_events("events.jsonl")
target_time = datetime.fromisoformat("2026-07-11T14:30:00")
window = timedelta(minutes=10)

nearby = [
    e for e in events
    if abs(datetime.fromisoformat(e["timestamp"]) - target_time) <= window
]
print(f"{len(nearby)} events within 10 min of target time")
```

## Notes
- These are meant as fast-start snippets during an incident, not production tooling — adapt field names/paths to your actual log format.
- Keep a `~/ir-toolkit/` on any analysis box with these pre-saved so you're not retyping regex under pressure.
