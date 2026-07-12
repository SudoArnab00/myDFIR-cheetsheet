# tcpdump / Wireshark Filters

## tcpdump — capture
```bash
# Capture on interface, write to file
tcpdump -i eth0 -w capture.pcap

# Capture with snaplen (full packet, avoid truncation)
tcpdump -i eth0 -s 0 -w capture.pcap

# Capture specific host
tcpdump -i eth0 host 10.0.0.5 -w capture.pcap

# Capture specific port
tcpdump -i eth0 port 443 -w capture.pcap

# Rotate captures (100MB files, keep last 10)
tcpdump -i eth0 -w capture.pcap -C 100 -W 10

# Read without resolving hostnames (faster, less noisy)
tcpdump -r capture.pcap -n
```

## tcpdump — common filters
```bash
# Traffic to/from a host
host 10.0.0.5

# Traffic between two hosts
host 10.0.0.5 and host 10.0.0.10

# Specific port
port 445
tcp port 3389

# Exclude noisy traffic (e.g. SSH you're using to connect)
not port 22

# SYN packets only (connection attempts / scan detection)
tcp[tcpflags] & tcp-syn != 0 and tcp[tcpflags] & tcp-ack == 0

# DNS traffic
port 53

# HTTP traffic (unencrypted, rare now but still seen internally)
port 80

# Traffic to a subnet
net 10.0.0.0/24
```

## Wireshark display filters
```
# IP address
ip.addr == 10.0.0.5

# Source or destination separately
ip.src == 10.0.0.5
ip.dst == 10.0.0.5

# Port
tcp.port == 445
udp.port == 53

# HTTP requests only
http.request

# HTTP host header (find beaconing/C2 domains)
http.host contains "suspicious-domain"

# DNS queries
dns.qry.name contains "evil"

# TLS SNI (see what domain HTTPS traffic was headed to, even encrypted)
tls.handshake.extensions_server_name contains "suspicious"

# Find large data transfers (possible exfil)
tcp.len > 1000

# SMB traffic (lateral movement / ransomware indicator)
smb2

# Kerberos (auth issues, golden/silver ticket investigation)
kerberos

# Retransmissions (network issues or scanning)
tcp.analysis.retransmission

# Filter to a conversation
tcp.stream eq 4
```

## Quick IR-relevant filters
```
# Beaconing pattern: repeated connections to same external IP, regular interval
ip.dst == <suspect_ip> and tcp.flags.syn == 1

# Find all unique external IPs contacted (export via Statistics > Conversations)

# ARP spoofing / MITM indicator
arp.duplicate-address-detected

# Unusual outbound port (possible C2 on non-standard port)
tcp.port > 1024 and tcp.flags.syn == 1 and ip.dst != 10.0.0.0/8
```

## Useful stats/tools in Wireshark
- **Statistics → Conversations**: quick view of top talkers, useful for spotting exfil or beaconing
- **Statistics → Protocol Hierarchy**: spot unexpected protocols
- **File → Export Objects → HTTP**: pull files transferred over HTTP for analysis
- **Follow → TCP Stream**: reconstruct a full session
