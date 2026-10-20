<!-- ai-logs/002-implementation.md -->
# Implementation conversation

Tokens and unrelated private context are excluded. Technical tool outcomes are recorded separately from user and assistant messages.

## User — implementation request

“Continue implementation according to the roadmap; record the AI conversation in English in ai-logs.”

## Assistant — start

“I will continue according to the roadmap. First I will implement the token and Home, then exact calculations and the claim flow. For claims I will compare two approaches to the balance and record the decision in the log and notes. I will keep recording the AI conversation in English without the token.”

## Assistant — balance-after-claim alternatives and selection

“There are two options for the balance after a claim:

- Server balance plus a separate claim status: I do not recalculate the amount by guessing; I label the old snapshot and temporarily block another claim for the same asset.
- Local reservation: I deduct the amount immediately, but when a new snapshot arrives I must reliably prevent a double deduction.

I choose the first option. The API does not provide a revision directly linking a snapshot to a claim; the conservative approach is therefore easier to verify within this time limit. I will calculate amounts in integer units using bigint.”

## Tool outcomes — foundation

Read the roadmap, package/config files and current git status. Consulted Expo SDK 58 reference, current Expo Router installation documentation and official React Native accessibility documentation. Installed compatible Expo Router dependencies using Expo CLI with Yarn. No native build is needed. Implemented token session storage, API decoders, exact bigint arithmetic, API client, and the first balances screen. These are implementation steps, not evidence of passing tests yet.

## Assistant — first verification update

“The foundation is written: the token stays only in the browser session, API responses are validated and amounts are calculated exactly. Home separates available balance, pending payback and amounts in claims.

I will now verify types and the web export, deploy the first functional step and then finish the claim form with its idempotency key preserved across a page refresh.”

## Tool outcomes — actual findings

TypeScript passed. The first lint run caught two issues in AI-written useBalances: Date.now() evaluated directly during render and a synchronous state update through the initial effect. Changed the clock initializer to a lazy function and scheduled the first fetch with a cancellable zero-delay timer (also avoids a duplicate initial request in Strict Mode). These were real tool findings, not fabricated examples. Python urllib received 403 from the API; a curl request using the same token succeeded and returned USDT/6, BTC/8 and ETH/18 balances. Token values were not printed or saved. This distinguishes a client request failure from an unavailable backend.

## Assistant — first deployed slice

“The first functional Home is deployed at the live URL. Ten money tests passed, including 18 decimal places and a USD total rounded only after addition.

An authenticated read request through curl also succeeded. The claim layer is written; I am now connecting it to the UI and verifying that an unknown outcome reuses the same saved request.”

## Tool outcomes — Home checks

Home: TypeScript and ESLint passed. Ten exact-money tests passed. The new Home/token web export was deployed to EAS Hosting successfully. Live API balances were checked with curl, not yet through a phone browser. These are separate verification levels.

## Assistant — claim integration verification

“Claim now has asset and destination selection, Max, fee/net receipt review and confirmation. Before submission, the immutable request body and idempotency key are saved; a restored in-flight request is treated as an unknown outcome and offers safe retry.

The checks have so far found missing Node types in the test configuration. I will add them and tests for a lost response and a delayed snapshot.”

## User — live Home verification

“Yes, the balances loaded.”

This is the user's response to the assistant asking them to enter the token directly on the live app and check USDT, BTC and ETH. The token was not sent back in chat. This confirms user-observed live Home loading, not a physical-phone claim test.

## Assistant — money-response bug found by a failing test

“You confirmed that the live Home loaded the balances. In claim tests I found another issue: the original API decoder would accept a response where fee + receiveAmount does not equal the claimed amount. The test correctly failed; I will add an exact check of this equality and check that the response matches the submitted intent.”

## Tool evidence — wrong/risky AI output

