# KQL (Kusto Query Language) Cheatsheet

For Microsoft Sentinel / Defender / Log Analytics.

## Basics
```kql
// Basic table query with time filter
SecurityEvent
| where TimeGenerated > ago(24h)
| where EventID == 4625

// Project specific columns
SecurityEvent
| project TimeGenerated, Account, Computer, EventID

// Count by field
SecurityEvent
| summarize count() by Account

// Top N
SecurityEvent
| summarize count() by IpAddress
| top 10 by count_
```

## IR-relevant queries

### Failed logons by account/source
```kql
SecurityEvent
| where EventID == 4625
| summarize FailCount = count() by TargetAccount, IpAddress
| where FailCount > 10
| sort by FailCount desc
```

### Impossible travel (sign-ins from geographically distant locations in short time)
```kql
SigninLogs
| where TimeGenerated > ago(1d)
| summarize Locations = make_set(Location) by UserPrincipalName
| where array_length(Locations) > 1
```

### Suspicious PowerShell execution (Defender for Endpoint)
```kql
DeviceProcessEvents
| where FileName =~ "powershell.exe"
| where ProcessCommandLine has_any ("-enc", "-EncodedCommand", "-nop", "-w hidden")
| project Timestamp, DeviceName, AccountName, ProcessCommandLine
```

### New/rare process across the fleet (baseline deviation)
```kql
DeviceProcessEvents
| where Timestamp > ago(7d)
| summarize DeviceCount = dcount(DeviceName) by FileName
| where DeviceCount == 1
| sort by DeviceCount asc
```

### Outbound connections to rare external IPs
```kql
DeviceNetworkEvents
| where Timestamp > ago(1d)
| where RemoteIPType == "Public"
| summarize count() by RemoteIP, DeviceName
| sort by count_ asc
```

### Lateral movement — new admin logon on multiple hosts
```kql
SecurityEvent
| where EventID == 4672 // special privileges assigned
| summarize HostCount = dcount(Computer) by Account
| where HostCount > 3
```

### Email-based initial access (Defender for Office 365)
```kql
EmailEvents
| where Timestamp > ago(1d)
| where ThreatTypes has "Phish"
| project Timestamp, RecipientEmailAddress, SenderFromAddress, Subject
```

### File creation matching known ransomware extensions
```kql
DeviceFileEvents
| where FileName endswith ".locked" or FileName endswith ".encrypted"
| summarize count() by DeviceName, bin(Timestamp, 5m)
```

## Useful operators
```kql
where | project | summarize | join | extend | parse | make_set | bin() | ago() | has / has_any / contains
```

- `has` is faster than `contains` for whole-word matches — prefer it when possible
- `bin(Timestamp, 5m)` — bucket events into time windows, useful for spotting bursts
- `join kind=inner` — correlate across tables (e.g. DeviceProcessEvents + DeviceNetworkEvents by DeviceId)
