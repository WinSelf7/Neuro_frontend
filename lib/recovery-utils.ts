/**
 * Recovery phrase generation and validation utilities
 */

// BIP39 wordlist (first 100 words for demo - in production use full 2048 word list)
const BIP39_WORDLIST = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
  'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
  'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
  'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
  'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter',
  'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger',
  'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
  'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic',
  'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest'
];

/**
 * Generate a random 12-word recovery phrase
 */
export function generateRecoveryPhrase(): string[] {
  const words: string[] = [];
  
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * BIP39_WORDLIST.length);
    words.push(BIP39_WORDLIST[randomIndex]);
  }
  
  return words;
}

/**
 * Validate a recovery phrase (check if all words are in the wordlist)
 */
export function validateRecoveryPhrase(phrase: string[]): boolean {
  if (phrase.length !== 12) {
    return false;
  }
  
  return phrase.every(word => BIP39_WORDLIST.includes(word.toLowerCase()));
}

/**
 * Convert recovery phrase to a single string
 */
export function phraseToString(phrase: string[]): string {
  return phrase.join(' ');
}

/**
 * Convert string back to recovery phrase array
 */
export function stringToPhrase(phraseString: string): string[] {
  return phraseString.trim().split(/\s+/);
}

/**
 * Generate a simple hash for recovery phrase (for demo purposes)
 * In production, use proper cryptographic hashing
 */
export function generateRecoveryHash(phrase: string[]): string {
  const phraseString = phraseToString(phrase);
  let hash = 0;
  
  for (let i = 0; i < phraseString.length; i++) {
    const char = phraseString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Generate recovery data for a new user
 */
export function generateRecoveryData() {
  const phrase = generateRecoveryPhrase();
  const phraseString = phraseToString(phrase);
  const hash = generateRecoveryHash(phrase);
  
  return {
    phrase,
    phraseString,
    hash,
    createdAt: new Date().toISOString()
  };
}
