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
Rewrite this [${title} - ${content.substring(0, 1500)}${content.length > 1500 ? '...' : ''}] to sound natural, engaging, and conversational, like a human wrote it. Use varied sentence lengths, avoid robotic phrasing, and incorporate a friendly tone.

Available categories:
${categoryDescriptions}

CRITICAL INSTRUCTIONS:
1. **Primary Focus Analysis**: Identify the MAIN topic and primary focus of the article
2. **Context Evaluation**: Consider the broader context, not just individual keywords
3. **Audience Perspective**: Think about how readers would categorize this content
4. **Exact Match Requirement**: Respond with ONLY the exact category name from the provided list
5. **Case Sensitivity**: Use the exact case as shown in the category list
6. **Confidence Check**: If you're unsure, choose the most logical category based on the primary theme

ANALYSIS GUIDELINES:
- Technology: Focus on tech innovations, software, hardware, digital trends, AI, programming
- Politics: Government actions, elections, policy decisions, political figures, legislation
- Business: Economic news, corporate developments, market trends, financial reports
- Sports: Athletic events, sports teams, athletes, competitions, sports industry
- Entertainment: Movies, music, celebrities, arts, media, cultural events
- Health: Medical news, healthcare, wellness, medical research, public health
- Science: Scientific discoveries, research studies, academic findings, space exploration
- World: International relations, global events, foreign policy, international conflicts
- Education: Academic news, educational policy, student affairs, learning trends
- Environment: Climate change, environmental policy, conservation, natural resources

