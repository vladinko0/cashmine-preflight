<!-- README.md -->
# CashMine preflight

Samostatná skúška Expo web prostredia pripravená pred začiatkom zadania.
Obsah aplikácie je pôvodná Expo blank-typescript šablóna; nejde o riešenie úlohy.

- Node 24.19.0; Yarn 1.22.x; Expo 58; TypeScript.
- `yarn web`: lokálny webový vývoj.
- `yarn typecheck`: kontrola TypeScriptu.
- `yarn build:web`: produkčný export do dist/.
- `yarn deploy:preview`: nový export a EAS preview nasadenie.
- `yarn deploy:production`: nový export a stabilná verejná EAS adresa.

## Overené 20. 10. 2026 pred zadaním

- Vytvorenie nového projektu cez oficiálny create-expo-app a inštalácia cez Yarn.
- TypeScript bez chýb.
- Produkčný web export úspešný.
- Aplikácia sa zobrazila v prehliadači na http://localhost:8093/.
- GitHub CLI prihlásenie funguje pri vynechaní starého GH_TOKEN/GITHUB_TOKEN.

## Otvorené

- `yarn eas login`: chýba prihlásenie používateľa do Expo účtu.
- EAS projekt, živé nasadenie a verejná URL ešte neboli vytvorené ani overené.
- Verejný GitHub remote a push zatiaľ neboli vytvorené ani overené.
- Skutočný telefón a vzdialené API neboli overené.
- ai-logs/ zatiaľ obsahuje iba pokyny, nie export skutočnej konverzácie.

Podrobný checklist, harmonogram a návrh odovzdania: [PREPARATION.md](PREPARATION.md).
JSON a .nvmrc nemajú komentár s cestou, aby zostali validné pre príslušné nástroje.
