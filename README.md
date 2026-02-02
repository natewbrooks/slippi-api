# slippi-api

An **unofficial Slippi ranked netplay API client and CLI** for Super Smash Bros. Melee.

* Fetch ranked player data
* Compute ranks, win rates, and character usage
* Includes a CLI and a JavaScript API
* ES Modules, zero config

> ⚠️ This package is **not affiliated with Slippi**. It uses Slippi’s internal GraphQL endpoint.

---

## Installation

```bash
npm install slippi-api
```

Or run via `npx`:

```bash
npx slippi MANG#0
```

---

## CLI Usage

After install:

```bash
npx slippi MANG#0
```

Multiple players:

```bash
npx slippi MANG#0 ZAIN#0 IBDW#0
```

Example output:

```
Mango (MANG#0)
Rank: Master 3 (2310)
Record (sets): 120W - 80L (60.0%)
Main: FOX
Profile: https://slippi.gg/user/MANG-0
```

---

## JavaScript Usage

### Basic example

```js
import { SlippiAPI } from 'slippi-api';

const api = new SlippiAPI();
const player = await api.getPlayer('MANG#0');

if (player) {
  console.log(player.toString());
}
```

---

## Fetching Multiple Players

```js
const players = await api.getPlayers(['MANG#0', 'ZAIN#0']);

players.forEach(p => {
  console.log(`${p.displayName} → ${p.getRank()}`);
});
```

---

## Player Model

`SlippiUser` exposes computed helpers:

```js
player.displayName
player.connectCode
player.getRank()
player.getProfileUrl()
player.getMainCharacter()
player.getCharacterImages()
```

### Ranked profile

```js
const profile = player.rankedProfile;

profile.wins              // sets won
profile.losses            // sets lost
profile.getTotalSets()    // wins + losses
profile.getTotalCharacterGames() // sum of character games
profile.getWinRate()      // % based on sets
```

> **Important:**
>
> * Wins/Losses are **sets**
> * Character `gameCount` values are **games**

---

## Character Usage (Correct Percentages)

```js
player.getCharacterImages().forEach(c => {
  console.log(
    `${c.displayName}: ${c.gameCount} games (${c.percentage}%)`
  );
});
```

Percentages are calculated as:

```
character games / total character games
```

---

## Character Helpers

```js
import * as characters from 'slippi-api/characters';

characters.getCharacterId('FOX');
characters.getCharacterDisplayName('CAPTAIN_FALCON');
characters.getCharacterUrl('FALCO');
characters.getCharacterColor('MARTH');
characters.getAllCharacters();
characters.isValidCharacter('SHEIK');
```

---

## Rank Helpers

```js
import * as ranks from 'slippi-api/ranks';

ranks.getRank(elo, placement);
ranks.getRankTier('Gold 2');
ranks.getRankDivision('Platinum 3');
ranks.getRankRange('Diamond 1');
ranks.getAllRanks();
```

---

## Connect Code Validation

```js
SlippiAPI.isValidConnectCode('MANG#0'); // true
SlippiAPI.isValidConnectCode('BADCODE'); // false
```

---

## Rate Limiting

By default, requests are limited to **1 call per second**.

Custom rate limit:

```js
const api = new SlippiAPI({
  maxCalls: 2,
  periodMs: 1000
});
```

---

## Examples

Run the included examples:

```bash
node examples.js
```

They demonstrate:

* Single player fetch
* Multiple players
* Rank helpers
* Character usage
* Validation
* Custom rate limiting

---

## Disclaimer

This package uses Slippi’s internal GraphQL API and may break if Slippi changes their backend.
Use responsibly and avoid excessive request rates.

---

## License

MIT
