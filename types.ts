
export interface Comment {
  id: string;
  user: string;
  text: string;
  createdAt: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  author: string;
  coverImage: string; // Base64 data URL
  pdfUrl: string; // Blob URL or Base64
  likes: number;
  dislikes: number;
  views: number;
  downloads: number;
  createdAt: string;
  comments: Comment[];
}

export enum ViewMode {
  GRID = 'GRID',
  LIST = 'LIST'
}

export enum SharePlatform {
  WHATSAPP = 'WHATSAPP',
  TWITTER = 'TWITTER',
  EMAIL = 'EMAIL',
  COPY = 'COPY'
}

// Global declaration for external libraries loaded via CDN
declare global {
  interface Window {
    pdfjsLib: any;
  }
}
