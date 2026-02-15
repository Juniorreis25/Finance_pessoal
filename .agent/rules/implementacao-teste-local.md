---
trigger: always_on
---

LOCAL VALIDATION GATE (MANDATORY)
Rule: NO code shall be committed or deployed automatically.

Local Availability: All implementations MUST be served locally first for user verification.

User Sign-off: Wait for explicit user confirmation after local testing.

Action: Only proceed to git commit and deploy scripts AFTER the "Go" signal.