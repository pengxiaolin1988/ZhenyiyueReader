import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { Book, Review } from '../types';

const BookDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [commentText, setCommentText] = useState('');
  
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isInLib, setIsInLib] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
        try {
            const b = await dataService.getBookById(id);
            const inL = await dataService.isInLibrary(id);
            const r = await dataService.getReviews(id);
            setBook(b);
            setIsInLib(inL);
            setReviews(r);
        } catch (e) {
            console.error("Failed to load book", e);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [id]);

  const toggleLibrary = async () => {
      if (!book) return;
      const newState = await dataService.toggleLibrary(book);
      setIsInLib(newState);
  };

  const handleBack = () => {
    const hasHistory = window.history.state && window.history.state.idx > 0;
    if (hasHistory) {
        navigate(-1);
    } else {
        navigate('/', { replace: true });
    }
  };

  if (loading) {
      return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div></div>;
  }

  if (!book) {
      return (
          <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
              <p className="text-gray-500 font-medium">未找到该书籍信息</p>
              <button onClick={() => navigate('/')} className="px-6 py-2 bg-black text-white rounded-full text-sm font-bold">返回首页</button>
          </div>
      );
  }

  return (
    <div className="bg-white min-h-screen relative">
      {/* 
         HEADER - Sticky within the container
      */}
      <div className="sticky top-0 inset-x-0 z-30 px-4 py-3 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-gray-100/50 shadow-sm">
          <button 
            onClick={handleBack} 
            className="flex items-center gap-1 text-blue-600 active:opacity-50 transition cursor-pointer p-2 -ml-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            <span className="text-[17px]">返回</span>
          </button>
          {/* Removed the top Add to Library button to avoid clutter, moved to footer */}
          <div className="w-8"></div>
      </div>

      {/* Background Blur Effect */}
      <div className="absolute top-0 left-0 right-0 h-96 overflow-hidden z-0 pointer-events-none">
         <img src={book.coverUrl} className="w-full h-full object-cover blur-3xl opacity-30 scale-110" alt="bg"/>
         <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white"></div>
      </div>

      <div className="relative z-10 px-6 pt-10 pb-36 max-w-2xl mx-auto">
         {/* Main Info */}
         <div className="flex flex-col items-center mb-10">
            {/* 3D Book Cover */}
            <div className="w-48 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] rounded-[4px] overflow-hidden mb-8 bg-white relative transform transition-transform hover:scale-105 duration-500">
                <img src={book.coverUrl} className="w-full h-auto object-cover aspect-[2/3]" alt="cover"/>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                {/* Book spine effect left */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>
            </div>
            
            <h1 className="text-3xl font-serif font-bold text-gray-900 text-center leading-tight mb-2">{book.title}</h1>
            <p className="text-gray-500 font-medium text-lg text-center mb-6">{book.author}</p>
            
            <div className="flex items-center gap-6 justify-center w-full px-4 mb-6">
                <div className="text-center">
                    <span className="block font-bold text-gray-900 text-lg flex items-center gap-1 justify-center">
                        {book.rating} <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">评分</span>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center">
                    <span className="block font-bold text-gray-900 text-lg">{book.genre}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">分类</span>
                </div>
                 <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center">
                    <span className="block font-bold text-gray-900 text-lg">{(book.chapters?.length || 0) * 2}k</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">字数</span>
                </div>
            </div>
         </div>

         <hr className="border-gray-100 mb-8" />

         {/* Introduction */}
         <div className="mb-8">
            <h3 className="font-bold text-lg mb-2 text-gray-900">简介</h3>
            <p className="text-gray-600 leading-relaxed text-[15px] font-serif">{book.description}</p>
         </div>

         <hr className="border-gray-100 mb-8" />

         {/* Chapter List */}
         <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-lg text-gray-900">目录</h3>
               <span className="text-gray-400 text-xs">共 {book.chapters?.length || 0} 章</span>
            </div>
            <div className="space-y-2">
               {book.chapters && book.chapters.length > 0 ? book.chapters.map((c, i) => (
                  <div key={c.id} className="flex justify-between items-center py-3 px-2 -mx-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate(`/read/${id}`)}>
                     <span className="text-[15px] font-medium text-gray-800 flex gap-4">
                         <span className="text-gray-400 font-normal w-6">{i + 1}</span>
                         {c.title}
                     </span>
                     <span className="text-[10px] text-gray-400 uppercase tracking-wide">免费</span>
                  </div>
               )) : (
                   <p className="text-gray-400 text-sm">暂无章节内容</p>
               )}
            </div>
         </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-4 pb-8 z-50">
         <div className="max-w-2xl mx-auto flex gap-3">
            {/* Library Toggle */}
            <button 
                onClick={toggleLibrary} 
                className={`flex-1 py-3.5 rounded-xl font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer ${isInLib ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
            >
                {isInLib ? (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                        <span>已加入</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                        <span>加书架</span>
                    </>
                )}
            </button>
            
            {/* Listen Button */}
            <button 
                onClick={() => navigate(`/listen/${id}`)}
                className="flex-1 py-3.5 rounded-xl bg-gray-900 text-white font-bold shadow-lg hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                 <span>听书</span>
            </button>

            {/* Read Button */}
            <button 
                onClick={() => navigate(`/read/${id}`)} 
                className="flex-[1.5] py-3.5 rounded-xl bg-black text-white font-bold shadow-lg hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                {isInLib && book.progress > 0 ? `继续阅读` : '开始阅读'}
            </button>
         </div>
      </div>
    </div>
  );
};

export default BookDetail;