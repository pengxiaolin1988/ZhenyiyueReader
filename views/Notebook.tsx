
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';

const Notebook: React.FC = () => {
  const navigate = useNavigate();
  const [highlights, setHighlights] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
        const all = await dataService.getAllHighlights();
        setHighlights(all);
        setLoading(false);
    };
    load();
  }, []);

  const filtered = highlights.filter(h => 
      h.text.toLowerCase().includes(filter.toLowerCase()) || 
      h.bookTitle.toLowerCase().includes(filter.toLowerCase())
  );

  const handleBack = () => {
      // 在浏览器环境中，window.history.length 包含应用外的历史。
      // 使用 window.history.back() 是最原始也最可靠的系统级返回方式
      if (window.history.length > 1) {
          window.history.back();
      } else {
          navigate('/', { replace: true });
      }
  };

  return (
    <div className="bg-[#F2F2F7] min-h-screen pb-20 font-sans selection:bg-orange-200">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 px-6 pt-12 pb-4 shadow-sm">
         <div className="flex justify-between items-center mb-6">
             <button onClick={handleBack} className="text-blue-600 font-bold active:opacity-40 transition flex items-center gap-1 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
                返回
             </button>
             <h1 className="text-lg font-black tracking-tight">笔记本</h1>
             <div className="w-10"></div>
         </div>
         <div className="relative">
             <input 
                type="text" 
                placeholder="搜索笔记或书名..." 
                className="w-full bg-gray-100/80 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#B05B3B]/20 transition-all font-medium"
                value={filter}
                onChange={e => setFilter(e.target.value)}
             />
         </div>
      </header>

      <div className="p-4 space-y-4 pt-8">
          {loading ? (
              <div className="flex flex-col items-center justify-center py-24 opacity-20">
                  <div className="w-8 h-8 border-2 border-t-black rounded-full animate-spin mb-4"></div>
                  <p className="text-xs font-black uppercase tracking-widest">同步笔记中...</p>
              </div>
          ) : filtered.length > 0 ? (
              filtered.map(h => (
                  <div key={h.id} className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-gray-100 group active:scale-[0.98] transition-transform cursor-pointer" onClick={() => navigate(`/read/${h.bookId}`)}>
                      <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] font-black text-[#B05B3B] uppercase tracking-[0.2em] bg-[#B05B3B]/5 px-2 py-0.5 rounded-full">{h.bookTitle}</span>
                          <span className="text-[10px] text-gray-300 font-bold">{new Date(h.date).toLocaleDateString()}</span>
                      </div>
                      <div className={`p-5 rounded-2xl ${h.color || 'bg-yellow-100'} text-gray-800 text-sm italic font-serif leading-relaxed mb-4 relative overflow-hidden border border-black/5`}>
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/5"></div>
                          “{h.text}”
                      </div>
                      <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">第 {h.chapterIndex + 1} 章节</span>
                          <button className="text-blue-500 text-[10px] font-black uppercase tracking-widest">回顾原文 &rarr;</button>
                      </div>
                  </div>
              ))
          ) : (
              <div className="text-center py-32 text-gray-400 space-y-6 opacity-20">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  <p className="text-sm font-black uppercase tracking-[0.3em]">暂无相关笔记</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default Notebook;
