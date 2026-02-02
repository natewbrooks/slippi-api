#!/usr/bin/env node

import { SlippiAPI } from './slippi-api.js';

/**
 * Simple CLI tool to fetch Slippi player data
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node cli.js <connect_code> [connect_code2] [connect_code3] ...');
    console.log('Example: node cli.js "ABC#123" "XYZ#456"');
    process.exit(1);
  }

  const api = new SlippiAPI();

  console.log(`Fetching data for ${args.length} player(s)...\n`);

  try {
    const players = await api.getPlayers(args);

    if (players.length === 0) {
      console.log('No players found.');
      return;
    }

    players.forEach((player, index) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Player ${index + 1}:`);
      console.log('='.repeat(60));
      console.log(player.toString());
      
      // Show character breakdown
      const chars = player.getCharactersSorted();
      if (chars.length > 0) {
        console.log('\nCharacter Usage:');
        const totalGames = player.rankedProfile.getTotalCharacterGames();

        chars.forEach(char => {
          const percentage = ((char.gameCount / totalGames) * 100).toFixed(1);
          console.log(`  ${char.character}: ${char.gameCount} games (${percentage}%)`);
        });
      }
    });

    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();