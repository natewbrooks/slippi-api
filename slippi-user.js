import { getRank } from './ranks.js';
import { getCharacterId, getCharacterUrl, getCharacterDisplayName } from './characters.js';

/**
 * Represents a character with game count
 */
export class Character {
  constructor(data = {}) {
    this.character = data.character || '';
    this.gameCount = data.gameCount || 0;
  }

  /**
   * Gets the character's icon URL
   * @returns {string} URL to character icon
   */
  getIconUrl() {
    return getCharacterUrl(this.character);
  }

  /**
   * Gets the character's ID
   * @param {boolean} dkClaus - Whether to use special Donkey Kong mapping
   * @returns {number} Character ID
   */
  getId(dkClaus = false) {
    return getCharacterId(this.character, dkClaus);
  }
}

/**
 * Represents a ranked netplay profile
 */
export class RankedNetplayProfile {
  constructor(data = {}) {
    this.id = data.id || null;
    this.ratingOrdinal = data.ratingOrdinal || 1100;
    this.ratingUpdateCount = data.ratingUpdateCount || null;
    this.wins = data.wins || 0;
    this.losses = data.losses || 0;
    this.dailyGlobalPlacement = data.dailyGlobalPlacement || null;
    this.dailyRegionalPlacement = data.dailyRegionalPlacement || null;
    this.continent = data.continent || null;
    this.characters = (data.characters || []).map(char => new Character(char));
  }

  /**
   * Gets total games played
   * @returns {number} Total games
   */
  getTotalGames() {
    return this.wins + this.losses;
  }

  /**
   * Gets win rate as a percentage
   * @returns {number} Win rate (0-100)
   */
  getWinRate() {
    const total = this.getTotalGames();
    return total > 0 ? (this.wins / total) * 100 : 0;
  }
}

/**
 * Represents subscription status
 */
export class SubscriptionStatus {
  constructor(data = {}) {
    this.level = data.level || 'NONE';
    this.hasGiftSub = data.hasGiftSub || false;
    this.active = this.level !== 'NONE';
  }
}

/**
 * Represents a Slippi user with profile and stats
 */
export class SlippiUser {
  constructor(slippiData) {
    if (!slippiData?.data?.getUser) {
      throw new Error('Invalid Slippi data provided');
    }

    const userData = slippiData.data.getUser;
    const rankedData = userData.rankedNetplayProfile;

    // Basic user info
    this.displayName = userData.displayName || '';
    this.connectCode = userData.connectCode?.code || '';
    this.fbUid = userData.fbUid || null;
    this.status = userData.status || null;

    // Subscription status
    this.subscription = new SubscriptionStatus(userData.activeSubscription || {});

    // Ranked profile
    this.rankedProfile = new RankedNetplayProfile(rankedData || {});
  }

  /**
   * Gets the user's current rank
   * @returns {string} Rank name (e.g., "Gold 2", "Master 1", "Grandmaster")
   */
  getRank() {
    const totalGames = this.rankedProfile.getTotalGames();
    
    // Check if they've played placement games
    if (totalGames < 5) {
      return totalGames === 0 ? 'None' : 'Pending';
    }

    return getRank(
      this.rankedProfile.ratingOrdinal,
      this.rankedProfile.dailyGlobalPlacement
    );
  }

  /**
   * Gets the user's profile page URL
   * @returns {string} Slippi.gg profile URL
   */
  getProfileUrl() {
    return `https://slippi.gg/user/${this.connectCode.replace('#', '-')}`;
  }

  /**
   * Gets the user's most played character
   * @returns {Character|null} Most played character
   */
  getMainCharacter() {
    if (this.rankedProfile.characters.length === 0) {
      return null;
    }

    return this.rankedProfile.characters.reduce((max, char) => 
      char.gameCount > max.gameCount ? char : max
    );
  }

  /**
   * Gets all characters sorted by game count
   * @returns {Character[]} Characters sorted by play count (descending)
   */
  getCharactersSorted() {
    return [...this.rankedProfile.characters].sort((a, b) => 
      b.gameCount - a.gameCount
    );
  }

  /**
   * Gets character image URLs for all characters played
   * @returns {Array<{name: string, displayName: string, gameCount: number, percentage: number, imageUrl: string}>}
   */
  getCharacterImages() {
    const totalGames = this.rankedProfile.getTotalGames();
    
    return this.getCharactersSorted().map(char => ({
      name: char.character,
      displayName: getCharacterDisplayName(char.character),
      gameCount: char.gameCount,
      percentage: totalGames > 0 ? parseFloat(((char.gameCount / totalGames) * 100).toFixed(1)) : 0,
      imageUrl: char.getIconUrl()
    }));
  }

  /**
   * Gets the main character's image URL
   * @returns {string|null} Image URL or null if no characters
   */
  getMainCharacterImage() {
    const main = this.getMainCharacter();
    return main ? main.getIconUrl() : null;
  }

  /**
   * Returns a formatted summary of the user
   * @returns {Object} User summary object
   */
  toJSON() {
    return {
      displayName: this.displayName,
      connectCode: this.connectCode,
      rank: this.getRank(),
      rating: this.rankedProfile.ratingOrdinal,
      wins: this.rankedProfile.wins,
      losses: this.rankedProfile.losses,
      winRate: this.rankedProfile.getWinRate().toFixed(2) + '%',
      totalGames: this.rankedProfile.getTotalGames(),
      mainCharacter: this.getMainCharacter()?.character || 'None',
      profileUrl: this.getProfileUrl(),
      subscription: this.subscription.level,
      continent: this.rankedProfile.continent
    };
  }

  /**
   * Returns a formatted string representation
   * @returns {string} Formatted user info
   */
  toString() {
    const main = this.getMainCharacter();
    return [
      `${this.displayName} (${this.connectCode})`,
      `Rank: ${this.getRank()} (${this.rankedProfile.ratingOrdinal})`,
      `Record: ${this.rankedProfile.wins}W - ${this.rankedProfile.losses}L (${this.rankedProfile.getWinRate().toFixed(1)}%)`,
      `Main: ${main ? main.character : 'None'}`,
      `Profile: ${this.getProfileUrl()}`
    ].join('\n');
  }
}