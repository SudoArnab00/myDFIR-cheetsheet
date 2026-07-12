# Splunk SPL Cheatsheet

## Basics
```spl
# Basic search with time range implied by picker
index=main sourcetype=windows:security EventCode=4625

# Search multiple indexes
index=main OR index=security

# Stats count by field
index=main | stats count by src_ip

# Top values
index=main | top limit=10 src_ip

# Table specific fields
index=main | table _time, src_ip, dest_ip, action
```

## IR-relevant searches

### Failed logons (brute force / password spray)
```spl
index=wineventlog EventCode=4625
| stats count by src_ip, user
| where count > 10
| sort -count
```

### Successful logon after failures (possible successful brute force)
```spl
index=wineventlog (EventCode=4625 OR EventCode=4624)
| transaction user src_ip maxspan=10m
| where mvcount(EventCode) > 1 AND searchmatch("EventCode=4624")
```

### New process creation with suspicious parent-child
```spl
index=sysmon EventCode=1
| where match(ParentImage, "(?i)winword\.exe|excel\.exe|outlook\.exe")
| where match(Image, "(?i)cmd\.exe|powershell\.exe|wscript\.exe")
| table _time, ParentImage, Image, CommandLine, User
```

### PowerShell with encoded commands (common obfuscation/C2)
```spl
index=sysmon EventCode=1 Image="*powershell.exe"
| regex CommandLine="(?i)-enc(odedcommand)?\s"
| table _time, Computer, User, CommandLine
```

### Outbound connections to rare/new destinations (possible beaconing)
```spl
index=firewall action=allowed
| stats count, dc(dest_ip) as unique_dests by src_ip
| sort -count
```

### DNS queries to suspicious TLDs or high entropy domains
```spl
index=dns
| eval domain_length=len(query)
| where domain_length > 40
| table _time, src_ip, query
```

### Lateral movement via admin shares
```spl
index=wineventlog EventCode=5140
| where match(ShareName, "(?i)C\$|ADMIN\$")
| stats count by src_ip, user, ShareName
```

### Data staging / large file writes before exfil
```spl
index=sysmon EventCode=11
| where match(TargetFilename, "(?i)\.zip$|\.rar$|\.7z$")
| table _time, Computer, TargetFilename, Image
```

## Timeline building
```spl
# Pull all events for a specific host, sorted chronologically
index=* host=compromised-host-01
| sort _time
| table _time, index, sourcetype, _raw
```

## Useful modifiers
```spl
| eval | where | stats | timechart | transaction | rex | lookup | tstats
```

- `tstats` — much faster than `stats` for accelerated data models, use for large-scale historical hunts
- `rex field=_raw "regex"` — extract fields on the fly without a defined extraction
- `| transaction` — group related events (use sparingly, it's expensive at scale)
