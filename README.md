<!-- README.md -->
# CashMine payback wallet

**Live app:** https://vmskoupil-cashmine-preflight.expo.app

## Run locally

Requires Node 24.19.0 and Yarn 1.22.x.

```sh
nvm use
yarn install --frozen-lockfile
yarn web
```

Enter your personal task API token in the app. The token is kept in this browser tab's session and sent only to the CashMine test API; no token or .env is needed in the source/build. Use **Change token** to connect another session. Closing the tab ends its saved token/claim recovery scope. Reviewers can enter their own tokens.

## What works

- Balances for each asset, exact USD totals, server snapshot age, loading/error/retry and refresh.
- Claim options, amount/Max, precision/minimum/available validation, destination and fee/net review before confirmation.
- A saved idempotent claim intent, safe replay after timeout or reload, status polling, and per-asset claim pause until a terminal result and fresh snapshot.
- Paginated activity for accruals, reversals and claims, with retry and duplicate-page protection.
- Exact bigint arithmetic and focused unit tests. The live test API returned an actual timeout; refreshing and safely retrying recovered the completed original claim.

```sh
yarn test
yarn typecheck
yarn lint
yarn format:check
yarn build:web
# Export current code and publish the stable EAS URL:
yarn deploy:production
```

[Decisions and known limits](NOTES.md) · [AI conversations](ai-logs/README.md)

This repository retains its pre-task Expo/environment preparation commits. Timed implementation began after the brief; history is not squashed.
