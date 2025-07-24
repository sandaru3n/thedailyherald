import { NewsArticle } from '@/types/news';

export const SAMPLE_NEWS: NewsArticle[] = [
  {
    id: '1',
    title: 'Global Climate Summit Reaches Historic Agreement on Carbon Reduction',
    content: 'World leaders have reached a groundbreaking agreement at the Global Climate Summit, committing to ambitious carbon reduction targets for the next decade. The agreement includes specific timelines and financial commitments from developed nations to support developing countries in their transition to renewable energy.',
    excerpt: 'World leaders reach historic climate agreement with ambitious carbon reduction targets and financial commitments.',
    author: 'Sarah Johnson',
    category: 'World',
    imageUrl: 'https://images.unsplash.com/photo-1569163139394-de4e5f43e4e3?w=800&h=400&fit=crop',
    publishedAt: new Date('2024-01-15'),
    isFeatured: true,
    tags: ['climate', 'environment', 'politics'],
    readTime: 5
  },
  {
    id: '2',
    title: 'Tech Giants Report Record Profits Despite Economic Uncertainty',
    content: 'Major technology companies have reported record-breaking profits in the latest quarter, defying economic headwinds and showing resilience in the face of global uncertainty. The strong performance is attributed to continued demand for digital services and cloud computing.',
    excerpt: 'Technology companies show remarkable resilience with record profits amid global economic challenges.',
    author: 'Michael Chen',
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop',
    publishedAt: new Date('2024-01-14'),
    isFeatured: false,
    tags: ['technology', 'business', 'economy'],
    readTime: 3
  },
  {
    id: '3',
    title: 'Olympic Champion Sets New World Record in Swimming',
    content: 'In a stunning display of athletic prowess, the defending Olympic champion has shattered the world record in the 100-meter freestyle, setting a new benchmark that many thought impossible. The achievement comes just months before the upcoming World Championships.',
    excerpt: 'Olympic swimming champion breaks world record in spectacular fashion ahead of World Championships.',
    author: 'Emma Davis',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    publishedAt: new Date('2024-01-13'),
    isFeatured: true,
    tags: ['sports', 'olympics', 'swimming'],
    readTime: 4
  },
  {
    id: '4',
    title: 'New Medical Breakthrough Offers Hope for Cancer Patients',
    content: 'Researchers at leading medical institutions have announced a significant breakthrough in cancer treatment, with a new therapy showing remarkable success rates in clinical trials. The treatment targets specific cancer cells while leaving healthy tissue unharmed.',
    excerpt: 'Groundbreaking cancer therapy shows promising results in clinical trials, offering new hope for patients.',
    author: 'Dr. Robert Kim',
    category: 'Health',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop',
    publishedAt: new Date('2024-01-12'),
    isFeatured: false,
    tags: ['health', 'medical', 'research'],
    readTime: 6
  },
  {
    id: '5',
    title: 'Stock Markets Rally as Inflation Shows Signs of Cooling',
    content: 'Global stock markets have surged following the release of inflation data that shows a significant cooling trend. Investors are optimistic about the economic outlook as central banks may be nearing the end of their aggressive interest rate hikes.',
    excerpt: 'Markets surge on positive inflation data, raising hopes for economic recovery and policy changes.',
    author: 'David Thompson',
    category: 'Business',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
    publishedAt: new Date('2024-01-11'),
    isFeatured: false,
    tags: ['business', 'economy', 'markets'],
    readTime: 4
  },
  {
    id: '6',
    title: 'Hollywood Stars Unite for Charity Gala Supporting Education',
    content: 'A star-studded charity gala brought together Hollywood`s biggest names to raise funds for educational programs in underserved communities. The event raised over $10 million and highlighted the importance of equal access to quality education.',
    excerpt: 'Celebrity charity gala raises millions for education programs, bringing together Hollywood elite for a worthy cause.',
    author: 'Lisa Martinez',
    category: 'Entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop',
    publishedAt: new Date('2024-01-10'),
    isFeatured: false,
    tags: ['entertainment', 'charity', 'education'],
    readTime: 3
  }
];
