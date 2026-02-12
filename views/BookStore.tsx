
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { searchBooks } from '../services/geminiService';
import { Book } from '../types';

const BookStore: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any>({ heroes: [], topCharts: [], newReleases: [] });
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [localResults, setLocalResults] = useState<Book[]>([]);
  const [aiResult, setAiResult] = useState<{text: string, links: any[]} | null>(null);

  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);
  const scrollRef3 = useRef<HTMLDivElement>(null);

  const categories = [
    { name: '文学小说', q: 'Fiction', color: 'from-blue-500/10 to-blue-600/5', icon: '📖', detail: '跨越时空的叙事' },
    { name: '硬核科幻', q: 'Sci-Fi', color: 'from-purple-500/10 to-purple-600/5', icon: '🚀', detail: '探索未来边界' },
    { name: '历史风云', q: 'History', color: 'from-amber-500/10 to-amber-600/5', icon: '🏛️', detail: '重返时间长河' },
    { name: '商业智慧', q: 'Business', color: 'from-emerald-500/10 to-emerald-600/5', icon: '📈', detail: '洞察市场逻辑' },
    { name: '悬疑惊悚', q: 'Thriller', color: 'from-rose-500/10 to-rose-600/5', icon: '🕵️', detail: '心跳加速的真相' },
    { name: '自我成长', q: 'Self-Help', color: 'from-cyan-500/10 to-cyan-600/5', icon: '🌱', detail: '遇见更好的自己' }
  ];

  const collections = [
    { title: "2024 年度推荐", subtitle: "编辑室深度评选", img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80" },
    { title: "深夜独处伴侣", subtitle: "治愈心灵的文字", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80" }
  ];

  useEffect(() => {
    const load = async () => {
        const d = await dataService.getStoreData();
        const all = await dataService.getAllStoreBooks();
        setData(d);
        setAllBooks(all);
        setLoading(false);
    };
    load();
  }, []);

  const performSearch = async (query: string) => {
      if (!query.trim()) {
          setLocalResults([]);
          setAiResult(null);
          return;
      }
      setIsSearching(true);
      const lowerQ = query.toLowerCase();
      const localMatches = allBooks.filter(b => 
          b.title.toLowerCase().includes(lowerQ) || 
          b.author.toLowerCase().includes(lowerQ)
      );
      setLocalResults(localMatches);
      try {
          const res = await searchBooks(query);
          setAiResult(res);
      } catch (err) {
          console.error(err);
      } finally {
          setIsSearching(false);
      }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      performSearch(searchQuery);
  };

  if (loading) return <div className="min-h-screen bg-white"></div>;

  return (
    <div className="bg-white min-h-screen pb-24 font-sans text-[#1C1C1E]">
      <header className="sticky top-0 bg-white/95 backdrop-blur-xl z-50 px-5 pt-12 pb-4 border-b border-gray-100/50">
        <h1 className="text-[34px] font-bold tracking-tight text-gray-900 font-serif leading-none mb-6">书城</h1>
        <form onSubmit={handleSearchSubmit} className="relative pb-2">
            <div className="relative bg-gray-100/50 rounded-full flex items-center px-4 py-2">
                <input
                    type="text"
                    placeholder="搜索书名、作者或分类..."
                    className="w-full bg-transparent text-sm focus:outline-none"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                {isSearching ? <div className="w-4 h-4 border-2 border-t-black rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>}
            </div>
        </form>
      </header>

      <div className="space-y-12 pt-6 pb-12">
        {!searchQuery && (
          <>
            {/* Hero Carousel */}
            <div ref={scrollRef1} className="overflow-x-auto no-scrollbar snap-x px-5 flex gap-4">
                {data.heroes.map((book: any) => (
                    <div key={book.id} onClick={() => navigate(`/book/${book.id}`)} className="w-[85%] flex-shrink-0 snap-center cursor-pointer group">
                        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-sm bg-gray-100">
                            <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={book.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="text-xl font-bold">{book.title}</h3>
                                <p className="text-sm opacity-80">{book.author}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Featured Collections Integrated from Explore */}
            <section className="px-5 space-y-4">
               <h2 className="text-[22px] font-bold font-serif">精选合辑</h2>
               <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x">
                  {collections.map((col, idx) => (
                     <div key={idx} className="flex-shrink-0 w-64 h-36 rounded-2xl overflow-hidden relative shadow-sm snap-start cursor-pointer group">
                        <img src={col.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={col.title}/>
                        <div className="absolute inset-0 bg-black/30"></div>
                        <div className="absolute bottom-3 left-3 text-white">
                           <p className="text-[10px] font-black uppercase opacity-80">{col.subtitle}</p>
                           <h3 className="font-bold">{col.title}</h3>
                        </div>
                     </div>
                  ))}
               </div>
            </section>

            <hr className="border-gray-100 mx-5" />

            {/* Browse Categories Integrated from Explore */}
            <section className="px-5 space-y-4">
                <h2 className="text-[22px] font-bold font-serif">浏览分类</h2>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(cat => (
                    <button 
                      key={cat.name} 
                      onClick={() => performSearch(cat.q)}
                      className={`relative h-24 bg-gradient-to-br ${cat.color} rounded-2xl p-4 flex flex-col justify-between items-start text-left border border-black/[0.02] active:scale-[0.96] transition-transform`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="font-bold text-gray-900 text-sm">{cat.name}</span>
                    </button>
                  ))}
                </div>
            </section>

            {/* Top Charts */}
            <div className="px-5">
                <h2 className="text-[22px] font-bold text-gray-900 font-serif mb-5">排行榜</h2>
                <div ref={scrollRef2} className="overflow-x-auto no-scrollbar snap-x flex gap-4">
                    {data.topCharts.slice(0, 5).map((book: any, idx: number) => (
                        <div key={book.id} onClick={() => navigate(`/book/${book.id}`)} className="w-[280px] flex-shrink-0 flex gap-4 items-center snap-start cursor-pointer">
                            <span className="text-xl font-serif text-gray-300 font-bold w-6">{idx + 1}</span>
                            <div className="w-14 aspect-[2/3] bg-gray-100 rounded shadow-sm overflow-hidden flex-shrink-0">
                                <img src={book.coverUrl} className="w-full h-full object-cover" alt="cover"/>
                            </div>
                            <div className="flex-1 min-w-0 pr-4">
                                <h3 className="font-bold text-gray-900 text-sm truncate">{book.title}</h3>
                                <p className="text-xs text-gray-500 truncate">{book.author}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </>
        )}

        {searchQuery && (
          <div className="px-5 space-y-6">
              {localResults.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                    {localResults.map(book => (
                        <div key={book.id} onClick={() => navigate(`/book/${book.id}`)} className="flex flex-col gap-2 cursor-pointer group">
                            <div className="w-full aspect-[2/3] rounded-lg shadow-sm overflow-hidden bg-gray-100">
                                <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </div>
                            <p className="text-sm font-bold truncate">{book.title}</p>
                        </div>
                    ))}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookStore;
