
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { Book, User, Chapter } from '../types';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'books' | 'users'>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Editor States
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [currentBook, setCurrentBook] = useState<Partial<Book>>({});
  const [coverPreview, setCoverPreview] = useState<string>('');

  const [isEditingUser, setIsEditingUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    // 修复点：管理后台应该加载全库书籍，而不是仅加载“我的书架”
    const allBooks = await dataService.getAllStoreBooks();
    const u = await dataService.getUsers();
    setBooks(allBooks);
    setUsers(u);
  };

  // --- Book Handlers ---

  const handleEditBook = (book?: Book) => {
      if (book) {
          setCurrentBook({ ...book });
          setCoverPreview(book.coverUrl);
      } else {
          setCurrentBook({ 
              id: 'b_' + Date.now().toString(), 
              chapters: [], 
              rating: 5.0, 
              progress: 0,
              totalReviews: 0,
              genre: '小说',
              description: '',
              title: '',
              author: ''
          });
          setCoverPreview('');
      }
      setIsEditingBook(true);
  };

  const handleDeleteBook = async (id: string) => {
      if (confirm('确认删除这本书吗？删除后书架和书城都将不再可见。')) {
          await dataService.deleteBook(id);
          await loadData();
      }
  };

  const handleSaveBook = async () => {
      if (!currentBook.title || !currentBook.author) {
          alert("书名和作者是必填项");
          return;
      }
      
      const bookToSave = {
          ...currentBook,
          coverUrl: coverPreview || 'https://images.unsplash.com/photo-1543004218-ee14110497f8?auto=format&fit=crop&w=400&q=80',
          chapters: currentBook.chapters || []
      } as Book;
      
      try {
          await dataService.saveBook(bookToSave);
          setIsEditingBook(false);
          // 强制重新加载数据
          await loadData();
          alert("保存成功！");
      } catch (err) {
          console.error(err);
          alert("保存失败，请检查控制台错误。");
      }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) setCoverPreview(ev.target.result as string);
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const handleAddChapter = () => {
      const newChap: Chapter = { 
          id: 'c_' + Date.now().toString() + '_' + (currentBook.chapters?.length || 0), 
          title: `第 ${ (currentBook.chapters?.length || 0) + 1 } 章`, 
          content: '' 
      };
      setCurrentBook({
          ...currentBook,
          chapters: [...(currentBook.chapters || []), newChap]
      });
  };

  const handleChapterChange = (idx: number, field: keyof Chapter, val: string) => {
      const newChaps = [...(currentBook.chapters || [])];
      newChaps[idx] = { ...newChaps[idx], [field]: val };
      setCurrentBook({ ...currentBook, chapters: newChaps });
  };
  
  const handleDeleteChapter = (idx: number) => {
       const newChaps = [...(currentBook.chapters || [])];
       newChaps.splice(idx, 1);
       setCurrentBook({ ...currentBook, chapters: newChaps });
  };

  // --- User Handlers ---

  const handleEditUser = (user: User) => {
      setCurrentUser({ ...user });
      setIsEditingUser(true);
  };

  const handleSaveUser = async () => {
      if (!currentUser.nickname) {
          alert("昵称不能为空");
          return;
      }
      await dataService.saveUser(currentUser as User);
      setIsEditingUser(false);
      loadData();
  };

  // --- Render ---

  if (isEditingBook) {
      const isNew = !books.find(b => b.id === currentBook.id);
      return (
          <div className="min-h-screen bg-gray-50 pb-32">
              <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
                  <h2 className="text-xl font-bold font-serif text-gray-900">{isNew ? '上传新书' : '编辑书籍'}</h2>
                  <button onClick={() => setIsEditingBook(false)} className="text-gray-500 hover:text-gray-800 font-bold px-4 py-2">取消</button>
              </div>

              <div className="p-6 space-y-6 max-w-2xl mx-auto">
                  {/* Cover Upload */}
                  <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-48 bg-white rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-200 relative hover:border-[#B05B3B] hover:bg-[#B05B3B]/5 transition-all shadow-sm group"
                      >
                          {coverPreview ? (
                              <img src={coverPreview} className="w-full h-full object-cover" />
                          ) : (
                              <>
                                <svg className="w-10 h-10 text-gray-300 group-hover:text-[#B05B3B] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                <span className="text-[10px] text-gray-400 group-hover:text-[#B05B3B] font-black uppercase tracking-widest">选择封面</span>
                              </>
                          )}
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload}/>
                      </div>
                      <div className="flex-1 w-full space-y-4">
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">书名</label>
                              <input 
                                className="w-full p-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#B05B3B]/20 focus:border-[#B05B3B] outline-none transition shadow-sm" 
                                placeholder="输入书名..." 
                                value={currentBook.title || ''}
                                onChange={e => setCurrentBook({...currentBook, title: e.target.value})}
                              />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">作者</label>
                              <input 
                                className="w-full p-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#B05B3B]/20 focus:border-[#B05B3B] outline-none transition shadow-sm" 
                                placeholder="输入作者..." 
                                value={currentBook.author || ''}
                                onChange={e => setCurrentBook({...currentBook, author: e.target.value})}
                              />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">分类</label>
                              <select 
                                  className="w-full p-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#B05B3B]/20 outline-none transition shadow-sm"
                                  value={currentBook.genre || '小说'}
                                  onChange={e => setCurrentBook({...currentBook, genre: e.target.value})}
                              >
                                  {['小说', '科幻', '传记', '历史', '商业', '哲学', '悬疑', '成长'].map(g => <option key={g} value={g}>{g}</option>)}
                              </select>
                          </div>
                      </div>
                  </div>

                  <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">简介内容</label>
                      <textarea 
                        className="w-full p-4 bg-white border border-gray-100 rounded-2xl h-32 focus:ring-2 focus:ring-[#B05B3B]/20 focus:border-[#B05B3B] outline-none transition resize-none shadow-sm" 
                        placeholder="输入书籍简介，好的简介能吸引更多读者..."
                        value={currentBook.description || ''}
                        onChange={e => setCurrentBook({...currentBook, description: e.target.value})}
                      />
                  </div>

                  {/* Chapter Editor */}
                  <div className="border-t border-gray-200 pt-8 mt-4">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="font-black text-xl text-gray-900 font-serif">章节内容 ({currentBook.chapters?.length || 0})</h3>
                          <button onClick={handleAddChapter} className="bg-[#B05B3B] text-white text-xs font-black px-4 py-2 rounded-full shadow-lg active:scale-95 transition-all">
                              + 新增章节
                          </button>
                      </div>
                      <div className="space-y-5">
                          {currentBook.chapters?.map((chap, idx) => (
                              <div key={chap.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 group">
                                  <div className="flex justify-between items-center mb-4">
                                      <div className="flex items-center gap-3 flex-1">
                                          <span className="text-[10px] font-black text-[#B05B3B] bg-[#B05B3B]/5 w-8 h-8 rounded-full flex items-center justify-center italic">{idx + 1}</span>
                                          <input 
                                            className="font-black text-sm border-b border-transparent focus:border-[#B05B3B] outline-none w-full bg-transparent transition py-1"
                                            value={chap.title}
                                            onChange={e => handleChapterChange(idx, 'title', e.target.value)}
                                            placeholder="章节标题"
                                          />
                                      </div>
                                      <button onClick={() => handleDeleteChapter(idx)} className="text-gray-200 hover:text-red-500 transition-colors p-2">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                      </button>
                                  </div>
                                  <textarea 
                                    className={`w-full text-sm p-4 bg-gray-50 rounded-2xl h-32 focus:bg-white focus:ring-2 focus:ring-[#B05B3B]/10 outline-none transition resize-none text-gray-600 font-serif leading-relaxed`}
                                    value={chap.content}
                                    onChange={e => handleChapterChange(idx, 'content', e.target.value)}
                                    placeholder="请输入本章节的正文内容..."
                                  />
                              </div>
                          ))}
                          {(!currentBook.chapters || currentBook.chapters.length === 0) && (
                              <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                                  <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                  <p className="font-black opacity-30 tracking-widest uppercase">暂无内容，请点击上方“新增章节”</p>
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-2xl border-t border-gray-100 z-50 flex justify-center pb-12">
                  <div className="w-full max-w-2xl flex gap-4">
                     <button onClick={handleSaveBook} className="flex-1 bg-black text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                         {isNew ? '确认发布并上架' : '保存书籍修改'}
                     </button>
                  </div>
              </div>
          </div>
      );
  }

  if (isEditingUser) {
      return (
          <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center pt-24">
              <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                  <h2 className="text-2xl font-black font-serif text-center">编辑用户档案</h2>
                  <div className="flex justify-center">
                      <img src={currentUser.avatar} className="w-24 h-24 rounded-full border-4 border-[#B05B3B]/20 p-1" alt="Avatar"/>
                  </div>
                  <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">用户名 (系统ID)</label>
                        <input disabled value={currentUser.username} className="w-full p-4 bg-gray-50 rounded-xl text-gray-400 font-bold" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">昵称</label>
                        <input value={currentUser.nickname} onChange={e => setCurrentUser({...currentUser, nickname: e.target.value})} className="w-full p-4 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#B05B3B]/20 outline-none" />
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <input type="checkbox" checked={currentUser.isVip} onChange={e => setCurrentUser({...currentUser, isVip: e.target.checked})} className="w-6 h-6 accent-[#B05B3B]" id="vip-toggle" />
                        <label htmlFor="vip-toggle" className="font-black text-gray-700">开通 VIP 尊享会员</label>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                      <button onClick={() => setIsEditingUser(false)} className="flex-1 py-4 bg-gray-100 rounded-xl font-black text-gray-500">取消</button>
                      <button onClick={handleSaveUser} className="flex-1 py-4 bg-black text-white rounded-xl font-black shadow-lg">更新</button>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white px-6 pt-16 pb-8 rounded-b-[3rem] shadow-2xl mb-8">
          <div className="flex justify-between items-center mb-8 px-2">
              <div>
                <h1 className="text-3xl font-black font-serif tracking-tight">实验室后台</h1>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Lumina System Laboratory</p>
              </div>
              <button onClick={() => navigate('/profile')} className="bg-white/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-colors border border-white/10">退出</button>
          </div>
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              <button 
                onClick={() => setActiveTab('books')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'books' ? 'bg-white text-black shadow-xl' : 'text-white/40 hover:text-white'}`}
              >
                  图书全库
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-black shadow-xl' : 'text-white/40 hover:text-white'}`}
              >
                  用户名录
              </button>
          </div>
      </div>

      <div className="px-6 space-y-6">
          {activeTab === 'books' ? (
              <div className="space-y-4">
                  <button onClick={() => handleEditBook()} className="w-full py-6 border-2 border-dashed border-gray-100 rounded-[2.5rem] text-gray-400 font-black flex flex-col items-center justify-center gap-2 hover:bg-gray-50 hover:border-[#B05B3B]/20 transition-all group">
                      <span className="text-3xl group-hover:scale-125 transition-transform">+</span>
                      <span className="text-[10px] uppercase tracking-[0.2em]">上架新书籍至商城</span>
                  </button>
                  <div className="grid gap-4">
                    {books.map(book => (
                        <div key={book.id} className="bg-white border border-gray-50 rounded-[2rem] p-5 flex gap-5 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="w-20 h-28 flex-shrink-0 shadow-lg rounded-md overflow-hidden bg-gray-50">
                              <img src={book.coverUrl} className="w-full h-full object-cover" alt="cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex justify-between items-start">
                                      <h3 className="font-black text-gray-900 text-lg leading-tight line-clamp-1">{book.title}</h3>
                                      <span className="text-[10px] font-black bg-gray-100 px-2 py-0.5 rounded-full text-gray-400">{book.genre}</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 mt-0.5">{book.author}</p>
                                    <p className="text-[10px] font-black text-[#B05B3B] mt-2 bg-[#B05B3B]/5 inline-block px-2 py-0.5 rounded-full italic">{book.chapters?.length || 0} 章节</p>
                                </div>
                                <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditBook(book)} className="px-4 py-2 bg-black text-white text-[10px] font-black rounded-xl hover:bg-gray-800 transition-colors">编辑</button>
                                    <button onClick={() => handleDeleteBook(book.id)} className="px-4 py-2 bg-red-50 text-red-500 text-[10px] font-black rounded-xl hover:bg-red-100 transition-colors">移除</button>
                                </div>
                            </div>
                        </div>
                    ))}
                  </div>
              </div>
          ) : (
              <div className="space-y-4">
                  {users.map(user => (
                      <div key={user.id} className="bg-white border border-gray-50 rounded-[2rem] p-5 flex items-center gap-5 shadow-sm">
                          <img src={user.avatar} className="w-16 h-16 rounded-full border-2 border-gray-100 p-0.5" alt="Avatar" />
                          <div className="flex-1">
                              <div className="flex items-center gap-2">
                                  <h3 className="font-black text-gray-900">{user.nickname}</h3>
                                  {user.isVip && <span className="bg-yellow-400 text-black text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm">VIP</span>}
                              </div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">ID: {user.username}</p>
                          </div>
                          <button onClick={() => handleEditUser(user)} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">管理</button>
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};

export default Admin;
