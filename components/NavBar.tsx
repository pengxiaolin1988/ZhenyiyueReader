
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab } from '../types';

interface NavBarProps {
  currentTab: Tab;
  mode: 'mobile' | 'desktop';
}

const NavBar: React.FC<NavBarProps> = ({ currentTab, mode }) => {
  const navigate = useNavigate();

  const tabs = [
    { 
      name: Tab.Bookshelf, 
      path: '/', 
      label: '书架', 
      icon: (active: boolean) => active ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 1H5a3 3 0 00-3 3v15.556a.5.5 0 00.758.429L12 15l9.242 4.985a.5.5 0 00.758-.429V4a3 3 0 00-3-3z"/></svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
      )
    },
    { 
      name: Tab.Listen, 
      path: '/audiobooks', 
      label: '听书', 
      icon: (active: boolean) => active ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
      ) : (
         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
      )
    },
    { 
      name: Tab.BookStore, 
      path: '/store', 
      label: '书城',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
      )
    },
    { 
      name: Tab.Meditation, 
      path: '/meditation', 
      label: '打坐',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
        </svg>
      )
    },
    { 
      name: Tab.Profile, 
      path: '/profile', 
      label: '我的', 
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
      )
    },
  ];

  if (mode === 'desktop') {
    return (
      <div className="flex flex-col space-y-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.name;
          return (
             <button
                key={tab.name}
                onClick={() => navigate(tab.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive ? 'bg-gray-200 text-black font-semibold' : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                }`}
             >
                <div className="scale-75 origin-center">{tab.icon(isActive)}</div>
                <span className="text-sm">{tab.label}</span>
             </button>
          )
        })}
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/60 pb-safe pt-2 px-6 flex justify-between items-center z-50 h-[84px] shadow-lg md:hidden">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.name;
        return (
          <button
            key={tab.name}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-start space-y-1 w-16 h-full transition-colors duration-200 pt-2 ${
              isActive ? 'text-black' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.icon(isActive)}
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        )
      })}
    </div>
  );
};

export default NavBar;
