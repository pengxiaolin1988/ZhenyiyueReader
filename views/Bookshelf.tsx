import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LiveSessionClient } from '../services/geminiService';
import { dataService } from '../services/dataService';
import LiveVisualizer from '../components/LiveVisualizer';
import { Book } from '../types';

const Bookshelf: React.FC = () => {
  const navigate = useNavigate();
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [volume, setVolume] = useState(0);
  const [liveClient] = useState(() => new LiveSessionClient());
  const [books, setBooks] = useState<Book[]>([]);
  const [todayMins, setTodayMins] = useState(0);
  const [loading, setLoading] = useState(true);

  const DAILY_GOAL = 30; // Minutes

  useEffect(() => {
    const loadBooks = async () => {
        const myBooks = await dataService.getMyBooks();
        const mins = await dataService.getTodayReadingMinutes();
        setBooks(myBooks);
        setTodayMins(mins);
        setLoading(false);
    };
    loadBooks();

    liveClient.onOutputVolume = (vol) => setVolume(vol);
    return () => { liveClient.disconnect(); };
  }, [liveClient]);

  const toggleLive = async () => {
    if (isLiveActive) {
      await liveClient.disconnect();
      setIsLiveActive(false);
    } else {
      try {
        await liveClient.connect(() => {});
        setIsLiveActive(true);
      } catch (e) {
        alert("Microphone access required.");
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-white"></div>;

  const currentRead = books[0];
  const goalPercent = Math.min(100, (todayMins / DAILY_GOAL) * 100);

  return (
    <div className="bg-white min-h-screen pb-24 font-sans text-[#1C1C1E]">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md z-30 px-6 pt-12 pb-4 border-b border-gray-100 flex justify-between items-end">
        <h1 className="text-[34px] font-bold tracking-tight text-gray-900 font-serif leading-none">书架</h1>
        <div 
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-200 cursor-pointer md:hidden"
        >
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover" alt="Avatar"/>
        </div>
      </header>

      <div className="p-6 space-y-10">
        
        {/* Reading Goal - Apple Style */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
            <div className="flex-1">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">今日阅读目标</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{todayMins} 分钟</h3>
                <p className="text-sm text-gray-500">距目标 {DAILY_GOAL} 分钟还差 {Math.max(0, DAILY_GOAL - todayMins)} 分钟</p>
                <button onClick={() => navigate('/profile')} className="mt-3 text-blue-600 text-sm font-semibold flex items-center gap-1">
                    查看详情 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                </button>
            </div>
            
            <div className="relative w-20 h-20 flex items-center justify-center">
                 {/* Circular Progress SVG */}
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                    <circle 
                        cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={213.6}
                        strokeDashoffset={213.6 - (213.6 * goalPercent) / 100}
                        strokeLinecap="round"
                        className="text-black transition-all duration-1000 ease-out" 
                    />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <svg className={`w-6 h-6 ${goalPercent === 100 ? 'text-black' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                 </div>
            </div>
        </div>

        {/* Reading Now Card */}
        {currentRead ? (
            <div onClick={() => navigate(`/read/${currentRead.id}`)} className="cursor-pointer group">
               <div className="relative w-full aspect-[2/1] md:aspect-[3/1] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 bg-gray-50 border border-gray-100">
                   {/* Blurred Background */}
                   <div className="absolute inset-0 overflow-hidden">
                       <img src={currentRead.coverUrl} className="w-full h-full object-cover blur-3xl opacity-30 scale-125 translate-y-10" alt="bg"/>
                   </div>

                   <div className="relative z-10 h-full flex items-center px-6 md:px-10 gap-6 md:gap-10">
                        {/* Book Cover */}
                        <div className="w-24 md:w-32 aspect-[2/3] shadow-[0_8px_20px_rgba(0,0,0,0.15)] rounded-md bg-white overflow-hidden flex-shrink-0 transform group-hover:scale-105 transition-transform duration-500 group-hover:-translate-y-1">
                             <img src={currentRead.coverUrl} className="w-full h-full object-cover" alt="cover" />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0 py-4">
                             <span className="text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 block">继续阅读</span>
                             <h2 className="font-serif text-xl md:text-3xl font-bold text-gray-900 leading-tight mb-2 truncate">{currentRead.title}</h2>
                             <p className="text-sm md:text-base text-gray-500 mb-4 truncate">{currentRead.author}</p>
                             <div className="flex items-center gap-3 max-w-xs">
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-black rounded-full" style={{ width: `${currentRead.progress}%` }}></div>
                                </div>
                                <span className="text-xs font-bold text-gray-500 tabular-nums">{currentRead.progress}%</span>
                             </div>
                        </div>
                   </div>
               </div>
            </div>
        ) : (
            <div onClick={() => navigate('/store')} className="p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center cursor-pointer hover:bg-gray-100 transition">
                <span className="text-gray-400 font-medium">去书城挑选一本好书</span>
            </div>
        )}

        {/* Live Assistant Pill */}
        <div onClick={toggleLive} className="flex items-center justify-between bg-black text-white p-5 rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer active:scale-[0.99] transition-all duration-300">
             <div className="flex items-center gap-4 overflow-hidden">
                 <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 relative overflow-hidden ring-2 ring-gray-700">
                     {isLiveActive ? <LiveVisualizer isActive={true} volume={volume} /> : (
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                     )}
                 </div>
                 <div>
                     <h3 className="font-bold text-base">Lumina AI 伴读</h3>
                     <p className="text-xs text-gray-400 mt-0.5">{isLiveActive ? "轻点结束对话" : "聊聊剧情、分析人物、激发灵感"}</p>
                 </div>
             </div>
             <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
             </div>
        </div>

        {/* Library Grid */}
        <div>
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-serif text-gray-900">我的书架</h2>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              </button>
           </div>
           
           <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-6 gap-y-10">
               {books.map(book => (
                   <div key={book.id} onClick={() => navigate(`/read/${book.id}`)} className="flex flex-col gap-3 cursor-pointer group">
                       <div className="w-full aspect-[2/3] shadow-[0_5px_15px_rgba(0,0,0,0.08)] rounded-[4px] overflow-hidden bg-gray-100 relative group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] group-hover:-translate-y-1 transition-all duration-300">
                           <img src={book.coverUrl} className="w-full h-full object-cover" alt={book.title} />
                           {book.progress > 0 && book !== currentRead && (
                               <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 backdrop-blur-sm">
                                   <div className="h-full bg-white/90" style={{ width: `${book.progress}%` }}></div>
                               </div>
                           )}
                       </div>
                       <div className="space-y-1">
                           <p className="text-[13px] md:text-[14px] font-semibold text-gray-900 leading-tight line-clamp-2">{book.title}</p>
                           <p className="text-[11px] md:text-[12px] text-gray-500 line-clamp-1">{book.author}</p>
                       </div>
                   </div>
               ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default Bookshelf;