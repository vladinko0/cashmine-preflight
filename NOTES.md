<!-- NOTES.md -->
# CashMine assessment notes

## Decisions

- Money: bigint integer units plus explicit decimal scales. A decimal library was the alternative; the small set of operations here made an isolated implementation and tests practical. USD conversion keeps the full price scale, adds before rounding and displays cents with half-up rounding. Total payback value includes available + pending + claiming; available value is shown separately.
- After claim: preserve server balances with a clearly labelled snapshot time and show the claim separately. Block another claim of that asset until its outcome is known and a server snapshot is at least as new as its terminal updatedAt. The alternative was an optimistic reservation overlay. I rejected it because the API has no claim-to-snapshot revision, making double deductions and apparent balance rebounds harder to reconcile safely in this time limit. See [AI balance discussion](ai-logs/002-implementation.md#assistant--balance-after-claim-alternatives-and-selection).
- Unknown submission: persist the exact body and a UUID Idempotency-Key before sending. A retry replays that identity; it does not create a new intent. Once a claim id is known, poll that id. Session storage keeps token and journal local to this browser tab and token scope; closing the tab ends that recovery scope.
- A non-positive net receipt is blocked with an explicit message as a conservative UI assumption; the documented API only states min/max/precision constraints.

## Working with AI

This section will be completed with actual, linked events before submission. The log is an English translation of the Slovak conversation; tool outcomes are labelled separately. No fictional prompts or disagreements will be added.

- Verification caught risky/incorrect output: the first Home lint run found render-time Date.now() and an immediate state update from the fetch effect. These were corrected; see [actual findings](ai-logs/002-implementation.md#tool-outcomes--actual-findings).
- Prompt that needed revision: not recorded yet.
- Human disagreement/rejected AI suggestion: not recorded yet. The AI's own comparison of alternatives is not represented as a human disagreement.

## Not done / known issues

Implementation is in progress: claim UI integration, journal/retry tests, live claim verification, optional Activity and final review remain. The first Home deployment and ten financial tests have passed. No physical phone has been verified yet. No real money is transferred by this test API. The repository retains clearly identified pre-task setup history.
