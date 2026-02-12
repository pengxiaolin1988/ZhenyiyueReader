import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';

const Stats: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<Record<string, number>>({});
  const [todayMins, setTodayMins] = useState(0);
  const [loading, setLoading] = useState(true);

  const DAILY_GOAL = 30;

  useEffect(() => {
    const load = async () => {
        const hist = await dataService.getReadingHistory();
        const mins = await dataService.getTodayReadingMinutes();
        setHistory(hist);
        setTodayMins(mins);
        setLoading(false);
    };
    load();
  }, []);

  const getLastNDays = (n: number) => {
      const dates = [];
      for (let i = n - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          dates.push(d.toISOString().split('T')[0]);
      }
      return dates;
  };

  const recentDates = getLastNDays(7);
  // Fix: Explicitly cast to number[] to resolve 'unknown' type error during spread in Math.max
  const maxMins = Math.max(...(Object.values(history) as number[]), DAILY_GOAL, 1);

  if (loading) return null;

  return (
    <div className="bg-[#F2F2F7] min-h-screen pb-20">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 px-6 pt-12 pb-4 flex items-center justify-between">
         <button onClick={() => navigate(-1)} className="text-blue-600 font-medium">返回</button>
         <h1 className="text-lg font-bold text-gray-900">阅读统计</h1>
         <div className="w-10"></div>
      </header>

      <div className="p-6 space-y-6">
          {/* Daily Circular Goal */}
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-sm">
              <div className="relative w-48 h-48 mb-6">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="86" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                    <circle 
                        cx="96" cy="96" r="86" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray={540}
                        strokeDashoffset={540 - (540 * Math.min(100, (todayMins/DAILY_GOAL)*100)) / 100}
                        strokeLinecap="round"
                        className="text-black transition-all duration-1000" 
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{todayMins}</span>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">分钟 / {DAILY_GOAL}</span>
                 </div>
              </div>
              <p className="text-sm text-center text-gray-500 max-w-[200px]">
                  {todayMins >= DAILY_GOAL ? "太棒了！你已达成今日目标。" : `再阅读 ${DAILY_GOAL - todayMins} 分钟即可完成今日目标。`}
              </p>
          </div>

          {/* Weekly Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">本周趋势</h3>
              <div className="flex items-end justify-between h-40 gap-2 px-2">
                  {recentDates.map(date => {
                      const mins = Math.floor((history[date] || 0) / 60);
                      const height = (mins / maxMins) * 100;
                      const isToday = date === new Date().toISOString().split('T')[0];
                      return (
                          <div key={date} className="flex-1 flex flex-col items-center gap-2 group">
                              <div className="relative w-full flex-1 flex flex-col justify-end">
                                  <div 
                                    className={`w-full rounded-t-md transition-all duration-500 ${isToday ? 'bg-black' : 'bg-gray-200 group-hover:bg-gray-300'}`} 
                                    style={{ height: `${height}%` }}
                                  ></div>
                              </div>
                              <span className={`text-[10px] font-bold ${isToday ? 'text-black' : 'text-gray-400'}`}>
                                  {new Date(date).toLocaleDateString('zh-CN', { weekday: 'short' })}
                              </span>
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* Achievements */}
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-5 shadow-sm text-center">
                   <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                       <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                   </div>
                   <p className="text-2xl font-bold">5</p>
                   <p className="text-xs text-gray-400">连续阅读天数</p>
              </div>
              <div className="bg-white rounded-3xl p-5 shadow-sm text-center">
                   <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                   </div>
                   <p className="text-2xl font-bold">12</p>
                   <p className="text-xs text-gray-400">本月读完书籍</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Stats;