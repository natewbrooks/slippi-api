import { SlippiAPI } from './slippi-api.js';
import { getCharacterDisplayName } from './characters.js';

/**
 * Get character image URLs for a player's characters
 * @param {string} connectCode - Player's connect code
 * @returns {Promise<Object|null>} Player info with character image URLs
 */
export async function getPlayerCharacterImages(connectCode) {
  const api = new SlippiAPI();
  const player = await api.getPlayer(connectCode);

  if (!player) {
    return null;
  }

  const characters = player.getCharactersSorted();
  const totalGames = player.rankedProfile.getTotalCharacterGames();

  return {
    player: {
      displayName: player.displayName,
      connectCode: player.connectCode,
      rank: player.getRank(),
      rating: player.rankedProfile.ratingOrdinal
    },
    characters: characters.map(char => ({
      name: char.character,
      displayName: getCharacterDisplayName(char.character),
      gameCount: char.gameCount,
      percentage: totalGames > 0 ? parseFloat(((char.gameCount / totalGames) * 100).toFixed(1)) : 0,
      imageUrl: char.getIconUrl()
    }))
  };
}

/**
 * Get just the main character image URL
 * @param {string} connectCode - Player's connect code
 * @returns {Promise<string|null>} Main character image URL
 */
export async function getMainCharacterImage(connectCode) {
  const data = await getPlayerCharacterImages(connectCode);
  
  if (!data || data.characters.length === 0) {
    return null;
  }

  return data.characters[0].imageUrl;
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node get-character-images.js <connect_code>');
    console.log('Example: node get-character-images.js "MANG#0"');
    process.exit(1);
  }

  const connectCode = args[0];
  const data = await getPlayerCharacterImages(connectCode);

  if (!data) {
    console.log('Player not found');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(70));
  console.log(`${data.player.displayName} (${data.player.connectCode}) - ${data.player.rank}`);
  console.log('='.repeat(70) + '\n');

  console.log('Character Images:\n');
  data.characters.forEach((char, index) => {
    const isMain = index === 0 ? ' [MAIN]' : '';
    console.log(`${char.displayName}${isMain}`);
    console.log(`  Games: ${char.gameCount} (${char.percentage}%)`);
    console.log(`  Image: ${char.imageUrl}`);
    console.log();
  });

  // Also output as JSON for easy parsing
  console.log('\nJSON Output:');
  console.log(JSON.stringify(data, null, 2));
}