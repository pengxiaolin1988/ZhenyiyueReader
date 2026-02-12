
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { User } from '../types';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({ booksCount: 0, readingHours: 0, notesCount: 0 });
  const [showMedalsModal, setShowMedalsModal] = useState(false);
  const [medalFilter, setMedalFilter] = useState<'all' | 'earned' | 'locked'>('all');

  useEffect(() => {
      dataService.getCurrentUser().then(setUser);
      // Fixed: handle promise from getUserStats
      dataService.getUserStats().then(setStats);
  }, []);

  const allMedals = [
    { id: 1, name: '初窥门径', icon: '🌱', color: 'bg-green-100 text-green-600', desc: '开启第一次阅读', earned: true, tier: 'bronze' },
    { id: 2, name: '博览群书', icon: '📚', color: 'bg-blue-100 text-blue-600', desc: '书架拥有 10 本书籍', earned: true, tier: 'silver' },
    { id: 3, name: '妙笔生花', icon: '✍️', color: 'bg-pink-100 text-pink-600', desc: '记录 10 条精彩笔记', earned: true, tier: 'bronze' },
    { id: 4, name: '连战连捷', icon: '🔥', color: 'bg-orange-100 text-orange-600', desc: '连续阅读 3 天', earned: true, tier: 'bronze' },
    { id: 5, name: '焚膏继晷', icon: '🕯️', color: 'bg-amber-100 text-amber-600', desc: '连续阅读 7 天', earned: true, tier: 'silver' },
    { id: 6, name: '问鼎苍穹', icon: '🚀', color: 'bg-sky-100 text-sky-600', desc: '读完 3 本科幻小说', earned: true, tier: 'bronze' },
    { id: 7, name: '广结善缘', icon: '🤝', color: 'bg-orange-100 text-orange-600', desc: '成功邀请 1 位书友', earned: true, tier: 'bronze' },
    { id: 8, name: '社交之星', icon: '🌟', color: 'bg-yellow-100 text-yellow-600', desc: '累计获赞突破 1000', earned: true, tier: 'silver' }
  ];

  if (!user) return null;

  const earnedCount = 30; // 模拟总数
  const filteredMedals = allMedals; // 示例简化

  return (
    <div className="bg-[#F2F2F7] h-screen overflow-hidden flex flex-col font-sans selection:bg-blue-200">
       
       {/* 1. 紧凑型 Header (垂直占用减少 50%) */}
       <header className="relative pt-12 pb-6 px-6 bg-white rounded-b-[3rem] shadow-sm shrink-0">
          <div className="flex items-center gap-5">
             <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-[#B05B3B]/40 to-[#B05B3B] shadow-lg">
                   <img src={user.avatar} className="w-full h-full rounded-full object-cover border-2 border-white" alt="Avatar"/>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md border border-gray-50">
                   <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-white text-[8px] font-black">👑</div>
                </div>
             </div>
             
             <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight truncate">{user.nickname}</h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[9px] font-black text-[#B05B3B] bg-[#B05B3B]/5 px-2 py-0.5 rounded-full uppercase tracking-widest">Level 12 · 黄金会员</span>
                </div>
                <div className="mt-3 flex gap-6">
                    {[
                      { label: '关注', value: user.following || 128 },
                      { label: '粉丝', value: user.followers || 42 },
                      { label: '影响力', value: user.fans || 1205 },
                    ].map((item, idx) => (
                       <div key={idx}>
                          <span className="text-sm font-black text-gray-900">{item.value}</span>
                          <span className="text-[9px] font-black text-gray-300 uppercase ml-1">{item.label}</span>
                       </div>
                    ))}
                </div>
             </div>
          </div>
       </header>

       {/* 可滚动的局部区域 */}
       <div className="flex-1 overflow-y-auto no-scrollbar pt-4 pb-32 space-y-6">
          
          {/* 2. 核心统计小磁贴 (紧凑型横向) */}
          <section className="px-6 flex gap-3">
             <div onClick={() => navigate('/stats')} className="flex-1 bg-white rounded-3xl p-4 flex items-center gap-3 border border-gray-100 shadow-sm active:scale-95 transition-transform">
                <div className="w-10 h-10 bg-[#B05B3B]/10 text-[#B05B3B] rounded-xl flex items-center justify-center shrink-0">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                   <p className="text-lg font-black text-gray-900 leading-none">{stats.readingHours}<span className="text-[10px] font-bold text-gray-400 ml-0.5">H</span></p>
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">累计阅读</p>
                </div>
             </div>
             <div onClick={() => navigate('/notebook')} className="flex-1 bg-white rounded-3xl p-4 flex items-center gap-3 border border-gray-100 shadow-sm active:scale-95 transition-transform">
                <div className="w-10 h-10 bg-[#B05B3B]/10 text-[#B05B3B] rounded-xl flex items-center justify-center shrink-0">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </div>
                <div>
                   <p className="text-lg font-black text-gray-900 leading-none">{stats.notesCount}<span className="text-[10px] font-bold text-gray-400 ml-0.5">处</span></p>
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">灵感笔记</p>
                </div>
             </div>
          </section>

          {/* 3. 荣誉成就 (缩减卡片高度) */}
          <section className="px-6">
             <div className="flex justify-between items-end mb-3 px-1">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">荣誉殿堂 ({earnedCount})</h3>
                <button onClick={() => setShowMedalsModal(true)} className="text-[10px] text-[#B05B3B] font-black uppercase tracking-widest active:opacity-50 transition">全部</button>
             </div>
             <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 snap-x">
                {allMedals.map((m, i) => (
                   <div key={i} className={`flex-shrink-0 snap-start w-28 h-28 rounded-[2rem] ${m.color} bg-opacity-30 border border-black/5 flex flex-col items-center justify-center text-center p-2 active:scale-95 transition group`}>
                      <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{m.icon}</span>
                      <span className="text-[10px] font-black leading-tight truncate w-full">{m.name}</span>
                   </div>
                ))}
                <div onClick={() => setShowMedalsModal(true)} className="flex-shrink-0 snap-start w-28 h-28 rounded-[2rem] bg-white border border-dashed border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer active:bg-gray-100 transition">
                   <span className="text-xl text-gray-300 mb-0.5">+</span>
                   <span className="text-[9px] font-black text-gray-400 uppercase">更多</span>
                </div>
             </div>
          </section>

          {/* 4. 原生功能列表 (紧凑布局) */}
          <section className="px-6">
             <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-50">
                {[
                  { label: '我的足迹', icon: '👣', path: '/stats', color: 'text-blue-500' },
                  { label: '智库提问', icon: '💬', path: '/notebook', color: 'text-purple-500' },
                  { label: '灵感工坊', icon: '🎨', path: '/store', color: 'text-orange-500' },
                  { label: '修行日报', icon: '🧘', path: '/meditation', color: 'text-green-500' }
                ].map((item, idx) => (
                   <button 
                      key={idx}
                      onClick={() => navigate(item.path)}
                      className="w-full px-5 py-4 flex items-center justify-between active:bg-gray-50 transition-all group"
                   >
                      <div className="flex items-center gap-4">
                         <span className="text-xl">{item.icon}</span>
                         <p className="font-black text-gray-900 text-sm tracking-tight">{item.label}</p>
                      </div>
                      <svg className="w-3.5 h-3.5 text-gray-300 group-active:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/></svg>
                   </button>
                ))}
             </div>
          </section>

          {/* 后台入口 */}
          <section className="px-6">
             <button 
                onClick={() => navigate('/admin')}
                className="w-full px-5 py-4 bg-gray-900 text-white rounded-[1.5rem] flex items-center justify-between shadow-xl shadow-gray-200 active:scale-[0.98] transition-all"
             >
                <div className="flex items-center gap-4">
                   <span className="text-lg">⚙️</span>
                   <p className="font-black text-[13px] tracking-tight">系统实验室</p>
                </div>
                <svg className="w-3 h-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/></svg>
             </button>
          </section>
       </div>

       {/* 勋章 Modal 保持不变 */}
       {showMedalsModal && (
          <div className="fixed inset-0 z-[100] flex items-end animate-fade-in">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowMedalsModal(false)}></div>
             <div className="relative w-full bg-[#F2F2F7] rounded-t-[3rem] shadow-2xl h-[90vh] flex flex-col animate-slide-up overflow-hidden">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-5"></div>
                <div className="px-8 pb-4 flex justify-between items-end">
                    <h3 className="text-2xl font-black text-gray-900">所有成就</h3>
                    <button onClick={() => setShowMedalsModal(false)} className="text-[#B05B3B] font-black text-xs uppercase tracking-widest">关闭</button>
                </div>
                <div className="flex-1 overflow-y-auto px-8 pb-12 grid grid-cols-2 gap-3 custom-scrollbar">
                   {allMedals.concat(allMedals).map((m, i) => (
                      <div key={i} className="p-5 bg-white rounded-[2rem] border border-gray-100 flex flex-col items-center text-center space-y-3 shadow-sm">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${m.color} bg-opacity-20`}>{m.icon}</div>
                         <h4 className="font-black text-gray-900 text-[12px]">{m.name}</h4>
                         <p className="text-[8px] text-gray-400 font-bold leading-tight uppercase tracking-tighter">{m.desc}</p>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       )}

       <style>{`
          @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
          .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-fade-in { animation: fadeIn 0.3s ease-out; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .no-scrollbar::-webkit-scrollbar { display: none; }
       `}</style>
    </div>
  );
};

export default Profile;
