<!-- PREPARATION.md -->
# CashMine: príprava na praktickú úlohu

Potvrdený začiatok: 20. 10. 2026 o 14:00 UTC = 16:00 CEST (Slovensko).
Koniec: 16:00 UTC = 18:00 CEST. Dve hodiny začínajú potvrdeným termínom.
Pri chýbajúcom zadaní skontroluj rovnaké emailové vlákno a spam.

Toto je skúška nástrojov vytvorená pred zadaním, nie riešenie úlohy.
Ponechaj skutočné časy commitov a túto prípravu transparentne odlíš v README.
Ak brief vyžaduje nový repozitár alebo iný základ, riaď sa ním.

## Príkazy

```sh
cd /Users/vladimirskoupil/Projekty/cashmine-preflight
nvm use
yarn web
yarn typecheck
yarn build:web
yarn eas whoami
yarn deploy:preview
# Stabilná verejná adresa finálneho riešenia:
yarn deploy:production
```

GitHub CLI má v prostredí starý GH_TOKEN. Uložené prihlásenie funguje takto:

```sh
env -u GH_TOKEN -u GITHUB_TOKEN gh auth status
```

Na zverejnenie samostatného repozitára po kontrole obsahu:

```sh
env -u GH_TOKEN -u GITHUB_TOKEN gh repo create cashmine-react-native-task --public --source=. --remote=origin --push
```

Ak už existuje remote, použi normálny push; nevytváraj duplicitný repozitár.
Nesquashuj históriu. Commituj priebežne funkčné kroky.

## Pred 16:00

- Over živú URL na telefóne cez mobilné dáta a anonymné okno bez prihlásenia.
- Maj otvorený email, editor, terminál a samostatný chat pre túto úlohu.
- Nový chat/pracovný projekt otvor v tomto priečinku, nie vo WoGu.
- API token zadávaj lokálne podľa dokumentácie; neposielaj ho do AI chatu.
- Over spôsob získania skutočných AI konverzácií ešte pred začiatkom.

## Navrhnuté rozdelenie 120 minút

- 0–10: prečítať brief, vypísať povinné body, overiť API a CORS z prehliadača.
- 10–25: najmenší funkčný tok s reálnymi dátami, prvé nasadenie.
- 25–80: hlavná funkcionalita a rozhranie pre telefón.
- 80–100: loading/error/empty, retry a kľúčové interakcie; cielené kontroly.
- 100–110: finálne nasadenie, telefón, refresh URL a anonymné okno.
- 110–120: README, AI konverzácie, kontrola verejného repozitára a odovzdanie.

Použi iba potrebné knižnice. Nepridávaj backend/proxy bez potreby z briefu.
Ak API nepodporuje CORS alebo jeho token nesmie byť verejný, vyrieš to podľa
ich dokumentácie alebo sa hneď spýtaj; EXPO_PUBLIC_* je súčasť webového bundlu.
.env v gitignore neskryje token, ktorý je vložený do klientského JavaScriptu.

## Kontrola odovzdania

- Reálny tok cez API, žiadne zatajené mocky.
- Verejný repozitár s úplnou históriou a yarn.lock.
- Verejná živá URL funguje na telefóne bez Expo účtu.
- README: spustenie, konfigurácia bez tokenu, rozhodnutia a známe limity.
- ai-logs/: skutočné konverzácie, odstránené tajomstvá.
- git status, git diff --check, typecheck a produkčný web export.
- Kľúčové ručné scenáre: loading/error/empty, úspech, retry, úzky viewport.

## Návrh odovzdávacieho emailu (odoslať až po doplnení)

Hi Ivan,

Here is my submission:
- Live app: <LIVE_URL>
- Public repository: <REPOSITORY_URL>
- AI conversations: <REPOSITORY_URL>/tree/main/ai-logs

The README includes setup instructions, implementation decisions and known limitations.

Best regards,
Vladimír Skoupil

## Oficiálne návody

- https://docs.expo.dev/workflow/web/
- https://docs.expo.dev/eas/hosting/get-started/
