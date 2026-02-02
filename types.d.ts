// Type definitions for Slippi API Wrapper

// ============================================================================
// Characters
// ============================================================================

export interface CharacterIDs {
  DONKEY_KONG: 0;
  CAPTAIN_FALCON: 1;
  FOX: 2;
  GAME_AND_WATCH: 3;
  KIRBY: 4;
  BOWSER: 5;
  LINK: 6;
  LUIGI: 7;
  MARIO: 8;
  MARTH: 9;
  MEWTWO: 10;
  NESS: 11;
  PEACH: 12;
  PIKACHU: 13;
  ICE_CLIMBERS: 14;
  JIGGLYPUFF: 15;
  SAMUS: 16;
  YOSHI: 17;
  ZELDA: 18;
  SHEIK: 19;
  FALCO: 20;
  YOUNG_LINK: 21;
  DR_MARIO: 22;
  ROY: 23;
  PICHU: 24;
  GANONDORF: 25;
  None: 256;
}

export type CharacterName = keyof CharacterIDs;
export type PlayableCharacterName = Exclude<CharacterName, 'None'>;

export declare namespace characters {
  export declare const CHARACTER_IDS: CharacterIDs;
  export declare const CHARACTER_COLORS: Partial<Record<PlayableCharacterName, string>>;

  export function getCharacterId(name: CharacterName, dkClaus?: boolean): number | null;
  export function getCharacterName(id: number): CharacterName | null;
  export function getCharacterUrl(name: string): string;
  export function getCharacterColor(name: string): string;
  export function getAllCharacters(): PlayableCharacterName[];
  export function isValidCharacter(name: string): boolean;
  export function getCharacterDisplayName(name: string): string;
}

// ============================================================================
// Ranks
// ============================================================================

export type RankName = 
  | 'Grandmaster'
  | 'Master 3'
  | 'Master 2'
  | 'Master 1'
  | 'Diamond 3'
  | 'Diamond 2'
  | 'Diamond 1'
  | 'Platinum 3'
  | 'Platinum 2'
  | 'Platinum 1'
  | 'Gold 3'
  | 'Gold 2'
  | 'Gold 1'
  | 'Silver 3'
  | 'Silver 2'
  | 'Silver 1'
  | 'Bronze 3'
  | 'Bronze 2'
  | 'Bronze 1'
  | 'None'
  | 'Pending';

export type RankTier = 
  | 'Grandmaster'
  | 'Master'
  | 'Diamond'
  | 'Platinum'
  | 'Gold'
  | 'Silver'
  | 'Bronze'
  | 'None'
  | 'Pending';

export declare namespace ranks {
  export interface RankRange {
    min: number;
    max: number;
  }

  export function getRank(elo: number, dailyGlobalPlacement?: number | null): RankName;
  export function getRankTier(rankName: RankName): RankTier;
  export function getRankDivision(rankName: RankName): number | null;
  export function getRankRange(rankName: RankName): RankRange | null;
  export function isRankHigher(rank1: RankName, rank2: RankName): boolean;
  export function getAllRanks(): RankName[];
}
// ============================================================================
// Character Class
// ============================================================================

export class Character {
  character: CharacterName;
  gameCount: number;

  constructor(data?: Partial<Character>);
  getIconUrl(): string;
  getId(dkClaus?: boolean): number | null;
}

// ============================================================================
// Ranked Netplay Profile
// ============================================================================

export class RankedNetplayProfile {
  id: string | null;
  ratingOrdinal: number;
  ratingUpdateCount: number | null;
  wins: number;
  losses: number;
  dailyGlobalPlacement: number | null;
  dailyRegionalPlacement: number | null;
  continent: string | null;
  characters: Character[];

  constructor(data?: Partial<RankedNetplayProfile>);
  getTotalSets(): number;
  getTotalCharacterGames(): number;
  getWinRate(): number;
}

// ============================================================================
// Slippi User
// ============================================================================

export interface SlippiUserSummary {
  displayName: string;
  connectCode: string;
  rank: RankName;
  rating: number;
  wins: number;
  losses: number;
  winRate: string;
  totalGames: number;
  mainCharacter: CharacterName | 'None';
  profileUrl: string;
  subscription: SubscriptionLevel;
  continent: string | null;
}

export class SlippiUser {
  displayName: string;
  connectCode: string;
  fbUid: string | null;
  status: string | null;
  subscription: SubscriptionStatus;
  rankedProfile: RankedNetplayProfile;

  constructor(slippiData: any);
  getRank(): RankName;
  getProfileUrl(): string;
  getMainCharacter(): Character | null;
  getCharactersSorted(): Character[];
  getMainCharacterImage(): string | null;
  getCharacterImages(): Array<{
    name: string;
    displayName: string;
    gameCount: number;
    percentage: number;
    imageUrl: string;
  }>;
  toJSON(): SlippiUserSummary;
  toString(): string;
}

// ============================================================================
// Slippi API
// ============================================================================

export interface SlippiAPIOptions {
  endpoint?: string;
  maxCalls?: number;
  periodMs?: number;
}

export class SlippiAPI {
  endpoint: string;
  
  constructor(options?: SlippiAPIOptions);
  
  static isValidConnectCode(connectCode: string): boolean;
  fetchPlayerData(connectCode: string): Promise<any>;
  getPlayer(connectCode: string): Promise<SlippiUser | null>;
  getPlayers(connectCodes: string[]): Promise<SlippiUser[]>;
  playerExists(connectCode: string): Promise<boolean>;
}

// ============================================================================
// Rate Limiter (internal)
// ============================================================================

declare class RateLimiter {
  constructor(maxCalls?: number, periodMs?: number);
  execute<T>(fn: () => T | Promise<T>): Promise<T>;
}