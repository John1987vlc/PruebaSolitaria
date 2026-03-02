// src/utils.js
/**
 * Shared utilities for MagicCloneJS, including mana system, card logic, and game constants.
 */

// === GAME CONSTANTS ===
const GameConstants = {
  // Mana costs (color combinations)
  MANA_COSTS: {
    WHITE: { MANA: 1, COLOR: 'W' },
    BLACK: { MANA: 1, COLOR: 'B' },
    BLUE: { MANA: 2, COLOR: 'U' },
    RED: { MANA: 3, COLOR: 'R' },
    GREEN: { MANA: 2, COLOR: 'G' },
    // Combined colors (e.g., 1W + 1B = 2Mana)
    WHITE_BLACK: { MANA: 2, COLOR: 'WB' },
    BLUE_RED: { MANA: 4, COLOR: 'UR' },
    RED_GREEN: { MANA: 4, COLOR: 'RG' },
    // Neutral mana (e.g., 1Mana)
    NEUTRAL: { MANA: 1, COLOR: 'N' },
    // Default mana pool (4 mana per turn)
    DEFAULT_MANA_POOL: 4,
  },

  // Card types (Magic: The Gathering standard)
  CARD_TYPES: [
    'Creature',
    'Artifact',
    'Enchantment',
    'Instant',
    'Sorcery',
    'Planeswalker',
    'Land',
    'Legendary',
    'Basic',
  ],

  // Card mana requirements (tap costs)
  TAP_COSTS: {
    CREATURE: 1,
    ARTIFACT: 0,
    ENCHANTMENT: 1,
    INSTANT: 0,
    SORCERY: 0,
    PLANESWALKER: 1,
    LAND: 1,
    LEGENDARY: 1,
    BASIC: 0,
  },

  // SVG templates for card rendering
  SVG_TEMPLATES: {
    CREATURE: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="90" height="80" fill="none" stroke="black" stroke-width="2"/>
      <text x="50" y="50" font-family="Arial" font-size="8" text-anchor="middle" fill="black">🐾</text>
      <text x="50" y="70" font-family="Arial" font-size="6" text-anchor="middle" fill="black">${(card.name || '').substring(0, 2)}</text>
    </svg>`,
    ARTIFACT: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="90" height="80" fill="none" stroke="black" stroke-width="2"/>
      <text x="50" y="50" font-family="Arial" font-size="8" text-anchor="middle" fill="black">🔧</text>
      <text x="50" y="70" font-family="Arial" font-size="6" text-anchor="middle" fill="black">${(card.name || '').substring(0, 2)}</text>
    </svg>`,
    LAND: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="90" height="80" fill="none" stroke="black" stroke-width="2"/>
      <text x="50" y="50" font-family="Arial" font-size="8" text-anchor="middle" fill="black">🌍</text>
      <text x="50" y="70" font-family="Arial" font-size="6" text-anchor="middle" fill="black">${(card.name || '').substring(0, 2)}</text>
    </svg>`,
    // Add more templates for other card types as needed
  },
};

// === MANA SYSTEM CLASS ===
class ManaSystem {
  constructor(manaPool = GameConstants.DEFAULT_MANA_POOL) {
    this.manaPool = manaPool;
    this.manaUsed = 0;
    this.manaGenerated = 0;
    this.manaHistory = [];
  }

  /**
   * Check if a card can be played with current mana pool
   * @param {Object} card - Card object with manaCost property
   * @returns {boolean} - True if card can be played
   */
  canPlayCard(card) {
    if (!card.manaCost) return false;

    // Calculate required mana based on mana costs
    const requiredMana = this.calculateManaCost(card.manaCost);
    return this.manaPool >= requiredMana;
  }

  /**
   * Calculate mana cost based on color combinations
   * @param {Object} manaCost - Object with color and mana properties
   * @returns {number} - Total mana cost
   */
  calculateManaCost(manaCost) {
    let totalMana = 0;
    for (const color in manaCost) {
      totalMana += manaCost[color].MANA;
    }
    return totalMana;
  }

  /**
   * Play a card and deduct mana
   * @param {Object} card - Card object with manaCost property
   * @returns {boolean} - True if card was played successfully
   */
  playCard(card) {
    if (!this.canPlayCard(card)) return false;

    const requiredMana = this.calculateManaCost(card.manaCost);
    this.manaUsed += requiredMana;
    this.manaPool -= requiredMana;
    this.manaHistory.push({
      action: 'play',
      card,
      manaUsed: requiredMana,
      remainingMana: this.manaPool,
    });

    return true;
  }

  /**
   * Tap a card (costs 1 mana per turn)
   * @param {Object} card - Card object with tapCost property
   * @returns {boolean} - True if card was tapped successfully
   */
  tapCard(card) {
    if (!card.tapCost || card.tapCost === 0) return false;

    if (this.manaPool < 1) return false;

    this.manaUsed += 1;
    this.manaPool -= 1;
    this.manaHistory.push({
      action: 'tap',
      card,
      manaUsed: 1,
      remainingMana: this.manaPool,
    });

    return true;
  }

  /**
   * Reset mana pool to default (4 mana)
   */
  resetManaPool() {
    this.manaPool = GameConstants.DEFAULT_MANA_POOL;
    this.manaUsed = 0;
    this.manaHistory = [];
  }

  /**
   * Get current mana pool
   * @returns {number} - Current mana pool
   */
  getManaPool() {
    return this.manaPool;
  }

  /**
   * Get mana history
   * @returns {Array} - Array of mana history entries
   */
  getManaHistory() {
    return [...this.manaHistory];
  }
}

// === CARD CLASS ===
class Card {
  constructor(name, manaCost, type, power = 1, toughness = 1, effects = []) {
    this.name = name;
    this.manaCost = manaCost;
    this.type = type;
    this.power = power;
    this.toughness = toughness;
    this.effects = effects;
    this.tapped = false;
    this.manaGenerated = 0;
    this.manaCosts = this.calculateManaCosts();
  }

  /**
   * Calculate mana costs for the card based on type
   * @returns {Object} - Object with mana costs for each color
   */
  calculateManaCosts() {
    const costs = {};
    if (this.type === 'Creature' || this.type === 'Planeswalker') {
      costs.WHITE = { MANA: 1, COLOR: 'W' };
      costs.BLACK = { MANA: 1, COLOR: 'B' };
    } else if (this.type === 'Artifact') {
      costs.NEUTRAL = { MANA: 1, COLOR: 'N' };
    } else if (this.type === 'Land') {
      costs.NEUTRAL = { MANA: 1, COLOR: 'N' };
    } else {
      // Default to single color mana cost
      costs.WHITE = { MANA: 1, COLOR: 'W' };
    }
    return costs;
  }

  /**
   * Render card as SVG
   * @returns {string} - SVG representation of the card
   */
  renderSVG() {
    const typeKey = this.type.toLowerCase();
    const template = GameConstants.SVG_TEMPLATES[typeKey] || this.renderDefaultSVG();
    return template;
  }

  /**
   * Default SVG rendering if template not found
   * @returns {string} - Default SVG representation
   */
  renderDefaultSVG() {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="90" height="80" fill="none" stroke="black" stroke-width="2"/>
      <text x="50" y="50" font-family="Arial" font-size="8" text-anchor="middle" fill="black">🎲</text>
      <text x="50" y="70" font-family="Arial" font-size="6" text-anchor="middle" fill="black">${this.name.substring(0, 2)}</text>
    </svg>`;
  }

  /**
   * Tap the card (costs 1 mana)
   */
  tap() {
    this.tapped = true;
    this.manaGenerated = 1; // Generates 1 mana when tapped
  }
}

// Export all required classes and constants
export { ManaSystem, Card, GameConstants };