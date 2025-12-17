import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import StoryDetails from './pages/StoryDetails';
import AdminDashboard from './pages/AdminDashboard';
import { Mail, Shield, User as UserIcon, X, Lock, ChevronLeft } from 'lucide-react';
import { User } from './types';
import { getSetting } from './services/storage';

const App: React.FC = () => {
  const ADMIN_EMAIL = 'saad130013@gmail.com';
  const OWNER_PASSWORD = '23209946';

  const [currentPage, setCurrentPage] = useState('home');
  const [currentStoryId, setCurrentStoryId] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState<'selection' | 'password'>('selection');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [profileImg, setProfileImg] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('maktabati_user');
    if (savedUser) {
        try {
            setUser(JSON.parse(savedUser));
        } catch (e) {
            console.error(e);
        }
    }

    const loadGlobalSettings = async () => {
        const img = await getSetting('profileImage');
        setProfileImg(img || 'https://ui-avatars.com/api/?name=Saad+Albogami&background=111827&color=fff&size=128');
    };
    loadGlobalSettings();
    window.addEventListener('profile-updated', loadGlobalSettings);
    return () => window.removeEventListener('profile-updated', loadGlobalSettings);
  }, []);

  const handleNavigate = (page: string, id?: string) => {
    if ((page === 'admin' || page === 'upload') && (!user || user.email !== ADMIN_EMAIL)) {
        alert("عذراً، هذه الصفحة مخصصة لمالك الموقع فقط.");
        return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
    setCurrentStoryId(id);
  };

  const verifyOwnerPassword = () => {
      if (passwordInput === OWNER_PASSWORD) {
          const ownerUser: User = {
              name: 'سعد البقمي',
              email: ADMIN_EMAIL,
              avatar: profileImg || '/saad.jpg'
          };
          setUser(ownerUser);
          localStorage.setItem('maktabati_user', JSON.stringify(ownerUser));
          setShowLoginModal(false);
      } else {
          setLoginError('كلمة المرور غير صحيحة.');
      }
  };

  const performLogin = (role: 'visitor') => {
      if (role === 'visitor') {
          const mockUser: User = {
              name: 'زائر الموقع',
              email: 'visitor@gmail.com',
              avatar: 'https://ui-avatars.com/api/?name=Visitor&background=0ea5e9&color=fff&length=1'
          };
          setUser(mockUser);
          localStorage.setItem('maktabati_user', JSON.stringify(mockUser));
          setShowLoginModal(false);
      }
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('maktabati_user');
      handleNavigate('home');
  };

  const renderPage = () => {
    const isOwner = user?.email === ADMIN_EMAIL;
    switch (currentPage) {
      case 'home': return <Home onNavigate={handleNavigate} />;
      case 'upload': return isOwner ? <Upload onNavigate={handleNavigate} /> : <Home onNavigate={handleNavigate} />;
      case 'admin': return isOwner ? <AdminDashboard onNavigate={handleNavigate} /> : <Home onNavigate={handleNavigate} />;
      case 'details': return currentStoryId ? <StoryDetails id={currentStoryId} onNavigate={handleNavigate} /> : <Home onNavigate={handleNavigate} />;
      default: return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} user={user} onLogin={() => setShowLoginModal(true)} onLogout={handleLogout} />
      <main className="pb-20">{renderPage()}</main>
      
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm rotate-3 group hover:rotate-0 transition-transform duration-500">
                    <img src={profileImg || ''} alt="Saad" className="w-full h-full object-cover object-top" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">SAAD ALBOGAMI</h3>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Official Content Library</p>
                </div>
            </div>
            <a href="mailto:saad130013@gmail.com" className="flex items-center gap-3 text-gray-900 font-black bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 hover:shadow-xl transition-all">
                <Mail className="w-5 h-5 text-primary-500" />
                saad130013@gmail.com
            </a>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-50 text-center text-gray-400 text-[11px] font-bold uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} SAAD ALBOGAMI - Crafted for Excellence.
          </div>
        </div>
      </footer>

      {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md px-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                  <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                      <h3 className="text-2xl font-black text-gray-900">{loginStep === 'selection' ? 'تسجيل الدخول' : 'تأكيد الهوية'}</h3>
                      <button onClick={() => setShowLoginModal(false)} className="text-gray-400 hover:text-gray-900"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="p-10 space-y-6">
                      {loginStep === 'selection' ? (
                          <>
                              <button onClick={() => setLoginStep('password')} className="w-full flex items-center p-6 border border-gray-100 bg-white rounded-3xl hover:border-primary-500 hover:shadow-xl transition-all group">
                                  <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white ml-5"><Shield className="w-7 h-7" /></div>
                                  <div className="text-right"><span className="block font-black text-gray-900 text-lg">مالك الموقع</span></div>
                              </button>
                              <button onClick={() => performLogin('visitor')} className="w-full flex items-center p-6 border border-gray-100 bg-white rounded-3xl hover:shadow-lg transition-all">
                                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 ml-5"><UserIcon className="w-7 h-7" /></div>
                                  <div className="text-right"><span className="block font-black text-gray-900 text-lg">تصفح كزائر</span></div>
                              </button>
                          </>
                      ) : (
                          <div className="space-y-8 text-center animate-fade-in-right">
                              <div className="relative w-24 h-24 mx-auto mb-6">
                                  <img src={profileImg || ''} className="w-full h-full object-cover rounded-3xl shadow-xl ring-4 ring-primary-50" />
                                  <div className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-2 rounded-xl shadow-lg"><Lock className="w-4 h-4" /></div>
                              </div>
                              <h4 className="text-xl font-black text-gray-900">أهلاً سعد!</h4>
                              <input 
                                  type="password" autoFocus placeholder="••••••••" 
                                  className="block w-full px-6 py-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white text-center text-xl font-black" 
                                  value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && verifyOwnerPassword()}
                              />
                              {loginError && <p className="text-red-500 text-xs font-black">{loginError}</p>}
                              <button onClick={verifyOwnerPassword} className="w-full py-5 bg-primary-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">تأكيد الهوية</button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;