Respond with ONLY the exact category name, nothing else.
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

    // Find partial match with improved logic
    const partialMatch = categories.find(cat => {
      const categoryName = cat.name.toLowerCase();
      return cleanResponse.includes(categoryName) ||
             categoryName.includes(cleanResponse) ||
             cleanResponse.split(' ').some(word => categoryName.includes(word)) ||
             categoryName.split(' ').some(word => cleanResponse.includes(word));
    });
    
    if (partialMatch) {
      return partialMatch;
    }

    // If no match found, return the first category as fallback
    console.warn(`No category match found for AI response: "${aiResponse}". Using fallback.`);
    return categories[0];
  }

  // Enhanced fallback category identification using improved keyword matching
  async fallbackCategoryIdentification(title, content) {
    try {
      const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
      
      if (categories.length === 0) {
        throw new Error('No active categories found');
      }

      const text = `${title} ${content}`.toLowerCase();
      
      // Enhanced keyword mappings with weighted scoring
      const categoryKeywords = {
        'Technology': {
          primary: ['technology', 'tech', 'software', 'hardware', 'ai', 'artificial intelligence', 'machine learning', 'programming', 'coding', 'startup', 'innovation', 'digital', 'computer', 'internet', 'web', 'app', 'mobile', 'cybersecurity', 'blockchain', 'cryptocurrency', 'bitcoin', 'ethereum', 'metaverse', 'vr', 'ar', 'virtual reality', 'augmented reality'],
          secondary: ['algorithm', 'data', 'cloud', 'database', 'server', 'network', 'wireless', '5g', 'smartphone', 'laptop', 'gaming', 'esports', 'streaming', 'social media', 'facebook', 'twitter', 'instagram', 'tiktok', 'youtube', 'netflix', 'amazon', 'google', 'apple', 'microsoft', 'tesla', 'spacex', 'nvidia', 'amd', 'intel']
        },
        'Politics': {
          primary: ['politics', 'political', 'government', 'election', 'vote', 'democrat', 'republican', 'congress', 'senate', 'president', 'policy', 'legislation', 'law', 'bill', 'campaign', 'politician', 'senator', 'representative', 'governor', 'mayor', 'biden', 'trump', 'obama', 'clinton'],
          secondary: ['democracy', 'republic', 'constitution', 'amendment', 'federal', 'state', 'local', 'bipartisan', 'partisan', 'lobbyist', 'lobbying', 'polls', 'polling', 'debate', 'rally', 'convention', 'inauguration', 'impeachment', 'veto', 'executive order', 'supreme court', 'judiciary', 'attorney general', 'secretary', 'cabinet']
        },
        'Business': {
          primary: ['business', 'economy', 'market', 'stock', 'finance', 'financial', 'investment', 'company', 'corporate', 'entrepreneur', 'startup', 'revenue', 'profit', 'trade', 'commerce', 'industry', 'wall street', 'nasdaq', 'dow jones', 's&p 500', 'federal reserve', 'fed', 'interest rate', 'inflation', 'recession', 'gdp'],
          secondary: ['earnings', 'quarterly', 'annual', 'merger', 'acquisition', 'ipo', 'initial public offering', 'venture capital', 'private equity', 'hedge fund', 'mutual fund', 'etf', 'bond', 'treasury', 'commodity', 'oil', 'gas', 'gold', 'silver', 'real estate', 'mortgage', 'loan', 'credit', 'debt', 'bankruptcy', 'layoff', 'hiring', 'unemployment']
        },
        'Sports': {
          primary: ['sports', 'football', 'basketball', 'baseball', 'soccer', 'tennis', 'golf', 'olympics', 'championship', 'tournament', 'game', 'match', 'player', 'team', 'coach', 'athlete', 'nfl', 'nba', 'mlb', 'nhl', 'mls', 'ncaa', 'college football', 'college basketball', 'super bowl', 'world series', 'stanley cup', 'nba finals'],
          secondary: ['quarterback', 'running back', 'wide receiver', 'point guard', 'shooting guard', 'pitcher', 'batter', 'goalie', 'forward', 'defender', 'midfielder', 'striker', 'referee', 'umpire', 'foul', 'penalty', 'touchdown', 'home run', 'goal', 'assist', 'rebound', 'steal', 'block', 'draft', 'free agency', 'trade deadline', 'playoff', 'championship']
        },
        'Entertainment': {
          primary: ['entertainment', 'movie', 'film', 'music', 'celebrity', 'actor', 'actress', 'singer', 'artist', 'hollywood', 'tv', 'television', 'show', 'concert', 'award', 'oscar', 'grammy', 'emmy', 'tony', 'golden globe', 'billboard', 'chart', 'album', 'single', 'tour', 'performance', 'red carpet', 'premiere'],
          secondary: ['director', 'producer', 'screenwriter', 'composer', 'lyricist', 'dancer', 'choreographer', 'comedian', 'stand-up', 'podcast', 'streaming', 'netflix', 'hulu', 'disney+', 'hbo', 'amazon prime', 'youtube', 'tiktok', 'instagram', 'twitter', 'social media', 'influencer', 'youtuber', 'streamer', 'gaming', 'esports']
        },
        'Health': {
          primary: ['health', 'medical', 'medicine', 'doctor', 'hospital', 'disease', 'treatment', 'vaccine', 'covid', 'coronavirus', 'wellness', 'fitness', 'nutrition', 'mental health', 'therapy', 'pharmaceutical', 'drug', 'medication', 'surgery', 'diagnosis', 'symptom', 'patient', 'clinic', 'emergency room', 'icu', 'nurse', 'pharmacist'],
          secondary: ['cancer', 'diabetes', 'heart disease', 'stroke', 'alzheimer', 'dementia', 'depression', 'anxiety', 'ptsd', 'addiction', 'rehabilitation', 'physical therapy', 'occupational therapy', 'psychology', 'psychiatry', 'pediatric', 'geriatric', 'obstetric', 'gynecologic', 'cardiology', 'neurology', 'oncology', 'dermatology', 'orthopedic']
        },
        'Science': {
          primary: ['science', 'scientific', 'research', 'study', 'discovery', 'experiment', 'laboratory', 'scientist', 'physics', 'chemistry', 'biology', 'space', 'astronomy', 'climate', 'environment', 'nasa', 'space station', 'mars', 'moon', 'planet', 'galaxy', 'universe', 'dna', 'gene', 'molecule', 'atom', 'particle'],
          secondary: ['quantum', 'relativity', 'evolution', 'genetics', 'microbiology', 'biochemistry', 'neuroscience', 'psychology', 'anthropology', 'archaeology', 'geology', 'meteorology', 'oceanography', 'botany', 'zoology', 'paleontology', 'fossil', 'extinction', 'biodiversity', 'ecosystem', 'species', 'mutation', 'protein', 'enzyme', 'hormone']
        },
        'World': {
          primary: ['world', 'international', 'global', 'foreign', 'country', 'nation', 'diplomacy', 'foreign policy', 'immigration', 'refugee', 'war', 'conflict', 'peace', 'treaty', 'united nations', 'un', 'nato', 'european union', 'eu', 'brexit', 'china', 'russia', 'iran', 'north korea', 'syria', 'ukraine', 'israel', 'palestine'],
          secondary: ['embassy', 'ambassador', 'diplomat', 'sanction', 'tariff', 'trade war', 'nuclear', 'missile', 'weapon', 'terrorism', 'terrorist', 'extremist', 'radical', 'protest', 'demonstration', 'revolution', 'coup', 'dictator', 'democracy', 'authoritarian', 'human rights', 'genocide', 'ethnic cleansing', 'civil war', 'insurgency']
        },
        'Education': {
          primary: ['education', 'school', 'university', 'college', 'student', 'teacher', 'academic', 'learning', 'curriculum', 'degree', 'scholarship', 'research', 'study', 'professor', 'lecturer', 'dean', 'principal', 'superintendent', 'board of education', 'department of education', 'federal student aid', 'pell grant'],
          secondary: ['kindergarten', 'elementary', 'middle school', 'high school', 'community college', 'graduate school', 'phd', 'masters', 'bachelors', 'associate', 'diploma', 'certificate', 'online learning', 'distance education', 'homeschooling', 'charter school', 'private school', 'public school', 'tuition', 'financial aid', 'loan forgiveness']
        },
        'Environment': {
          primary: ['environment', 'climate', 'weather', 'pollution', 'renewable', 'solar', 'wind', 'energy', 'conservation', 'wildlife', 'nature', 'forest', 'ocean', 'sustainability', 'global warming', 'climate change', 'greenhouse gas', 'carbon', 'emission', 'fossil fuel', 'clean energy', 'electric vehicle', 'ev', 'tesla'],
          secondary: ['recycling', 'plastic', 'waste', 'landfill', 'compost', 'organic', 'biodiversity', 'endangered species', 'extinction', 'deforestation', 'desertification', 'drought', 'flood', 'hurricane', 'tornado', 'tsunami', 'earthquake', 'volcano', 'wildfire', 'air quality', 'water quality', 'soil', 'agriculture', 'farming', 'organic farming']
        }
      };

      // Calculate weighted scores for each category
      const categoryScores = {};
      
      categories.forEach(category => {
        const keywords = categoryKeywords[category.name];
        if (!keywords) return;
        
        let score = 0;
        
        // Primary keywords get higher weight
        keywords.primary.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          const matches = text.match(regex);
          if (matches) {
            score += matches.length * 3; // Primary keywords worth 3 points
          }
        });
        
        // Secondary keywords get lower weight
        keywords.secondary.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          const matches = text.match(regex);
          if (matches) {
            score += matches.length * 1; // Secondary keywords worth 1 point
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

      // Log the scoring for debugging
      console.log('Category identification scores:', categoryScores);
      console.log('Selected category:', bestCategory.name, 'with score:', highestScore);

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
      const confidence = identifiedCategory._id.toString() === categoryId.toString() ? 1.0 : 0.0;
      
      // Additional confidence factors
      const text = `${title} ${content}`.toLowerCase();
      const categoryName = identifiedCategory.name.toLowerCase();
      
      // Check for strong keyword matches
      const strongKeywords = this.getStrongKeywordsForCategory(categoryName);
      const strongMatches = strongKeywords.filter(keyword => 
        text.includes(keyword.toLowerCase())
      ).length;
      
      // Calculate confidence based on keyword density
      const keywordDensity = strongMatches / Math.max(1, text.split(' ').length);
      const finalConfidence = Math.min(1.0, confidence + keywordDensity * 0.3);
      
      return finalConfidence;
    } catch (error) {
      console.error('Error getting category confidence:', error);
      return 0.5; // Default confidence
    }
  }

  // Get strong keywords for a specific category
  getStrongKeywordsForCategory(categoryName) {
    const strongKeywords = {
      'technology': ['artificial intelligence', 'machine learning', 'blockchain', 'cryptocurrency', 'software', 'hardware', 'programming', 'cybersecurity'],
      'politics': ['election', 'congress', 'senate', 'president', 'legislation', 'policy', 'government', 'democrat', 'republican'],
      'business': ['stock market', 'earnings', 'revenue', 'profit', 'investment', 'wall street', 'federal reserve', 'economy'],
      'sports': ['nfl', 'nba', 'mlb', 'nhl', 'olympics', 'championship', 'tournament', 'athlete', 'team'],
      'entertainment': ['movie', 'film', 'music', 'celebrity', 'hollywood', 'award', 'oscar', 'grammy', 'concert'],
      'health': ['medical', 'hospital', 'doctor', 'treatment', 'vaccine', 'disease', 'patient', 'surgery'],
      'science': ['research', 'discovery', 'experiment', 'laboratory', 'scientist', 'nasa', 'space', 'study'],
      'world': ['international', 'foreign', 'diplomacy', 'united nations', 'war', 'conflict', 'global'],
      'education': ['university', 'college', 'student', 'teacher', 'academic', 'curriculum', 'degree'],
      'environment': ['climate change', 'global warming', 'pollution', 'renewable', 'conservation', 'sustainability']
    };
    
    return strongKeywords[categoryName.toLowerCase()] || [];
  }

  // Enhanced category identification with confidence scoring
  async identifyCategoryWithConfidence(title, content) {
    try {
      const identifiedCategory = await this.identifyCategory(title, content);
      const confidence = await this.getCategoryConfidence(title, content, identifiedCategory._id);
      
      return {
        category: identifiedCategory,
        confidence: confidence,
        method: 'ai' // or 'fallback' if AI failed
      };
    } catch (error) {
      console.error('Error in category identification with confidence:', error);
      return {
        category: null,
        confidence: 0.0,
        method: 'error'
      };
    }
  }
}

module.exports = new CategoryIdentificationService();