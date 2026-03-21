export const HABIT_CATEGORIES = [
  { id: 'health', name: 'health & fitness', emojiUrl: '/health.png' },
  { id: 'productivity', name: 'productivity', emojiUrl: '/productivity.png' },
  { id: 'mind', name: 'mind', emojiUrl: '/mind.png' },
  { id: 'learning', name: 'learning', emojiUrl: '/learning.png' },
  { id: 'finance', name: 'finance', emojiUrl: '/finance.png' },
  { id: 'relation', name: 'relation', emojiUrl: '/relation.png' },
];

export const getCategoryById = (id: string) => 
  HABIT_CATEGORIES.find(c => c.id === id) || HABIT_CATEGORIES[0];
