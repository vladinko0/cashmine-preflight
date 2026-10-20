<!-- README.md -->
# CashMine preflight

Samostatná skúška Expo web prostredia pripravená pred začiatkom zadania.
Obsah aplikácie je pôvodná Expo blank-typescript šablóna; nejde o riešenie úlohy.

- Node 24.19.0; Yarn 1.22.x; Expo 58; TypeScript.
- `yarn web`: lokálny webový vývoj.
- `yarn lint`: kontrola ESLint.
- `yarn typecheck`: kontrola TypeScriptu.
- `yarn build:web`: produkčný export do dist/.
- `yarn deploy:preview`: nový export a EAS preview nasadenie.
- `yarn deploy:production`: nový export a stabilná verejná EAS adresa.

## Overené 20. 10. 2026 pred zadaním

- Vytvorenie nového projektu cez oficiálny create-expo-app a inštalácia cez Yarn.
- TypeScript bez chýb.
- ESLint bez chýb (`yarn lint`; priame ESLint volanie po chybe detekcie verzie v Expo CLI).
- Produkčný web export úspešný.
- Aplikácia sa zobrazila v prehliadači na http://localhost:8093/.
- GitHub CLI prihlásenie funguje pri vynechaní starého GH_TOKEN/GITHUB_TOKEN.

## Otvorené

- EAS účet: `vmskoupil`; projekt `cashmine-preflight` je vytvorený a prepojený.
- Živá URL bola overená v prehliadači bez prihlásenia: https://vmskoupil-cashmine-preflight.expo.app
- Dashboard: https://expo.dev/accounts/vmskoupil/projects/cashmine-preflight
- Verejný GitHub remote a push zatiaľ neboli vytvorené ani overené. Automatická kontrola zablokovala zverejnenie prípravnej histórie s lokálnymi cestami a pracovnými nastaveniami; vyžaduje sa výslovný súhlas používateľa.
- Skutočný telefón a vzdialené API neboli overené.
- ai-logs/ zatiaľ obsahuje iba pokyny, nie export skutočnej konverzácie.

Podrobný checklist, harmonogram a návrh odovzdania: [PREPARATION.md](PREPARATION.md).
JSON a .nvmrc nemajú komentár s cestou, aby zostali validné pre príslušné nástroje.
