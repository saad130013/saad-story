import React, { useState } from 'react';
import { Upload, Home, Menu, LayoutDashboard, LogOut, ChevronDown, User as UserIcon } from 'lucide-react';
import { User } from '../types';

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

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="flex-shrink-0 flex items-center">
              {/* Profile Image - Large and elegant */}
              <div className="relative h-16 w-16 ml-4 rounded-full overflow-hidden border-2 border-gray-900 shadow-md ring-2 ring-gray-100">
                  <img 
                    src="/saad.jpg" 
                    alt="Saad Albogami" 
                    className="h-full w-full object-cover object-top"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallbackSrc = 'https://ui-avatars.com/api/?name=Saad+Albogami&background=111827&color=fff&size=128&font-size=0.33';
                      // Prevent infinite loop if fallback also fails
                      if (target.src !== fallbackSrc) {
                        target.src = fallbackSrc;
                      }
                    }}
                  />
              </div>
              <div className="flex flex-col justify-center h-full">
                  <span className="font-bold text-xl tracking-wide text-gray-900 font-sans uppercase leading-tight">SAAD ALBOGAMI</span>
                  <span className="text-sm text-primary-600 font-medium">القصص والمحتوى</span>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:space-x-8 sm:space-x-reverse">
            <button
              onClick={() => onNavigate('home')}
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-colors ${
                currentPage === 'home' 
                  ? 'border-primary-500 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Home className="w-5 h-5 ml-2" />
              الرئيسية
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-colors ${
                currentPage === 'admin' 
                  ? 'border-primary-500 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 ml-2" />
              لوحة التحكم
            </button>
            <button
              onClick={() => onNavigate('upload')}
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-colors ${
                currentPage === 'upload' 
                  ? 'border-primary-500 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload className="w-5 h-5 ml-2" />
              رفع قصة جديدة
            </button>
          </div>

          <div className="flex items-center">
            {user ? (
                // Logged in State
                <div className="relative mr-4">
                    <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-full pl-4 pr-1 py-1 transition-colors border border-gray-100"
                    >
                         <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="h-8 w-8 rounded-full object-cover"
                         />
                         <span className="text-sm font-medium text-gray-700 hidden md:block">{user.name}</span>
                         <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {isUserMenuOpen && (
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 ring-1 ring-black ring-opacity-5 animate-fade-in-up origin-top-left z-50">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-xs text-gray-500">مسجل دخول بـ</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsUserMenuOpen(false);
                                    onLogout();
                                }}
                                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4 ml-2" />
                                تسجيل خروج
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                // Logged out State - Google Button
                <button
                    onClick={onLogin}
                    className="mr-4 flex items-center bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 hover:shadow-sm transition-all shadow-sm"
                >
                    <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    تسجيل الدخول
                </button>
            )}

            <div className="flex items-center sm:hidden mr-2">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                <Menu className="h-6 w-6" />
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden border-t border-gray-100">
            <div className="pt-2 pb-3 space-y-1">
                <button onClick={() => onNavigate('home')} className="block w-full text-right px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                    الرئيسية
                </button>
                <button onClick={() => onNavigate('admin')} className="block w-full text-right px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                    لوحة التحكم
                </button>
                <button onClick={() => onNavigate('upload')} className="block w-full text-right px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-5