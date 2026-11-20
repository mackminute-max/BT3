# Blood & Thunder

An offline fantasy chariot-racing management game. Run Dawnward Stable, prepare your racing unit, and manage the consequences of autonomous races across six championships.

## Play

Double-click [dist/Blood-and-Thunder.html](dist/Blood-and-Thunder.html) in a modern desktop browser. The file contains the game code, styles, and procedurally drawn Canvas artwork. You can copy it to another computer and play without installing anything.

Progress saves locally when the browser permits localStorage for local files. Keep using the same file path and browser profile to resume. A race interrupted before the finish restarts from its grid. Completed races save automatically.

## Race and manage the stable

- Review the schedule, entry fee, and prize before committing. Select an eligible driver, beast team, and chariot in the roster.
- Raise a Strategy Sign before the starting signal or during a circuit race. A queued sign takes effect at the next crossing and consumes one of three uses. Select the queued sign again to lower it, or select a different sign to replace it. A rally has only the starting opportunity.
- Follow your team in the top-down view and use the tactical map, standings, and race radio to read the field. Pause, single-step by 0.1 seconds, or watch at up to 4× speed.
- Inspect race wear between starts. Service or swap assets, and choose whether to continue or withdraw. Recruit staff and develop the stable in the workshop.

## Develop and build

With Node.js 18+ installed, run:

```sh
npm run build
```

The build uses Node's standard library with zero npm dependencies. It embeds all source modules and CSS into `dist/Blood-and-Thunder.html`. Open that file to test the distribution. For editing and debugging the ES modules directly, serve the repository root with any local static server and open `index.html`.

- `src/data.js` defines assets, tracks, competitions, and signs.
- `src/stable.js` handles progression, economy, race results, and saves.
- `src/race.js` simulates the field, signs, incidents, and contact.
- `src/graphics.js` draws the illustrated banner, race view, and tactical map.
- `src/app.js` and `src/style.css` provide the interface.
