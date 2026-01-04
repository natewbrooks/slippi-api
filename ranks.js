/**
 * Rank definitions with ELO boundaries
 */
const RANKS = [
  { name: 'Bronze 1', min: 0, max: 765.42 },
  { name: 'Bronze 2', min: 765.43, max: 913.71 },
  { name: 'Bronze 3', min: 913.72, max: 1054.86 },
  { name: 'Silver 1', min: 1054.87, max: 1188.87 },
  { name: 'Silver 2', min: 1188.88, max: 1315.74 },
  { name: 'Silver 3', min: 1315.75, max: 1435.47 },
  { name: 'Gold 1', min: 1435.48, max: 1548.06 },
  { name: 'Gold 2', min: 1548.07, max: 1653.51 },
  { name: 'Gold 3', min: 1653.52, max: 1751.82 },
  { name: 'Platinum 1', min: 1751.83, max: 1842.99 },
  { name: 'Platinum 2', min: 1843, max: 1927.02 },
  { name: 'Platinum 3', min: 1927.03, max: 2003.91 },
  { name: 'Diamond 1', min: 2003.92, max: 2073.66 },
  { name: 'Diamond 2', min: 2073.67, max: 2136.27 },
  { name: 'Diamond 3', min: 2136.28, max: 2191.74 },
  { name: 'Master 1', min: 2191.75, max: 2274.99 },
  { name: 'Master 2', min: 2275, max: 2350 },
  { name: 'Master 3', min: 2350, max: Infinity }
];

const GRANDMASTER_THRESHOLD = 2191.75;

/**
 * Gets the rank name based on ELO rating and placement
 * @param {number} elo - The player's ELO rating
 * @param {number|null} dailyGlobalPlacement - Daily global placement (required for Grandmaster)
 * @returns {string} The rank name
 */
export function getRank(elo, dailyGlobalPlacement = null) {
  // Check for Grandmaster rank
  if (dailyGlobalPlacement && elo >= GRANDMASTER_THRESHOLD) {
    return 'Grandmaster';
  }

  // Find matching rank
  for (const rank of RANKS) {
    if (elo >= rank.min && elo < rank.max) {
      return rank.name;
    }
  }

  // Fallback to highest rank
  return RANKS[RANKS.length - 1].name;
}

/**
 * Gets rank tier from rank name
 * @param {string} rankName - The rank name
 * @returns {string} The tier (Bronze, Silver, Gold, etc.)
 */
export function getRankTier(rankName) {
  if (rankName === 'Grandmaster') return 'Grandmaster';
  if (rankName === 'None' || rankName === 'Pending') return rankName;
  return rankName.split(' ')[0];
}

/**
 * Gets rank division from rank name
 * @param {string} rankName - The rank name
 * @returns {number|null} The division number (1, 2, 3) or null
 */
export function getRankDivision(rankName) {
  if (rankName === 'Grandmaster' || rankName === 'None' || rankName === 'Pending') {
    return null;
  }
  const parts = rankName.split(' ');
  return parts.length > 1 ? parseInt(parts[1]) : null;
}

/**
 * Gets the ELO range for a rank
 * @param {string} rankName - The rank name
 * @returns {{min: number, max: number}|null} The ELO range or null if not found
 */
export function getRankRange(rankName) {
  const rank = RANKS.find(r => r.name === rankName);
  return rank ? { min: rank.min, max: rank.max } : null;
}

/**
 * Checks if a rank is above another rank
 * @param {string} rank1 - First rank name
 * @param {string} rank2 - Second rank name
 * @returns {boolean} True if rank1 is higher than rank2
 */
export function isRankHigher(rank1, rank2) {
  if (rank1 === 'Grandmaster') return rank2 !== 'Grandmaster';
  if (rank2 === 'Grandmaster') return false;
  
  const idx1 = RANKS.findIndex(r => r.name === rank1);
  const idx2 = RANKS.findIndex(r => r.name === rank2);
  
  return idx1 > idx2;
}

/**
 * Gets all available ranks
 * @returns {string[]} Array of all rank names
 */
export function getAllRanks() {
  return ['Grandmaster', ...RANKS.map(r => r.name)];
}