import { Story, Comment } from '../types';

const DB_NAME = 'MaktabatiDB';
const STORIES_STORE = 'stories';
const CATS_STORE = 'categories';
const SETTINGS_STORE = 'settings';
const DB_VERSION = 3; // Incremented for settings store

const DEFAULT_CATEGORIES = [
    'ريادة أعمال',
    'تجارة إلكترونية',
    'تطوير ذات',
    'تقنية',
    'روايات',
    'قصص أطفال',
    'شعر وأدب',
    'عام'
];

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORIES_STORE)) {
        db.createObjectStore(STORIES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CATS_STORE)) {
        db.createObjectStore(CATS_STORE, { keyPath: 'name' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };
  });
};

// --- Settings Management ---

export const getSetting = async (key: string): Promise<any> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SETTINGS_STORE, 'readonly');
    const store = transaction.objectStore(SETTINGS_STORE);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result?.value);
    request.onerror = () => reject(request.error);
  });
};

export const saveSetting = async (key: string, value: any): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SETTINGS_STORE, 'readwrite');
    const store = transaction.objectStore(SETTINGS_STORE);
    const request = store.put({ key, value });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// --- Category Management ---

export const getCategories = async (): Promise<string[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CATS_STORE, 'readonly');
    const store = transaction.objectStore(CATS_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      let cats = request.result.map((c: any) => c.name);
      if (cats.length === 0) {
        DEFAULT_CATEGORIES.forEach(name => saveCategory(name));
        resolve(DEFAULT_CATEGORIES);
      } else {
        resolve(cats);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const saveCategory = async (name: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CATS_STORE, 'readwrite');
    const store = transaction.objectStore(CATS_STORE);
    const request = store.put({ name });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const deleteCategory = async (name: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CATS_STORE, 'readwrite');
    const store = transaction.objectStore(CATS_STORE);
    const request = store.delete(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const renameCategory = async (oldName: string, newName: string): Promise<void> => {
    await deleteCategory(oldName);
    await saveCategory(newName);
    const stories = await getStories();
    for (const story of stories) {
        if (story.category === oldName) {
            story.category = newName;
            await updateStory(story);
        }
    }
};

// --- Story Management ---

export const getStories = async (): Promise<Story[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORIES_STORE, 'readonly');
    const store = transaction.objectStore(STORIES_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      let stories = request.result;
      resolve(stories.sort((a: Story, b: Story) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };
    request.onerror = () => reject(request.error);
  });
};

export const saveStory = async (story: Story): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORIES_STORE, 'readwrite');
    const store = transaction.objectStore(STORIES_STORE);
    const request = store.put(story);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getStoryById = async (id: string): Promise<Story | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORIES_STORE, 'readonly');
    const store = transaction.objectStore(STORIES_STORE);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const updateStory = async (updatedStory: Story): Promise<void> => {
  return saveStory(updatedStory);
};

export const deleteStory = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORIES_STORE, 'readwrite');
    const store = transaction.objectStore(STORIES_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const addComment = async (storyId: string, text: string): Promise<Comment> => {
    const story = await getStoryById(storyId);
    if(!story) throw new Error("Story not found");
    const newComment: Comment = {
        id: Date.now().toString(),
        user: 'زائر',
        text,
        createdAt: new Date().toISOString()
    };
    story.comments.push(newComment);
    await updateStory(story);
    return newComment;
};