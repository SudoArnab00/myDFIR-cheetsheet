# Containment Decision Framework

Purpose: make containment calls quickly and defensibly, without waiting for perfect information.

## The core tension
Every containment action trades **speed** against **evidence preservation** and **business continuity**. Purple team instinct is to want full understanding first — in live IR that instinct will cost you. Contain on reasonable suspicion, refine later.

## Containment tiers (cheapest/fastest → most disruptive)

| Tier | Action | When to use | Evidence impact |
|------|--------|-------------|------------------|
| 1 | Revoke session/token | Compromised credential, no host compromise confirmed | None |
| 2 | Disable account | Confirmed credential compromise | None |
| 3 | Network isolation (EDR/VLAN) | Host compromise, want to preserve for forensics | Low — memory/disk intact |
| 4 | Block C2 at perimeter | Known bad IP/domain, buys time | None |
| 5 | Kill process / remove persistence | Active malicious execution, isolation not immediately available | Medium — may lose process memory |
| 6 | Power off | Wiper malware, active data destruction in progress | High — loses volatile memory, but stops the bleeding |
| 7 | Full rebuild | Post-investigation, confirmed compromise | N/A (should come after evidence capture) |

**Default to Tier 3 (network isolation) as your first move on a confirmed host compromise.** It stops lateral movement and C2 without destroying the disk/memory state you'll want later. Only jump straight to power-off for active destructive activity (ransomware encryption in progress, wiper).

## Questions to ask before you act
1. Is this host talking to anything else right now that would spread if I wait 10 more minutes?
2. Do I have (or can I quickly get) a memory/disk capture before I take disruptive action? If not, is the risk of waiting acceptable?
3. What's the business cost of this action, and who needs to know before I do it (not necessarily approve — but know)?
4. Is this reversible? (Isolation is; a rebuild isn't.)

## When you're wrong (and you will be, sometimes)
- Document what you knew at decision time, not just the outcome. A reasonable call that turns out wrong given later info is still a reasonable call.
- If you over-contained (isolated something benign), the fix is fast and cheap — re-enable, apologize briefly, move on. Don't let fear of this stop you from containing quickly next time.
- If you under-contained (should have isolated but didn't), escalate the correction immediately rather than quietly fixing it.

## Communicating a containment decision to non-technical stakeholders
Template: **"We're [action] on [system] to stop [risk]. This means [business impact] until [rough timeframe]. We'll update by [time]."**

Example: "We're isolating the finance-app-03 server from the network to stop potential spread. This means finance reporting will be unavailable for the next 1–2 hours. We'll update by 3:30pm."

Avoid leading with technical justification unless asked — lead with action + impact + timeframe.
