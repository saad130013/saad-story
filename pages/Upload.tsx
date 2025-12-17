import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, FileText, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { extractCoverFromPdf, createPdfUrl } from '../services/pdfService';
import { saveStory } from '../services/storage';
import { Story } from '../types';

interface UploadProps {
  onNavigate: (page: string) => void;
}

const Upload: React.FC<UploadProps> = ({ onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        alert('الرجاء اختيار ملف PDF فقط');
        return;
      }
      
      setFile(selectedFile);
      setIsProcessing(true);
      
      try {
        // Here is the magic: Extracting cover client-side using PDF.js
        const coverDataUrl = await extractCoverFromPdf(selectedFile);
        setCoverPreview(coverDataUrl);
      } catch (error) {
        console.error("Failed to extract cover", error);
        alert('حدث خطأ أثناء معالجة ملف الـ PDF. تأكد أن الملف سليم.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !coverPreview || !title || !author) return;

    const newStory: Story = {
      id: Date.now().toString(),
      title,
      author,
      description,
      coverImage: coverPreview,
      pdfUrl: createPdfUrl(file), // Creates a blob URL
      likes: 0,
      dislikes: 0,
      views: 0,
      downloads: 0,
      createdAt: new Date().toISOString(),
      comments: []
    };

    saveStory(newStory);
    onNavigate('home');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-primary-50">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <UploadIcon className="ml-3 h-6 w-6 text-primary-600" />
            رفع قصة جديدة
          </h2>
          <p className="mt-2 text-gray-600">
            سيقوم النظام تلقائياً باستخراج الغلاف من الصفحة الأولى لملف الـ PDF.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* File Upload Area */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">ملف القصة (PDF)</label>
            
            {!file ? (
              <div 
                onClick={triggerFileInput}
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-all group"
              >
                <div className="space-y-1 text-center">
                  <div className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary-500 transition-colors">
                    <UploadIcon className="h-full w-full" />
                  </div>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="relative rounded-md font-medium text-primary-600 bg-transparent hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      اختر ملفاً
                    </span>
                    <span className="mr-1">أو اسحبه هنا</span>
                  </div>
                  <p className="text-xs text-gray-500">PDF حتى 10 ميجابايت</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-100 rounded-xl">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-primary-600 ml-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button type="button" onClick={removeFile} className="p-1 hover:bg-red-100 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              accept="application/pdf" 
              className="hidden" 
            />
          </div>

          {/* Processing Indicator or Preview */}
          {isProcessing && (
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-xl">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600 ml-2" />
              <span className="text-gray-600">جاري معالجة الملف واستخراج الغلاف...</span>
            </div>
          )}

          {coverPreview && !isProcessing && (
            <div className="flex flex-col sm:flex-row gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-32 flex-shrink-0">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">الغلاف المستخرج</span>
                <img src={coverPreview} alt="Cover Preview" className="w-full rounded-lg shadow-sm border border-gray-200" />
              </div>
              <div className="flex-grow flex items-center">
                <div className="text-sm text-gray-600">
                    <div className="flex items-center mb-2">
                        <ImageIcon className="w-4 h-4 ml-2 text-green-600" />
                        <span className="font-medium text-green-700">تم استخراج الغلاف بنجاح!</span>
                    </div>
                    <p>هذه هي الصورة التي ستظهر في الصفحة الرئيسية. تم أخذها من الصفحة الأولى لملفك.</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">عنوان القصة</label>
              <input
                type="text"
                id="title"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">اسم الكاتب</label>
              <input
                type="text"
                id="author"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">نبذة عن القصة</label>
              <textarea
                id="description"
                rows={4}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
             <button
              type="button"
              onClick={() => onNavigate('home')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ml-3"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!file || !coverPreview}
              className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                !file || !coverPreview ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }`}
            >
              نشر القصة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;