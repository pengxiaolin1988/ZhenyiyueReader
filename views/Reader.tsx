
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { Book, Highlight } from '../types';

const Reader: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [book, setBook] = useState<Book | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const [showControls, setShowControls] = useState(true);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showTOC, setShowTOC] = useState(false); 
  const [showSearch, setShowSearch] = useState(false);
  
  const [fontSize, setFontSize] = useState(20);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [theme, setTheme] = useState<'paper' | 'sepia' | 'gray' | 'dark' | 'mint' | 'night' | 'sakura' | 'nordic' | 'parchment'>('paper');
  const [paginationMode, setPaginationMode] = useState<'vertical' | 'horizontal'>('horizontal');
  const [brightness, setBrightness] = useState(100); 
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selection, setSelection] = useState<{x: number, y: number, text: string} | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
        setLoading(true);
        dataService.getBookById(id).then(b => {
            if (b) {
                setBook(b);
                setHighlights(b.highlights || []);
            }
            setLoading(false);
        });
    }
  }, [id]);

  // 当切换章节或排版变化时，重新计算页数并滚动到第一页
  useEffect(() => {
    if (paginationMode === 'horizontal' && !loading) {
        const timer = setTimeout(() => {
            if (scrollContainerRef.current && contentRef.current) {
                const totalWidth = contentRef.current.scrollWidth;
                const viewWidth = window.innerWidth;
                const pages = Math.max(1, Math.ceil(totalWidth / viewWidth));
                setTotalPages(pages);
                setCurrentPage(1);
                scrollContainerRef.current.scrollLeft = 0;
            }
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [book, currentChapterIndex, paginationMode, fontSize, lineHeight, loading]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (paginationMode === 'horizontal') {
        const left = e.currentTarget.scrollLeft;
        const viewWidth = window.innerWidth;
        const page = Math.round(left / viewWidth) + 1;
        setCurrentPage(page);
    }
  };

  const themes = {
    paper:  { bg: 'bg-[#FAF9F5]', text: 'text-[#333333]', ui: 'bg-white', border: 'border-gray-200' },
    sepia:  { bg: 'bg-[#F4ECD8]', text: 'text-[#5B4636]', ui: 'bg-[#F1E8D0]', border: 'border-[#E3D8B3]' },
    gray:   { bg: 'bg-[#3A3A3C]', text: 'text-[#CECECE]', ui: 'bg-[#2C2C2E]', border: 'border-[#48484A]' },
    dark:   { bg: 'bg-[#000000]', text: 'text-[#D1D1D6]', ui: 'bg-[#1C1C1E]', border: 'border-[#333333]' },
    mint:   { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', ui: 'bg-[#F1F8F1]', border: 'border-[#C8E6C9]' },
    night:  { bg: 'bg-[#0F172A]', text: 'text-[#94A3B8]', ui: 'bg-[#1E293B]', border: 'border-[#334155]' },
    sakura: { bg: 'bg-[#FFF0F5]', text: 'text-[#DB7093]', ui: 'bg-[#FFF5F8]', border: 'border-[#FFD1DC]' },
    nordic: { bg: 'bg-[#E5E7EB]', text: 'text-[#1F2937]', ui: 'bg-[#D1D5DB]', border: 'border-[#9CA3AF]' },
    parchment: { bg: 'bg-[#FEF9C3]', text: 'text-[#713F12]', ui: 'bg-[#FEF08A]', border: 'border-[#EAB308]' }
  };
  const currentTheme = themes[theme];
  const isDark = theme === 'gray' || theme === 'dark' || theme === 'night';

  const processedContent = useMemo(() => {
    return book?.chapters?.[currentChapterIndex]?.content || '内容加载中...';
  }, [book, currentChapterIndex]);

  const handleMainClick = () => {
      if (selection) return;
      if (showAppearance) { setShowAppearance(false); return; }
      if (showTOC) { setShowTOC(false); return; }
      setShowControls(!showControls);
  };

  if (loading) return (
      <div className={`min-h-screen ${currentTheme.bg} flex items-center justify-center`}>
          <div className="w-10 h-10 border-4 border-t-[#B05B3B] border-gray-100 rounded-full animate-spin"></div>
      </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-700 relative overflow-hidden ${currentTheme.bg} font-sans`}>
      
      {/* 全屏亮度遮罩 */}
      <div className="fixed inset-0 pointer-events-none z-[999] bg-black transition-opacity duration-300" 
           style={{ opacity: (100 - brightness) / 100 * 0.7 }} />

      {/* 顶部工具栏 */}
      <div className={`fixed top-0 inset-x-0 z-40 transition-transform duration-500 shadow-sm ${showControls && !showAppearance && !showTOC ? 'translate-y-0' : '-translate-y-full'}`}>
         <div className={`${currentTheme.ui} border-b ${currentTheme.border} px-4 py-3 flex justify-between items-center`}>
             <button onClick={() => navigate(-1)} className={`p-2 active:opacity-50 transition ${isDark ? 'text-white' : 'text-[#B05B3B]'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
             </button>
             <div className="flex-1 text-center truncate px-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowTOC(true); }}>
                 <p className={`text-[11px] font-black ${currentTheme.text} opacity-60 uppercase tracking-[0.2em]`}>{book?.chapters?.[currentChapterIndex]?.title}</p>
             </div>
             <button onClick={(e) => { e.stopPropagation(); setShowSearch(true); }} className={`p-2 active:opacity-50 transition ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
             </button>
         </div>
      </div>

      {/* 核心排版容器 */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`w-full h-screen relative no-scrollbar ${paginationMode === 'horizontal' ? 'overflow-x-auto snap-x snap-mandatory flex' : 'overflow-y-auto'}`} 
        onClick={handleMainClick}
      >
          {/* 左右翻页模式下的仿真阴影与页码 */}
          {paginationMode === 'horizontal' && (
              <>
                  <div className="fixed inset-y-0 right-0 w-16 pointer-events-none z-10 bg-gradient-to-l from-black/5 to-transparent"></div>
                  <div className="fixed inset-y-0 left-0 w-16 pointer-events-none z-10 bg-gradient-to-r from-black/5 to-transparent"></div>
              </>
          )}

          <div 
            ref={contentRef}
            className={`transition-all duration-500 ${currentTheme.text} ${paginationMode === 'horizontal' ? 'inline-block px-0 h-full' : 'max-w-3xl mx-auto px-8 md:px-16 py-32 w-full'}`}
            style={{ 
              fontSize: `${fontSize}px`, 
              lineHeight: lineHeight, 
              columnWidth: paginationMode === 'horizontal' ? '100vw' : 'auto', 
              columnGap: '0',
              fontFamily: fontFamily === 'serif' ? 'Lora, Merriweather, serif' : 'Inter, sans-serif'
            }}
          >
             {/* 实际内容渲染区域 */}
             <div className={`${paginationMode === 'horizontal' ? 'px-8 md:px-24 py-32 h-full' : ''}`}>
                <div dangerouslySetInnerHTML={{ __html: processedContent }} />
             </div>
          </div>
      </div>

      {/* 页码指示器 */}
      {paginationMode === 'horizontal' && !showControls && (
          <div className="fixed bottom-10 left-0 right-0 pointer-events-none flex justify-center z-20">
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full bg-black/5 backdrop-blur-sm ${currentTheme.text} opacity-30`}>
                  {currentPage} / {totalPages}
              </span>
          </div>
      )}

      {/* 设置面板 - 确保无缝贴底 */}
      {showAppearance && (
        <div className="fixed inset-0 z-[110] flex items-end animate-fade-in" onClick={() => setShowAppearance(false)}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            <div 
                className={`${currentTheme.ui} relative w-full h-[35vh] overflow-y-auto no-scrollbar rounded-t-[3rem] shadow-2xl p-8 space-y-8 animate-slide-in-up border-t border-white/10`} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-12 h-1.5 bg-gray-300/40 rounded-full mx-auto mb-2 shrink-0"></div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">翻页</label>
                      <div className="flex bg-black/5 rounded-2xl p-1 gap-1">
                          <button onClick={() => setPaginationMode('vertical')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition ${paginationMode === 'vertical' ? 'bg-white shadow text-black' : 'text-gray-400'}`}>上下</button>
                          <button onClick={() => setPaginationMode('horizontal')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition ${paginationMode === 'horizontal' ? 'bg-white shadow text-black' : 'text-gray-400'}`}>左右</button>
                      </div>
                  </div>
                  <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">字体</label>
                      <div className="flex bg-black/5 rounded-2xl p-1 gap-1">
                          <button onClick={() => setFontFamily('serif')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition ${fontFamily === 'serif' ? 'bg-white shadow text-black' : 'text-gray-400'}`}>宋体</button>
                          <button onClick={() => setFontFamily('sans')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition ${fontFamily === 'sans' ? 'bg-white shadow text-black' : 'text-gray-400'}`}>黑体</button>
                      </div>
                  </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">亮度</label>
                    <div className="flex items-center gap-5 bg-black/5 p-4 rounded-[1.5rem]">
                      <input type="range" min="20" max="100" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="flex-1 accent-black h-1 bg-gray-200 rounded-full appearance-none" />
                    </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">字号</label>
                      <div className="flex items-center justify-between bg-black/5 p-1 rounded-2xl">
                          <button onClick={() => setFontSize(Math.max(12, fontSize - 1))} className="w-10 h-10 flex items-center justify-center font-bold active:bg-white/50 rounded-xl transition">A-</button>
                          <span className="text-[12px] font-black">{fontSize}</span>
                          <button onClick={() => setFontSize(Math.min(36, fontSize + 1))} className="w-10 h-10 flex items-center justify-center font-bold active:bg-white/50 rounded-xl transition">A+</button>
                      </div>
                  </div>
                  <div className="flex-1 space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">行间距</label>
                      <div className="flex bg-black/5 rounded-2xl p-1 gap-1">
                          <button onClick={() => setLineHeight(1.4)} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition ${lineHeight === 1.4 ? 'bg-white shadow text-black' : 'text-gray-400'}`}>1.4</button>
                          <button onClick={() => setLineHeight(1.8)} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition ${lineHeight === 1.8 ? 'bg-white shadow text-black' : 'text-gray-400'}`}>1.8</button>
                      </div>
                  </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">主题配色</label>
                    <div className="grid grid-cols-5 gap-4 py-1 pb-10">
                       {Object.entries(themes).map(([key, t]) => (
                           <button key={key} onClick={() => setTheme(key as any)} className={`w-full aspect-square rounded-full border-2 transition-all ${theme === key ? 'border-[#B05B3B] scale-110 shadow-lg' : 'border-black/5'} ${t.bg} shadow-inner flex items-center justify-center overflow-hidden`}>
                              <span className={`text-[10px] font-serif ${t.text} opacity-30`}>文</span>
                           </button>
                       ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 目录面板 - 恢复正常功能 */}
      {showTOC && (
          <div className="fixed inset-0 z-[100] flex animate-fade-in" onClick={() => setShowTOC(false)}>
             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
             <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl p-6 pt-16 animate-slide-in-left overflow-y-auto border-r" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-2xl font-black font-serif mb-8 px-2 text-gray-900">目录</h3>
                <div className="space-y-1.5">
                    {book?.chapters?.map((chap, idx) => (
                        <div 
                            key={chap.id} 
                            onClick={() => { setCurrentChapterIndex(idx); setShowTOC(false); setShowControls(false); }} 
                            className={`p-5 rounded-[1.8rem] flex items-center justify-between group active:scale-[0.97] transition-all cursor-pointer ${currentChapterIndex === idx ? 'bg-[#B05B3B]/10 text-[#B05B3B]' : 'hover:bg-gray-50 text-gray-800'}`}
                        >
                            <span className="text-sm font-bold truncate pr-4">{chap.title}</span>
                            {currentChapterIndex === idx && <div className="w-1.5 h-1.5 bg-[#B05B3B] rounded-full"></div>}
                        </div>
                    ))}
                </div>
             </div>
          </div>
      )}

      {/* 底部导航栏 */}
      <div className={`fixed bottom-0 inset-x-0 z-40 transition-transform duration-500 shadow-lg ${showControls && !showAppearance && !showTOC ? 'translate-y-0' : 'translate-y-full'}`}>
         <div className={`${currentTheme.ui} border-t ${currentTheme.border} px-10 py-4 pb-12 flex justify-around`}>
             <button onClick={(e) => { e.stopPropagation(); setShowTOC(true); }} className="flex flex-col items-center gap-1.5 active:opacity-40 transition">
                <svg className="w-6 h-6 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h7"/></svg>
                <span className="text-[10px] font-black uppercase opacity-40">目录</span>
             </button>
             <button onClick={(e) => { e.stopPropagation(); setShowAppearance(true); }} className="flex flex-col items-center gap-1.5 active:opacity-40 transition">
                <span className="text-xl font-serif font-black opacity-60">Aa</span>
                <span className="text-[10px] font-black uppercase opacity-40">设置</span>
             </button>
             <button onClick={(e) => { e.stopPropagation(); navigate('/notebook'); }} className="flex flex-col items-center gap-1.5 active:opacity-40 transition">
                <svg className="w-6 h-6 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253"/></svg>
                <span className="text-[10px] font-black uppercase opacity-40">笔记</span>
             </button>
         </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slide-in-up { animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-in-left { animation: slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .overflow-x-auto {
            scrollbar-width: none;
            -ms-overflow-style: none;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
        }
        .overflow-x-auto > div {
            scroll-snap-align: start;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #fff;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          border: 1px solid #ddd;
        }
      `}</style>
    </div>
  );
};

export default Reader;
