import React, { useState, useEffect } from 'react';
import { getStoryById, updateStory, addComment } from '../services/storage';
import { Story, SharePlatform } from '../types';
import PdfViewer from '../components/PdfViewer';
import { 
  Download, ThumbsUp, ThumbsDown, Share2, 
  Send, Calendar, User, Eye, Link as LinkIcon, Check, MessageCircle, Tag, Loader2
} from 'lucide-react';

interface StoryDetailsProps {
  id: string;
  onNavigate: (page: string) => void;
}

const StoryDetails: React.FC<StoryDetailsProps> = ({ id, onNavigate }) => {
  const [story, setStory] = useState<Story | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
        try {
            const data = await getStoryById(id);
            if (data) {
                const updated = { ...data, views: data.views + 1 };
                await updateStory(updated);
                setStory(updated);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchStory();
  }, [id]);

  const handleLike = async () => {
    if (!story) return;
    const updated = { ...story, likes: story.likes + 1 };
    setStory(updated);
    await updateStory(updated);
  };

  const handleDislike = async () => {
    if (!story) return;
    const updated = { ...story, dislikes: story.dislikes + 1 };
    setStory(updated);
    await updateStory(updated);
  };

  const handleDownload = async () => {
    if (!story) return;
    const updated = { ...story, downloads: (story.downloads || 0) + 1 };
    setStory(updated);
    await updateStory(updated);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story || !newComment.trim()) return;
    
    await addComment(story.id, newComment);
    const updated = await getStoryById(story.id);
    if (updated) setStory(updated);
    setNewComment('');
  };

  const handleShare = (platform: SharePlatform) => {
    if (!story) return;
    const text = `اقرأ قصة "${story.title}" على مكتبتي!`;
    const url = window.location.href;
    let shareUrl = '';

    switch (platform) {
        case SharePlatform.WHATSAPP:
            shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
            window.open(shareUrl, '_blank');
            break;
        case SharePlatform.COPY:
            navigator.clipboard.writeText(url).then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 3000);
            });
            break;
    }
    setShowShareMenu(false);
  };

  if (loading) return (
      <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
  );

  if (!story) return (
      <div className="text-center py-20">
          <p className="text-xl text-gray-500 mb-4">القصة غير موجودة</p>
          <button onClick={() => onNavigate('home')} className="text-primary-600 hover:underline">العودة للرئيسية</button>
      </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/3 lg:w-1/4 bg-gray-50 p-6 flex items-center justify-center">
             <div className="relative shadow-xl rounded-lg overflow-hidden w-full max-w-[250px]">
                <img src={story.coverImage} alt={story.title} className="w-full h-auto" />
             </div>
          </div>
          <div className="p-8 md:w-2/3 lg:w-3/4 flex flex-col">
             <div className="flex-grow">
                <div className="flex items-center text-sm text-gray-500 mb-2 flex-wrap gap-y-2">
                    <span className="flex items-center bg-primary-50 text-primary-700 px-2.5 py-0.5 rounded-full text-xs font-semibold ml-3 border border-primary-100">
                        <Tag className="w-3 h-3 ml-1" />
                        {story.category || 'عام'}
                    </span>
                    <Calendar className="w-4 h-4 ml-1" />
                    {new Date(story.createdAt).toLocaleDateString('ar-EG')}
                    <span className="mx-2 text-gray-300">•</span>
                    <Eye className="w-4 h-4 ml-1" />
                    {story.views} مشاهدة
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{story.title}</h1>
                <div className="flex items-center text-primary-600 font-medium mb-6">
                    <User className="w-5 h-5 ml-2" />
                    {story.author}
                </div>
                <p className="text-gray-600 leading-relaxed text-lg mb-8">{story.description}</p>
             </div>

             <div className="flex flex-wrap items-center gap-4 mt-auto pt-6 border-t border-gray-100">
                <a 
                    href={story.pdfUrl} 
                    download={`${story.title}.pdf`}
                    onClick={handleDownload}
                    className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm"
                >
                    <Download className="w-5 h-5 ml-2" />
                    تحميل PDF
                </a>
                
                <div className="flex items-center space-x-2 space-x-reverse border-r border-gray-200 pr-4 mr-2">
                    <button onClick={handleLike} className="flex items-center px-4 py-2 rounded-full bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500">
                        <ThumbsUp className="w-5 h-5 ml-2" />
                        <span>{story.likes}</span>
                    </button>
                    <button onClick={handleDislike} className="flex items-center px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600">
                        <ThumbsDown className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative mr-auto">
                    <button onClick={() => setShowShareMenu(!showShareMenu)} className="flex items-center px-4 py-3 rounded-full bg-gray-50 text-gray-600">
                        <Share2 className="w-5 h-5 ml-2" /> مشاركة
                    </button>
                    {showShareMenu && (
                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-10">
                            <button onClick={() => handleShare(SharePlatform.WHATSAPP)} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-green-50">واتساب</button>
                            <button onClick={() => handleShare(SharePlatform.COPY)} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">نسخ الرابط</button>
                        </div>
                    )}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-4 bg-gray-50 flex justify-center">
            {story.pdfUrl ? <PdfViewer url={story.pdfUrl} /> : <div className="p-10 text-gray-400 italic">لا يتوفر عرض مباشر لهذا الملف.</div>}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                التعليقات <span className="mr-2 bg-primary-50 text-primary-700 py-0.5 px-3 rounded-full text-sm font-medium">{story.comments.length}</span>
            </h3>
            <form onSubmit={handleCommentSubmit} className="mb-8 flex gap-4">
                <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="أضف تعليقاً..." className="flex-grow bg-gray-50 border border-gray-200 rounded-full py-3 px-6 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <button type="submit" disabled={!newComment.trim()} className="p-3 rounded-full text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300">
                    <Send className="w-5 h-5" />
                </button>
            </form>
            <div className="space-y-6">
                {story.comments.length > 0 ? story.comments.slice().reverse().map(comment => (
                    <div key={comment.id} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">{comment.user[0]}</div>
                        <div className="bg-gray-50 rounded-2xl px-5 py-3">
                            <div className="flex items-center mb-1 gap-2">
                                <span className="font-bold text-sm">{comment.user}</span>
                                <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString('ar-EG')}</span>
                            </div>
                            <p className="text-gray-700 text-sm">{comment.text}</p>
                        </div>
                    </div>
                )) : <div className="text-center py-8 text-gray-400 italic">لا توجد تعليقات بعد.</div>}
            </div>
        </div>
      </div>

      {copySuccess && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center animate-fade-in-up">
          <Check className="w-5 h-5 ml-2 text-green-400" /> تم نسخ الرابط بنجاح
        </div>
      )}
    </div>
  );
};

export default StoryDetails;