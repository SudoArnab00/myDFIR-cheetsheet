# Linux Commands for IR

## System/process investigation
```bash
# Full process list with args
ps auxww

# Process tree (spot suspicious parent-child relationships)
ps -ejH
pstree -p

# What's a process actually doing / what files does it have open
lsof -p <pid>

# All open network connections + owning process
lsof -i
ss -tulpn

# Recently modified files (last 24h) — common after compromise
find / -mtime -1 -type f 2>/dev/null

# Recently modified files in specific high-value dirs
find /etc /var/www /home -mtime -1 -type f 2>/dev/null

# SUID binaries (privilege escalation vector — check for unexpected additions)
find / -perm -4000 -type f 2>/dev/null
```

## User / auth investigation
```bash
# Who's logged in right now
who
w

# Login history
last -50
lastb -50    # failed logins

# Check for unexpected sudoers entries
cat /etc/sudoers
ls -la /etc/sudoers.d/

# Check for unexpected SSH keys (persistence mechanism)
cat ~/.ssh/authorized_keys
find / -name "authorized_keys" 2>/dev/null

# Check bash history for suspicious commands (careful — attacker may have cleared/edited this)
cat ~/.bash_history
find / -name ".bash_history" 2>/dev/null
```

## Persistence mechanism checks
```bash
# Cron jobs (all users)
for u in $(cut -f1 -d: /etc/passwd); do crontab -u $u -l 2>/dev/null; done
ls -la /etc/cron.d/ /etc/cron.daily/ /etc/cron.hourly/

# Systemd services (check for unexpected/recently added units)
systemctl list-units --type=service --state=running
find /etc/systemd/system -mtime -7

# Startup scripts
cat /etc/rc.local

# LD_PRELOAD hijacking (rootkit technique)
cat /etc/ld.so.preload
```

## Network investigation
```bash
# Active connections with process names
ss -tulpn

# ARP table (check for MITM/spoofing)
arp -a

# DNS resolution config (check for hijacked resolvers)
cat /etc/resolv.conf

# Routing table
ip route
```

## File integrity / hashing
```bash
# Hash a file (for evidence/comparison against known-bad hashes)
sha256sum suspicious_file

# Hash all files in a directory recursively
find /path -type f -exec sha256sum {} \; > hashes.txt

# Compare current state against a known baseline (if you have one)
diff baseline_hashes.txt hashes.txt
```

## Log locations worth checking
```
/var/log/auth.log          # Debian/Ubuntu auth events
/var/log/secure            # RHEL/CentOS auth events
/var/log/syslog            # general system log
/var/log/audit/audit.log   # auditd, if enabled
~/.bash_history            # command history (unreliable, can be tampered)
/var/log/apache2/          # web server logs (check for webshell access)
/var/log/nginx/
```

## Quick safety notes
- Prefer read-only commands early — avoid writing to the compromised host until evidence is captured.
- `2>/dev/null` suppresses permission-denied noise on wide `find` scans — useful for readability but don't lose track of what you're not seeing.
- If auditd is running, `ausearch`/`aureport` can be faster than raw log grep for specific event types.
