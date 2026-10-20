<!-- ROADMAP.md -->
# CashMine — roadmapa praktickej úlohy

Zdroj: zadanie doručené 20. 10. 2026 a živá [API dokumentácia](https://task-api.cashmine.io/docs).
Časové okno: **14:00–16:00 UTC / 16:00–18:00 CEST**, 20. 10. 2026.
Po 16:00 UTC nerobiť push ani redeploy. Časy nižšie sú cieľové, nie záruka.
Príprava prostredia vznikla pred úlohou; funkčné riešenie zatiaľ nie je implementované.

## Poradie a pravidlá rozsahu

1. Balances/Home a vstup vlastného tokenu.
2. Správny Claim vrátane neznámeho výsledku a sledovania stavu.
3. Niekoľko unit testov parsovania, validácie, poplatku a USD súčtov.
4. Activity len po dokončení a overení predchádzajúcich bodov.

Uprednostniť správnosť peňazí pred vizuálnymi detailmi. Expo + TypeScript, web pre telefón približne 390 px; natívne buildy nie sú súčasťou zadania. Použiť existujúci nový Expo základ a transparentne oddeliť prípravné commity od riešenia. Nepridávať zbytočný backend ani natívne závislosti.

## 0. Kontrakt a rozhodnutia — cieľ do 14:15 UTC

- [x] Prečítať celé zadanie a verejnú API dokumentáciu; token nekopírovať do projektu.
- [x] Overiť, že dokumentácia uvádza CORS pre ľubovoľný origin, desatinné reťazce, 15-sekundové snapshoty a idempotentný POST.
- [ ] Zapísať typy odpovedí, chýb a stavov podľa dokumentácie; API base URL držať na jednom mieste.
- [ ] Zvoliť presnú reprezentáciu súm. Navrhnutý smer: celočíselné jednotky cez bigint s explicitnou škálou; alternatíva: desatinná knižnica. Zvoliť až po porovnaní jednoduchej implementácie a testovateľnosti. Nepoužiť Number/parseFloat na finančné výpočty.
- [ ] Pre USD násobenie zachovať aj škálu usdPrice a zaokrúhliť až zobrazenie výsledného súčtu; nepredpokladať rovnaký počet desatinných miest ceny a aktíva.
- [ ] Požiadať AI o aspoň dva prístupy k zostatku po claime, uložiť skutočnú diskusiu do ai-logs/ a až potom vybrať riešenie. Toto nie je splnené samotným zoznamom v roadmape.
- [ ] Porovnať aspoň: (A) serverový snapshot s označením neaktuálnosti, samostatným claim stavom a dočasným blokovaním ďalšieho claimu aktíva; (B) lokálnu rezerváciu sumy s explicitným zosúladením, ktoré zabráni dvojitému odpočtu po novom snapshote. Zapísať výber a dôvod do NOTES.md.
- [ ] Rozhodnúť správanie unknown výsledku: zachovať rovnaký Idempotency-Key aj nezmenené telo, nespúšťať nový claim s novým kľúčom ako retry.
- [ ] Vyjasniť v NOTES.md význam total USD: navrhnutý súčet available + pending + claiming, rozdelenie zobraziť osobitne; neprezentovať pending/claiming ako sumu na okamžité vybratie.

Hotové, keď sú finančné a sieťové invarianty explicitné a nie sú založené na vymyslených API poliach.

## 1. Token, API a Home — cieľ do 14:35 UTC

- [ ] Pri prvom otvorení zobraziť vstup tokenu; uchovať ho iba v prehliadači, napríklad sessionStorage, a umožniť zmenu/odhlásenie. Nevložiť token do URL, zdrojov, buildu, .env určeného na bundlovanie ani logov.
- [ ] Pri zmene tokenu zrušiť staré requesty/polling a oddeliť cache aj rozpracované operácie podľa identity; stará odpoveď nesmie prepísať nového používateľa.
- [ ] API klient: Authorization Bearer, timeout/AbortController, čitateľná typovaná chyba, 401 návrat na token, 429 rešpektuje retryAfterMs/Retry-After. Dokumentácia nie je dôkaz dostupnosti autentifikovaného API.
- [ ] GET /v1/balances: aktívum, available, pending, claiming, USD súčet, čas asOf a viditeľná čerstvosť dát. Nezamieňať čas lokálneho fetchu za čas snapshotu.
- [ ] Loading, počiatočná chyba s Retry, prázdny výsledok a refresh; pri chybe refreshu ponechať posledné dáta s upozornením.
- [ ] Úzky viewport približne 390 px; čitateľné sumy, formuláre a ovládanie bez horizontálneho overflow.
- [ ] Prvý funkčný Home nasadiť skoro na existujúci EAS Hosting a overiť verejný odkaz s tokenom zadaným používateľom až v aplikácii.
- [ ] Commit a push funkčného kroku; najneskôr každých 30 minút počas práce, bez squashovania a bez prepisovania historických časov.

Hotové, keď sa na živom webe načítajú reálne dáta pre zadaný token a funguje chyba/retry/refresh.

## 2. Presná amount logika a testy — cieľ do 14:50 UTC

- [ ] Parsovanie bez floating-point chýb, presný prevod medzi reťazcom a najmenšími jednotkami.
- [ ] API formát: číslice, voliteľná bodka s ďalšími číslicami, bez úvodných núl; odmietnuť .5, 1., 05, 1e-3, záporné sumy a prekročenie decimals. Správanie medzier a čiarky zvoliť explicitne; neprepisovať ticho nejednoznačný vstup.
- [ ] Validácia podľa minAmount <= amount <= available a asset decimals; nespoliehať sa na snapshot ako na garanciu serverového zostatku.
- [ ] Fee je odpočítaný z amount: receiveAmount = amount - fee. Max = dostupná claim suma, nie available mínus fee. Nepridávať nevysvetlené obchodné pravidlá; prípadný nekladný receiveAmount riešiť explicitne.
- [ ] Unit testy: platné/neplatné parsovanie, presnosť, min/max hranice a prekročenie, Max, presný poplatok/netto, USD súčet s rôznymi škálami, zaokrúhlenie až po súčte a nulové hodnoty.
- [ ] Zvoliť jednoduchý web-kompatibilný test runner, pridať `yarn test` a overiť výsledok. Unit testy nesmú používať osobný token.

Hotové, keď finančné funkcie majú zrozumiteľné izolované testy a žiadne peňažné operácie cez binárny float.

## 3. Claim od formulára po vysporiadanie — cieľ do 15:25 UTC

- [ ] Výber aktíva → GET /v1/claim-options?asset=...; spracovať načítanie, chybu a zmenu aktíva bez stale odpovedí.
- [ ] Zobraziť minimum, fee a destinations; umožniť vybrať platný cieľ a vyplniť amount alebo Max.
- [ ] Pred potvrdením jasne ukázať aktívum, amount, destination, fee a receiveAmount.
- [ ] Pred POST uložiť immutable telo a nový Idempotency-Key pre konkrétny používateľský úmysel; počas odosielania zabrániť dvojitému kliknutiu. Kľúč má 1–100 znakov.
- [ ] POST /v1/claims: spracovať 201 aj idempotentné 200 ako úspech; serverovú validáciu ukázať pri poli, 409 nevyriešiť automatickým vytvorením nového kľúča.
- [ ] Pri timeoute, strate siete alebo nejednoznačnom serverovom výsledku ukázať „výsledok zatiaľ nepoznáme“; nenechať používateľa nevedomky vytvoriť ďalší claim. Retry odošle identický kľúč aj telo. Pri 429 počkať požadovaný interval.
- [ ] Ak už máme claim id, stav overovať GET /v1/claims/{id}; obnova po refreshi má zachovať identitu rozpracovanej operácie. Pred získaním id obnoviť unknown operáciu replayom rovnakého POST.
- [ ] Pending stav sledovať primeraným pollingom; približne 20 sekúnd je očakávanie, nie klientsky dôkaz zlyhania. Po completed/failed polling zastaviť; pri 401 ho zastaviť, pri 429 spomaliť.
- [ ] Completed: ukázať úspech a serverové receiveAmount; failed: failureReason a informácia o návrate sumy do available.
- [ ] Zosúladiť balances podľa zvoleného prístupu. Snapshot môže byť 15 s starý; nenahradiť ním nekriticky čerstvý claim stav, neodpočítať rovnaký claim dvakrát a pri failed nevykonať neoverenú lokálnu refundáciu.
- [ ] Pri konzervatívnom prístupe uvoľniť blokovanie aktíva až po známom výsledku a dostatočne novom serverovom snapshote; pri probléme ponúknuť refresh/retry a vysvetlenie.
- [ ] Overiť reálny úspešný tok na test API. Neznámy výsledok a duplicity overiť cieleným testom/fake transportom, ak sa nedajú bezpečne a deterministicky vyvolať na API. Neoznačiť simuláciu za živé overenie.
- [ ] Priebežný commit/push bez squashovania.

Hotové, keď jeden zámer nespôsobí dva claimy a používateľ vie rozlíšiť sending, unknown, pending, completed a failed.

## 4. Activity — voliteľné, najneskôr do 15:35 UTC

Začať iba ak sú Home, Claim a požadované finančné testy funkčné.

- [ ] GET /v1/activity s limit <= 20, nextCursor a načítaním ďalšej strany; koniec pri null.
- [ ] accrual, reversal a claim, status, asset, signed amount, čas, exchange/relatedId podľa dostupnosti.
- [ ] Neotáčať znamienko už zápornej sumy, nerozbiť stránkovanie duplicitnými fetchmi; loading/error/retry/empty.
- [ ] Ak čas nestačí, preskočiť a pravdivo uviesť v NOTES.md.

## 5. Overenie, poznámky a AI logy — 15:25–15:45 UTC

- [ ] Cielené kontroly: yarn test, yarn lint, yarn typecheck a yarn build:web. Po oprave zopakovať dotknutú kontrolu.
- [ ] Ručne: nový token, jeho zmena, refresh, min/max/precision, dvojklik, unknown retry, pending → terminal, starý snapshot a úzky viewport. Rozlíšiť reálny telefón od browser viewportu a simulované chyby od živého API.
- [ ] NOTES.md približne jedna strana s presnými sekciami Decisions; Working with AI; Not done / known issues.
- [ ] Decisions pokrývajú reprezentáciu peňazí, zostatok po claime, unknown výsledok, alternatívy a dôvody.
- [ ] Working with AI: tri skutočné momenty s konkrétnym odkazom do ai-logs/: neúspešný prompt a jeho zmena; chybný/rizikový AI návrh a odhalenie; nesúhlas alebo odmietnutie návrhu. Ak moment nenastal, nevymýšľať históriu.
- [ ] Uložiť skutočné AI konverzácie bez uhladzovania; odstrániť token a súkromné údaje s označením redakcie. Anglické preklady pôvodne slovenských správ jasne označiť ako preklad. Súhrn nenahrádza úplnú konverzáciu. Nepublikovať nesúvisiacu WoGu komunikáciu.
- [ ] README zúžiť na live link, lokálne spustenie a čo funguje; oddeliť pripravenú šablónu od skutočne implementovaných funkcií.
- [ ] Known issues: presne pomenovať vynechané body, obmedzenia a ďalší krok, vrátane expiry tokenu bez zverejnenia jeho hodnoty.

## 6. Finálne nasadenie a odovzdanie — 15:45–15:55 UTC

- [ ] Skontrolovať staged diff, históriu a finálny export na absenciu tokenu; token sa zadáva až pri otvorení aplikácie, reviewer použije vlastný.
- [ ] Finálny commit a push celej histórie, bez squashovania; skontrolovať zhodu lokálneho a remote commitu.
- [ ] EAS deploy čerstvého web exportu, overiť verejný prístup bez Expo/GitHub loginu, refresh a hlavný tok na live URL.
- [ ] Skontrolovať README, NOTES.md a odkazy do ai-logs/ vo verejnom repozitári.
- [ ] Pripraviť odovzdanie: verejný repo link, live link, približný čas strávený úlohou. Email odosiela používateľ, kým výslovne nepoverí odoslaním.
- [ ] Pri nedostupnom API zaznamenať skutočný čas a dôkaz chyby bez tokenu, uviesť v odovzdaní; nepredstierať úspešný tok.
- [ ] Rezerva do 16:00 UTC; po tomto čase žiadny push ani redeploy.

## Aktuálne adresy

- Repozitár: https://github.com/vladinko0/cashmine-preflight
- Živý web: https://vmskoupil-cashmine-preflight.expo.app
- Základ API: https://task-api.cashmine.io
- Dokumentácia API: https://task-api.cashmine.io/docs

V čase vzniku roadmapy live web stále obsahuje iba prípravnú Expo obrazovku.
Táto roadmapa je plán; odškrtnuté sú len skutočne vykonané kroky.
