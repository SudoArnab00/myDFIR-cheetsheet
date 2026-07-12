# Sigma Rules Cheatsheet

Sigma = generic, SIEM-agnostic detection rule format. Converts to Splunk SPL, KQL, ES QL, etc via `sigma-cli` / `pysigma`.

## Basic structure
```yaml
title: Suspicious PowerShell Encoded Command
id: <generate a uuid>
status: experimental
description: Detects PowerShell execution with base64 encoded command parameter
author: your-name
date: 2026/07/11
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        Image|endswith: '\powershell.exe'
        CommandLine|contains:
            - '-enc '
            - '-EncodedCommand'
    condition: selection
level: medium
tags:
    - attack.execution
    - attack.t1059.001
```

## Key fields
```yaml
logsource:
    category: process_creation | network_connection | file_event | registry_event
    product: windows | linux | macos
    service: sysmon | security | powershell   # optional, narrows source

detection:
    selection:
        FieldName|endswith: 'value'      # modifiers below
        FieldName|contains: 'value'
    condition: selection                  # boolean logic across selections
level: informational | low | medium | high | critical
```

## Common modifiers
```
|contains       substring match
|startswith     prefix match
|endswith       suffix match
|re             regex match
|all            all listed values must match (AND instead of default OR)
|base64offset   matches base64-encoded value at any offset (for encoded commands)
```

## Multi-condition example (parent-child process relationship)
```yaml
detection:
    parent_office:
        ParentImage|endswith:
            - '\winword.exe'
            - '\excel.exe'
            - '\outlook.exe'
    child_suspicious:
        Image|endswith:
            - '\cmd.exe'
            - '\powershell.exe'
            - '\wscript.exe'
    condition: parent_office and child_suspicious
```

## Converting Sigma to your SIEM (sigma-cli)
```bash
pip install sigma-cli
sigma plugin install splunk
sigma plugin install microsoft365   # for KQL/Sentinel

# Convert a single rule to Splunk SPL
sigma convert -t splunk rule.yml

# Convert to KQL (Sentinel)
sigma convert -t microsoft365 -p sentinel_lower_case rule.yml

# Convert a whole rule directory
sigma convert -t splunk ./rules/ -o combined.spl
```

## Workflow tips
- Pull public rules from the SigmaHQ repo (github.com/SigmaHQ/sigma) as a baseline, tune thresholds/fields to your environment rather than writing from scratch.
- Always test converted queries against known-good and known-bad sample data before deploying — field mappings differ per SIEM and silently produce zero-result "working" rules.
- Use `level` honestly — inflating everything to `high` trains analysts to ignore your alerts.
- Tag with MITRE ATT&CK technique IDs (`attack.txxxx`) — makes coverage-mapping and reporting much easier later.
