# gamepick 🎲

Vår spelhylla som en Netflix-sida: en hero med utvalda spel och rader (”rails”) man scrollar i sidled.
Listan över spel ligger i ett [Google-ark](https://docs.google.com/spreadsheets/d/1--3GD0zPWlafjrLmjbLZtgXXrOFs-vxRVBwqlj4h2Y8/edit),
all info om spelen hämtas från [BoardGameGeek](https://boardgamegeek.com).

## Lägga till spel

Lägg till en rad i arket:

| Kolumn      | Exempel                       | Beskrivning |
|-------------|-------------------------------|-------------|
| `bgg_id`    | `266192` eller BGG-länken     | Id:t från BGG-adressen (`boardgamegeek.com/boardgame/266192/wingspan`). Kan lämnas tomt – då söks spelet upp på namnet. |
| `namn`      | `Wingspan`                    | Valfritt. Visas i stället för BGG:s namn (bra för svenska titlar). |
| `samlingar` | `Favoriter, Familj`           | Egna rails, kommaseparerade. Ordningen i arket styr ordningen på sidan. |
| `utvald`    | `ja`                          | Visas i heron högst upp (`ja`, `x`, `1` funkar). |
| `ägare`     | `Anton`                       | Vem som har spelet. |
| `kommentar` | `Kvällens favorit!`           | Visas i heron och på spelets sida. |

Sidan byggs om varje natt. Vill du se ändringen direkt: **Actions → Deploy to GitHub Pages → Run workflow**.

Utöver egna samlingar skapas rails automatiskt: Senast tillagda (nederst i arket = nyast), Högst betyg, Samarbetsspel,
Snabba spel, 6+ spelare, Bara för två, Lätta att lära, Tunga strategispel och de vanligaste BGG-kategorierna.
”Vi är”-knapparna filtrerar hela sidan på antal spelare.

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