The first decoder written by this agent validated the three amount strings independently but not their relationship. Added a test with amount=0.5, fee=0.0012 and receiveAmount=0.4999. The test failed with “Missing expected rejection.” (18 passed, 1 failed). This is a synthetic inconsistent response, not a claim that the real API returned bad data. The fix checks fee + receiveAmount = amount with bigint arithmetic and checks that POST response asset, destination and amount match the persisted intent. A mismatch must remain an unknown outcome; it must never create a new intent.

## User — challenge to token setup

“But it cannot stay like this, that the token must be entered on the website. If necessary create a local .env where I can paste it.”

## Assistant — explicit brief constraint and pushback

“The task explicitly requires the opposite: ‘On first open, the app asks for the token … We will open your link with our own tokens.’ It also forbids the token in the deployed build. A .env.local file does not hide a value when it is embedded in client-side JavaScript.

For submission, I therefore recommend retaining token input. I can adjust storage so you do not have to enter it again in the same browser after closing the tab.”

## Assistant — clarification question

“The token form is explicitly required by the brief and reviewers will use their own tokens. Should I retain it and remember the token after closing the tab, or keep the current tab-session-only storage? The token will not go into the public build.”

Options: retain form and remember token in this browser; retain form and store only during the session. No answer had arrived at the time of this entry; storage behaviour remains unchanged.

## Tool outcomes — claim implementation

All 19 targeted tests now pass, including the previously failing claim arithmetic consistency test. TypeScript, ESLint and the claim-capable production web export passed. Unknown requests are persisted before POST, restored with the same key/body, and retry uses that identity. Pending known ids are polled; completed/failed claims keep the asset paused until a snapshot catches up. Tests cover lost responses with a fake transport and stale snapshots; these are not yet evidence of a live claim.

## User — revised token instruction

“If it is in the brief, leave it and work according to the brief.”

## Assistant — confirmed direction

“Understood, I am keeping the token form and session storage according to the brief. The personal token will not go into the sources or deployed build.

The claim version has successful TypeScript, lint, web export and all 19 tests. I will now deploy it and walk through a live claim flow on the test API.”

## Tool outcomes — preserving session boundaries

Code review found that an old claim form could navigate after its token session had been disconnected. Added a mounted guard for the form's asynchronous completion and a synchronous submission lock. The journal already persists under a hash of the token; old requests cannot replace a new user's balances. A live Home was also observed directly in the in-app browser after the user entered the token themselves.

## Assistant — real timeout recovery verified

“During a live test, the API returned a timeout after submitting 0.01 ETH. The app correctly showed an unknown outcome and paused another ETH claim, although a newer snapshot already showed 0.01 ETH in claiming.

I will now verify page reload and a safe retry of that same request. This timeout was actually observed on the test API.”

## Assistant — recovered claim result

“Safe retry after page reload obtained the original claim, which was already Completed. The UI showed a fee of 0.0012 ETH, received 0.0088 ETH, and enabled ETH claims again after a current snapshot. I also verified rejection of .5 and Max with full precision at a 390 px width.

The main flow therefore works even with a real timeout. I will now add optional Activity and the final notes.”

## Tool evidence — live web

The deployed app was exercised at 390 × 844 in the in-app browser with the token entered by the user. Invalid .5 was rejected; Max preserved 18-decimal precision. A double click on Confirm was attempted for a 0.01 ETH test-data claim to the wallet destination. The API returned a timeout; the app showed unknown and paused ETH. After a browser reload, the saved request remained and Resolve with safe retry returned the original completed claim, reference clm_12dabe6895d8, fee 0.0012, net 0.0088. A fresh snapshot enabled ETH again. A screenshot confirmed the completed card. This is a browser viewport test, not a physical-device test. The test API transfers no real funds.

## User — log wording

“Remove the language-origin labels from ai-logs.”

## Assistant

“I will remove those labels from ai-logs. I will preserve the conversation content and redaction markers. Then I will continue checking Activity.”

## Assistant — Activity implementation update

“Activity has been added: it paginates through nextCursor, distinguishes payback, reversals and claims, and does not duplicate records when pages overlap. On a definite server rejection, the claim form stays open with the error so the input can be corrected.

