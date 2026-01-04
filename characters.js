/**
 * Character ID mappings
 */
export const CHARACTER_IDS = {
  'DONKEY_KONG': 0,
  'CAPTAIN_FALCON': 1,
  'FOX': 2,
  'GAME_AND_WATCH': 3,
  'KIRBY': 4,
  'BOWSER': 5,
  'LINK': 6,
  'LUIGI': 7,
  'MARIO': 8,
  'MARTH': 9,
  'MEWTWO': 10,
  'NESS': 11,
  'PEACH': 12,
  'PIKACHU': 13,
  'ICE_CLIMBERS': 14,
  'JIGGLYPUFF': 15,
  'SAMUS': 16,
  'YOSHI': 17,
  'ZELDA': 18,
  'SHEIK': 19,
  'FALCO': 20,
  'YOUNG_LINK': 21,
  'DR_MARIO': 22,
  'ROY': 23,
  'PICHU': 24,
  'GANONDORF': 25,
  'None': 256
};

/**
 * Character color codes
 */
export const CHARACTER_COLORS = {
  'DONKEY_KONG': '#2f1003',
  'CAPTAIN_FALCON': '#c51620',
  'FOX': '#ffb242',
  'GAME_AND_WATCH': '#000000',
  'KIRBY': '#ffbed8',
  'BOWSER': '#376218',
  'LINK': '#073f07',
  'LUIGI': '#10b91a',
  'MARIO': '#ff1d1c',
  'MARTH': '#2f3955',
  'MEWTWO': '#734c60',
  'NESS': '#f9ca58',
  'PEACH': '#ff5488',
  'PIKACHU': '#ffff00',
  'ICE_CLIMBERS': '#8a63ff',
  'JIGGLYPUFF': '#ffd6f0',
  'SAMUS': '#da490c',
  'YOSHI': '#008000',
  'ZELDA': '#ff6ac8',
  'SHEIK': '#828681',
  'FALCO': '#494fd6',
  'YOUNG_LINK': '#009e01',
  'DR_MARIO': '#d1cfc9',
  'ROY': '#962000',
  'PICHU': '#ffff1b',
  'GANONDORF': '#91763e'
};

const BASE_ICON_URL = 'https://slippi.gg/images/characters/stock-icon-';

/**
 * Gets character ID from name
 * @param {string} name - Character name (e.g., "FOX", "CAPTAIN_FALCON")
 * @param {boolean} dkClaus - Whether to use DK Claus mapping (255 instead of 0)
 * @returns {number|null} Character ID or null if not found
 */
export function getCharacterId(name, dkClaus = false) {
  const id = CHARACTER_IDS[name];
  
  if (id === undefined) {
    return null;
  }
  
  // Handle special Donkey Kong mapping
  if (dkClaus && id === 0) {
    return 255;
  }
  
  return id;
}

/**
 * Gets character name from ID
 * @param {number} id - Character ID
 * @returns {string|null} Character name or null if not found
 */
export function getCharacterName(id) {
  // Handle special DK case
  if (id === 255) {
    id = 0;
  }
  
  for (const [name, charId] of Object.entries(CHARACTER_IDS)) {
    if (charId === id) {
      return name;
    }
  }
  
  return null;
}

/**
 * Gets character icon URL
 * @param {string} name - Character name
 * @returns {string} URL to character stock icon
 */
export function getCharacterUrl(name) {
  const id = getCharacterId(name);
  
  if (id === null) {
    return `${BASE_ICON_URL}256-0.png`; // Default/None icon
  }
  
  return `${BASE_ICON_URL}${id}-0.png`;
}

/**
 * Gets character color
 * @param {string} name - Character name
 * @returns {string} Hex color code
 */
export function getCharacterColor(name) {
  return CHARACTER_COLORS[name] || '#000000';
}

/**
 * Gets all character names
 * @returns {string[]} Array of all character names
 */
export function getAllCharacters() {
  return Object.keys(CHARACTER_IDS).filter(name => name !== 'None');
}

/**
 * Checks if a character name is valid
 * @param {string} name - Character name to check
 * @returns {boolean} True if valid character
 */
export function isValidCharacter(name) {
  return name in CHARACTER_IDS;
}

/**
 * Gets character display name (formatted)
 * @param {string} name - Character name (e.g., "CAPTAIN_FALCON")
 * @returns {string} Formatted name (e.g., "Captain Falcon")
 */
export function getCharacterDisplayName(name) {
  if (!name || name === 'None') {
    return 'None';
  }
  
  return name
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}