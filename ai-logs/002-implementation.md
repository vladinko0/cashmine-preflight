<!-- ai-logs/002-implementation.md -->
# Implementation conversation (English translation)

Original user/assistant messages are in Slovak. This file translates their wording into English and records technical tool outcomes separately. It is not a fabricated verbatim English export. Tokens and unrelated private context are excluded. Tool metadata below is not a replacement for the conversation.

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
