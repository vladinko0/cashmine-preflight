<!-- ROADMAP.md -->
# CashMine — roadmapa praktickej úlohy

Zdroj: zadanie doručené 20. 10. 2026 a živá [API dokumentácia](https://task-api.cashmine.io/docs).
Časové okno: **14:00–16:00 UTC / 16:00–18:00 CEST**, 20. 10. 2026.
Po 16:00 UTC nerobiť push ani redeploy. Časy nižšie sú cieľové, nie záruka.
Príprava prostredia vznikla pred úlohou; Home, Claim, finančné testy a voliteľná Activity sú implementované. Výsledky overení sú uvedené nižšie.

## Poradie a pravidlá rozsahu

1. Balances/Home a vstup vlastného tokenu.
2. Správny Claim vrátane neznámeho výsledku a sledovania stavu.
3. Niekoľko unit testov parsovania, validácie, poplatku a USD súčtov.
4. Activity len po dokončení a overení predchádzajúcich bodov.

Uprednostniť správnosť peňazí pred vizuálnymi detailmi. Expo + TypeScript, web pre telefón približne 390 px; natívne buildy nie sú súčasťou zadania. Použiť existujúci nový Expo základ a transparentne oddeliť prípravné commity od riešenia. Nepridávať zbytočný backend ani natívne závislosti.

## 0. Kontrakt a rozhodnutia — cieľ do 14:15 UTC

- [x] Prečítať celé zadanie a verejnú API dokumentáciu; token nekopírovať do projektu.
- [x] Overiť, že dokumentácia uvádza CORS pre ľubovoľný origin, desatinné reťazce, 15-sekundové snapshoty a idempotentný POST.
- [x] Zapísať typy odpovedí, chýb a stavov podľa dokumentácie; API base URL držať na jednom mieste.
- [x] Zvoliť presnú reprezentáciu súm. Navrhnutý smer: celočíselné jednotky cez bigint s explicitnou škálou; alternatíva: desatinná knižnica. Zvoliť až po porovnaní jednoduchej implementácie a testovateľnosti. Nepoužiť Number/parseFloat na finančné výpočty.
- [x] Pre USD násobenie zachovať aj škálu usdPrice a zaokrúhliť až zobrazenie výsledného súčtu; nepredpokladať rovnaký počet desatinných miest ceny a aktíva.
- [x] Požiadať AI o aspoň dva prístupy k zostatku po claime, uložiť skutočnú diskusiu do ai-logs/ a až potom vybrať riešenie. Toto nie je splnené samotným zoznamom v roadmape.
- [x] Porovnať aspoň: (A) serverový snapshot s označením neaktuálnosti, samostatným claim stavom a dočasným blokovaním ďalšieho claimu aktíva; (B) lokálnu rezerváciu sumy s explicitným zosúladením, ktoré zabráni dvojitému odpočtu po novom snapshote. Zapísať výber a dôvod do NOTES.md.
- [x] Rozhodnúť správanie unknown výsledku: zachovať rovnaký Idempotency-Key aj nezmenené telo, nespúšťať nový claim s novým kľúčom ako retry.
- [x] Vyjasniť v NOTES.md význam total USD: navrhnutý súčet available + pending + claiming, rozdelenie zobraziť osobitne; neprezentovať pending/claiming ako sumu na okamžité vybratie.

Hotové, keď sú finančné a sieťové invarianty explicitné a nie sú založené na vymyslených API poliach.

## 1. Token, API a Home — cieľ do 14:35 UTC

- [x] Pri prvom otvorení zobraziť vstup tokenu; uchovať ho iba v prehliadači, napríklad sessionStorage, a umožniť zmenu/odhlásenie. Nevložiť token do URL, zdrojov, buildu, .env určeného na bundlovanie ani logov.
- [x] Pri zmene tokenu zrušiť staré requesty/polling a oddeliť cache aj rozpracované operácie podľa identity; stará odpoveď nesmie prepísať nového používateľa.
- [x] API klient: Authorization Bearer, timeout/AbortController, čitateľná typovaná chyba, 401 návrat na token, 429 rešpektuje retryAfterMs/Retry-After. Dokumentácia nie je dôkaz dostupnosti autentifikovaného API.
- [x] GET /v1/balances: aktívum, available, pending, claiming, USD súčet, čas asOf a viditeľná čerstvosť dát. Nezamieňať čas lokálneho fetchu za čas snapshotu.
- [x] Loading, počiatočná chyba s Retry, prázdny výsledok a refresh; pri chybe refreshu ponechať posledné dáta s upozornením.
- [x] Úzky viewport približne 390 px; čitateľné sumy, formuláre a ovládanie bez horizontálneho overflow.
- [x] Prvý funkčný Home nasadiť skoro na existujúci EAS Hosting a overiť verejný odkaz s tokenom zadaným používateľom až v aplikácii.
- [x] Commit a push funkčného kroku; najneskôr každých 30 minút počas práce, bez squashovania a bez prepisovania historických časov.

Hotové, keď sa na živom webe načítajú reálne dáta pre zadaný token a funguje chyba/retry/refresh.

## 2. Presná amount logika a testy — cieľ do 14:50 UTC

- [x] Parsovanie bez floating-point chýb, presný prevod medzi reťazcom a najmenšími jednotkami.
- [x] API formát: číslice, voliteľná bodka s ďalšími číslicami, bez úvodných núl; odmietnuť .5, 1., 05, 1e-3, záporné sumy a prekročenie decimals. Správanie medzier a čiarky zvoliť explicitne; neprepisovať ticho nejednoznačný vstup.
- [x] Validácia podľa minAmount <= amount <= available a asset decimals; nespoliehať sa na snapshot ako na garanciu serverového zostatku.
- [x] Fee je odpočítaný z amount: receiveAmount = amount - fee. Max = dostupná claim suma, nie available mínus fee. Nepridávať nevysvetlené obchodné pravidlá; prípadný nekladný receiveAmount riešiť explicitne.
- [x] Unit testy: platné/neplatné parsovanie, presnosť, min/max hranice a prekročenie, Max, presný poplatok/netto, USD súčet s rôznymi škálami, zaokrúhlenie až po súčte a nulové hodnoty.
- [x] Zvoliť jednoduchý web-kompatibilný test runner, pridať `yarn test` a overiť výsledok. Unit testy nesmú používať osobný token.

Hotové, keď finančné funkcie majú zrozumiteľné izolované testy a žiadne peňažné operácie cez binárny float.

## 3. Claim od formulára po vysporiadanie — cieľ do 15:25 UTC

- [x] Výber aktíva → GET /v1/claim-options?asset=...; spracovať načítanie, chybu a zmenu aktíva bez stale odpovedí.
- [x] Zobraziť minimum, fee a destinations; umožniť vybrať platný cieľ a vyplniť amount alebo Max.
- [x] Pred potvrdením jasne ukázať aktívum, amount, destination, fee a receiveAmount.
- [x] Pred POST uložiť immutable telo a nový Idempotency-Key pre konkrétny používateľský úmysel; počas odosielania zabrániť dvojitému kliknutiu. Kľúč má 1–100 znakov.
- [x] POST /v1/claims: spracovať 201 aj idempotentné 200 ako úspech; serverovú validáciu ukázať pri poli, 409 nevyriešiť automatickým vytvorením nového kľúča.
- [x] Pri timeoute, strate siete alebo nejednoznačnom serverovom výsledku ukázať „výsledok zatiaľ nepoznáme“; nenechať používateľa nevedomky vytvoriť ďalší claim. Retry odošle identický kľúč aj telo. Pri 429 počkať požadovaný interval.
- [x] Ak už máme claim id, stav overovať GET /v1/claims/{id}; obnova po refreshi má zachovať identitu rozpracovanej operácie. Pred získaním id obnoviť unknown operáciu replayom rovnakého POST.
- [x] Pending stav sledovať primeraným pollingom; približne 20 sekúnd je očakávanie, nie klientsky dôkaz zlyhania. Po completed/failed polling zastaviť; pri 401 ho zastaviť, pri 429 spomaliť.
- [x] Completed: ukázať úspech a serverové receiveAmount; failed: failureReason a informácia o návrate sumy do available.
- [x] Zosúladiť balances podľa zvoleného prístupu. Snapshot môže byť 15 s starý; nenahradiť ním nekriticky čerstvý claim stav, neodpočítať rovnaký claim dvakrát a pri failed nevykonať neoverenú lokálnu refundáciu.
- [x] Pri konzervatívnom prístupe uvoľniť blokovanie aktíva až po známom výsledku a dostatočne novom serverovom snapshote; pri probléme ponúknuť refresh/retry a vysvetlenie.
- [x] Overiť reálny úspešný tok na test API. Neznámy výsledok a duplicity overiť cieleným testom/fake transportom, ak sa nedajú bezpečne a deterministicky vyvolať na API. Neoznačiť simuláciu za živé overenie.
- [x] Priebežný commit/push bez squashovania.

Hotové, keď jeden zámer nespôsobí dva claimy a používateľ vie rozlíšiť sending, unknown, pending, completed a failed.

## 4. Activity — voliteľné, najneskôr do 15:35 UTC

Začať iba ak sú Home, Claim a požadované finančné testy funkčné.

- [x] GET /v1/activity s limit <= 20, nextCursor a načítaním ďalšej strany; koniec pri null.
- [x] accrual, reversal a claim, status, asset, signed amount, čas, exchange/relatedId podľa dostupnosti.
- [x] Neotáčať znamienko už zápornej sumy, nerozbiť stránkovanie duplicitnými fetchmi; loading/error/retry/empty.
- Activity nebolo potrebné preskočiť; bola implementovaná aj živo overená.

## 5. Overenie, poznámky a AI logy — 15:25–15:45 UTC

- [x] Cielené kontroly: yarn test, yarn lint, yarn typecheck a yarn build:web. Po oprave zopakovať dotknutú kontrolu.
- [x] Ručne: nový token, jeho zmena, refresh, min/max/precision, dvojklik, unknown retry, pending → terminal, starý snapshot a úzky viewport. Rozlíšiť reálny telefón od browser viewportu a simulované chyby od živého API.
- [x] NOTES.md približne jedna strana s presnými sekciami Decisions; Working with AI; Not done / known issues.
- [x] Decisions pokrývajú reprezentáciu peňazí, zostatok po claime, unknown výsledok, alternatívy a dôvody.
- [x] Working with AI: tri skutočné momenty s konkrétnym odkazom do ai-logs/: neúspešný prompt a jeho zmena; chybný/rizikový AI návrh a odhalenie; nesúhlas alebo odmietnutie návrhu. Ak moment nenastal, nevymýšľať históriu.
- [x] Uložiť skutočné AI konverzácie bez uhladzovania; odstrániť token a súkromné údaje s označením redakcie. Anglické preklady pôvodne slovenských správ jasne označiť ako preklad. Súhrn nenahrádza úplnú konverzáciu. Nepublikovať nesúvisiacu WoGu komunikáciu.
- [x] README zúžiť na live link, lokálne spustenie a čo funguje; oddeliť pripravenú šablónu od skutočne implementovaných funkcií.
- [x] Known issues: presne pomenovať vynechané body, obmedzenia a ďalší krok, vrátane expiry tokenu bez zverejnenia jeho hodnoty.

## 6. Finálne nasadenie a odovzdanie — 15:45–15:55 UTC

- [x] Skontrolovať staged diff, históriu a finálny export na absenciu tokenu; token sa zadáva až pri otvorení aplikácie, reviewer použije vlastný.
- [x] Finálny commit a push celej histórie, bez squashovania; skontrolovať zhodu lokálneho a remote commitu.
- [x] EAS deploy čerstvého web exportu, overiť verejný prístup bez Expo/GitHub loginu, refresh a hlavný tok na live URL.
- [x] Skontrolovať README, NOTES.md a odkazy do ai-logs/ vo verejnom repozitári.
- [x] Pripraviť odovzdanie: verejný repo link, live link, približný čas strávený úlohou. Email odosiela používateľ, kým výslovne nepoverí odoslaním.
- API bolo dostupné a autentifikované živé toky prešli; žiadosť o náhradný termín nie je potrebná.
- Odovzdanie je pripravené približne o 14:40 UTC; zostáva rezerva do 16:00 UTC. Po tomto čase žiadny push ani redeploy. Email zatiaľ nebol odoslaný.

## Aktuálne adresy

- Repozitár: https://github.com/vladinko0/cashmine-preflight
- Živý web: https://vmskoupil-cashmine-preflight.expo.app
- Základ API: https://task-api.cashmine.io
- Dokumentácia API: https://task-api.cashmine.io/docs

## Overený priebeh implementácie

Odškrtnuté implementačné body znamenajú napísaný a lokálne overený rozsah; neznamenajú, že sa každá chybová vetva vyskytla na živom API.

| Oblasť | Výsledok | Druh dôkazu |
| --- | --- | --- |
| TypeScript, lint, format:check, web export | Úspešné; posledné UI/session opravy overené typmi, cieleným lintom a novým exportom | Lokálne nástroje |
| Finančná a bezpečnostná logika | 20 úspešných testov vrátane presnosti, idempotentného replay, stale snapshotu, 409, 429 a poškodeného journalu | Unit/fake transport; nie živé chyby 409/429 |
| Home | USDT/BTC/ETH a presné súčty načítané na živom webe | Používateľské potvrdenie + browser |
| ETH claim 0.01 | Skutočný timeout → unknown → reload → safe retry → pôvodný completed claim, fee 0.0012 a receive 0.0088 | Živé test API cez nasadený web |
| Dvojklik / duplicita | Jeden ETH claim; jeho referencia sa vo vykreslenej histórii objavila raz | Browser + samostatný idempotency test |
| USDT claim 10 | Automaticky completed, fee 1.5 a receive 8.5 | Živý web |
| BTC claim 0.0005 | Pozorovaný pending, blokované BTC; po reload failed s dôvodom odmietnutého cieľa a vrátenia sumy | Živý web |
| Activity | Prvá aj ďalšia strana, znamienka, historické failed/completed/reversal a koniec pri nextCursor null | Živý web + unit test deduplikácie |
| Neplatný token | Chyba invalid/expired; Change token otvorilo prázdny formulár | Živý negatívny test so zástupným tokenom |
| Mobilný viewport | 390 × 844, amount/Max/confirmation a claim výsledky | Browser; nejde o fyzický telefón |
| Fyzický iPhone | Používateľ potvrdil zostatky a otvorenie formulára Claim | Používateľské potvrdenie; nie dôkaz celého claim toku na telefóne |

Osobný token bol presne porovnaný so zdrojmi, exportom, logmi a Git históriou: nenachádza sa v nich. V AI logoch je celé zadanie s redigovaným tokenom a skutočné diskusie aj neúspešné kontroly. Finálny runtime commit `7f76a88` bol pushnutý a nasadený; živý web overil opravený Reconnect pri 401 aj presnú vrátenú sumu failed claimu. Odovzdávací email v SUBMISSION.md posiela používateľ. Android ani fyzické odoslanie claimu na iPhone sa neoznačujú ako overené.
