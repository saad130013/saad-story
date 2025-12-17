import React from 'react';
import { Heart, Eye, MessageCircle } from 'lucide-react';
import { Story } from '../types';

interface StoryCardProps {
  story: Story;
  onClick: (id: string) => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onClick }) => {
  return (
    <div 
        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
        onClick={() => onClick(story.id)}
    >
      {/* Changed aspect ratio to aspect-video (16:9) to make it wider and shorter as requested */}
      <div className="relative aspect-video overflow-hidden bg-gray-50 border-b border-gray-50">
        <img 
          src={story.coverImage} 
          alt={story.title} 
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300" />
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          {/* Increased line-clamp to 2 to ensure title is visible */}
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {story.title}
          </h3>
          <p className="text-sm text-gray-500 mb-3">{story.author}</p>
          <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
            {story.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-3 mt-auto">
          <div className="flex items-center space-x-3 space-x-reverse">
            <span className="flex items-center hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4 ml-1" />
              {story.likes}
            </span>
            <span className="flex items-center">
              <MessageCircle className="w-4 h-4 ml-1" />
              {story.comments.length}
            </span>
          </div>
          <span className="flex items-center">
            <Eye className="w-4 h-4 ml-1" />
            {story.views}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;