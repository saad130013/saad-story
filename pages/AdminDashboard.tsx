import React, { useEffect, useState } from 'react';
import { getStories, deleteStory } from '../services/storage';
import { Story } from '../types';
import { Plus, Trash2, Eye, FileText, BarChart3, Download } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string, id?: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [stats, setStats] = useState({ totalStories: 0, totalViews: 0, totalLikes: 0, totalDownloads: 0 });

  const loadData = () => {
    const data = getStories();
    setStories(data);
    
    // Calculate stats
    const totalViews = data.reduce((acc, curr) => acc + curr.views, 0);
    const totalLikes = data.reduce((acc, curr) => acc + curr.likes, 0);
    const totalDownloads = data.reduce((acc, curr) => acc + (curr.downloads || 0), 0);
    
    setStats({
      totalStories: data.length,
      totalViews,
      totalLikes,
      totalDownloads
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`هل أنت متأكد من حذف قصة "${title}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      deleteStory(id);
      loadData(); // Refresh list
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900">لوحة التحكم</h1>
            <p className="mt-1 text-gray-500">إدارة القصص والمحتوى والإحصائيات</p>
        </div>
        <button
          onClick={() => onNavigate('upload')}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          إضافة قصة جديدة
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">إجمالي القصص</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalStories}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">إجمالي المشاهدات</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalViews}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Download className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">إجمالي التحميلات</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalDownloads}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">إجمالي الإعجابات</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalLikes}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stories Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">قائمة القصص</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الغلاف
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عنوان القصة
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الكاتب
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ النشر
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تفاعل
                </th>
                <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">إجراءات</span>
                </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {stories.length > 0 ? (
                    stories.map((story) => (
                    <tr key={story.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded object-cover" src={story.coverImage} alt="" />
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{story.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{story.description.substring(0, 30)}...</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{story.author}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                                {new Date(story.createdAt).toLocaleDateString('ar-EG')}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3"/> {story.views}</span>
                                <span className="flex items-center gap-1"><Download className="w-3 h-3"/> {story.downloads || 0}</span>
                                <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3"/> {story.likes}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3 space-x-reverse">
                                <button 
                                    onClick={() => onNavigate('details', story.id)}
                                    className="text-primary-600 hover:text-primary-900"
                                    title="مشاهدة"
                                >
                                    <Eye className="h-5 w-5" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(story.id, story.title)}
                                    className="text-red-600 hover:text-red-900"
                                    title="حذف"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                            لا توجد قصص حالياً. ابدأ بإضافة قصة جديدة!
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;