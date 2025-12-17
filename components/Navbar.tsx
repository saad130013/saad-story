import React, { useState, useEffect } from 'react';
import { Upload, Home, Menu, LayoutDashboard, LogOut, ChevronDown, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { getSetting } from '../services/storage';

interface NavbarProps {
    onNavigate: (page: string) => void;
    currentPage: string;
    user: User | null;
    onLogin: () => void;
    onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, user, onLogin, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [profileImg, setProfileImg] = useState<string | null>(null);

  const ADMIN_EMAIL = 'saad130013@gmail.com';
  const isOwner = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const loadImg = async () => {
      const img = await getSetting('profileImage');
      setProfileImg(img || 'https://ui-avatars.com/api/?name=Saad+Albogami&background=111827&color=fff&size=128');
    };
    loadImg();
    
    const handleUpdate = () => loadImg();
    window.addEventListener('profile-updated', handleUpdate);
    return () => window.removeEventListener('profile-updated', handleUpdate);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className="flex-shrink-0 flex items-center">
              <div className="relative h-14 w-14 ml-4 rounded-full overflow-hidden border-2 border-white shadow-lg ring-1 ring-gray-900/10 transition-transform duration-300 group-hover:scale-105">
                  <img 
                    src={profileImg || ''} 
                    alt="Saad Albogami" 
                    className="h-full w-full object-cover object-top"
                  />
              </div>
              <div className="flex flex-col justify-center">
                  <span className="font-extrabold text-lg tracking-wider text-gray-900 font-sans uppercase leading-tight group-hover:text-primary-600 transition-colors">SAAD ALBOGAMI</span>
                  <span className="text-xs text-primary-500 font-bold uppercase tracking-widest opacity-80">Official Library</span>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:space-x-4 sm:space-x-reverse">
            <button
              onClick={() => onNavigate('home')}
              className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-full transition-all ${
                currentPage === 'home' 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4 ml-2" />
              الرئيسية
            </button>
            
            {isOwner && (
                <>
                    <button
                    onClick={() => onNavigate('admin')}
                    className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-full transition-all ${
                        currentPage === 'admin' 
                        ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    >
                    <LayoutDashboard className="w-4 h-4 ml-2" />
                    لوحة التحكم
                    </button>
                    
                    <button
                    onClick={() => onNavigate('upload')}
                    className={`inline-flex items-center px-5 py-2 text-sm font-black rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                        currentPage === 'upload' 
                        ? 'bg-primary-700 text-white' 
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                    >
                    <Upload className="w-4 h-4 ml-2" />
                    رفع قصة
                    </button>
                </>
            )}
          </div>

          <div className="flex items-center">
            {user ? (
                <div className="relative mr-4">
                    <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-full pl-4 pr-1 py-1 transition-all border border-gray-100"
                    >
                         <img 
                            src={isOwner ? profileImg! : user.avatar} 
                            alt={user.name} 
                            className="h-8 w-8 rounded-full object-cover shadow-sm"
                         />
                         <span className="text-sm font-bold text-gray-700 hidden md:block">{user.name}</span>
                         <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {isUserMenuOpen && (
                        <div className="absolute left-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl py-2 border border-gray-100 ring-1 ring-black ring-opacity-5 animate-fade-in-up origin-top-left z-50 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">حساب المستخدم</p>
                                <p className="text-sm font-black text-gray-900 truncate">{user.email}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsUserMenuOpen(false);
                                    onLogout();
                                }}
                                className="flex w-full items-center px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4 ml-3" />
                                تسجيل خروج
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    onClick={onLogin}
                    className="mr-4 flex items-center bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-black hover:bg-gray-800 transition-all shadow-md active:scale-95"
                >
                    <UserIcon className="w-4 h-4 ml-2" />
                    دخول المالك
                </button>
            )}

            <div className="flex items-center sm:hidden mr-2">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                <Menu className="h-6 w-6" />
                </button>
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white">
            <div className="pt-2 pb-6 space-y-1 px-4">
                <button onClick={() => {onNavigate('home'); setIsMenuOpen(false);}} className="block w-full text-right px-4 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 rounded-xl">
                    الرئيسية
                </button>
                {isOwner && (
                    <>
                        <button onClick={() => {onNavigate('admin'); setIsMenuOpen(false);}} className="block w-full text-right px-4 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 rounded-xl">
                            لوحة التحكم
                        </button>
                        <button onClick={() => {onNavigate('upload'); setIsMenuOpen(false);}} className="block w-full text-right px-4 py-3 text-base font-black text-primary-600 bg-primary-50 rounded-xl mt-2">
                            رفع قصة جديدة
                        </button>
                    </>
                )}
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;