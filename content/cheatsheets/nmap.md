# Nmap Cheatsheet

## Basic scans
```bash
# Quick scan, top 1000 ports
nmap 10.0.0.5

# Scan specific ports
nmap -p 22,80,443 10.0.0.5

# Scan a range
nmap -p 1-65535 10.0.0.5

# Scan a subnet
nmap 10.0.0.0/24

# Ping sweep only (host discovery, no port scan)
nmap -sn 10.0.0.0/24
```

## Scan types
```bash
-sS   # SYN scan (stealthy, default for privileged users)
-sT   # TCP connect scan (no raw socket privileges needed)
-sU   # UDP scan (slow, but needed for UDP services)
-sV   # service/version detection
-O    # OS detection
-A    # aggressive: OS + version + script scan + traceroute
```

## Timing (relevant for IR — avoid tipping off attacker on a live host)
```bash
-T0   # paranoid (very slow, IDS evasion)
-T1   # sneaky
-T2   # polite
-T3   # normal (default)
-T4   # aggressive (typical for internal authorized scanning)
-T5   # insane (fast, noisy)
```

## IR / incident-relevant use cases

### Confirm what's actually listening on a suspect host
```bash
nmap -sV -p- 10.0.0.5
```

### Find other hosts with the same exposed service (scope a vuln/compromise)
```bash
nmap -p 445 --open 10.0.0.0/24
```

### Check for a specific known-bad indicator (unexpected open port)
```bash
nmap -p 4444,8080,31337 10.0.0.0/24 --open
```

### Fast host discovery across a large range (find what's alive before deeper scan)
```bash
nmap -sn -T4 10.0.0.0/16
```

### Script scan for vulnerability checks (use cautiously — can be disruptive)
```bash
nmap --script vuln 10.0.0.5
```

### Detect service version to match against known exploited CVEs
```bash
nmap -sV --version-intensity 5 10.0.0.5
```

## Output formats (for feeding into other tools)
```bash
-oN scan.txt      # normal
-oX scan.xml      # XML — parseable, feed into other tools
-oG scan.gnmap    # greppable (legacy but still handy for quick grep/awk)
-oA scan_basename # all formats at once
```

## Caution during live IR
- Scanning a potentially compromised host can alert an attacker with host-based monitoring — prefer passive discovery (existing logs, EDR) when stealth matters.
- Aggressive scans (`-A`, `--script vuln`) can crash fragile/legacy services — know your environment before running against production.
- Get authorization/scope confirmation before scanning anything outside the already-approved incident scope.
