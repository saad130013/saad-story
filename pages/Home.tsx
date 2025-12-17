import React, { useEffect, useState } from 'react';
import StoryCard from '../components/StoryCard';
import { getStories } from '../services/storage';
import { Story } from '../types';
import { Search } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, id?: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setStories(getStories());
  }, []);

  const filteredStories = stories.filter(story => 
    story.title.includes(searchTerm) || 
    story.author.includes(searchTerm) ||
    story.description.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero / Header Section */}
      <div className="text-center mb-12">
        
        {/* Profile Image Highlight */}
        <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-gray-200">
             <img 
                src="/saad.jpg" 
                alt="Saad Albogami" 
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallbackSrc = 'https://ui-avatars.com/api/?name=Saad+Albogami&background=111827&color=fff&size=256';
                  // Prevent infinite loop if fallback also fails
                  if (target.src !== fallbackSrc) {
                    target.src = fallbackSrc;
                  }
                }}
            />
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          أهلاً بك في مكتبة سعد البقمي
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          تصفح مجموعتي الخاصة من القصص والكتب المصورة، وشاركني آرائك وتفاعلك.
        </p>
        
        {/* Search Bar */}
        <div className="mt-8 max-w-xl mx-auto relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm shadow-sm transition-all"
            placeholder="ابحث عن قصة، كاتب، أو موضوع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStories.map(story => (
            <StoryCard 
              key={story.id} 
              story={story} 
              onClick={(id) => onNavigate('details', id)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">لا توجد قصص مطابقة لبحثك.</p>
        </div>
      )}
    </div>
  );
};

export default Home;