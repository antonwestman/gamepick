# gamepick 🎲

Vår spelhylla som en Netflix-sida: en hero med utvalda spel och rader (”rails”) man scrollar i sidled.
Listan över spel ligger i ett [Google-ark](https://docs.google.com/spreadsheets/d/1--3GD0zPWlafjrLmjbLZtgXXrOFs-vxRVBwqlj4h2Y8/edit),
all info om spelen hämtas från [BoardGameGeek](https://boardgamegeek.com).

## Lägga till spel

Lägg till en rad i arket:

| Kolumn      | Exempel                       | Beskrivning |
|-------------|-------------------------------|-------------|
| `bgg_id`    | `266192` eller BGG-länken     | Id:t från BGG-adressen (`boardgamegeek.com/boardgame/266192/wingspan`). Kan lämnas tomt – då söks spelet upp på exakt namn. Spel som inte finns på BGG (t.ex. Hitster) visas ändå, med bara arkets info. |
| `namn`      | `Wingspan`                    | Valfritt. Visas i stället för BGG:s namn (bra för svenska titlar). |
| `samlingar` | `Favoriter, Familj`           | Egna rails, kommaseparerade. Ordningen i arket styr ordningen på sidan. |
| `utvald`    | `ja`                          | Visas i heron högst upp (`ja`, `x`, `1` funkar). |
| `ägare`     | `Anton`                       | Vem som har spelet. |
| `kommentar` | `Kvällens favorit!`           | Visas i heron och på spelets sida. |

Sidan byggs om varje natt. Vill du se ändringen direkt: **Actions → Deploy to GitHub Pages → Run workflow**.

Utöver egna samlingar skapas rails automatiskt: Senast tillagda (nederst i arket = nyast), Högst betyg, Samarbetsspel,
Snabba spel, 6+ spelare, Bara för två, Lätta att lära, Tunga strategispel och de vanligaste BGG-kategorierna.
”Vi är”-knapparna filtrerar hela sidan på antal spelare.

## Rösta på kvällens spel

Tryck 👍 på ett spel för att rösta. Första gången får du skriva ditt namn (det sparas i webbläsaren).
Spelen med flest röster hamnar i raden **Kvällens topplista** högst upp, och alla ser varandras röster
(sidan uppdateras var 15:e sekund).

**🎯 Vem börjar?** snurrar fram vem som börjar. Spelarlistan och resultatet delas med alla: när någon snurrar
snurrar hjulet hos alla och landar på samma person.

Inför nästa spelkväll: ta bort raderna i flikarna **Röster**, **Spelare** och **Snurr** i arket.

Röster, spelare och snurr sparas i arket via ett litet Google Apps Script, eftersom GitHub Pages bara kan visa statiska filer.
Engångs-setup:

1. Öppna arket → **Tillägg → Apps Script**. Ersätt innehållet med [`apps-script/Code.gs`](apps-script/Code.gs) och spara.
2. **Distribuera → Ny distribution** → typ *Webbapp*. *Kör som:* Jag, *Vem har åtkomst:* Alla. Godkänn behörigheterna.
3. Kopiera webbappens URL (slutar på `/exec`) till `VITE_VOTES_URL` i [`.env.production`](.env.production).
   Den är inte hemlig – webbläsaren anropar den direkt.

När `Code.gs` ändras: **Distribuera → Hantera distributioner → ✏️ → Version: Ny version → Distribuera**
(URL:en är densamma). Med ett äldre skript fungerar röstningen, men snurrans lista sparas bara per telefon och egna Pannlappen-kategorier döljs.

Utan `VITE_VOTES_URL` döljs röstningen. Det finns ingen inloggning, så vem som helst med länken kan rösta i vems namn som helst –
det är tänkt för kompisgänget.

## Mobilspel: Pannlappen

Raden **Mobilspel** länkar till Pannlappen (`#/mobilspel/pannlappen`; hette tidigare Heads Up och den gamla länken funkar fortfarande). Välj en kategori, sätt telefonen på tvären i pannan
och luta nedåt för rätt, uppåt för pass. 60 sekunder per runda. Utan rörelsesensor (eller om man nekar den på iPhone)
trycker man på höger/vänster halva av skärmen i stället.

Välj språk på orden (svenska/engelska), svårighet (Lätt/Medel/Svår) och lägg till lag om ni vill tävla: lagen turas om och poängen räknas ihop.
Inget ord kommer två gånger under ett spel (även ord man passat, avbrutit eller inte hann med räknas som sedda) – tar en kategori slut väljer man en annan eller trycker **Nytt spel**. Inställningarna sparas i telefonen.
Orden ligger i [`src/lib/pannlappenWords.sv.ts`](src/lib/pannlappenWords.sv.ts) och [`.en.ts`](src/lib/pannlappenWords.en.ts), uppdelade per kategori och svårighet.

**Egna kategorier:** under *Egna kategorier* kan vem som helst skapa en kategori – skriv eller klistra in ord (ett per rad),
eller ladda upp en textfil. Den sparas i fliken **Pannlappen** i arket och syns för alla, och vem som helst kan ändra eller ta
bort den. Egna kategorier har en ordlista som används oavsett språk och svårighet. Kräver att `Code.gs` är uppdaterad (se nedan).

## Hur det funkar

```
Google-ark ──CSV──▶ scripts/build-data.ts ──▶ public/games.json ──▶ React-app (Vite) ──▶ GitHub Pages
                          ▲
             BoardGameGeek XML API
```

Datan hämtas **vid bygget** i GitHub Actions, inte i webbläsaren: BGG:s API kräver en token och skickar inga CORS-headers,
och vi vill inte att varje besökare ska belasta BGG. Sidan blir då bara statiska filer.

## Engångs-setup

1. **Dela arket:** Dela → Allmän åtkomst → *Alla som har länken* → *Läsare*. Bygget läser arket som CSV utan inloggning.
2. **BGG-token:** Registrera en app enligt <https://boardgamegeek.com/using_the_xml_api> och lägg token som repo-secret `BGG_TOKEN`
   (Settings → Secrets and variables → Actions).
3. **Pages:** Settings → Pages → Source: *GitHub Actions*.
4. (Valfritt) Repo-variabeln `SHEET_ID` om ni byter ark.

## Utveckling

```sh
npm install
npm run data:sample   # offline-exempeldata → public/games.json
# eller: BGG_TOKEN=... npm run data   # riktig data från arket + BGG
npm run dev
npm test
```

- `src/lib/game.ts` – datakontraktet mellan bygg-skriptet och appen
- `src/lib/rails.ts` – vilka rails som visas och hur heron väljs
- `scripts/` – läser arket, hämtar från BGG och slår ihop
