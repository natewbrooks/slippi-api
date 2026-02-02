import { SlippiAPI } from './slippi-api.js';
import { getRank, getRankTier, getAllRanks } from './ranks.js';
import { getCharacterDisplayName, getAllCharacters } from './characters.js';

/**
 * Example usage of the Slippi API wrapper
 */

async function basicUsage() {
  console.log('\n=== Basic Usage ===\n');
  
  const api = new SlippiAPI();
  
  // Fetch a single player
  const player = await api.getPlayer('MANG#0');
  
  if (player) {
    console.log('Player found!');
    console.log(player.toString());
    console.log('\nJSON representation:');
    console.log(JSON.stringify(player.toJSON(), null, 2));
  } else {
    console.log('Player not found');
  }
}

async function multiplePlayers() {
  console.log('\n=== Fetching Multiple Players ===\n');
  
  const api = new SlippiAPI();
  const connectCodes = ['MANG#0', 'ZAIN#0', 'IBDW#0'];
  
  const players = await api.getPlayers(connectCodes);
  
  console.log(`Found ${players.length} out of ${connectCodes.length} players\n`);
  
  // Compare players
  if (players.length > 1) {
    const sorted = players.sort((a, b) => 
      b.rankedProfile.ratingOrdinal - a.rankedProfile.ratingOrdinal
    );
    
    console.log('Players ranked by ELO:');
    sorted.forEach((p, i) => {
      console.log(
        `${i + 1}. ${p.displayName} (${p.connectCode}) - ` +
        `${p.getRank()} (${p.rankedProfile.ratingOrdinal.toFixed(0)})`
      );
    });
  }
}

async function playerStats() {
  console.log('\n=== Detailed Player Stats ===\n');
  
  const api = new SlippiAPI();
  const player = await api.getPlayer('MANG#0');
  
  if (!player) {
    console.log('Player not found');
    return;
  }
  
  const profile = player.rankedProfile;
  
  console.log(`Display Name: ${player.displayName}`);
  console.log(`Connect Code: ${player.connectCode}`);
  console.log(`Rank: ${player.getRank()}`);
  console.log(`Rating: ${profile.ratingOrdinal.toFixed(2)}`);
  console.log(`Record: ${profile.wins}W - ${profile.losses}L`);
  console.log(`Win Rate: ${profile.getWinRate().toFixed(2)}%`);
  console.log(`Total Games: ${profile.getTotalSets()}`);
  console.log(`Continent: ${profile.continent || 'Unknown'}`);
  
  if (profile.dailyGlobalPlacement) {
    console.log(`Global Placement: #${profile.dailyGlobalPlacement}`);
  }
  
  if (profile.dailyRegionalPlacement) {
    console.log(`Regional Placement: #${profile.dailyRegionalPlacement}`);
  }
  
  console.log(`Subscription: ${player.subscription.level}`);
  console.log(`Profile URL: ${player.getProfileUrl()}`);
  
  // Character breakdown
  const mainChar = player.getMainCharacter();
  if (mainChar) {
    console.log(`\nMain Character: ${getCharacterDisplayName(mainChar.character)}`);
    console.log(`Games with main: ${mainChar.gameCount}`);
    
    const chars = player.getCharactersSorted();
    if (chars.length > 1) {
      console.log('\nAll Characters:');
      chars.forEach(char => {
        const percentage = ((char.gameCount / profile.getTotalSets()) * 100).toFixed(1);
        console.log(
          `  ${getCharacterDisplayName(char.character).padEnd(20)} ` +
          `${char.gameCount.toString().padStart(4)} games (${percentage.padStart(5)}%)`
        );
      });
    }
  }
}

async function validateConnectCode() {
  console.log('\n=== Connect Code Validation ===\n');
  
  const testCodes = [
    'MANG#0',      // Valid
    'ABC#123',     // Valid
    'TEST#99',     // Valid
    'INVALID',     // Invalid - no #
    'TOO#LONG123', // Invalid - too long
    'A#1',         // Valid - minimum length
    '#123',        // Invalid - no letters
    'ABC#',        // Invalid - no numbers
  ];
  
  testCodes.forEach(code => {
    const isValid = SlippiAPI.isValidConnectCode(code);
    console.log(`${code.padEnd(15)} - ${isValid ? '✓ Valid' : '✗ Invalid'}`);
  });
}

async function checkPlayerExists() {
  console.log('\n=== Check Player Existence ===\n');
  
  const api = new SlippiAPI();
  
  const codes = ['MANG#0', 'NOTREAL#999'];
  
  for (const code of codes) {
    const exists = await api.playerExists(code);
    console.log(`${code}: ${exists ? 'Exists' : 'Does not exist'}`);
  }
}

async function rankExamples() {
  console.log('\n=== Rank System Examples ===\n');
  
  const eloValues = [500, 1000, 1500, 2000, 2200, 2400];
  
  console.log('ELO to Rank conversions:');
  eloValues.forEach(elo => {
    const rank = getRank(elo);
    const tier = getRankTier(rank);
    console.log(`ELO ${elo} = ${rank} (${tier} tier)`);
  });
  
  console.log('\nAll available ranks:');
  console.log(getAllRanks().join(', '));
}

async function characterExamples() {
  console.log('\n=== Character System Examples ===\n');
  
  const topCharacters = ['FOX', 'FALCO', 'MARTH', 'SHEIK', 'JIGGLYPUFF'];
  
  console.log('Character information:');
  topCharacters.forEach(char => {
    const displayName = getCharacterDisplayName(char);
    console.log(`${char} => ${displayName}`);
  });
  
  console.log(`\nTotal characters: ${getAllCharacters().length}`);
}

async function customRateLimiting() {
  console.log('\n=== Custom Rate Limiting ===\n');
  
  // Create API with custom rate limit (2 calls per second)
  const api = new SlippiAPI({
    maxCalls: 2,
    periodMs: 1000
  });
  
  console.log('Fetching 5 players with 2 calls/second rate limit...');
  const start = Date.now();
  
  const codes = ['MANG#0', 'ZAIN#0', 'IBDW#0', 'HBOX#0', 'LEFFEN#0'];
  const players = await api.getPlayers(codes);
  
  const elapsed = Date.now() - start;
  console.log(`Fetched ${players.length} players in ${(elapsed / 1000).toFixed(2)} seconds`);
}

// Run all examples
async function runAllExamples() {
  try {
    await basicUsage();
    await multiplePlayers();
    await playerStats();
    await validateConnectCode();
    await checkPlayerExists();
    await rankExamples();
    await characterExamples();
    await customRateLimiting();
    
    console.log('\n✓ All examples completed successfully!\n');
  } catch (error) {
    console.error('\n✗ Error running examples:', error.message);
    console.error(error.stack);
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

export {
  basicUsage,
  multiplePlayers,
  playerStats,
  validateConnectCode,
  checkPlayerExists,
  rankExamples,
  characterExamples,
  customRateLimiting
};