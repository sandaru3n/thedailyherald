const Category = require('../models/Category');

class CategoryIdentificationService {
  constructor() {
    this.fetch = null;
  }

  // Initialize fetch dynamically
  async initFetch() {
    if (!this.fetch) {
      const fetchModule = await import('node-fetch');
      this.fetch = fetchModule.default;
    }
    return this.fetch;
  }

  // Identify the most appropriate category for an article using AI
  async identifyCategory(title, content) {
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        console.warn('GEMINI_API_KEY not configured, using fallback category identification');
        return await this.fallbackCategoryIdentification(title, content);
      }

      // Get all available categories
      const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
      
      if (categories.length === 0) {
        throw new Error('No active categories found');
      }

      const categoryNames = categories.map(cat => cat.name);
      const categoryDescriptions = categories.map(cat => `${cat.name}: ${cat.description || 'General news and updates'}`).join('\n');

      const prompt = this.generateCategoryIdentificationPrompt(title, content, categoryNames, categoryDescriptions);
      
      const fetch = await this.initFetch();
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API response:', errorText);
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          console.warn('Gemini API rate limit exceeded, using fallback category identification');
          return await this.fallbackCategoryIdentification(title, content);
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const aiResponse = data.candidates[0].content.parts[0].text.trim();
        return this.parseAIResponse(aiResponse, categories);
      } else {
        console.error('Invalid Gemini API response:', data);
        throw new Error('Invalid response from Gemini API');
      }
    } catch (error) {
      console.error('Error identifying category with AI:', error);
      // Return fallback category identification if AI fails
      return await this.fallbackCategoryIdentification(title, content);
    }
  }

  // Generate prompt for category identification
  generateCategoryIdentificationPrompt(title, content, categoryNames, categoryDescriptions) {
    return `
You are a news categorization expert. Analyze the following article and identify the most appropriate category from the available options.

Available categories:
${categoryDescriptions}

Article Title: ${title}

Article Content: ${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}

Instructions:
1. Analyze the title and content to understand the topic and theme
2. Consider the subject matter, tone, and target audience
3. Choose the most appropriate category from the provided list
4. Respond with ONLY the exact category name (case-sensitive)
5. If no category fits perfectly, choose the closest match

Respond with only the category name, nothing else.
`;
  }

  // Parse AI response to find the matching category
  parseAIResponse(aiResponse, categories) {
    const cleanResponse = aiResponse.trim().toLowerCase();
    
    // Find exact match first
    const exactMatch = categories.find(cat => 
      cat.name.toLowerCase() === cleanResponse
    );
    
    if (exactMatch) {
      return exactMatch;
    }

    // Find partial match
    const partialMatch = categories.find(cat => 
      cleanResponse.includes(cat.name.toLowerCase()) ||
      cat.name.toLowerCase().includes(cleanResponse)
    );
    
    if (partialMatch) {
      return partialMatch;
    }

    // If no match found, return the first category as fallback
    console.warn(`No category match found for AI response: "${aiResponse}". Using fallback.`);
    return categories[0];
  }

  // Fallback category identification using keyword matching
  async fallbackCategoryIdentification(title, content) {
    try {
      const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
      
      if (categories.length === 0) {
        throw new Error('No active categories found');
      }

      const text = `${title} ${content}`.toLowerCase();
      
      // Define keyword mappings for each category
      const categoryKeywords = {
        'Technology': ['tech', 'technology', 'software', 'hardware', 'ai', 'artificial intelligence', 'machine learning', 'programming', 'coding', 'startup', 'innovation', 'digital', 'computer', 'internet', 'web', 'app', 'mobile', 'cybersecurity'],
        'Politics': ['politics', 'political', 'government', 'election', 'vote', 'democrat', 'republican', 'congress', 'senate', 'president', 'policy', 'legislation', 'law', 'bill', 'campaign', 'politician'],
        'Business': ['business', 'economy', 'market', 'stock', 'finance', 'financial', 'investment', 'company', 'corporate', 'entrepreneur', 'startup', 'revenue', 'profit', 'trade', 'commerce', 'industry'],
        'Sports': ['sports', 'football', 'basketball', 'baseball', 'soccer', 'tennis', 'golf', 'olympics', 'championship', 'tournament', 'game', 'match', 'player', 'team', 'coach', 'athlete'],
        'Entertainment': ['entertainment', 'movie', 'film', 'music', 'celebrity', 'actor', 'actress', 'singer', 'artist', 'hollywood', 'tv', 'television', 'show', 'concert', 'award', 'oscar', 'grammy'],
        'Health': ['health', 'medical', 'medicine', 'doctor', 'hospital', 'disease', 'treatment', 'vaccine', 'covid', 'coronavirus', 'wellness', 'fitness', 'nutrition', 'mental health', 'therapy'],
        'Science': ['science', 'scientific', 'research', 'study', 'discovery', 'experiment', 'laboratory', 'scientist', 'physics', 'chemistry', 'biology', 'space', 'astronomy', 'climate', 'environment'],
        'World': ['world', 'international', 'global', 'foreign', 'country', 'nation', 'diplomacy', 'foreign policy', 'immigration', 'refugee', 'war', 'conflict', 'peace', 'treaty'],
        'Education': ['education', 'school', 'university', 'college', 'student', 'teacher', 'academic', 'learning', 'curriculum', 'degree', 'scholarship', 'research', 'study'],
        'Environment': ['environment', 'climate', 'weather', 'pollution', 'renewable', 'solar', 'wind', 'energy', 'conservation', 'wildlife', 'nature', 'forest', 'ocean', 'sustainability']
      };

      // Calculate scores for each category
      const categoryScores = {};
      
      categories.forEach(category => {
        const keywords = categoryKeywords[category.name] || [];
        let score = 0;
        
        keywords.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          const matches = text.match(regex);
          if (matches) {
            score += matches.length;
          }
        });
        
        categoryScores[category._id] = score;
      });

      // Find category with highest score
      let bestCategory = categories[0];
      let highestScore = 0;

      Object.entries(categoryScores).forEach(([categoryId, score]) => {
        if (score > highestScore) {
          highestScore = score;
          bestCategory = categories.find(cat => cat._id.toString() === categoryId);
        }
      });

      return bestCategory;
    } catch (error) {
      console.error('Error in fallback category identification:', error);
      // Return first available category as ultimate fallback
      const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
      return categories[0] || null;
    }
  }

  // Get category confidence score (0-1)
  async getCategoryConfidence(title, content, categoryId) {
    try {
      const identifiedCategory = await this.identifyCategory(title, content);
      return identifiedCategory._id.toString() === categoryId.toString() ? 1.0 : 0.0;
    } catch (error) {
      console.error('Error getting category confidence:', error);
      return 0.5; // Default confidence
    }
  }
}

module.exports = new CategoryIdentificationService();