import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import StoryDetails from './pages/StoryDetails';
import AdminDashboard from './pages/AdminDashboard';
import { Mail } from 'lucide-react';
import { User } from './types';

const App: React.FC = () => {
  // Helper to parse URL params for initial state
  const getParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      page: params.get('page') || 'home',
      id: params.get('id') || undefined
    };
  };

  const initialParams = getParams();
  const [currentPage, setCurrentPage] = useState(initialParams.page);
  const [currentStoryId, setCurrentStoryId] = useState<string | undefined>(initialParams.id);
  const [user, setUser] = useState<User | null>(null);

  // Handle browser back/forward buttons (PopState)
  useEffect(() => {
    const onPopState = () => {
      const { page, id } = getParams();
      setCurrentPage(page);
      setCurrentStoryId(id);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Check for saved user session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('maktabati_user');
    if (savedUser) {
        try {
            setUser(JSON.parse(savedUser));
        } catch (e) {
            console.error(e);
        }
    }
  }, []);

  const handleNavigate = (page: string, id?: string) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
    setCurrentStoryId(id);

    // Update URL to support sharing/bookmarking
    const url = new URL(window.location.href);
    
    if (page === 'home') {
       // Clean URL for home page
       window.history.pushState({}, '', window.location.pathname);
    } else {
       url.searchParams.set('page', page);
       if (id) {
         url.searchParams.set('id', id);
       } else {
         url.searchParams.delete('id');
       }
       window.history.pushState({}, '', url.toString());
    }
  };

  const handleLogin = () => {
      // Simulate Google Login Process
      const mockUser: User = {
          name: 'زائر الموقع',
          email: 'visitor@gmail.com',
          avatar: 'https://ui-avatars.com/api/?name=Visitor&background=0ea5e9&color=fff&length=1'
      };
      
      setUser(mockUser);
      localStorage.setItem('maktabati_user', JSON.stringify(mockUser));
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('maktabati_user');
      handleNavigate('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'upload':
        // Ensure only logged in users can upload (optional rule, but good for UX)
        return <Upload onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'details':
        return currentStoryId ? (
          <StoryDetails id={currentStoryId} onNavigate={handleNavigate} />
        ) : (
          <Home onNavigate={handleNavigate} />
        );
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      <Navbar 
        onNavigate={handleNavigate} 
        currentPage={currentPage} 
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main className="fade-in">
        {renderPage()}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Brand in Footer */}
            <div className="text-center md:text-right">
              <h3 className="text-lg font-bold text-gray-900 uppercase">SAAD ALBOGAMI</h3>
              <p className="text-sm text-gray-500 mt-1">منصة القصص والمحتوى الإبداعي</p>
            </div>

            {/* Contact Section */}
            <div className="flex flex-col items-center md:items-end bg-gray-50 px-6 py-4 rounded-xl border border-gray-100">
               <span className="text-sm font-semibold text-gray-700 mb-2">تواصل مع صاحب الموقع</span>
               <a 
                 href="mailto:saad130013@gmail.com" 
                 className="flex items-center gap-2 text-primary-600 hover:text-primary-700 hover:underline transition-colors font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 hover:shadow-md"
               >
                 <Mail className="w-4 h-4" />
                 saad130013@gmail.com
               </a>
            </div>

          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} SAAD ALBOGAMI - جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;