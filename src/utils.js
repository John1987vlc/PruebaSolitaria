<repaired_file path="src/utils.js">
// src/utils.js
/**
 * Shared constants and math helpers for MagicCloneJS.
 * Defines game rules, card types, and utility functions.
 */

// ===== GAME CONSTANTS =====
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
  ],

  // SVG template for card rendering
  SVG_TEMPLATE: `
    <svg width="100" height="150" viewBox="0 0 100 150">
      <rect x="5" y="5" width="90" height="140" fill="#f0f0f0" rx="5" />
      <text x="50" y="30" text-anchor="middle" font-size="12" fill="#333">Card Name</text>
      <text x="50" y="50" text-anchor="middle" font-size="10" fill="#666">Type: Creature</text>
      <text x="50" y="70" text-anchor="middle" font-size="10" fill="#666">Mana: 2</text>
    </svg>
  `,

  // Health points (default for creatures)
  DEFAULT_HEALTH: 3,
};

// ===== MANA SYSTEM =====
class ManaSystem {
  constructor(manaPool = 0) {
    this.manaPool = manaPool;
    this.manaCosts = GameConstants.MANA_COSTS;
  }

  /**
   * Calculate mana cost for a card based on its color requirements.
   * @param {string[]} cardColors - Array of color strings (e.g., ['W', 'B']).
   * @returns {number} Total mana cost.
   */
  calculateCost(cardColors) {
    let cost = 0;
    const uniqueColors = [...new Set(cardColors)];

    uniqueColors.forEach(color => {
      const manaCost = this.manaCosts[color]?.MANA || 0;
      cost += manaCost;
    });

    return cost;
  }

  /**
   * Check if player can afford a card.
   * @param {number} manaCost - Mana cost of the card.
   * @returns {boolean} True if mana pool >= cost.
   */
  canAfford(manaCost) {
    return this.manaPool >= manaCost;
  }

  /**
   * Spend mana from the pool.
   * @param {number} manaCost - Mana to spend.
   * @returns {boolean} True if successful.
   */
  spendMana(manaCost) {
    if (this.manaPool >= manaCost) {
      this.manaPool -= manaCost;
      return true;
    }
    return false;
  }

  /**
   * Calculate mana cost for combined colors (e.g., 'WB' for White-Black).
   * @param {string} combinedColor - Combined color string (e.g., 'WB').
   * @returns {number} Mana cost for the combined color.
   */
  calculateCombinedColorCost(combinedColor) {
    return this.manaCosts[combinedColor]?.MANA || 0;
  }

  /**
   * Validate mana cost for a card with combined colors.
   * @param {string[]} cardColors - Array of color strings (e.g., ['W', 'B']).
   * @returns {boolean} True if mana cost can be calculated correctly.
   */
  validateManaCost(cardColors) {
    const uniqueColors = [...new Set(cardColors)];
    const combinedColor = uniqueColors.join('');

    // Check if combined color exists in manaCosts
    const combinedCost = this.manaCosts[combinedColor]?.MANA || 0;
    const individualCost = uniqueColors.reduce((sum, color) => sum + (this.manaCosts[color]?.MANA || 0), 0);

    return combinedCost === individualCost;
  }
}

// ===== CARD CLASS =====
class Card {
  constructor({
    name,
    type,
    manaCost,
    colors,
    health = GameConstants.DEFAULT_HEALTH,
    effects = [],
  }) {
    this.name = name;
    this.type = type;
    this.manaCost = manaCost;
    this.colors = colors;
    this.health = health;
    this.effects = effects;
  }

  /**
   * Apply effects to the card.
   * @param {Array} effects - Array of effect objects.
   */
  applyEffects(effects) {
    this.effects.push(...effects);
  }

  /**
   * Render card as SVG.
   * @returns {string} SVG string representation.
   */
  renderSVG() {
    const svgTemplate = GameConstants.SVG_TEMPLATE;
    const manaText = `Mana: ${this.manaCost}`;
    const healthText = `Health: ${this.health}`;

    return svgTemplate
      .replace('Card Name', this.name)
      .replace('Type:', `Type: ${this.type}`)
      .replace('Mana:', manaText)
      .replace('Health:', healthText);
  }

  /**
   * Calculate mana cost for the card based on its colors.
   * @returns {number} Total mana cost.
   */
  calculateCardManaCost() {
    return this.manaSystem.calculateCost(this.colors);
  }

  /**
   * Validate card mana cost against its stored manaCost.
   * @returns {boolean} True if mana cost matches.
   */
  validateManaCost() {
    return this.manaCost === this.calculateCardManaCost();
  }
}

// ===== EXPORTS =====
module.exports = {
  ManaSystem,
  Card,
  GameConstants,
};
</repaired_file>