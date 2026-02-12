
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { User } from '../types';

const Meditation: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isMeditating, setIsMeditating] = useState(false);
  const [hasSignedIn, setHasSignedIn] = useState(false);
  const [streak, setStreak] = useState(0);
  const [beans, setBeans] = useState(0);
  const [showLottery, setShowLottery] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lotteryResult, setLotteryResult] = useState<string | null>(null);

  const quotes = [
    "心如工画师，能画诸世间。",
    "大直若屈，大巧若拙，大辩若讷。",
    "行到水穷处，坐看云起时。",
    "心外无物，闲看庭前花开花落。"
  ];
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    dataService.getCurrentUser().then(u => {
      setUser(u);
      setStreak(u.meditationStreak || 0);
      setBeans(u.totalPoints || 0);
    });
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const handleSignIn = () => {
    if (hasSignedIn) return;
    setIsMeditating(true);
    setTimeout(() => {
      setIsMeditating(false);
      setHasSignedIn(true);
      const newStreak = streak + 1;
      const newBeans = beans + 30;
      setStreak(newStreak);
      setBeans(newBeans);
      
      if (user) {
          dataService.saveUser({
              ...user,
              meditationStreak: newStreak,
              totalPoints: newBeans
          });
      }
    }, 4000); 
  };

  const startLottery = () => {
    if (beans < 50 || isSpinning) return;
    setIsSpinning(true);
    setLotteryResult(null);
    setBeans(prev => prev - 50);

    setTimeout(() => {
      setIsSpinning(false);
      const prizes = ["100 烦恼豆", "VIP 体验卡", "精美书签", "500 烦恼豆"];
      const result = prizes[Math.floor(Math.random() * prizes.length)];
      setLotteryResult(result);
      if (result.includes("烦恼豆")) {
          const win = parseInt(result);
          setBeans(prev => prev + win);
      }
    }, 2000);
  };

  const readingTasks = [
    { time: 10, reward: 10, completed: false },
    { time: 30, reward: 30, completed: false },
    { time: 60, reward: 60, completed: false },
    { time: 90, reward: 90, completed: false },
    { time: 120, reward: 120, completed: false },
    { time: 150, reward: 150, completed: false },
    { time: 180, reward: 200, completed: false },
  ];

  return (
    <div className="bg-[#F2F2F7] h-screen w-full flex flex-col relative overflow-hidden font-sans">
      {/* 沉浸式动态背景 */}
      <div className={`absolute inset-0 transition-all duration-[2000ms] z-0 ${isMeditating ? 'bg-[#09090B]' : 'bg-[#F2F2F7]'}`}>
        <div className={`absolute top-[-20%] left-[-20%] w-[140%] aspect-square bg-blue-500/10 blur-[100px] rounded-full transition-opacity duration-1000 ${isMeditating ? 'opacity-20' : 'opacity-40'}`}></div>
      </div>

      {/* 1. 紧凑型头部 (pt-8 代替 pt-12) */}
      <header className={`relative z-20 px-6 pt-8 pb-2 flex justify-between items-center transition-opacity duration-500 ${isMeditating ? 'opacity-0' : 'opacity-100'}`}>
        <div>
            <h1 className="text-[28px] font-black tracking-tight text-gray-900 font-serif leading-none">打坐</h1>
            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">禅读 · 修行中心</p>
        </div>
        <button onClick={() => setShowLottery(true)} className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 active:scale-90 transition">
            <span className="text-lg">🎡</span>
        </button>
      </header>

      {/* 2. 胶囊型指标区 (py-2 代替 py-4) */}
      <section className={`relative z-20 px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar transition-all duration-500 ${isMeditating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
         <div className="flex-shrink-0 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-white/60 min-w-[100px]">
             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">烦恼豆</p>
             <div className="flex items-center gap-1">
                 <span className="text-base font-black text-gray-900 tabular-nums">{beans}</span>
                 <span className="text-[10px]">🫘</span>
             </div>
         </div>
         <div className="flex-shrink-0 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-white/60 min-w-[100px]">
             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">修行天</p>
             <div className="flex items-center gap-1">
                 <span className="text-base font-black text-gray-900 tabular-nums">{streak}</span>
                 <span className="text-[9px] text-orange-500 font-bold">DAYS</span>
             </div>
         </div>
         <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-2.5 rounded-xl shadow-md min-w-[100px] text-white">
             <p className="text-[8px] font-black opacity-60 uppercase tracking-widest mb-0.5">今日倍率</p>
             <div className="flex items-center gap-1">
                 <span className="text-base font-black tabular-nums">1.2x</span>
             </div>
         </div>
      </section>

      {/* 3. 精简核心交互区 (缩减球体尺寸) */}
      <section className="relative z-20 flex flex-col items-center justify-center py-2 shrink-0">
          <div className="relative group">
              <div className={`absolute inset-0 bg-blue-400/20 rounded-full blur-2xl transition-all duration-1000 ${isMeditating ? 'scale-[2] opacity-20' : 'animate-pulse scale-110 opacity-30'}`}></div>
              
              <button 
                onClick={handleSignIn} 
                disabled={hasSignedIn || isMeditating}
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-[2000ms] relative z-20 shadow-xl active:scale-95 border-[4px]
                  ${isMeditating ? 'bg-white scale-125 border-white' : hasSignedIn ? 'bg-green-500 text-white border-green-400' : 'bg-white text-gray-900 border-gray-100'}
                `}
              >
                 {isMeditating ? (
                   <div className="flex flex-col items-center">
                     <div className="w-6 h-6 border-[3px] border-gray-100 border-t-black rounded-full animate-spin mb-1.5"></div>
                     <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest animate-pulse">入定</span>
                   </div>
                 ) : hasSignedIn ? (
                   <div className="flex flex-col items-center">
                     <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center">
                     <span className="text-4xl mb-1">🧘‍♂️</span>
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">开始打坐</span>
                   </div>
                 )}
              </button>
          </div>
          <div className={`mt-4 text-center transition-all duration-1000 ${isMeditating ? 'opacity-40' : 'opacity-100'}`}>
              <p className={`text-[11px] font-medium font-serif italic max-w-[200px] mx-auto leading-relaxed ${isMeditating ? 'text-white' : 'text-gray-500'}`}>
                “{quote}”
              </p>
          </div>
      </section>

      {/* 4. 紧致任务中心 (缩减滚动框高度) */}
      <section className={`relative z-30 px-6 mt-2 transition-all duration-700 ${isMeditating ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
          {/* 邀请卡片 - 变薄 */}
          <div className="mb-3 bg-white rounded-2xl p-0.5 shadow-sm border border-white">
              <div className="bg-gradient-to-r from-orange-400 to-rose-500 px-4 py-2.5 rounded-[1.1rem] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <span className="text-lg">🤝</span>
                      <p className="text-[10px] font-black">邀请好友获 1000 豆</p>
                  </div>
                  <button className="bg-white text-orange-600 px-3 py-1.5 rounded-lg text-[9px] font-black whitespace-nowrap shadow-sm">去邀请</button>
              </div>
          </div>

          {/* 任务局部滚动大框 (h-200 代替 h-280) */}
          <div className="bg-white rounded-[1.8rem] border border-white shadow-sm overflow-hidden flex flex-col h-[200px]">
              {/* 固定标题栏 - 变薄 */}
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                  <h3 className="text-[12px] font-black text-gray-900">修行日常</h3>
                  <div className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">任务中</span>
                  </div>
              </div>

              {/* 独立滚动列表区域 */}
              <div className="flex-1 overflow-y-auto no-scrollbar overscroll-contain divide-y divide-gray-50 relative">
                  {readingTasks.map((task, idx) => (
                      <div key={idx} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer group">
                          <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm ${task.time > 90 ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'}`}>
                                  {task.time <= 60 ? '📖' : '🎧'}
                              </div>
                              <div>
                                  <h4 className="font-bold text-[11px] text-gray-800">阅读 {task.time}m</h4>
                                  <p className="text-[8px] font-bold text-gray-400">+{task.reward} 豆</p>
                              </div>
                          </div>
                          <button 
                              onClick={(e) => { e.stopPropagation(); navigate('/'); }} 
                              className="bg-gray-50 text-gray-900 px-3 py-1 rounded-md text-[9px] font-black border border-gray-100 group-hover:bg-black group-hover:text-white"
                          >
                              去完成
                          </button>
                      </div>
                  ))}
                  <div className="py-2 text-center text-[8px] text-gray-300 font-bold tracking-widest">END</div>
              </div>
          </div>
      </section>

      {/* 抽奖弹出层 */}
      {showLottery && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSpinning && setShowLottery(false)}></div>
              <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-10 text-center shadow-2xl animate-scale-in border border-white/20">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6">福报求签</h3>
                  <div className={`w-24 h-24 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center text-4xl mb-6 shadow-inner transition-transform duration-500 ${isSpinning ? 'animate-spin scale-90' : ''}`}>
                      {isSpinning ? '🎡' : '🎰'}
                  </div>
                  {lotteryResult && !isSpinning && (
                      <div className="mb-6 py-2 bg-blue-50 rounded-xl animate-in zoom-in border border-blue-100">
                          <p className="text-base font-black text-blue-600">{lotteryResult}</p>
                      </div>
                  )}
                  <button onClick={startLottery} disabled={isSpinning || beans < 50} className="w-full py-4 rounded-xl bg-black text-white font-black text-sm shadow-xl disabled:bg-gray-100 disabled:text-gray-400 active:scale-95 transition-transform">
                      开启福报 (50豆)
                  </button>
              </div>
          </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Meditation;
