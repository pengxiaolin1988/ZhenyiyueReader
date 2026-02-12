
export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  progress: number;
  genre: string;
  description: string;
  rating: number;
  reviews?: Review[];
  totalReviews?: number;
  isLiked?: boolean;
  lastRead?: number;
  audioDuration?: number;
  chapters?: Chapter[];
  wordCount?: number;
  highlights?: Highlight[];
}

export interface Highlight {
  id: string;
  chapterIndex: number;
  text: string;
  color: string;
  date: number;
}

export interface User {
  id: string;
  username: string;
  nickname: string;
  phone?: string;
  avatar: string;
  isVip?: boolean;
  joinDate?: string;
  dailyGoalMinutes?: number;
  bio?: string;
  following?: number;
  followers?: number;
  fans?: number;
  isExpert?: boolean;
  expertField?: string;
  meditationStreak?: number;
  totalPoints?: number;
}

export interface Question {
  id: string;
  bookId: string;
  text: string;
  answer?: string;
  expertId?: string;
  date: number;
}

export interface Review {
  id: string;
  user: string;
  avatar: string;
  text: string;
  likes: number;
  date: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
}

export enum Tab {
  Bookshelf = 'Bookshelf',
  Listen = 'Listen',
  BookStore = 'Book Store',
  Meditation = 'Meditation',
  Profile = 'Profile'
}

export type ImageSize = '1K' | '2K' | '4K';
