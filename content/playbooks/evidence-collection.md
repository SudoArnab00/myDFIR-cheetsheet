# Evidence Collection Checklist

Order matters: volatile evidence first (it disappears), persistent evidence second.

## Order of volatility (collect in this order when possible)
1. CPU registers, cache (rarely feasible to capture manually — noted for completeness)
2. **RAM / memory** — running processes, network connections, injected code, encryption keys
3. Network state — active connections, ARP cache, routing table
4. Running processes and services
5. Disk (relatively stable, but still capture before rebuild)
6. Logs on remote/centralized systems (SIEM, syslog server) — these outlive the host
7. Archival/backup media

## Quick capture commands (Linux host, live triage)
```bash
# Process list with full command lines
ps auxww > processes.txt

# Network connections
netstat -tulpn > netstat.txt 2>&1 || ss -tulpn > netstat.txt

# Logged in users
who -a > logged_in_users.txt
last -50 > last_logins.txt

# Loaded kernel modules (rootkit check)
lsmod > lsmod.txt

# Scheduled tasks / persistence
crontab -l > crontab_root.txt
ls -la /etc/cron.d/ /etc/cron.daily/ > cron_dirs.txt

# Memory capture (requires tool pre-installed, e.g. LiME or avml)
# avml /tmp/memory.dump
```

## Quick capture commands (Windows host, live triage)
```powershell
# Process list
Get-Process | Export-Csv processes.csv

# Network connections
Get-NetTCPConnection | Export-Csv netconns.csv

# Logged in users / sessions
query user

# Scheduled tasks
Get-ScheduledTask | Export-Csv scheduled_tasks.csv

# Prefetch / recent execution evidence — copy, don't modify
# C:\Windows\Prefetch\*.pf

# Memory capture (requires tool, e.g. WinPmem)
# winpmem.exe memory.raw
```

## Chain of custody basics
- Record: who collected, what, when, from where, hash of the file (SHA256 minimum).
- Write-protect or hash source media before copying if physical access.
- Store originals separately from working copies — always work from copies.
- Log every access to the evidence after collection (who, when, why).

## What NOT to do
- Don't run antivirus/EDR remediation before capturing — it can delete the evidence you need.
- Don't reboot before memory capture if memory-resident malware is suspected — reboot clears RAM.
- Don't log into the compromised host with privileged/domain admin creds — you can hand the attacker a credential to escalate with.
- Don't skip documentation because "you'll remember" — you won't, three incidents from now.
