export enum Page {
  Dashboard = 'Dashboard',
  Notes = 'Notes',
  Lessons = 'Lessons',
  MusicPlaylists = 'My Music',
  Settings = 'Settings',
  Exercise = 'Yenilenme Alanı',
  Tasks = 'Görevler',
  Collection = 'Koleksiyonum',
}

export interface ExternalLink {
  name: string;
  url: string;
  icon: IconName;
}

export type Theme = 'light' | 'dark';

export enum TimerMode {
  Focus = 'focus',
  ShortBreak = 'shortBreak',
  LongBreak = 'longBreak',
}

export interface PomodoroSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
}

export interface PomodoroSession {
  id: string;
  date: string; // YYYY-MM-DD
  duration: number; // in minutes
  completed: boolean;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

export interface Note {
  id: string;
  folderId: string | null;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Lesson {
  id:string;
  type: 'udemy' | 'youtube';
  title: string;
  url: string;
  progress: number;
  noteContent: string;
}

export interface SavedPlaylist {
  id: string;
  name: string;
  url: string;
}

export interface MotivationalVideo {
  id: string;
  url: string;
}

export const PostPomodoroCategories = ['Kedi', 'Araba', 'Motor', 'Anime', 'Hayvanlar'] as const;
export type PostPomodoroCategory = typeof PostPomodoroCategories[number];

export interface PostPomodoroVideo {
  id: string;
  url: string;
}

export type PostPomodoroVideoPools = Record<PostPomodoroCategory, PostPomodoroVideo[]>;

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  completedAt: number | null;
}

export interface CollectionCard {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Icon';
  description: string;
  imageData: string;
  opCost: number;
  unlockMethod: 'op' | 'session_streak';
}

export interface LastEarnedRewards {
  tickets: number;
  spins: number;
  op: number;
  newCard: CollectionCard | null;
}


export type IconName =
  | 'LayoutDashboard'
  | 'FileText'
  | 'BookOpen'
  | 'Play'
  | 'Pause'
  | 'SkipForward'
  | 'SkipBack'
  | 'RefreshCw'
  | 'Settings'
  | 'Sun'
  | 'Moon'
  | 'Plus'
  | 'Folder'
  | 'Trash2'
  | 'Edit'
  | 'X'
  | 'Move'
  | 'FilePlus'
  | 'MoreVertical'
  | 'Check'
  | 'ChevronDown'
  | 'ChevronLeft'
  | 'UploadCloud'
  | 'Link'
  | 'Youtube'
  | 'Music'
  | 'Sparkles'
  | 'Palette'
  | 'Image'
  | 'Volume2'
  | 'Save'
  | 'Wind'
  | 'Eye'
  | 'CheckSquare'
  | 'Search'
  | 'Ticket'
  | 'Gift'
  | 'Lock'
  | 'Op'
  | 'HelpCircle'
  | 'Star'
  | 'Award'
  | 'Expand';