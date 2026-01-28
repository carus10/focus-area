
import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import Icon from './Icon.tsx';
import { DataContext } from '../context/DataContext.tsx';
import Modal from './Modal.tsx';

// --- Type Definitions ---
interface Track {
  id: string;
  title: string;
  artist: { name:string };
  album: { cover_medium: string };
  preview: string; // This will now be the full audio URL
}

type Status = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

// --- Helper Functions ---
const getIdentifierFromUrl = (url: string): string | null => {
  if (!url) return null;
  try {
    const urlObject = new URL(url);
    if (urlObject.hostname !== 'archive.org') return null;
    const pathParts = urlObject.pathname.split('/');
    // URL format is /details/{identifier}
    const detailsIndex = pathParts.indexOf('details');
    if (detailsIndex !== -1 && pathParts.length > detailsIndex + 1) {
      return pathParts[detailsIndex + 1];
    }
    return null;
  } catch (e) {
    return null;
  }
};

const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00';
    const floorSeconds = Math.floor(seconds);
    const mins = Math.floor(floorSeconds / 60);
    const secs = floorSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};


// --- Component ---
const MusicWidget: React.FC = () => {
  const { addSavedPlaylist, playlistToPlay, setPlaylistToPlay } = useContext(DataContext);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });
  const [volume, setVolume] = useState(1);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);
  const lastTrackIdRef = useRef<string | null>(null); // Track ID ref to prevent unnecessary src resets
  const currentTrack = tracks.length > 0 ? tracks[currentTrackIndex] : null;

  const playNext = useCallback(() => {
    if (tracks.length > 1) {
        setCurrentTrackIndex(prevIndex => (prevIndex + 1) % tracks.length);
    }
  }, [tracks.length]);

  const loadPlaylist = useCallback(async (urlToLoad: string) => {
    if (!urlToLoad) return;
    setErrorMessage('');
    setTracks([]);
    lastTrackIdRef.current = null; // Reset track ID ref when loading new playlist
    setStatus('loading');

    const identifier = getIdentifierFromUrl(urlToLoad);
    if (!identifier) {
      setStatus('error');
      setErrorMessage("Geçersiz URL. Lütfen geçerli bir Internet Archive koleksiyon linki girin.");
      return;
    }

    try {
      const response = await fetch(`https://archive.org/metadata/${identifier}`);
      if (!response.ok) {
        throw new Error("Koleksiyon bulunamadı veya sunucu hatası.");
      }
      const data = await response.json();
      
      const audioFiles = data.files?.filter((file: any) => 
        file.format?.includes('MP3') || file.format?.includes('Ogg Vorbis')
      );

      if (!audioFiles || audioFiles.length === 0) {
         setStatus('error');
         setErrorMessage("Bu koleksiyonda çalınabilir ses dosyası bulunamadı.");
         return;
      }

      const fetchedTracks: Track[] = audioFiles.map((file: any, index: number) => ({
        id: file.md5 || `${identifier}-${index}`,
        title: file.title || data.metadata?.title || 'Bilinmeyen Parça',
        artist: { name: file.creator || data.metadata?.creator || 'Bilinmeyen Sanatçı' },
        album: { cover_medium: `https://archive.org/services/get-item-image.php?identifier=${identifier}` },
        preview: `https://archive.org/download/${identifier}/${file.name}`,
      }));

      setTracks(fetchedTracks);
      setCurrentTrackIndex(0);
      setStatus('playing'); // Autoplay
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || "Liste yüklenirken bir hata oluştu. URL'yi veya internet bağlantınızı kontrol edin.");
    }
  }, []);

  useEffect(() => {
    if (playlistToPlay) {
      setPlaylistUrl(playlistToPlay.url);
      loadPlaylist(playlistToPlay.url);
      setPlaylistToPlay(null); // Clear after use
    }
  }, [playlistToPlay, loadPlaylist, setPlaylistToPlay]);


  useEffect(() => {
    if (audioRef.current && currentTrack) {
        // Use ID comparison instead of src string comparison to avoid issues with URL encoding
        if (lastTrackIdRef.current !== currentTrack.id) {
            lastTrackIdRef.current = currentTrack.id;
            audioRef.current.src = currentTrack.preview;
            
            if (status === 'playing') {
                audioRef.current.play().catch(() => {
                    setStatus('paused'); // Autoplay might be blocked
                });
            }
        }
    }
  }, [currentTrack, status]); 

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => playNext();
    const handleTimeUpdate = () => {
        setProgress(prev => ({ ...prev, currentTime: audio.currentTime }));
    };
    const handleLoadedMetadata = () => {
        setProgress({ currentTime: 0, duration: audio.duration });
    };


    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [playNext]);

  const handleLoadPlaylistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loadPlaylist(playlistUrl);
  };

  const handleSavePlaylist = () => {
    const identifier = getIdentifierFromUrl(playlistUrl);
    if (!identifier) {
        alert("Please load a valid playlist before saving.");
        return;
    }
    setNewPlaylistName(currentTrack?.artist.name || identifier);
    setIsSaveModalOpen(true);
  }

  const handleConfirmSavePlaylist = () => {
    if (newPlaylistName.trim() && playlistUrl) {
        addSavedPlaylist(newPlaylistName.trim(), playlistUrl);
        setIsSaveModalOpen(false);
        setNewPlaylistName('');
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (status === 'playing') {
      audioRef.current.pause();
      setStatus('paused');
    } else {
      audioRef.current.play().then(() => setStatus('playing')).catch(() => {
          setStatus('error');
          setErrorMessage("Medya oynatılamadı. Lütfen tekrar deneyin.");
      });
    }
  };

  const playPrev = () => {
    setCurrentTrackIndex(prevIndex => (prevIndex - 1 + tracks.length) % tracks.length);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
        audioRef.current.currentTime = Number(e.target.value);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
        audioRef.current.volume = newVolume;
    }
  };
  
  const isLoading = status === 'loading';
  const isPlayerActive = tracks.length > 0 && status !== 'loading' && status !== 'error' && !!currentTrack;
  const isPlaying = status === 'playing';

  const { title: displayTitle, author: displayAuthor, cover: displayCover } = (() => {
    if (status === 'error') return { title: 'Hata Oluştu', author: errorMessage, cover: null };
    if (isLoading) return { title: 'Yükleniyor...', author: 'Lütfen bekleyin...', cover: null };
    if (isPlayerActive && currentTrack) return { title: currentTrack.title, author: currentTrack.artist.name, cover: currentTrack.album.cover_medium };
    return { title: 'Koleksiyon Bekleniyor', author: 'Internet Archive', cover: null };
  })();

  return (
    <div className="bg-light-card/60 dark:bg-dark-card/50 backdrop-blur-2xl p-6 rounded-2xl shadow-lg border border-white/20 dark:border-white/10 flex flex-col h-full">
      <audio ref={audioRef} />
      
      <h2 className="text-xl font-bold mb-4">Music Player</h2>
      
      <div className="flex-grow flex flex-col md:flex-row items-center gap-6">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg shadow-lg bg-dark-card flex items-center justify-center shrink-0 overflow-hidden">
            {displayCover ? (
                <img src={displayCover} alt="Album Art" className="w-full h-full object-cover" />
            ) : (
              <Icon name="Music" className={`w-12 h-12 ${status === 'error' ? 'text-red-500' : 'text-primary'}`} />
            )}
          </div>

          <div className="w-full flex-1 flex flex-col justify-center text-center md:text-left">
            <p className="font-bold text-2xl truncate" title={displayTitle}>{displayTitle}</p>
            <p className={`text-md truncate mt-1 ${status === 'error' ? 'text-red-400' : 'text-gray-500 dark:text-gray-400'}`} title={displayAuthor}>{displayAuthor}</p>
            
             {isPlayerActive && (
                <div className="mt-4">
                    <input
                        type="range"
                        min="0"
                        max={progress.duration || 0}
                        value={progress.currentTime}
                        onChange={handleSeek}
                        className="w-full"
                        disabled={!isPlayerActive}
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{formatTime(progress.currentTime)}</span>
                        <span>{formatTime(progress.duration)}</span>
                    </div>
                </div>
            )}

            <div className="flex justify-center items-center space-x-6 my-4">
              <button onClick={playPrev} disabled={!isPlayerActive} className="text-gray-500 dark:text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon name="SkipBack" className="w-6 h-6" />
              </button>
              <button onClick={togglePlay} disabled={!isPlayerActive} className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/40 hover:bg-primary-hover disabled:opacity-50 disabled:bg-gray-500 disabled:cursor-not-allowed">
                {isPlaying ? <Icon name="Pause" className="w-7 h-7" /> : <Icon name="Play" className="w-7 h-7" />}
              </button>
              <button onClick={playNext} disabled={!isPlayerActive} className="text-gray-500 dark:text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon name="SkipForward" className="w-6 h-6" />
              </button>
            </div>
          </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mt-auto pt-4 border-t border-white/20 dark:border-white/10">
        <div className="flex items-center space-x-2 w-full md:w-1/3">
            <Icon name="Volume2" className="w-5 h-5 text-gray-500"/>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full"
            />
        </div>
        <form onSubmit={handleLoadPlaylistSubmit} className="w-full md:w-2/3">
            <div className="flex">
              <input
                type="text"
                value={playlistUrl}
                onChange={e => setPlaylistUrl(e.target.value)}
                placeholder="Internet Archive koleksiyon URL'si..."
                className="w-full bg-gray-500/10 dark:bg-white/5 p-2 rounded-l-md border-transparent focus:border-primary focus:ring-primary text-sm"
                aria-label="Internet Archive Collection URL"
              />
              <button type="button" onClick={handleSavePlaylist} className="bg-primary/80 text-white px-3 py-2 hover:bg-primary-hover font-semibold text-sm disabled:bg-gray-400" title="Save Playlist" disabled={!isPlayerActive}>
                <Icon name="Save" className="w-4 h-4"/>
              </button>
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary-hover font-semibold text-sm disabled:bg-gray-400" disabled={isLoading}>
                {isLoading ? '...' : 'Yükle'}
              </button>
            </div>
        </form>
      </div>
      <Modal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} title="Save Playlist">
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Playlist Name</label>
                <input 
                    type="text" 
                    value={newPlaylistName} 
                    onChange={e => setNewPlaylistName(e.target.value)} 
                    className="mt-1 block w-full bg-gray-500/10 dark:bg-white/5 border-transparent rounded-md shadow-sm p-2"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmSavePlaylist(); }}
                />
            </div>
            <div className="flex justify-end space-x-2">
                <button onClick={() => setIsSaveModalOpen(false)} className="bg-gray-500/20 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-500/30">Cancel</button>
                <button onClick={handleConfirmSavePlaylist} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover">Save</button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default MusicWidget;
