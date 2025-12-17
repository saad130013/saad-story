import React, { useState, useEffect } from 'react';
import { getStoryById, updateStory, addComment } from '../services/storage';
import { Story, SharePlatform } from '../types';
import PdfViewer from '../components/PdfViewer';
import { 
  Download, ThumbsUp, ThumbsDown, Share2, 
  Send, Calendar, User, Eye, Facebook, Twitter, Mail, Link as LinkIcon, Check, MessageCircle
} from 'lucide-react';

interface StoryDetailsProps {
  id: string;
  onNavigate: (page: string) => void;
}

const StoryDetails: React.FC<StoryDetailsProps> = ({ id, onNavigate }) => {
  const [story, setStory] = useState<Story | undefined>(undefined);
  const [newComment, setNewComment] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const data = getStoryById(id);
    if (data) {
      // Increment views
      const updated = { ...data, views: data.views + 1 };
      updateStory(updated);
      setStory(updated);
    }
  }, [id]);

  const handleLike = () => {
    if (!story) return;
    const updated = { ...story, likes: story.likes + 1 };
    setStory(updated);
    updateStory(updated);
  };

  const handleDislike = () => {
    if (!story) return;
    const updated = { ...story, dislikes: story.dislikes + 1 };
    setStory(updated);
    updateStory(updated);
  };

  const handleDownload = () => {
    if (!story) return;
    // Increment download count
    // Handle case where downloads might be undefined for old data
    const currentDownloads = story.downloads || 0;
    const updated = { ...story, downloads: currentDownloads + 1 };
    setStory(updated);
    updateStory(updated);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!story || !newComment.trim()) return;
    
    addComment(story.id, newComment);
    // Refresh local state
    const updated = getStoryById(story.id);
    if (updated) setStory(updated);
    setNewComment('');
  };

  const handleShare = (platform: SharePlatform) => {
    if (!story) return;
    
    const text = `اقرأ قصة "${story.title}" على مكتبتي!`;
    const url = window.location.href; // In real app, this is the permalink

    let shareUrl = '';

    switch (platform) {
        case SharePlatform.WHATSAPP:
            shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
            window.open(shareUrl, '_blank');
            break;
        case SharePlatform.TWITTER:
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
            window.open(shareUrl, '_blank');
            break;
        case SharePlatform.EMAIL:
            shareUrl = `mailto:?subject=${encodeURIComponent(story.title)}&body=${encodeURIComponent(text + '\n' + url)}`;
            window.open(shareUrl, '_self');
            break;
        case SharePlatform.COPY:
            navigator.clipboard.writeText(url).then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 3000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
            break;
    }
    setShowShareMenu(false);
  };

  if (!story) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-xl text-gray-500 mb-4">القصة غير موجودة</div>
        <button onClick={() => onNavigate('home')} className="text-primary-600 hover:underline">العودة للرئيسية</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Top Section: Cover & Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/3 lg:w-1/4 bg-gray-50 p-6 flex items-center justify-center">
             <div className="relative shadow-xl rounded-lg overflow-hidden w-full max-w-[250px] transform hover:scale-105 transition-transform duration-300">
                <img src={story.coverImage} alt={story.title} className="w-full h-auto" />
             </div>
          </div>
          <div className="p-8 md:w-2/3 lg:w-3/4 flex flex-col">
             <div className="flex-grow">
                <div className="flex items-center text-sm text-gray-500 mb-2 flex-wrap gap-y-2">
                    <Calendar className="w-4 h-4 ml-1" />
                    {new Date(story.createdAt).toLocaleDateString('ar-EG')}
                    <span className="mx-2 text-gray-300">•</span>
                    <Eye className="w-4 h-4 ml-1" />
                    {story.views} مشاهدة
                    <span className="mx-2 text-gray-300">•</span>
                    <MessageCircle className="w-4 h-4 ml-1" />
                    {story.comments.length} تعليقات
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{story.title}</h1>
                <div className="flex items-center text-primary-600 font-medium mb-6">
                    <User className="w-5 h-5 ml-2" />
                    {story.author}
                </div>
                <p className="text-gray-600 leading-relaxed text-lg mb-8">
                    {story.description}
                </p>
             </div>

             {/* Action Buttons */}
             <div className="flex flex-wrap items-center gap-4 mt-auto pt-6 border-t border-gray-100">
                <a 
                    href={story.pdfUrl} 
                    download={`${story.title}.pdf`}
                    onClick={handleDownload}
                    className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
                >
                    <Download className="w-5 h-5 ml-2" />
                    تحميل PDF
                </a>
                
                <div className="flex items-center space-x-2 space-x-reverse border-r border-gray-200 pr-4 mr-2">
                    <button 
                        onClick={handleLike}
                        className="flex items-center px-4 py-2 rounded-full bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 transition-colors"
                    >
                        <ThumbsUp className="w-5 h-5 ml-2" />
                        <span>{story.likes}</span>
                    </button>
                    <button 
                         onClick={handleDislike}
                        className="flex items-center px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                        <ThumbsDown className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative mr-auto">
                    <button 
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="flex items-center px-4 py-3 rounded-full bg-gray-50 hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                        <Share2 className="w-5 h-5 ml-2" />
                        مشاركة
                    </button>
                    
                    {showShareMenu && (
                        <div className="absolute left-0 bottom-full mb-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 pb-1 z-10 animate-fade-in-up">
                            {/* Preview Header */}
                            <div className="flex items-center gap-3 p-3 border-b border-gray-100 bg-gray-50 rounded-t-xl mb-1">
                                <img src={story.coverImage} alt="" className="w-10 h-10 rounded object-cover shadow-sm border border-gray-200" />
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-gray-800 truncate">{story.title}</p>
                                    <p className="text-[10px] text-gray-500">مشاركة عبر...</p>
                                </div>
                            </div>
                            
                            <button onClick={() => handleShare(SharePlatform.WHATSAPP)} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 flex items-center">
                                <MessageCircle className="w-4 h-4 ml-2" /> واتساب
                            </button>
                            <button onClick={() => handleShare(SharePlatform.TWITTER)} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-500 flex items-center">
                                <Twitter className="w-4 h-4 ml-2" /> تويتر
                            </button>
                            <button onClick={() => handleShare(SharePlatform.EMAIL)} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                                <Mail className="w-4 h-4 ml-2" /> بريد إلكتروني
                            </button>
                             <button onClick={() => handleShare(SharePlatform.COPY)} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center border-t border-gray-50">
                                <LinkIcon className="w-4 h-4 ml-2" /> نسخ الرابط
                            </button>
                        </div>
                    )}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-lg">قراءة القصة</h3>
        </div>
        <div className="p-4 bg-gray-50 flex justify-center">
            {/* The new secure PDF Viewer */}
            <PdfViewer url={story.pdfUrl} />
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                التعليقات 
                <span className="mr-2 bg-primary-50 text-primary-700 py-0.5 px-3 rounded-full text-sm font-medium">
                    {story.comments.length}
                </span>
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-8 flex gap-4">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                        <User className="w-6 h-6" />
                    </div>
                </div>
                <div className="flex-grow relative">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="أضف تعليقاً..." 
                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 px-6 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                    />
                    <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                {story.comments.length > 0 ? (
                    story.comments.slice().reverse().map(comment => (
                        <div key={comment.id} className="flex gap-4 group">
                             <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    <span className="font-bold text-sm">{comment.user[0]}</span>
                                </div>
                            </div>
                            <div className="flex-grow">
                                <div className="bg-gray-50 rounded-2xl rounded-tr-none px-5 py-3 inline-block">
                                    <div className="flex items-center mb-1 gap-2">
                                        <span className="font-bold text-sm text-gray-900">{comment.user}</span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(comment.createdAt).toLocaleDateString('ar-EG')}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm">{comment.text}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 italic">
                        لا توجد تعليقات بعد. كن أول من يعلق!
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Toast Notification */}
      {copySuccess && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center animate-fade-in-up transition-opacity duration-300">
          <Check className="w-5 h-5 ml-2 text-green-400" />
          <span className="font-medium">تم نسخ الرابط بنجاح</span>
        </div>
      )}
    </div>
  );
};

export default StoryDetails;