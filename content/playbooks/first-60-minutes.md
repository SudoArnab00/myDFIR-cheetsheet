# First 60 Minutes — Initial Triage

Goal: confirm scope and severity fast enough to make a containment call without freezing.

## 0–5 min: Confirm it's real
- Re-check the alert/report source. False positive rate matters — don't page the room for noise.
- Identify: what triggered this? (EDR alert, SIEM correlation, user report, third-party notification)
- Note exact first-seen timestamp. This anchors your timeline for everything after.

## 5–15 min: Establish blast radius (fast, not perfect)
- Which host(s)/account(s)/systems are confirmed affected right now?
- Is this contained to one asset or does it touch shared infra (AD, DNS, cloud IAM, CI/CD)?
- Check for lateral movement indicators: new logons on other hosts, new scheduled tasks, unusual auth from the affected identity.
- **Decision point:** isolated single-host issue vs. potential multi-system compromise. This determines your next 45 minutes.

## 15–30 min: Stakeholder notification (don't skip this — it's the part IR newcomers under-invest in)
- Notify your IC (incident commander) or manager per your escalation matrix — do this even if you're still not 100% sure it's real. Under-notifying is worse than a false alarm.
- Use a **status, not a story**: "Investigating suspected [ransomware/BEC/lateral movement] on [system]. Confirmed impact: [X]. Next update in 30 min." Don't wait until you have the full picture to say something.
- If customer data or production is plausibly affected, loop in legal/privacy early — this is often a hard deadline trigger (regulatory notification clocks start ticking from discovery, not confirmation).

## 30–45 min: Containment decision
- Can you isolate without destroying evidence? (network isolation > shutdown, in most cases — shutdown kills volatile memory/artifacts)
- Weigh business impact of containment vs. risk of continued compromise. This is a judgment call — document your reasoning, don't just act.
- Common containment actions, cheapest/fastest first:
  - Disable compromised account(s)
  - Network-isolate host (EDR isolation, VLAN move, or ACL block) — preferred over pulling power
  - Revoke active sessions/tokens
  - Block C2 indicators at perimeter/EDR
- **Don't** wipe or rebuild yet. That's premature and destroys evidence you may need later.

## 45–60 min: Set the next checkpoint
- Write the timeline so far in one place (shared doc/channel), even rough notes — you will not remember exact timestamps later.
- Set a concrete next update time and stick to it. Silence during an incident erodes stakeholder trust faster than bad news.
- Decide: do you need more hands? Escalate now rather than at hour 3 when you're already stretched.

## Common failure modes (for you specifically, based on stated gaps)
- **Analysis paralysis before containment**: you don't need 100% certainty to isolate a host. A wrong isolation costs an hour of user inconvenience; a missed containment can cost the whole environment.
- **Silent investigation**: going quiet for an hour "to get you real answers" — stakeholders read silence as "nobody's driving." Short frequent updates beat rare thorough ones.
- **Technically correct, contextually useless updates**: "Found evidence of a discovery-phase Cobalt Strike beacon" means nothing to a VP. Translate: "Attacker has a foothold, no evidence of data theft yet, we're cutting off their access now."
