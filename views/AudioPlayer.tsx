import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { Book } from '../types';
import { generateSpeech } from '../services/geminiService';

const AudioPlayer: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // in seconds
  const [duration, setDuration] = useState(180); // Default to a short demo duration
  const [isGenerating, setIsGenerating] = useState(false);
  const [volume, setVolume] = useState(0.8);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Demo audio for fallback (Royalty free nature sound or speech)
  const DEMO_AUDIO_URL = "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav"; 

  useEffect(() => {
    if (!id) return;
    const loadBook = async () => {
       const b = await dataService.getBookById(id);
       setBook(b);
    };
    loadBook();
    
    // Initialize fallback audio logic
    // We create the element but don't play yet
    if (!fallbackAudioRef.current) {
        fallbackAudioRef.current = new Audio(DEMO_AUDIO_URL);
        fallbackAudioRef.current.loop = false;
        fallbackAudioRef.current.addEventListener('loadedmetadata', () => {
            if(fallbackAudioRef.current) setDuration(fallbackAudioRef.current.duration);
        });
        fallbackAudioRef.current.addEventListener('ended', () => {
            setIsPlaying(false);
            if(intervalRef.current) clearInterval(intervalRef.current);
        });
    }

    return () => {
        if (fallbackAudioRef.current) {
            fallbackAudioRef.current.pause();
            fallbackAudioRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id]);

  // Handle Play/Pause logic
  const togglePlay = async () => {
      // Logic: If user clicks play, we check if we have AI audio generated. 
      // If not, we play fallback.
      
      if (isPlaying) {
          // Pause logic
          if (fallbackAudioRef.current) fallbackAudioRef.current.pause();
          if (audioContextRef.current?.state === 'running') {
              audioContextRef.current.suspend();
          }
          setIsPlaying(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
          // Play logic
          setIsPlaying(true);
          
          // Check if we are using Web Audio (AI) or Fallback
          if (audioContextRef.current && audioSourceRef.current) {
              // Resuming AI Audio
              if (audioContextRef.current.state === 'suspended') {
                  audioContextRef.current.resume();
              }
          } else {
              // Playing Fallback
              if (fallbackAudioRef.current) {
                  fallbackAudioRef.current.volume = volume;
                  try {
                      await fallbackAudioRef.current.play();
                  } catch (e) {
                      console.error("Autoplay prevented", e);
                      setIsPlaying(false);
                  }
              }
          }

          // Start interval for UI updates
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = window.setInterval(() => {
              if (fallbackAudioRef.current && !audioSourceRef.current) {
                  setProgress(fallbackAudioRef.current.currentTime);
              }
              // Note: Web Audio progress is handled in handleAIPreview custom interval
          }, 500);
      }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = Number(e.target.value);
      setProgress(newTime);
      if (fallbackAudioRef.current && !audioSourceRef.current) {
          fallbackAudioRef.current.currentTime = newTime;
      }
  };

  // Generate AI Speech (The "Rich" Feature)
  const handleAIPreview = async () => {
     if (!book || isGenerating) return;
     // Stop any current playback
     if (isPlaying) togglePlay();
     
     setIsGenerating(true);
     try {
         const audioData = await generateSpeech(`正在为您朗读 ${book.title}。${book.description.slice(0, 100)}`);
         
         // Use Web Audio API for high quality TTS playback
         if (!audioContextRef.current) {
             audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
         }
         const ctx = audioContextRef.current;
         if (ctx.state === 'suspended') await ctx.resume();

         const buffer = await ctx.decodeAudioData(audioData);
         if (audioSourceRef.current) audioSourceRef.current.disconnect();
         
         const source = ctx.createBufferSource();
         source.buffer = buffer;
         source.connect(ctx.destination);
         source.start();
         audioSourceRef.current = source;
         
         setIsPlaying(true);
         setDuration(buffer.duration);
         
         // Custom progress tracking for Web Audio API
         const startTime = ctx.currentTime;
         if (intervalRef.current) clearInterval(intervalRef.current);
         intervalRef.current = window.setInterval(() => {
             const curr = ctx.currentTime - startTime;
             if (curr >= buffer.duration) {
                 setIsPlaying(false);
                 clearInterval(intervalRef.current!);
                 setProgress(buffer.duration);
                 audioSourceRef.current = null; // Reset to allow fallback next time if needed
             } else {
                 setProgress(curr);
             }
         }, 100);

         source.onended = () => {
             setIsPlaying(false);
         };

     } catch (e) {
         console.error(e);
         alert("AI 语音生成失败，请检查 API Key。");
     } finally {
         setIsGenerating(false);
     }
  };

  if (!book) return <div className="bg-white min-h-screen"></div>;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-100 text-gray-900 font-sans flex flex-col">
       {/* Background */}
       <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gray-200/80 backdrop-blur-3xl z-10"></div>
          <img src={book.coverUrl} className="w-full h-full object-cover blur-[80px] opacity-60 scale-125" alt="bg" />
       </div>

       {/* Header */}
       <div className="relative z-20 flex justify-between items-center px-6 pt-12 pb-2">
             <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300/30 active:bg-gray-400/50 transition cursor-pointer text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
             </button>
             <div className="text-xs font-bold tracking-widest uppercase text-gray-500 bg-gray-200/50 px-3 py-1 rounded-full backdrop-blur-md">正在播放</div>
             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300/30 active:bg-gray-400/50 transition text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
             </button>
       </div>

       {/* Main Content */}
       <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-8 py-4">
            {/* Album Art with Heavy Shadow */}
             <div className="w-full max-w-[280px] aspect-square relative mb-10 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.4)] rounded-xl bg-white">
                <img src={book.coverUrl} className="w-full h-full object-cover rounded-xl" alt="Cover" />
             </div>
             
             {/* Text Info */}
             <div className="w-full flex justify-between items-start mb-8">
                 <div className="flex-1 pr-4">
                    <h1 className="text-2xl font-bold leading-tight mb-1 text-gray-900 line-clamp-2">{book.title}</h1>
                    <p className="text-lg text-gray-500 line-clamp-1">{book.author}</p>
                 </div>
                 <button onClick={handleAIPreview} className="flex-shrink-0 bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 active:scale-95 transition">
                    {isGenerating ? '生成中...' : 'AI 朗读'}
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                 </button>
             </div>

             {/* Scrubber */}
             <div className="w-full space-y-2 mb-8 group">
                <input 
                  type="range" 
                  min="0" 
                  max={duration} 
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-gray-400/30 rounded-lg appearance-none cursor-pointer accent-gray-800 hover:accent-gray-600"
                />
                <div className="flex justify-between text-xs font-medium text-gray-500 tabular-nums">
                   <span>{formatTime(progress)}</span>
                   <span>-{formatTime(duration - progress)}</span>
                </div>
             </div>

             {/* Controls */}
             <div className="w-full flex justify-between items-center mb-10 px-4">
                <button className="text-gray-900 active:opacity-50 transition">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
                </button>
                <button onClick={togglePlay} className="text-gray-900 active:scale-90 transition transform">
                   {isPlaying ? (
                       <svg className="w-16 h-16 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                   ) : (
                       <svg className="w-16 h-16 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                   )}
                </button>
                <button className="text-gray-900 active:opacity-50 transition">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" /></svg>
                </button>
             </div>

             {/* Bottom Tools */}
             <div className="w-full flex justify-between items-center px-6">
                 {/* Volume Icon */}
                 <div className="flex items-center gap-3 w-1/3">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                    <input type="range" min="0" max="1" step="0.1" value={volume} onChange={e => {
                        setVolume(Number(e.target.value));
                        if(fallbackAudioRef.current) fallbackAudioRef.current.volume = Number(e.target.value);
                    }} className="w-full h-1 bg-gray-400 rounded-lg accent-gray-600"/>
                 </div>

                 {/* AirPlay / Chapter */}
                 <div className="flex gap-6">
                     <button className="text-gray-500 font-bold text-xs bg-gray-200/50 px-3 py-1 rounded-md">
                         1.0x
                     </button>
                     <button className="text-gray-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
                     </button>
                 </div>
             </div>
       </div>
    </div>
  );
};

export default AudioPlayer;