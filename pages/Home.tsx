import React, { useEffect, useState } from 'react';
import StoryCard from '../components/StoryCard';
import { getStories, getCategories, getSetting } from '../services/storage';
import { Story } from '../types';
import { Search, Loader2 } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, id?: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [profileImg, setProfileImg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [storiesData, catsData, imgData] = await Promise.all([
                getStories(),
                getCategories(),
                getSetting('profileImage')
            ]);
            setStories(storiesData);
            setCategories(['الكل', ...catsData]);
            setProfileImg(imgData || 'https://ui-avatars.com/api/?name=Saad+Albogami&background=111827&color=fff&size=256');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          story.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          story.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'الكل' || story.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-20">
        <div className="relative group inline-block">
            <div className="absolute inset-0 bg-primary-500 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative w-44 h-44 mx-auto mb-8 rounded-full p-1.5 border-2 border-gray-100 shadow-2xl bg-white overflow-hidden ring-4 ring-white/80">
                 <img 
                    src={profileImg || ''} 
                    alt="Saad Albogami" 
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                />
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/20 shadow-lg">
                Verified Owner
            </div>
        </div>

        <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">مكتبة سعد البقمي</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">منصة متخصصة لعرض القصص، ريادة الأعمال، والمحتوى الإبداعي المختار.</p>
        
        <div className="mt-12 max-w-2xl mx-auto relative mb-12">
          <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-primary-500" />
          </div>
          <input
            type="text"
            className="block w-full pr-14 pl-6 py-5 border-none rounded-[2rem] bg-white shadow-xl shadow-gray-200/50 transition-all focus:ring-4 focus:ring-primary-100 placeholder:text-gray-400 font-bold"
            placeholder="عن ماذا تبحث اليوم؟ (مثلاً: ريادة الأعمال)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto">
            {categories.map(category => (
                <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-2xl text-sm font-black transition-all transform active:scale-95 ${
                        selectedCategory === category
                            ? 'bg-primary-600 text-white shadow-xl shadow-primary-200 -translate-y-1'
                            : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50 hover:text-gray-900 hover:shadow-lg'
                    }`}
                >
                    {category}
                </button>
            ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-6">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <span className="w-2 h-8 bg-primary-600 rounded-full"></span>
              أحدث الإصدارات
          </h2>
          <div className="text-sm font-bold text-gray-400">
              عرض {filteredStories.length} قصة
          </div>
      </div>

      {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
              <p className="text-gray-400 font-black text-xs uppercase tracking-widest">جاري تحميل المكتبة</p>
          </div>
      ) : filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredStories.map(story => (
            <StoryCard key={story.id} story={story} onClick={(id) => onNavigate('details', id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Search className="w-10 h-10" />
          </div>
          <p className="text-gray-400 text-lg font-bold">عذراً، لم نجد أي نتائج لـ "{searchTerm}"</p>
          <button onClick={() => {setSearchTerm(''); setSelectedCategory('الكل');}} className="mt-4 text-primary-600 font-black hover:underline">عرض كل القصص</button>
        </div>
      )}
    </div>
  );
};

export default Home;