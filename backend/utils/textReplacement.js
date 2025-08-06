const Settings = require('../models/Settings');

/**
 * Apply text replacement rules to a given text
 * @param {string} text - The text to process
 * @param {Array} rules - Array of replacement rules
 * @returns {string} - The processed text
 */
function applyTextReplacements(text, rules = []) {
  if (!text || !rules || !Array.isArray(rules)) {
    return text;
  }

  let result = text;

  // Apply each active replacement rule
  for (const rule of rules) {
    if (rule.isActive && rule.find && rule.replace) {
      try {
        // Escape special regex characters in the find text
        const escapedFind = rule.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedFind, 'g');
        result = result.replace(regex, rule.replace);
      } catch (error) {
        console.error('Error applying text replacement rule:', error);
        // Continue with other rules even if one fails
      }
    }
  }

  return result;
}

/**
 * Get text replacement rules from settings and apply them to text
 * @param {string} text - The text to process
 * @returns {Promise<string>} - The processed text
 */
async function processTextWithReplacements(text) {
  try {
    const settings = await Settings.getSettings();
    
    if (!settings.textReplacements || !settings.textReplacements.enabled) {
      return text;
    }

    return applyTextReplacements(text, settings.textReplacements.rules);
  } catch (error) {
    console.error('Error processing text with replacements:', error);
    return text; // Return original text if processing fails
  }
}

/**
 * Process RSS feed item with text replacements
 * @param {Object} item - RSS feed item
 * @returns {Promise<Object>} - Processed RSS item
 */
async function processRssItem(item) {
  try {
    const settings = await Settings.getSettings();
    
    if (!settings.textReplacements || !settings.textReplacements.enabled) {
      return item;
    }

    const processedItem = { ...item };

    // Apply replacements to title
    if (processedItem.title) {
      processedItem.title = applyTextReplacements(processedItem.title, settings.textReplacements.rules);
    }

    // Apply replacements to description/content
    if (processedItem.description) {
      processedItem.description = applyTextReplacements(processedItem.description, settings.textReplacements.rules);
    }

    // Apply replacements to content if it exists
    if (processedItem.content) {
      processedItem.content = applyTextReplacements(processedItem.content, settings.textReplacements.rules);
    }

    return processedItem;
  } catch (error) {
    console.error('Error processing RSS item with replacements:', error);
    return item; // Return original item if processing fails
  }
}

module.exports = {
  applyTextReplacements,
  processTextWithReplacements,
  processRssItem
}; 