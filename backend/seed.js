const mongoose = require('mongoose');
const Category = require('./models/Category');
const Article = require('./models/Article');
const Admin = require('./models/Admin');

// Connect to MongoDB Cloud
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-username:your-password@your-cluster.mongodb.net/thedailyherald?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleCategories = [
  { name: 'Politics', slug: 'politics', color: '#EF4444', description: 'Political news and updates' },
  { name: 'Business', slug: 'business', color: '#3B82F6', description: 'Business and economic news' },
  { name: 'Technology', slug: 'technology', color: '#10B981', description: 'Technology and innovation news' },
  { name: 'Sports', slug: 'sports', color: '#F59E0B', description: 'Sports news and updates' },
  { name: 'Entertainment', slug: 'entertainment', color: '#8B5CF6', description: 'Entertainment and celebrity news' },
  { name: 'Health', slug: 'health', color: '#EC4899', description: 'Health and wellness news' },
  { name: 'World', slug: 'world', color: '#6366F1', description: 'International news' },
];

const sampleArticles = [
  {
    title: 'AI Breakthrough: New Language Model Surpasses Human Performance',
    slug: 'ai-breakthrough-new-language-model-surpasses-human-performance',
    content: `Artificial Intelligence has reached a new milestone with the development of GPT-5, a language model that has demonstrated unprecedented capabilities in understanding and generating human-like text. Researchers at OpenAI announced that their latest model achieved scores that surpass human performance on multiple standardized tests.

The new model, which was trained on a dataset of over 100 trillion parameters, shows remarkable improvements in reasoning, creativity, and factual accuracy. "This represents a significant step forward in our quest to create AI that can truly understand and assist humans," said Dr. Sarah Chen, lead researcher on the project.

Key improvements include:
- Enhanced reasoning capabilities for complex problem-solving
- Improved factual accuracy with reduced hallucinations
- Better understanding of context and nuance
- Multilingual proficiency across 50+ languages

The model has already been integrated into various applications, from educational tools to creative writing assistants. However, concerns about AI safety and potential misuse have prompted calls for increased regulation and oversight.

"While this technology is incredibly promising, we must ensure it's developed and deployed responsibly," said AI ethicist Dr. Michael Rodriguez. "The potential benefits are enormous, but so are the risks if not properly managed."

The research team has committed to ongoing safety evaluations and has implemented several safeguards to prevent misuse. They're also working with policymakers to establish guidelines for responsible AI development.`,
    excerpt: 'OpenAI\'s GPT-5 achieves unprecedented performance, surpassing human capabilities in multiple standardized tests while raising important questions about AI safety and regulation.',
    category: 'technology',
    author: 'admin',
    status: 'published',
    isFeatured: true,
    publishedAt: new Date('2024-01-15'),
    readTime: 8,
    tags: ['AI', 'Technology', 'OpenAI', 'GPT-5', 'Machine Learning'],
    featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop'
  },
  {
    title: 'Global Markets Rally as Tech Stocks Lead Recovery',
    slug: 'global-markets-rally-as-tech-stocks-lead-recovery',
    content: `Global financial markets experienced a significant rally today, with technology stocks leading the charge as investors regained confidence in the economic recovery. The S&P 500 rose 2.3%, while the NASDAQ Composite gained 3.1%, marking the best single-day performance in six months.

The rally was fueled by several positive developments:
- Strong quarterly earnings from major tech companies
- Positive economic data showing inflation cooling
- Central bank signals of potential interest rate cuts
- Strong consumer spending data

"Today's market performance reflects growing optimism about the economic outlook," said financial analyst Jennifer Martinez. "The combination of strong corporate earnings and moderating inflation has given investors confidence that we're on the right track."

Major tech companies including Apple, Microsoft, and Google parent Alphabet all reported better-than-expected quarterly results, with strong growth in cloud computing and AI-related services. This helped drive the broader market higher, with all major indices posting gains.

The rally wasn't limited to the United States. European markets also posted strong gains, with the FTSE 100 up 1.8% and the DAX rising 2.1%. Asian markets followed suit, with the Nikkei 225 gaining 1.5% and the Hang Seng Index up 2.3%.

However, some analysts caution that the rally may be short-lived. "While today's gains are encouraging, we need to see sustained economic improvement to maintain this momentum," warned economist David Thompson. "There are still significant headwinds, including geopolitical tensions and supply chain challenges."

Investors will be closely watching upcoming economic reports, including employment data and inflation figures, to gauge whether this rally has staying power.`,
    excerpt: 'Global markets surge as technology stocks lead a broad-based rally, with major indices posting their best performance in months on strong earnings and economic optimism.',
    category: 'business',
    author: 'admin',
    status: 'published',
    isFeatured: true,
    publishedAt: new Date('2024-01-14'),
    readTime: 6,
    tags: ['Markets', 'Technology', 'Economy', 'Stocks', 'Finance'],
    featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop'
  },
  {
    title: 'Championship Final: Underdogs Triumph in Historic Victory',
    slug: 'championship-final-underdogs-triumph-in-historic-victory',
    content: `In what will be remembered as one of the greatest upsets in sports history, the underdog team from Riverside City defeated the heavily favored champions in a thrilling championship final that went down to the wire. The final score of 28-27 was decided by a last-second field goal that sent the stadium into a frenzy.

The game was a masterclass in determination and strategy. Despite being 20-point underdogs, Riverside City's team never gave up, mounting an incredible comeback in the fourth quarter. Quarterback Marcus Johnson threw for 350 yards and three touchdowns, while running back Sarah Williams rushed for 120 yards and the game-winning touchdown.

"This victory is for our entire community," said head coach Robert Davis, fighting back tears. "These players have worked harder than anyone could imagine, and today they proved that heart and determination can overcome any obstacle."

The game was filled with dramatic moments:
- A 95-yard touchdown run in the third quarter
- A crucial interception with 2 minutes remaining
- The game-winning field goal as time expired
- Emotional celebrations from players and fans alike

The victory parade is scheduled for tomorrow, with thousands of fans expected to line the streets of Riverside City. Local businesses have already started planning celebrations, and the mayor has declared a city holiday in honor of the team's achievement.

"This is more than just a sports victory," said Mayor Lisa Chen. "This is about community pride and showing that anything is possible with hard work and determination."

The team's success has inspired countless young athletes and has brought the community together in celebration. Plans are already underway for next season, with expectations higher than ever before.`,
    excerpt: 'Riverside City\'s underdog team pulls off a historic upset in the championship final, winning 28-27 with a last-second field goal in a game that will be remembered for generations.',
    category: 'sports',
    author: 'admin',
    status: 'published',
    isFeatured: false,
    publishedAt: new Date('2024-01-13'),
    readTime: 5,
    tags: ['Football', 'Championship', 'Underdogs', 'Victory', 'Sports'],
    featuredImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
  },
  {
    title: 'New Climate Agreement Reached at Global Summit',
    slug: 'new-climate-agreement-reached-at-global-summit',
    content: `World leaders have reached a historic agreement on climate action at the Global Climate Summit in Paris, committing to more ambitious targets for reducing greenhouse gas emissions. The new agreement, signed by 195 countries, sets a goal of achieving net-zero emissions by 2050.

The landmark deal includes several key provisions:
- Mandatory emissions reporting for all signatory countries
- Increased funding for renewable energy projects in developing nations
- Stricter regulations on fossil fuel industries
- Support for climate adaptation and resilience programs

"This agreement represents a turning point in our fight against climate change," said UN Secretary-General Antonio Guterres. "For the first time, we have a truly global commitment to take the necessary action to protect our planet for future generations."

The agreement was reached after two weeks of intense negotiations, with countries overcoming significant differences on issues such as funding mechanisms and enforcement procedures. The final text includes provisions for regular review and strengthening of commitments every five years.

Environmental groups have praised the agreement as a significant step forward, while acknowledging that implementation will be the real test. "The targets are ambitious and necessary," said climate activist Greta Thunberg. "Now we need to ensure that governments actually follow through on their commitments."

The agreement also includes measures to support workers and communities affected by the transition to clean energy, addressing concerns about economic impacts. Funding mechanisms have been established to help developing countries meet their climate goals while continuing to develop their economies.

Implementation will begin immediately, with countries required to submit updated climate action plans within the next year. The agreement also establishes a new international body to monitor progress and ensure compliance.`,
    excerpt: 'World leaders reach historic climate agreement at Global Summit, committing to net-zero emissions by 2050 with comprehensive measures for renewable energy and climate adaptation.',
    category: 'world',
    author: 'admin',
    status: 'published',
    isFeatured: true,
    publishedAt: new Date('2024-01-12'),
    readTime: 7,
    tags: ['Climate Change', 'Environment', 'Global Summit', 'Paris Agreement', 'Sustainability'],
    featuredImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop'
  },
  {
    title: 'Breakthrough in Cancer Treatment Shows Promising Results',
    slug: 'breakthrough-in-cancer-treatment-shows-promising-results',
    content: `A groundbreaking new cancer treatment has shown remarkable results in clinical trials, offering hope to millions of patients worldwide. The treatment, which combines immunotherapy with targeted gene therapy, has achieved unprecedented success rates in treating previously untreatable forms of cancer.

The clinical trials, conducted at leading medical centers across the country, involved over 1,000 patients with various types of advanced cancer. Results showed that 65% of patients experienced significant tumor reduction, with 40% achieving complete remission.

"This is a game-changer in cancer treatment," said Dr. Emily Rodriguez, lead researcher on the study. "We're seeing results that we never thought possible just a few years ago. This treatment represents a new paradigm in how we approach cancer care."

The treatment works by:
- Activating the patient's own immune system to recognize cancer cells
- Using gene therapy to target specific genetic mutations
- Combining multiple treatment approaches for maximum effectiveness
- Minimizing side effects compared to traditional chemotherapy

The breakthrough has been particularly effective for patients with lung cancer, pancreatic cancer, and certain types of brain tumors - all of which have historically been difficult to treat. The treatment is also showing promise for pediatric cancers, offering hope to families facing devastating diagnoses.

"Seeing my daughter respond to this treatment has been nothing short of miraculous," said Sarah Johnson, whose 8-year-old daughter participated in the trial. "She's not just surviving; she's thriving. This treatment has given us our daughter back."

The treatment is expected to receive FDA approval within the next year, making it available to patients nationwide. Pharmaceutical companies are already working to scale up production to meet anticipated demand.

However, the treatment comes with a significant price tag, raising concerns about accessibility. Healthcare advocates are calling for insurance coverage and government support to ensure that all patients who could benefit have access to the treatment.`,
    excerpt: 'Revolutionary cancer treatment combining immunotherapy and gene therapy shows unprecedented success rates in clinical trials, offering new hope for patients with previously untreatable cancers.',
    category: 'health',
    author: 'admin',
    status: 'published',
    isFeatured: false,
    publishedAt: new Date('2024-01-11'),
    readTime: 6,
    tags: ['Cancer', 'Medical Research', 'Immunotherapy', 'Gene Therapy', 'Healthcare'],
    featuredImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop'
  },
  {
    title: 'Major Film Studio Announces Revolutionary Virtual Reality Movie',
    slug: 'major-film-studio-announces-revolutionary-virtual-reality-movie',
    content: `A major Hollywood studio has announced plans to produce the world's first full-length virtual reality feature film, marking a revolutionary step in cinematic storytelling. The project, titled "Beyond Reality," will allow viewers to experience the story from multiple perspectives and interact with the narrative in unprecedented ways.

The film will be shot using cutting-edge VR technology and will feature an all-star cast including Academy Award winners. Viewers will be able to choose their perspective within the story, experiencing different character viewpoints and storylines based on their choices.

"This is not just a movie; it's a completely new form of storytelling," said director Christopher Nolan, who is helming the project. "We're creating an immersive experience that allows audiences to become part of the story in ways that were previously impossible."

The technology behind the film includes:
- 360-degree cameras capturing every angle simultaneously
- AI-powered narrative branching based on viewer choices
- Haptic feedback systems for physical interaction
- Spatial audio for complete immersion

The production budget is estimated at $200 million, making it one of the most expensive films ever made. The studio has partnered with leading technology companies to develop the necessary hardware and software for the VR experience.

"Virtual reality has the potential to revolutionize entertainment in the same way that sound and color did for cinema," said studio executive Jennifer Martinez. "This project will set the standard for what's possible in immersive storytelling."

The film is scheduled for release in 2025 and will be available through VR headsets and specialized theaters. The studio is also developing a companion mobile app that will allow viewers to continue their experience outside of the VR environment.

Industry experts predict that this could mark the beginning of a new era in entertainment, with VR becoming a mainstream medium for storytelling. Other studios are already developing their own VR projects in response to this announcement.`,
    excerpt: 'Hollywood studio announces groundbreaking VR feature film "Beyond Reality," allowing viewers to experience interactive storytelling from multiple perspectives in a revolutionary new format.',
    category: 'entertainment',
    author: 'admin',
    status: 'published',
    isFeatured: true,
    publishedAt: new Date('2024-01-10'),
    readTime: 5,
    tags: ['Virtual Reality', 'Film', 'Entertainment', 'Technology', 'Hollywood'],
    featuredImage: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&h=600&fit=crop'
  },
  {
    title: 'Political Reform Bill Passes with Bipartisan Support',
    slug: 'political-reform-bill-passes-with-bipartisan-support',
    content: `In a rare display of bipartisan cooperation, Congress has passed a comprehensive political reform bill that addresses campaign finance, voting rights, and government transparency. The bill, which received support from both major political parties, represents the most significant political reform legislation in decades.

The bill includes several key provisions:
- Stricter campaign finance regulations and disclosure requirements
- Expanded voting rights and protections against voter suppression
- Enhanced transparency in government spending and decision-making
- Independent redistricting commissions to prevent gerrymandering
- Ethics reforms for elected officials and government employees

"This bill represents what's possible when we put the interests of the American people above partisan politics," said Senate Majority Leader Sarah Johnson. "These reforms will strengthen our democracy and restore public trust in our political system."

The legislation was the result of months of negotiations between Democrats and Republicans, with both parties making concessions to reach a compromise. The final bill received 75 votes in the Senate and 320 votes in the House of Representatives.

Key features of the bill include:
- Mandatory disclosure of all political donations over $1,000
- Automatic voter registration for eligible citizens
- Independent oversight of election administration
- Public financing options for political campaigns
- Stricter lobbying regulations and cooling-off periods

The bill also establishes a new independent commission to oversee campaign finance and ethics compliance, with the power to investigate violations and impose penalties. This represents a significant strengthening of enforcement mechanisms.

"This is a victory for democracy and transparency," said political reform advocate Michael Chen. "These reforms will help ensure that our government works for all Americans, not just the wealthy and well-connected."

The bill is expected to be signed into law by the president within the next week. Implementation will begin immediately, with most provisions taking effect within the next year.`,
    excerpt: 'Congress passes landmark political reform bill with bipartisan support, addressing campaign finance, voting rights, and government transparency in the most significant reform legislation in decades.',
    category: 'politics',
    author: 'admin',
    status: 'published',
    isFeatured: false,
    publishedAt: new Date('2024-01-09'),
    readTime: 6,
    tags: ['Politics', 'Reform', 'Campaign Finance', 'Voting Rights', 'Democracy'],
    featuredImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop'
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB Cloud...');
    
    // Clear existing data
    await Category.deleteMany({});
    await Article.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create categories
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log('Created categories:', createdCategories.length);
    
    // Create a default admin user if it doesn't exist
    let admin = await Admin.findOne({ email: 'admin@example.com' });
    if (!admin) {
      admin = await Admin.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Created admin user');
    }
    
    // Create articles with proper category references
    const articlesWithCategories = sampleArticles.map(article => {
      const category = createdCategories.find(cat => cat.slug === article.category);
      return {
        ...article,
        category: category._id,
        author: admin._id,
        featuredImage: article.featuredImage
      };
    });
    
    const createdArticles = await Article.insertMany(articlesWithCategories);
    console.log('Created articles:', createdArticles.length);
    
    console.log('Database seeded successfully!');
    console.log('\nSample data created:');
    console.log('- Categories:', createdCategories.map(c => c.name).join(', '));
    console.log('- Articles:', createdArticles.map(a => a.title).join('\n  '));
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 