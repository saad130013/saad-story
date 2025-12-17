import React, { useEffect, useState, useRef } from 'react';
import { getStories, deleteStory, getCategories, saveCategory, deleteCategory, renameCategory, getSetting, saveSetting } from '../services/storage';
import { Story } from '../types';
import { Plus, Trash2, Eye, FileText, BarChart3, Download, Loader2, Tag, Edit3, X, Check, Camera, Image as ImageIcon, Save } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string, id?: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'stories' | 'categories' | 'settings'>('stories');
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalStories: 0, totalViews: 0, totalLikes: 0, totalDownloads: 0 });
  
  // Settings State
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category Edit State
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<{old: string, current: string} | null>(null);

  const loadData = async () => {
    try {
        setLoading(true);
        const [storiesData, catsData, imgData] = await Promise.all([
            getStories(),
            getCategories(),
            getSetting('profileImage')
        ]);
        setStories(storiesData);
        setCategories(catsData);
        setProfileImg(imgData || 'https://ui-avatars.com/api/?name=Saad+Albogami&background=111827&color=fff&size=256');
        
        const totalViews = storiesData.reduce((acc, curr) => acc + curr.views, 0);
        const totalLikes = storiesData.reduce((acc, curr) => acc + curr.likes, 0);
        const totalDownloads = storiesData.reduce((acc, curr) => acc + (curr.downloads || 0), 0);
        
        setStats({ totalStories: storiesData.length, totalViews, totalLikes, totalDownloads });
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProfileImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImg(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await saveSetting('profileImage', profileImg);
      // Notify other components (Navbar, Home) to refresh
      window.dispatchEvent(new CustomEvent('profile-updated'));
      alert('تم تحديث الصورة الشخصية بنجاح!');
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteStory = async (id: string, title: string) => {
    if (window.confirm(`هل أنت متأكد من حذف قصة "${title}"؟`)) {
      await deleteStory(id);
      loadData();
    }
  };

  const handleAddCategory = async () => {
      if (!newCatName.trim()) return;
      if (categories.includes(newCatName.trim())) {
          alert('هذا التصنيف موجود بالفعل');
          return;
      }
      await saveCategory(newCatName.trim());
      setNewCatName('');
      loadData();
  };

  const handleDeleteCategory = async (name: string) => {
      const inUse = stories.some(s => s.category === name);
      const msg = inUse 
        ? `هذا التصنيف مستخدم في بعض القصص. إذا حذفته، ستتحول تلك القصص إلى تصنيف "عام". هل أنت متأكد؟`
        : `هل أنت متأكد من حذف تصنيف "${name}"؟`;
      
      if (window.confirm(msg)) {
          await deleteCategory(name);
          loadData();
      }
  };

  const handleRenameCategory = async () => {
      if (!editingCat || !editingCat.current.trim()) return;
      if (editingCat.old === editingCat.current) {
          setEditingCat(null);
          return;
      }
      await renameCategory(editingCat.old, editingCat.current.trim());
      setEditingCat(null);
      loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900">لوحة التحكم</h1>
            <p className="mt-1 text-gray-500">إدارة المحتوى والإعدادات الشخصية</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
             <button onClick={() => onNavigate('upload')} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-lg shadow-primary-100">
                <Plus className="-ml-1 mr-2 h-5 w-5" /> إضافة قصة جديدة
            </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('stories')}
            className={`px-6 py-3 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'stories' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
              إدارة القصص
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'categories' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
              إدارة التصنيفات
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
              إعدادات الموقع
          </button>
      </div>

      {activeTab === 'stories' && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white p-5 shadow-sm border border-gray-100 rounded-2xl flex items-center">
                    <div className="bg-blue-50 p-3 rounded-xl ml-4"><FileText className="h-6 w-6 text-blue-600" /></div>
                    <div>
                        <dt className="text-xs font-bold text-gray-400 uppercase tracking-widest">إجمالي القصص</dt>
                        <dd className="text-xl font-black text-gray-900">{stats.totalStories}</dd>
                    </div>
                </div>
                <div className="bg-white p-5 shadow-sm border border-gray-100 rounded-2xl flex items-center">
                    <div className="bg-purple-50 p-3 rounded-xl ml-4"><Eye className="h-6 w-6 text-purple-600" /></div>
                    <div>
                        <dt className="text-xs font-bold text-gray-400 uppercase tracking-widest">المشاهدات</dt>
                        <dd className="text-xl font-black text-gray-900">{stats.totalViews}</dd>
                    </div>
                </div>
                <div className="bg-white p-5 shadow-sm border border-gray-100 rounded-2xl flex items-center">
                    <div className="bg-green-50 p-3 rounded-xl ml-4"><Download className="h-6 w-6 text-green-600" /></div>
                    <div>
                        <dt className="text-xs font-bold text-gray-400 uppercase tracking-widest">التحميلات</dt>
                        <dd className="text-xl font-black text-gray-900">{stats.totalDownloads}</dd>
                    </div>
                </div>
                <div className="bg-white p-5 shadow-sm border border-gray-100 rounded-2xl flex items-center">
                    <div className="bg-red-50 p-3 rounded-xl ml-4"><BarChart3 className="h-6 w-6 text-red-600" /></div>
                    <div>
                        <dt className="text-xs font-bold text-gray-400 uppercase tracking-widest">الإعجابات</dt>
                        <dd className="text-xl font-black text-gray-900">{stats.totalLikes}</dd>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 overflow-hidden rounded-2xl">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-right">
                        <thead className="bg-gray-50/50">
                            <tr>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">الغلاف</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">العنوان</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">تاريخ النشر</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">تفاعل</th>
                            <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {stories.map((story) => (
                                <tr key={story.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4"><img className="h-12 w-12 rounded-lg object-cover shadow-sm" src={story.coverImage} alt="" /></td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-black text-gray-900">{story.title}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded uppercase">{story.category}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{new Date(story.createdAt).toLocaleDateString('ar-EG')}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{story.views} مش. | {story.likes} إعج.</td>
                                    <td className="px-6 py-4 text-left font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => onNavigate('details', story.id)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors"><Eye className="h-5 w-5" /></button>
                                            <button onClick={() => handleDeleteStory(story.id, story.title)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-5 w-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                )}
            </div>
          </>
      )}

      {activeTab === 'categories' && (
          <div className="max-w-2xl">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                  <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center">
                      <Plus className="w-5 h-5 ml-2 text-primary-600" />
                      إضافة تصنيف جديد
                  </h3>
                  <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="مثلاً: ريادة أعمال"
                        className="flex-grow border border-gray-200 rounded-xl px-5 py-3 focus:ring-4 focus:ring-primary-50 focus:outline-none font-bold"
                      />
                      <button 
                        onClick={handleAddCategory}
                        className="bg-primary-600 text-white px-8 py-3 rounded-xl font-black hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 active:scale-95"
                      >
                          إضافة
                      </button>
                  </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 text-right">
                      <thead className="bg-gray-50/50">
                          <tr>
                              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">اسم التصنيف</th>
                              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">إجراءات</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                          {categories.map(cat => (
                              <tr key={cat} className="hover:bg-gray-50/30 transition-colors">
                                  <td className="px-6 py-4">
                                      {editingCat?.old === cat ? (
                                          <div className="flex items-center gap-2">
                                              <input 
                                                type="text" 
                                                value={editingCat.current}
                                                onChange={(e) => setEditingCat({...editingCat, current: e.target.value})}
                                                className="border border-primary-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary-50 font-bold"
                                                autoFocus
                                              />
                                              <button onClick={handleRenameCategory} className="bg-green-100 text-green-700 p-2 rounded-lg"><Check className="w-4 h-4" /></button>
                                              <button onClick={() => setEditingCat(null)} className="bg-gray-100 text-gray-500 p-2 rounded-lg"><X className="w-4 h-4" /></button>
                                          </div>
                                      ) : (
                                          <span className="text-sm font-bold text-gray-900">{cat}</span>
                                      )}
                                  </td>
                                  <td className="px-6 py-4 text-left">
                                      <div className="flex justify-end gap-3">
                                          <button onClick={() => setEditingCat({old: cat, current: cat})} className="p-2 text-gray-300 hover:text-primary-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                                          <button onClick={() => handleDeleteCategory(cat)} className="p-2 text-gray-300 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'settings' && (
          <div className="max-w-2xl animate-fade-in-up">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8 text-center">
                  <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">إعدادات الهوية البصرية</h3>
                  <p className="text-gray-400 font-medium mb-10">ارفع صورتك الاحترافية لتظهر في كامل الموقع</p>
                  
                  <div className="relative inline-block group">
                      <div className="w-48 h-48 rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl ring-4 ring-gray-50 bg-gray-50 flex items-center justify-center mb-8 relative">
                          {profileImg ? (
                              <img src={profileImg} className="w-full h-full object-cover object-top transition-transform group-hover:scale-110 duration-500" alt="Profile" />
                          ) : (
                              <ImageIcon className="w-16 h-16 text-gray-200" />
                          )}
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                              <Camera className="w-10 h-10 text-white" />
                          </div>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleProfileImgChange} 
                      />
                  </div>

                  <div className="flex flex-col gap-4">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 border-2 border-gray-100 rounded-2xl font-black text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                      >
                          <Camera className="w-5 h-5" />
                          تغيير الصورة
                      </button>
                      
                      <button 
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings}
                        className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-700 transition-all shadow-xl shadow-primary-100 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                          {isSavingSettings ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                          حفظ الإعدادات بالكامل
                      </button>
                  </div>
              </div>
              
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <p className="text-blue-700 text-sm font-bold flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      نصيحة: استخدم صورة بخلفية حيادية (مثل صورتك الأبيض والأسود) للحصول على أفضل مظهر "Premium".
                  </p>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;