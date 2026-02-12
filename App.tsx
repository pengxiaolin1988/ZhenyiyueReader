
import React from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Bookshelf from './views/Bookshelf';
import BookStore from './views/BookStore';
import Meditation from './views/Meditation';
import Profile from './views/Profile';
import BookDetail from './views/BookDetail';
import Reader from './views/Reader';
import AudioPlayer from './views/AudioPlayer';
import ListenNow from './views/ListenNow';
import Admin from './views/Admin';
import Stats from './views/Stats';
import Notebook from './views/Notebook';
import { Tab } from './types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const hideNavPaths = ['/read/', '/listen/', '/book/', '/stats', '/notebook', '/admin']; 
  const isFullScreen = hideNavPaths.some(path => location.pathname.startsWith(path));

  let currentTab = Tab.Bookshelf;
  if (location.pathname === '/store') currentTab = Tab.BookStore;
  if (location.pathname === '/meditation') currentTab = Tab.Meditation;
  if (location.pathname === '/profile') currentTab = Tab.Profile;
  if (location.pathname === '/audiobooks') currentTab = Tab.Listen;

  return (
    <div className="flex min-h-screen bg-[#F2F2F7] text-[#1C1C1E] overflow-hidden">
      {!isFullScreen && (
        <aside className="hidden md:flex flex-col w-64 bg-gray-100/80 backdrop-blur-xl border-r border-gray-200 h-screen sticky top-0 shrink-0">
           <div className="p-6 pt-10"><h1 className="text-2xl font-bold font-serif flex items-center gap-2"><span className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm">LB</span>Lumina</h1></div>
           <nav className="flex-1 px-4 space-y-2"><NavBar currentTab={currentTab} mode="desktop" /></nav>
           <div className="p-4 border-t border-gray-200"><div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition cursor-pointer"><img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" className="w-10 h-10 rounded-full" alt="User"/><div><p className="text-sm font-bold">阅读者一号</p><p className="text-xs text-gray-500">VIP Member</p></div></div></div>
        </aside>
      )}
      <main className={`flex-1 relative overflow-y-auto h-screen no-scrollbar ${isFullScreen ? 'bg-white' : ''}`}>
        <div className={`mx-auto min-h-screen ${isFullScreen ? 'w-full' : 'max-w-5xl'} bg-white md:shadow-sm md:min-h-screen relative`}>{children}</div>
        {!isFullScreen && <div className="md:hidden"><NavBar currentTab={currentTab} mode="mobile" /></div>}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Bookshelf />} />
          <Route path="/audiobooks" element={<ListenNow />} />
          <Route path="/store" element={<BookStore />} />
          <Route path="/meditation" element={<Meditation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/notebook" element={<Notebook />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/read/:id" element={<Reader />} />
          <Route path="/listen/:id" element={<AudioPlayer />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
