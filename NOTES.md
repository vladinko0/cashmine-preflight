<!-- NOTES.md -->
# Assessment notes

## Decisions

**Amounts.** I chose bigint integer units with explicit decimal scales instead of floating point or a decimal library. Parsing rejects noncanonical inputs and excess precision; calculations retain all digits. USD prices retain their own scale, totals include available + pending + claiming, and only the final USD display is rounded half-up to cents. Available USD is shown separately. Max uses the entire available amount; the fee is deducted from it. Blocking a non-positive net receipt is an explicit conservative UI assumption beyond the API's min/max/precision rules.

**Balance after claim.** We compared server snapshots plus a separate claim state against an optimistic reservation overlay ([discussion](ai-logs/002-implementation.md#assistant--balance-after-claim-alternatives-and-selection)). I chose snapshots, labelled with their actual asOf time. The asset's claim action stays paused while the outcome is unknown/pending, then until a snapshot is at least as new as the terminal updatedAt. This avoids both accidental resubmission against a stale balance and a guessed deduction that later jumps back or gets counted twice. Other assets remain usable.

**Unknown result.** Before POST, save a UUID Idempotency-Key and immutable body in a token-scoped journal. Lost responses use the same identity on retry; known ids use GET polling. A timeout is never represented as a failed claim. HTTP 400/401 are definite rejections; ambiguous errors remain unresolved. 429 applies a shared cooldown to that API client. The token and journal live only in sessionStorage: reload is recoverable in the same tab, but clearing storage/closing the tab ends recovery. No token is in the code or deployed bundle.

## Working with AI

1. **Prompt refined:** I asked to remove website token entry and use a local .env. The assistant identified the explicit brief requirement for reviewer-supplied tokens. I clarified “if it is in the brief, leave it and work according to the brief.” We retained runtime token entry rather than implementing a conflicting request ([exchange](ai-logs/002-implementation.md#user--challenge-to-token-setup)).
2. **Wrong/risky AI output caught:** the first decoder checked amount strings individually but accepted fee + receiveAmount different from amount. A deliberately inconsistent fixture failed with “Missing expected rejection”; exact arithmetic consistency and POST-intent matching were added, and the test passed ([failure and fix](ai-logs/002-implementation.md#tool-evidence--wrongrisky-ai-output)).
3. **Different choice from the AI default:** during pre-task preparation, the assistant proposed Cloudflare Pages. I suggested EAS Hosting; we used and verified EAS instead ([pre-task exchange](ai-logs/003-hosting-preparation.md)). This happened before the timed task and is not claimed as timed implementation work.

## Not done / known issues

Physical phone testing is not yet confirmed; browser checks used 390 × 844. A live 0.01 ETH claim encountered a real timeout, survived reload, and safe replay recovered its completed result (fee 0.0012, received 0.0088). Live Activity pagination and a normal pending-to-terminal polling path are being checked. Failure, conflict, rate limits and corrupt-journal handling have focused synthetic tests where available, not a claim that every branch occurred live. Cross-tab coordination and recovery after browser storage is cleared are not implemented; a production financial app would need server-backed reconciliation and authentication. This is a fake-data API; no real funds are transferred.
