
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Studio from './Studio';

const Explore: React.FC = () => {
  const navigate = useNavigate();
  const [activeSegment, setActiveSegment] = useState<'categories' | 'studio'>('categories');

  const handleCategoryClick = (category: string) => {
    navigate(`/store?q=${encodeURIComponent(category)}`);
  };

  const categories = [
    { name: '文学小说', q: 'Fiction', color: 'from-blue-500/10 to-blue-600/5', icon: '📖', detail: '跨越时空的叙事' },
    { name: '硬核科幻', q: 'Sci-Fi', color: 'from-purple-500/10 to-purple-600/5', icon: '🚀', detail: '探索未来边界' },
    { name: '历史风云', q: 'History', color: 'from-amber-500/10 to-amber-600/5', icon: '🏛️', detail: '重返时间长河' },
    { name: '商业智慧', q: 'Business', color: 'from-emerald-500/10 to-emerald-600/5', icon: '📈', detail: '洞察市场逻辑' },
    { name: '悬疑惊悚', q: 'Thriller', color: 'from-rose-500/10 to-rose-600/5', icon: '🕵️', detail: '心跳加速的真相' },
    { name: '艺术审美', q: 'Art', color: 'from-indigo-500/10 to-indigo-600/5', icon: '🎨', detail: '致敬极致美学' },
    { name: '自我成长', q: 'Self-Help', color: 'from-cyan-500/10 to-cyan-600/5', icon: '🌱', detail: '遇见更好的自己' },
    { name: '人物传记', q: 'Biography', color: 'from-orange-500/10 to-orange-600/5', icon: '👤', detail: '书写不凡人生' }
  ];

  const collections = [
    { title: "2024 年度推荐", subtitle: "编辑室深度评选", img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80" },
    { title: "深夜独处伴侣", subtitle: "治愈心灵的文字", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80" }
  ];

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Dynamic Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-xl z-40 px-6 pt-12 pb-4 border-b border-gray-100/50">
        <h1 className="text-[34px] font-bold tracking-tight text-gray-900 mb-6 font-serif">探索</h1>
        
        {/* Apple Style Segment Control */}
        <div className="relative flex p-1 bg-gray-100/80 rounded-[14px] w-full max-w-md">
          <button 
            onClick={() => setActiveSegment('categories')}
            className={`flex-1 py-1.5 text-[13px] font-bold rounded-[10px] transition-all duration-300 z-10 ${
              activeSegment === 'categories' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            全部分类
          </button>
          <button 
            onClick={() => setActiveSegment('studio')}
            className={`flex-1 py-1.5 text-[13px] font-bold rounded-[10px] transition-all duration-300 z-10 ${
              activeSegment === 'studio' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            AI 创作室
          </button>
        </div>
      </header>

      {activeSegment === 'categories' ? (
        <div className="px-6 py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Featured Collections */}
          <section className="space-y-4">
             <h2 className="text-[22px] font-bold font-serif px-1">精选合辑</h2>
             <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
                {collections.map((col, idx) => (
                   <div key={idx} className="flex-shrink-0 w-72 h-44 rounded-2xl overflow-hidden relative shadow-md snap-start cursor-pointer group active:scale-[0.98] transition-transform">
                      <img src={col.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={col.title}/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{col.subtitle}</p>
                         <h3 className="text-lg font-bold">{col.title}</h3>
                      </div>
                   </div>
                ))}
             </div>
          </section>

          {/* Categories Grid */}
          <section className="space-y-4">
            <h2 className="text-[22px] font-bold font-serif px-1">浏览分类</h2>
            <div className="grid grid-cols-2 gap-4">
              {categories.map(cat => (
                <button 
                  key={cat.name} 
                  onClick={() => handleCategoryClick(cat.q)}
                  className={`relative h-28 bg-gradient-to-br ${cat.color} rounded-2xl p-4 flex flex-col justify-between items-start text-left border border-black/[0.03] shadow-sm hover:shadow-md active:scale-[0.96] transition-all duration-200 group`}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <div>
                    <span className="block font-black text-gray-900 text-[15px]">{cat.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{cat.detail}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Studio />
        </div>
      )}
    </div>
  );
};

export default Explore;
