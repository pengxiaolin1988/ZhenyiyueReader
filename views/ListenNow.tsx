
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { Book } from '../types';
import Studio from './Studio';

const ListenNow: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
        const all = await dataService.getAllStoreBooks();
        setBooks(all);
        setFilteredBooks(all);
    };
    load();
  }, []);

  const handleBookClick = (id: string) => navigate(`/book/${id}`);

  return (
    <div className="bg-white min-h-screen pb-24 font-sans text-[#1C1C1E]">
      <header className="sticky top-0 bg-white/95 backdrop-blur-xl z-50 px-5 pt-12 pb-4 border-b border-gray-100/50">
         <h1 className="text-[34px] font-bold tracking-tight text-gray-900 font-serif leading-none mb-6">听书</h1>
         <div className="relative bg-gray-100/50 rounded-full flex items-center px-4 py-2">
            <input
                type="text"
                placeholder="搜索有声书..."
                className="w-full bg-transparent text-sm focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
      </header>
      
      <div className="p-5 space-y-12 pt-6">
          {!searchQuery && (
            <div onClick={() => handleBookClick(books[1]?.id || books[0]?.id)} className="cursor-pointer">
                <div className="bg-[#FFD700] rounded-3xl p-6 flex items-center gap-6 shadow-sm">
                    <div className="w-24 aspect-[2/3] shadow-lg rounded-md overflow-hidden flex-shrink-0 rotate-2">
                        <img src={books[1]?.coverUrl || books[0]?.coverUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <span className="text-[10px] font-black bg-black/10 px-2 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">名家演播</span>
                        <h2 className="text-xl font-bold text-gray-900">{books[1]?.title || books[0]?.title}</h2>
                        <p className="text-gray-800 text-sm mb-4">沉浸式 3D 音效体验</p>
                    </div>
                </div>
            </div>
          )}

          <section>
              <h2 className="text-[22px] font-bold text-gray-900 font-serif mb-5">热门有声书</h2>
              <div className="grid grid-cols-3 gap-x-4 gap-y-8">
                 {filteredBooks.slice(0, 6).map(book => (
                     <div key={book.id} onClick={() => handleBookClick(book.id)} className="cursor-pointer group">
                         <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 relative shadow-sm">
                             <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                             <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-md p-1.5 rounded-full">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                             </div>
                         </div>
                         <p className="text-[13px] font-bold truncate">{book.title}</p>
                     </div>
                 ))}
              </div>
          </section>

          {/* AI Studio Integrated from Explore at the Bottom */}
          <section className="border-t border-gray-100 pt-10">
              <div className="mb-6 px-1">
                  <h2 className="text-[22px] font-bold font-serif">AI 创作空间</h2>
                  <p className="text-sm text-gray-400 mt-1">为您的听书时光增添视觉灵感</p>
              </div>
              <div className="bg-gray-50 rounded-[3rem] p-2">
                  <Studio />
              </div>
          </section>
      </div>
    </div>
  );
};

export default ListenNow;
