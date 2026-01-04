import fetch from 'node-fetch';
import { SlippiUser } from './slippi-user.js';

// GraphQL query for player data
const QUERY = `
query UserProfilePageQuery($cc: String, $uid: String) {
  getUser(connectCode: $cc, fbUid: $uid) {
    ...userProfilePage
    __typename
  }
}

fragment userProfilePage on User {
  fbUid
  displayName
  connectCode {
    code
    __typename
  }
  status
  activeSubscription {
    level
    hasGiftSub
    __typename
  }
  rankedNetplayProfile {
    ...profileFields
    __typename
  }
  rankedNetplayProfileHistory {
    ...profileFields
    season {
      id
      startedAt
      endedAt
      name
      status
      __typename
    }
    __typename
  }
  __typename
}

fragment profileFields on NetplayProfile {
  id
  ratingOrdinal
  ratingUpdateCount
  wins
  losses
  dailyGlobalPlacement
  dailyRegionalPlacement
  continent
  characters {
    character
    gameCount
    __typename
  }
  __typename
}
`;

/**
 * Simple rate limiter class
 */
class RateLimiter {
  constructor(maxCalls = 1, periodMs = 1000) {
    this.maxCalls = maxCalls;
    this.periodMs = periodMs;
    this.queue = [];
  }

  async execute(fn) {
    const now = Date.now();
    this.queue = this.queue.filter(time => now - time < this.periodMs);

    if (this.queue.length >= this.maxCalls) {
      const oldestCall = this.queue[0];
      const waitTime = this.periodMs - (now - oldestCall);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.execute(fn);
    }

    this.queue.push(now);
    return fn();
  }
}

/**
 * Main Slippi API client class
 */
export class SlippiAPI {
  constructor(options = {}) {
    this.endpoint = options.endpoint || 'https://internal.slippi.gg';
    this.rateLimiter = new RateLimiter(
      options.maxCalls || 1,
      options.periodMs || 1000
    );
  }

  /**
   * Validates a Slippi connect code format
   * @param {string} connectCode - The connect code to validate (e.g., "ABC#123")
   * @returns {boolean} True if valid, false otherwise
   */
  static isValidConnectCode(connectCode) {
    if (!connectCode || typeof connectCode !== 'string') {
      return false;
    }
    // Format: 1-7 letters, #, 1-7 digits (3-9 chars total)
    return /^(?=.{3,9}$)[a-zA-Z]{1,7}#[0-9]{1,7}$/.test(connectCode);
  }

  /**
   * Fetches player data from the Slippi API
   * @private
   * @param {string} connectCode - The player's connect code
   * @returns {Promise<Object>} The raw API response
   */
  async _fetchPlayerData(connectCode) {
    if (!SlippiAPI.isValidConnectCode(connectCode)) {
      throw new Error(`Invalid connect code: ${connectCode}`);
    }

    const upperCode = connectCode.toUpperCase();
    const payload = {
      operationName: 'UserProfilePageQuery',
      query: QUERY,
      variables: {
        cc: upperCode,
        uid: upperCode
      }
    };

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetches player data with rate limiting
   * @param {string} connectCode - The player's connect code
   * @returns {Promise<Object>} The raw API response
   */
  async fetchPlayerData(connectCode) {
    return this.rateLimiter.execute(() => this._fetchPlayerData(connectCode));
  }

  /**
   * Gets a player's ranked data as a SlippiUser object
   * @param {string} connectCode - The player's connect code
   * @returns {Promise<SlippiUser|null>} SlippiUser object or null if not found
   */
  async getPlayer(connectCode) {
    try {
      const data = await this.fetchPlayerData(connectCode);
      
      if (!data?.data?.getUser) {
        return null;
      }

      return new SlippiUser(data);
    } catch (error) {
      console.error(`Error fetching player ${connectCode}:`, error.message);
      return null;
    }
  }

  /**
   * Gets multiple players' data
   * @param {string[]} connectCodes - Array of connect codes
   * @returns {Promise<SlippiUser[]>} Array of SlippiUser objects (nulls filtered out)
   */
  async getPlayers(connectCodes) {
    const promises = connectCodes.map(code => this.getPlayer(code));
    const results = await Promise.all(promises);
    return results.filter(player => player !== null);
  }

  /**
   * Checks if a player exists
   * @param {string} connectCode - The player's connect code
   * @returns {Promise<boolean>} True if player exists, false otherwise
   */
  async playerExists(connectCode) {
    try {
      const data = await this.fetchPlayerData(connectCode);
      return !!(data?.data?.getUser);
    } catch (error) {
      return false;
    }
  }
}