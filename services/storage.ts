import { Story, Comment } from '../types';

const STORAGE_KEY = 'maktabati_stories_v1';

// Initial dummy data
const SEED_DATA: Story[] = [
  {
    id: '1',
    title: 'مغامرات في الغابة',
    description: 'قصة مشوقة للأطفال تحكي عن مغامرات أرنب صغير في الغابة الكبيرة.',
    author: 'أحمد محمد',
    coverImage: 'https://picsum.photos/400/600?random=1',
    pdfUrl: '#', // Placeholder
    likes: 120,
    dislikes: 5,
    views: 1540,
    downloads: 45,
    createdAt: new Date().toISOString(),
    comments: [
      { id: 'c1', user: 'سارة', text: 'قصة رائعة جداً!', createdAt: new Date().toISOString() }
    ]
  },
  {
    id: '2',
    title: 'سر الكهف المهجور',
    description: 'ثلاثة أصدقاء يكتشفون خريطة قديمة تقودهم إلى كنز مفقود.',
    author: 'ليلى خالد',
    coverImage: 'https://picsum.photos/400/600?random=2',
    pdfUrl: '#', 
    likes: 85,
    dislikes: 2,
    views: 890,
    downloads: 23,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    comments: []
  }
];

export const getStories = (): Story[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Error parsing stories data:", error);
    // If data is corrupted, reset to seed data
    localStorage.removeItem(STORAGE_KEY);
    return SEED_DATA;
  }
};

export const saveStory = (story: Story): void => {
  const stories = getStories();
  // Ensure new stories have 0 downloads initially
  const storyWithDefaults = { ...story, downloads: 0 };
  const newStories = [storyWithDefaults, ...stories];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newStories));
};

export const getStoryById = (id: string): Story | undefined => {
  const stories = getStories();
  return stories.find(s => s.id === id);
};

export const updateStory = (updatedStory: Story): void => {
  const stories = getStories();
  const index = stories.findIndex(s => s.id === updatedStory.id);
  if (index !== -1) {
    stories[index] = updatedStory;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  }
};

export const deleteStory = (id: string): void => {
  const stories = getStories();
  const newStories = stories.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newStories));
};

export const addComment = (storyId: string, text: string): Comment => {
    const stories = getStories();
    const index = stories.findIndex(s => s.id === storyId);
    if(index === -1) throw new Error("Story not found");
    
    const newComment: Comment = {
        id: Date.now().toString(),
        user: 'زائر', // Default user
        text,
        createdAt: new Date().toISOString()
    };
    
    stories[index].comments.push(newComment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
    return newComment;
};