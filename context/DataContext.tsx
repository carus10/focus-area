
import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode, CSSProperties } from 'react';
import { Theme, Note, Folder, Lesson, PomodoroSession, SavedPlaylist, Page, MotivationalVideo, PostPomodoroVideoPools, PostPomodoroCategory, Task, PomodoroSettings, TimerMode, CollectionCard, LastEarnedRewards } from '../types.ts';
import { usePomodoro } from '../hooks/usePomodoro.ts';
import { initialAllCards } from '../data/collectionCards.ts';

// --- MOCK DATA ---
const initialFolders: Folder[] = [
  { id: '1', name: 'Personal', createdAt: Date.now() },
  { id: '2', name: 'Work', createdAt: Date.now() },
];

const initialNotes: Note[] = [
  { id: 'n1', folderId: '1', title: 'Grocery List', content: '- Milk\n- Bread\n- Eggs', createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'n2', folderId: '2', title: 'Q3 Project Plan', content: 'Initial draft for the Q3 project...', createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'n3', folderId: null, title: 'Random thoughts', content: 'This is a note without a folder.', createdAt: Date.now(), updatedAt: Date.now() },
];

const initialLessons: Lesson[] = [
  { id: 'l1', type: 'youtube', title: 'React Hooks Tutorial', url: 'https://www.youtube.com/playlist?list=PLC3y8-rFHvwisvxhZ135pPducxAbbing4', progress: 25, noteContent: '' },
  { id: 'l2', type: 'udemy', title: 'The Complete 2023 Web Development Bootcamp', url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/', progress: 60, noteContent: 'Initial draft for the Q3 project...' },
];

const initialPomodoroSessions: PomodoroSession[] = [
  {id: 'p1', date: '2023-10-26', duration: 25, completed: true},
  {id: 'p2', date: '2023-10-27', duration: 25, completed: true},
  {id: 'p3', date: '2023-10-27', duration: 25, completed: true},
];

const initialMotivationalVideos: MotivationalVideo[] = [
    { id: 'mv1', url: 'https://www.youtube.com/watch?v=wnHW6o8WMas' },
    { id: 'mv2', url: 'https://www.youtube.com/watch?v=g-jwWYX7Jlo' },
    { id: 'mv3', url: 'https://www.youtube.com/watch?v=k6_qHxh_g20' }
];

const initialPostPomodoroVideos: PostPomodoroVideoPools = {
    'Kedi': [{id: 'pk1', url: 'https://www.youtube.com/watch?v=Vt2_wkF3_U4'}],
    'Araba': [{id: 'pc1', url: 'https://www.youtube.com/watch?v=3V9B5d_L4bQ'}],
    'Motor': [],
    'Anime': [],
    'Hayvanlar': [],
};

// Helper to get from localStorage
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Could not save state for key "${key}" to localStorage.`, e);
    }
  }, [key, value]);

  return [value, setValue];
}

// --- CONTEXT PROPS INTERFACES ---

interface DataContextProps {
  theme: Theme;
  toggleTheme: () => void;
  background: string | null;
  setBackground: (url: string) => void;
  backgroundColor: string | null;
  setBackgroundColor: (color: string) => void;
  backgroundBlur: number;
  setBackgroundBlur: (blur: number) => void;
  backgroundOpacity: number;
  setBackgroundOpacity: (opacity: number) => void;
  backgroundStyle: CSSProperties;
  motivationalImage: string | null;
  setMotivationalImage: (image: string | null) => void;
  isFlowModeEnabled: boolean;
  setIsFlowModeEnabled: (isEnabled: boolean) => void;
  folders: Folder[];
  addFolder: (name: string) => void;
  updateFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id:string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
  moveNote: (noteId: string, targetFolderId: string | null) => void;
  lessons: Lesson[];
  addLesson: (lesson: Omit<Lesson, 'id'>) => void;
  updateLesson: (id: string, updates: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;
  pomodoroSessions: PomodoroSession[];
  addPomodoroSession: (session: Omit<PomodoroSession, 'id'>) => LastEarnedRewards;
  savedPlaylists: SavedPlaylist[];
  addSavedPlaylist: (name: string, url: string) => void;
  updateSavedPlaylist: (id: string, name: string) => void;
  deleteSavedPlaylist: (id: string) => void;
  playlistToPlay: SavedPlaylist | null;
  playPlaylist: (playlist: SavedPlaylist) => void;
  setPlaylistToPlay: (playlist: SavedPlaylist | null) => void;
  activePage: Page;
  setActivePage: (page: Page) => void;
  motivationalVideos: MotivationalVideo[];
  addMotivationalVideo: (url: string) => void;
  deleteMotivationalVideo: (id: string) => void;
  postPomodoroVideos: PostPomodoroVideoPools;
  addPostPomodoroVideo: (category: PostPomodoroCategory, url: string) => void;
  deletePostPomodoroVideo: (category: PostPomodoroCategory, videoId: string) => void;
  tasks: Task[];
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  clearCompletedTasks: () => void;
  gameTickets: number;
  wheelSpins: number;
  op: number;
  unlockedCardIds: string[];
  collectionCards: CollectionCard[];
  addCollectionCard: (card: Omit<CollectionCard, 'id' | 'unlockMethod'>) => void;
  updateCollectionCard: (id: string, updates: Partial<CollectionCard>) => void;
  deleteCollectionCard: (id: string) => void;
  spendGameTicket: () => void;
  spendWheelSpin: () => void;
  addGameTickets: (amount: number) => void;
  addOp: (amount: number) => void;
  unlockCardWithOp: (cardId: string) => boolean;
  completedSessionCountForCards: number;
  claimLegendaryCard: (cardToUnlockId: string) => CollectionCard | null;
  legendaryCardsUnlockedForIcon: number;
  claimIconCard: () => CollectionCard | null;
}

interface PomodoroContextProps {
    isFlowModeActive: boolean;
    timeLeft: number;
    mode: TimerMode;
    isActive: boolean;
    cycles: number;
    settings: PomodoroSettings;
    toggleTimer: () => void;
    resetTimer: () => void;
    skipTimer: () => void;
    updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
    pomodoroFocusCompleted: boolean;
    acknowledgePomodoroFocusCompleted: () => void;
    lastEarnedRewards: LastEarnedRewards | null;
}


// --- CONTEXT CREATION ---
export const DataContext = createContext<DataContextProps>({} as DataContextProps);
export const PomodoroContext = createContext<PomodoroContextProps>({} as PomodoroContextProps);


// --- POMODORO PROVIDER ---
export const PomodoroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addPomodoroSession, isFlowModeEnabled } = useContext(DataContext);
    const [isFlowModeActive, setFlowModeActive] = useState(false);
    const [pomodoroFocusCompleted, setPomodoroFocusCompleted] = useState(false);
    const [lastEarnedRewards, setLastEarnedRewards] = useState<LastEarnedRewards | null>(null);

    const acknowledgePomodoroFocusCompleted = useCallback(() => {
        setPomodoroFocusCompleted(false)
        setLastEarnedRewards(null);
    }, []);

    const handleFocusComplete = useCallback((durationInMinutes: number) => {
        const rewards = addPomodoroSession({
            // id is set in addPomodoroSession
            date: new Date().toISOString().split('T')[0],
            duration: durationInMinutes,
            completed: true
        });
        setLastEarnedRewards(rewards);
        setPomodoroFocusCompleted(true);
    }, [addPomodoroSession]);
    
    const pomodoro = usePomodoro(
        { focus: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4 },
        handleFocusComplete,
        setFlowModeActive,
        isFlowModeEnabled
    );

    const pomodoroValue = useMemo(() => ({
        ...pomodoro,
        isFlowModeActive,
        pomodoroFocusCompleted,
        acknowledgePomodoroFocusCompleted,
        lastEarnedRewards,
    }), [pomodoro, isFlowModeActive, pomodoroFocusCompleted, acknowledgePomodoroFocusCompleted, lastEarnedRewards]);
    
    return (
        <PomodoroContext.Provider value={pomodoroValue}>
            {children}
        </PomodoroContext.Provider>
    )
}

// --- MAIN DATA PROVIDER COMPONENT ---
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useStickyState<Page>(Page.Dashboard, 'app-active-page');
  const [theme, setTheme] = useStickyState<Theme>('dark', 'app-theme');
  const [background, _setBackground] = useStickyState<string | null>(null, 'app-background');
  const [backgroundColor, _setBackgroundColor] = useStickyState<string | null>(null, 'app-bg-color');
  const [backgroundBlur, setBackgroundBlur] = useStickyState<number>(8, 'app-bg-blur');
  const [backgroundOpacity, setBackgroundOpacity] = useStickyState<number>(50, 'app-bg-opacity');
  const [motivationalImage, setMotivationalImage] = useStickyState<string | null>(null, 'app-motivational-image');
  const [isFlowModeEnabled, setIsFlowModeEnabled] = useStickyState<boolean>(true, 'app-flow-mode-enabled');
  
  const [folders, setFolders] = useStickyState<Folder[]>(initialFolders, 'app-folders');
  const [notes, setNotes] = useStickyState<Note[]>(initialNotes, 'app-notes');
  const [lessons, setLessons] = useStickyState<Lesson[]>(initialLessons, 'app-lessons');
  const [pomodoroSessions, setPomodoroSessions] = useStickyState<PomodoroSession[]>(initialPomodoroSessions, 'app-pomodoro');
  const [savedPlaylists, setSavedPlaylists] = useStickyState<SavedPlaylist[]>([], 'app-saved-playlists');
  const [playlistToPlay, setPlaylistToPlay] = useState<SavedPlaylist | null>(null);
  const [motivationalVideos, setMotivationalVideos] = useStickyState<MotivationalVideo[]>(initialMotivationalVideos, 'app-motivational-videos');
  const [postPomodoroVideos, setPostPomodoroVideos] = useStickyState<PostPomodoroVideoPools>(initialPostPomodoroVideos, 'app-post-pomodoro-videos');
  const [tasks, setTasks] = useStickyState<Task[]>([], 'app-tasks');

  // Gamification states
  const [gameTickets, setGameTickets] = useStickyState<number>(5, 'app-game-tickets');
  const [wheelSpins, setWheelSpins] = useStickyState<number>(3, 'app-wheel-spins');
  const [op, setOp] = useStickyState<number>(100, 'app-op');
  const [unlockedCardIds, setUnlockedCardIds] = useStickyState<string[]>(['C001'], 'app-unlocked-cards');
  const [completedSessionCountForCards, setCompletedSessionCountForCards] = useStickyState<number>(0, 'app-session-count-for-cards');
  const [collectionCards, setCollectionCards] = useStickyState<CollectionCard[]>(initialAllCards, 'app-collection-cards');
  const [legendaryCardsUnlockedForIcon, setLegendaryCardsUnlockedForIcon] = useStickyState<number>(0, 'app-legendary-unlocked-for-icon');

  
  const spendOp = useCallback((amount: number) => {
    setOp(prev => Math.max(0, prev - amount));
  }, [setOp]);

  const addCollectionCard = useCallback((card: Omit<CollectionCard, 'id' | 'unlockMethod'>) => {
    const newCard: CollectionCard = {
      ...card,
      id: `CSTM-${Date.now()}`,
      unlockMethod: 'op'
    };
    setCollectionCards(prev => [...prev, newCard]);
  }, [setCollectionCards]);
  
  const updateCollectionCard = useCallback((id: string, updates: Partial<CollectionCard>) => {
    setCollectionCards(prev => prev.map(card => card.id === id ? { ...card, ...updates } : card));
  }, [setCollectionCards]);

  const deleteCollectionCard = useCallback((id: string) => {
    // Also remove from unlocked cards if it's there
    setUnlockedCardIds(prev => prev.filter(cardId => cardId !== id));
    setCollectionCards(prev => prev.filter(card => card.id !== id));
  }, [setCollectionCards, setUnlockedCardIds]);

  const unlockCardWithOp = useCallback((cardId: string): boolean => {
    const cardToUnlock = collectionCards.find(card => card.id === cardId);
    if (!cardToUnlock || cardToUnlock.unlockMethod !== 'op' || unlockedCardIds.includes(cardId)) {
        return false;
    }

    if (op >= cardToUnlock.opCost) {
        spendOp(cardToUnlock.opCost);
        setUnlockedCardIds(prev => [...prev, cardId]);
        return true;
    }
    
    return false;
  }, [op, spendOp, unlockedCardIds, setUnlockedCardIds, collectionCards]);


  const addPomodoroSession = useCallback((session: Omit<PomodoroSession, 'id'>): LastEarnedRewards => {
    setPomodoroSessions(prev => [...prev, { ...session, id: String(Date.now()) }]);
    
    const duration = session.duration;
    let ticketsEarned = 0;
    let spinsEarned = 0;
    // Award 1 OP per minute of focus
    let opEarned = duration;
    
    if (duration >= 90) {
        ticketsEarned = 6;
        spinsEarned = 2;
    } else if (duration >= 40) {
        ticketsEarned = 2;
        spinsEarned = 1;
    } else if (duration >= 25) {
        ticketsEarned = 1;
    }
    
    if (ticketsEarned > 0) setGameTickets(prev => prev + ticketsEarned);
    if (spinsEarned > 0) setWheelSpins(prev => prev + spinsEarned);
    if (opEarned > 0) setOp(prev => prev + opEarned);

    // Legendary card progress is now manual. Just increment the counter.
    if (duration >= 20) {
        setCompletedSessionCountForCards(prev => prev + 1);
    }

    return { tickets: ticketsEarned, spins: spinsEarned, op: opEarned, newCard: null };
  }, [setPomodoroSessions, setGameTickets, setWheelSpins, setOp, setCompletedSessionCountForCards]);

  const claimLegendaryCard = useCallback((cardToUnlockId: string): CollectionCard | null => {
    if (completedSessionCountForCards < 10) {
        return null;
    }

    const card = collectionCards.find(c => c.id === cardToUnlockId);

    if (!card || card.unlockMethod !== 'session_streak' || unlockedCardIds.includes(cardToUnlockId)) {
        return null;
    }

    setUnlockedCardIds(prev => [...prev, card.id]);
    setCompletedSessionCountForCards(prev => prev - 10);
    setLegendaryCardsUnlockedForIcon(prev => prev + 1);
    return card;
  }, [completedSessionCountForCards, collectionCards, unlockedCardIds, setCompletedSessionCountForCards, setUnlockedCardIds, setLegendaryCardsUnlockedForIcon]);
  
  const claimIconCard = useCallback((): CollectionCard | null => {
      const availableIconCards = collectionCards.filter(c => c.rarity === 'Icon' && !unlockedCardIds.includes(c.id));
      if (legendaryCardsUnlockedForIcon < 3 || availableIconCards.length === 0) {
          return null;
      }

      const cardToUnlock = availableIconCards[Math.floor(Math.random() * availableIconCards.length)];
      setUnlockedCardIds(prev => [...prev, cardToUnlock.id]);
      setLegendaryCardsUnlockedForIcon(prev => prev - 3);

      return cardToUnlock;
  }, [legendaryCardsUnlockedForIcon, collectionCards, unlockedCardIds, setLegendaryCardsUnlockedForIcon, setUnlockedCardIds]);


  const spendGameTicket = useCallback(() => {
    setGameTickets(prev => Math.max(0, prev - 1));
  }, [setGameTickets]);

  const spendWheelSpin = useCallback(() => {
    setWheelSpins(prev => Math.max(0, prev - 1));
  }, [setWheelSpins]);

  const addGameTickets = useCallback((amount: number) => {
    setGameTickets(prev => prev + amount);
  }, [setGameTickets]);
  
  const addOp = useCallback((amount: number) => {
    setOp(prev => prev + amount);
  }, [setOp]);


  const toggleTheme = useCallback(() => setTheme(prev => prev === 'light' ? 'dark' : 'light'), [setTheme]);
  
  const setBackground = useCallback((url: string) => {
    _setBackground(url);
    _setBackgroundColor(null);
  }, [_setBackground, _setBackgroundColor]);
  
  const setBackgroundColor = useCallback((color: string) => {
    _setBackground(null);
    _setBackgroundColor(color);
  }, [_setBackground, _setBackgroundColor]);

  const addFolder = useCallback((name: string) => {
    setFolders(prev => [...prev, { id: String(Date.now()), name, createdAt: Date.now() }]);
  }, [setFolders]);
  const updateFolder = useCallback((id: string, name: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f));
  }, [setFolders]);
  const deleteFolder = useCallback((id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setNotes(prev => prev.map(n => n.folderId === id ? { ...n, folderId: null } : n));
  }, [setFolders, setNotes]);
  
  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
    const newNote: Note = {
      ...note,
      id: String(Date.now()),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  }, [setNotes]);
  const updateNote = useCallback((id: string, title: string, content: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, title, content, updatedAt: Date.now() } : n));
  }, [setNotes]);
  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, [setNotes]);
  const moveNote = useCallback((noteId: string, targetFolderId: string | null) => {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, folderId: targetFolderId } : n));
  }, [setNotes]);

  const addLesson = useCallback((lesson: Omit<Lesson, 'id'>) => {
    setLessons(prev => [...prev, { ...lesson, id: String(Date.now()) }]);
  }, [setLessons]);
  const updateLesson = useCallback((id: string, updates: Partial<Lesson>) => {
    setLessons(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, [setLessons]);
  const deleteLesson = useCallback((id: string) => {
    setLessons(prev => prev.filter(l => l.id !== id));
  }, [setLessons]);
  
  const addSavedPlaylist = useCallback((name: string, url: string) => {
    const newPlaylist: SavedPlaylist = { id: String(Date.now()), name, url };
    setSavedPlaylists(prev => [...prev, newPlaylist]);
  }, [setSavedPlaylists]);
  const updateSavedPlaylist = useCallback((id: string, name: string) => {
    setSavedPlaylists(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  }, [setSavedPlaylists]);
  const deleteSavedPlaylist = useCallback((id: string) => {
    setSavedPlaylists(prev => prev.filter(p => p.id !== id));
  }, [setSavedPlaylists]);
  const playPlaylist = useCallback((playlist: SavedPlaylist) => {
    setPlaylistToPlay(playlist);
    setActivePage(Page.Dashboard);
  }, [setActivePage]);

  const addMotivationalVideo = useCallback((url: string) => {
    setMotivationalVideos(prev => [...prev, { id: String(Date.now()), url }]);
  }, [setMotivationalVideos]);
  const deleteMotivationalVideo = useCallback((id: string) => {
    setMotivationalVideos(prev => prev.filter(v => v.id !== id));
  }, [setMotivationalVideos]);
  const addPostPomodoroVideo = useCallback((category: PostPomodoroCategory, url: string) => {
    const newVideo = { id: String(Date.now()), url };
    setPostPomodoroVideos(prev => ({ ...prev, [category]: [...(prev[category] || []), newVideo] }));
  }, [setPostPomodoroVideos]);
  const deletePostPomodoroVideo = useCallback((category: PostPomodoroCategory, videoId: string) => {
    setPostPomodoroVideos(prev => ({ ...prev, [category]: prev[category].filter(v => v.id !== videoId) }));
  }, [setPostPomodoroVideos]);

  const addTask = useCallback((text: string) => {
    const newTask: Task = { id: String(Date.now()), text, completed: false, completedAt: null };
    setTasks(prev => [newTask, ...prev]);
  }, [setTasks]);
  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : null } : t));
  }, [setTasks]);
  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, [setTasks]);
  const clearCompletedTasks = useCallback(() => {
    setTasks(prev => prev.filter(t => !t.completed));
  }, [setTasks]);

  const backgroundStyle = useMemo((): CSSProperties => ({
    backgroundImage: background ? `url(${background})` : 'none',
    backgroundColor: backgroundColor ? backgroundColor : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: `blur(${backgroundBlur}px) brightness(${backgroundOpacity / 100})`,
  }), [background, backgroundColor, backgroundBlur, backgroundOpacity]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const stableValue = useMemo(() => ({
    theme, toggleTheme,
    background, setBackground, backgroundColor, setBackgroundColor, backgroundBlur, setBackgroundBlur, backgroundOpacity, setBackgroundOpacity, backgroundStyle,
    motivationalImage, setMotivationalImage,
    isFlowModeEnabled, setIsFlowModeEnabled,
    folders, addFolder, updateFolder, deleteFolder,
    notes, addNote, updateNote, deleteNote, moveNote,
    lessons, addLesson, updateLesson, deleteLesson,
    pomodoroSessions, addPomodoroSession,
    savedPlaylists, addSavedPlaylist, updateSavedPlaylist, deleteSavedPlaylist,
    playlistToPlay, playPlaylist, setPlaylistToPlay,
    activePage, setActivePage,
    motivationalVideos, addMotivationalVideo, deleteMotivationalVideo,
    postPomodoroVideos, addPostPomodoroVideo, deletePostPomodoroVideo,
    tasks, addTask, toggleTask, deleteTask, clearCompletedTasks,
    gameTickets, wheelSpins, op, unlockedCardIds,
    spendGameTicket, spendWheelSpin, addGameTickets, addOp, unlockCardWithOp,
    collectionCards, addCollectionCard, updateCollectionCard, deleteCollectionCard,
    completedSessionCountForCards, claimLegendaryCard,
    legendaryCardsUnlockedForIcon, claimIconCard,
  }), [
    theme, toggleTheme, background, setBackground, backgroundColor, setBackgroundColor, backgroundBlur, setBackgroundBlur, backgroundOpacity, setBackgroundOpacity, backgroundStyle,
    motivationalImage, setMotivationalImage, isFlowModeEnabled, setIsFlowModeEnabled,
    folders, addFolder, updateFolder, deleteFolder, notes, addNote, updateNote, deleteNote, moveNote,
    lessons, addLesson, updateLesson, deleteLesson, pomodoroSessions, addPomodoroSession, savedPlaylists, addSavedPlaylist, updateSavedPlaylist, deleteSavedPlaylist,
    playlistToPlay, playPlaylist, setPlaylistToPlay, activePage, setActivePage, motivationalVideos, addMotivationalVideo, deleteMotivationalVideo,
    postPomodoroVideos, addPostPomodoroVideo, deletePostPomodoroVideo, tasks, addTask, toggleTask, deleteTask, clearCompletedTasks,
    gameTickets, wheelSpins, op, unlockedCardIds, spendGameTicket, spendWheelSpin, addGameTickets, addOp, unlockCardWithOp,
    collectionCards, addCollectionCard, updateCollectionCard, deleteCollectionCard,
    completedSessionCountForCards, claimLegendaryCard, legendaryCardsUnlockedForIcon, claimIconCard
  ]);

  return (
    <DataContext.Provider value={stableValue}>
        {children}
    </DataContext.Provider>
  );
};