I will now format the code and check the added parts. Then I will verify history on the live website.”

## Tool outcomes — Activity checks

All 20 tests and the web export passed. TypeScript caught an outdated ScrollView ref type; checked the installed RN 0.88 generated declarations and used ScrollViewInstance. ESLint then treated the wallet carrier object containing that ref as ref-derived data throughout render. Split the imperative scroll-reset ref into its own hook, keeping normal wallet state separate; lint is being rerun. These errors and fixes were not hidden from the working record.

## Assistant — final verification update

“The current code has successful TypeScript, lint, web export and 20 tests. I added NOTES.md with three actual AI-work moments and checked that the personal token is absent from sources, build, logs and Git history.

I will deploy Activity and verify pagination and an ordinary pending claim. Then I will update the roadmap from the results.”

## Assistant — Activity and unauthorized session findings

“Live Activity displays the completed test claim as well as historical accruals, reversals and claims with the correct signs. I also checked the invalid-token error and return to the connection form.

During this check I noticed an inaccurate label: after an error it still said Loading your balances. I will correct it and offer reconnection directly for an invalid token.”

## Tool outcomes — real unauthorized request

In a separate browser tab, entered the non-secret value invalid-test-token. The live API produced the invalid/expired-token message; Change token returned to the empty secure form. The valid-token tab remained separate. Found and fixed the misleading loading label and disabled claim actions after a known 401. No personal token was entered in code or logs for this negative test.

## Assistant — successful, failed and paginated live flows

“Another live flow passed: the USDT claim completed automatically. For BTC I captured pending and, after refreshing the page, failed with the server's reason. Activity loaded both pages to the end; the original ETH claim appears exactly once.

For a failed claim I will make the copy more precise so it clearly shows the returned gross amount and does not imply that the user received net funds or paid the fee.”

## Tool evidence — additional live flows

Activity displayed 20 initial records, then loaded the remaining records and showed the end-of-history marker. The original ETH claim reference occurred once in the rendered history. A 10 USDT claim completed automatically (reference clm_37e979c965f0, fee 1.5, received 8.5). A 0.0005 BTC claim (reference clm_d0252b5f4650) visibly entered pending; BTC was paused while other assets remained claimable. After a reload it showed failed: the destination rejected the transfer and the server returned the amount. No local refund was applied. The source was then adjusted to display Returned to available: gross amount for a failed claim instead of a fee/net payout summary. Also prevented a disconnected request instance from overwriting a newer token session's saved state.

## Assistant — implementation complete, final deployment

“The implementation, including Activity, is complete. I am finishing the last deployment: the invalid-token state fix, showing the returned amount for a failed claim, and protection against a delayed response from a disconnected session.

I am not marking a physical phone as verified yet; I am waiting for your reply. Browser tests at 390 px and live claim scenarios are recorded in the roadmap.”

## User — physical phone confirmation

“It works on iPhone.”

This answered the request to open the live web on a physical phone, enter the token there, check balances and open the Claim form without submitting another claim.

## Assistant — final handoff update

“Thank you, I am recording your confirmation: balances and opening the claim form work on the physical iPhone. Submission and error branches were verified in the browser.

The final version is deployed; I also checked the fixed Reconnect action and the returned amount on a failed claim. All that remains is saving the final verification summary and submission email draft.”

## Tool outcomes — final state

Runtime commit 7f76a88 was pushed and deployed to the stable EAS URL. Public GitHub returned HTTP 200 without authentication and local/remote HEAD matched. The final live browser showed Returned to available: 0.0005 BTC for the failed claim. An independent invalid-token session showed No balance snapshot loaded and Reconnect, without the incorrect loading text. The source has 20 passing focused unit tests; latest relevant TypeScript, lint, format check and production export checks passed. The original ETH timeout/reload/replay, successful USDT and pending/failed BTC were live fake-data API observations. iPhone confirmation covers Home and opening the form only. No email has been sent, no production funds moved, and no Android or full physical-phone claim proof is claimed.
