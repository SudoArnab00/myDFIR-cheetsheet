# YARA Rules Cheatsheet

Pattern-matching for malware/file identification — used in triage to quickly ID known families or suspicious characteristics.

## Basic rule structure
```yara
rule Suspicious_PowerShell_Dropper
{
    meta:
        author = "your-name"
        date = "2026-07-11"
        description = "Detects common PowerShell dropper patterns"
        threat_level = "medium"

    strings:
        $s1 = "IEX(New-Object" nocase
        $s2 = "DownloadString(" nocase
        $s3 = "-EncodedCommand" nocase
        $hex1 = { 4D 5A 90 00 03 00 00 00 }  // MZ header, embedded PE

    condition:
        2 of ($s1, $s2, $s3) or $hex1
}
```

## String types
```yara
strings:
    $text = "cmd.exe" ascii wide nocase   // text string, case-insensitive, both encodings
    $hex = { E8 ?? ?? ?? ?? 5D }          // hex bytes, ?? = wildcard byte
    $regex = /https?:\/\/[a-z0-9]+\.onion/  // regex pattern
```

## Condition logic
```yara
condition:
    all of them              // every string must match
    any of them               // at least one
    2 of ($s1, $s2, $s3)       // at least N of a set
    $s1 and $s2 and not $s3
    filesize < 500KB
    uint16(0) == 0x5A4D        // check PE magic bytes at file start
```

## Useful conditions for triage
```yara
// Match only on PE files (uses pe module)
import "pe"

rule Suspicious_PE_No_Signature
{
    condition:
        pe.number_of_signatures == 0 and
        filesize < 2MB and
        pe.characteristics & pe.EXECUTABLE_IMAGE
}
```

```yara
// Detect high entropy sections (possible packing/encryption)
import "math"

rule High_Entropy_Section
{
    condition:
        math.entropy(0, filesize) > 7.5
}
```

## Running YARA
```bash
# Scan a single file
yara rule.yar suspicious_file.exe

# Scan a directory recursively
yara -r rule.yar /mnt/evidence/

# Scan running processes (requires privileges)
yara -p <pid> rule.yar

# Print matched strings, not just rule name
yara -s rule.yar suspicious_file.exe

# Use multiple rule files
yara -r rules/*.yar /mnt/evidence/
```

## Sourcing rules quickly during an incident
- YARA-Forge (community-curated, deduplicated ruleset): good default baseline
- Vendor threat intel feeds if you have them (often ship YARA rules with reports)
- Write a quick custom rule from unique strings/hashes found in your own triage — even a rough rule scoped to *this* incident helps you sweep other hosts fast

## Common pitfalls
- Overly broad strings (`"http"`) generate massive false positives — anchor on something more specific to the sample.
- Forgetting `nocase`/`wide` — malware authors mix case and Windows often stores strings as UTF-16 (wide).
- Not testing against known-clean files before a fleet-wide sweep — you'll page yourself with false positives.
