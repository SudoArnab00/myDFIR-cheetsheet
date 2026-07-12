# Stakeholder Communication During Active Incidents

Purpose: fast, reusable templates so comms never become the bottleneck. Written for the gap between "technically accurate" and "understandable under stress."

## Principles
- **Cadence beats completeness.** A short update every 30 min beats one perfect update every 3 hours. Commit to a cadence out loud and keep it, even if the update is "no change since last update."
- **Lead with what changed, not what you did technically.** Executives want: is it getting better or worse, what's the business impact, when's the next update.
- **Never say "we don't know" without a follow-up.** Pair uncertainty with next steps: "We don't yet know the scope, we're isolating [X] now and will confirm scope by [time]."
- **Separate confirmed facts from working theories** explicitly. "Confirmed: X. Suspected but unconfirmed: Y." This prevents a hypothesis from being repeated as fact three meetings later.

## Initial notification template
```
Subject: [SEV-X] Investigating [brief description] — [system/service]

We are investigating [brief, plain-language description of the issue].

Confirmed impact: [what's actually affected, or "still being determined"]
Current status: [containment/investigation/monitoring]
Next update: [specific time, not "soon"]

Point of contact: [you/IC name]
```

## Status update template (recurring)
```
Update #[N] — [time]

Since last update:
- [what changed / what was done]

Current status: [ongoing / contained / resolved]
Confirmed impact: [current understanding]
Next steps: [what's happening now]
Next update: [specific time]
```

## Escalating severity mid-incident
Don't bury a severity increase in a routine update — call it out explicitly:
```
Update: escalating this to SEV-1. [One-sentence reason — new scope discovered, 
customer data confirmed affected, etc.] Bringing in [who]. Next update in 15 min.
```

## Talking to execs vs. talking to the technical team
Same facts, different altitude:
- **To execs:** business impact, timeline, what you need from them (decisions, budget, external comms approval). Skip IOCs, TTPs, tool names unless asked.
- **To technical team:** IOCs, affected systems, what's been tried, what you need help with (specific skills/access).
- **Rule of thumb:** if you're about to say a tool name, technique name, or log source to an exec, ask "does this change what they need to decide?" If not, cut it.

## Closing/all-clear template
```
Subject: [RESOLVED] [brief description] — [system/service]

Summary: [1-2 sentences, what happened and what was done]
Root cause: [if known; "under investigation, RCA to follow" if not]
Impact: [final confirmed scope]
Current status: resolved / monitoring for recurrence

A full post-incident report will follow within [timeframe].
```

## Common mistakes to avoid (based on stated growth areas)
- Going quiet while deep in technical work — set a phone timer for your update cadence if you have to.
- Over-hedging every statement into uselessness ("it's possible that potentially X may have occurred") — say what you know plainly, flag what you don't know separately.
- Waiting for the IC/manager to ask for an update instead of pushing it proactively — proactive beats reactive every time in trust-building.
