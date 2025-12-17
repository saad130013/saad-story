import React, { useState, useRef, useEffect } from 'react';
import { Upload as UploadIcon, FileText, X, Loader2, Image as ImageIcon, CheckCircle, Tag } from 'lucide-react';
import { extractCoverFromPdf } from '../services/pdfService';
import { saveStory, getCategories } from '../services/storage';
import { Story } from '../types';

interface UploadProps {
  onNavigate: (page: string) => void;
}

const Upload: React.FC<UploadProps> = ({ onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCats = async () => {
        const cats = await getCategories();
        setCategories(cats);
        if (cats.length > 0) setCategory(cats[0]);
    };
    fetchCats();
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

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
        const coverDataUrl = await extractCoverFromPdf(selectedFile);
        setCoverPreview(coverDataUrl);
      } catch (error) {
        console.error("Failed to extract cover", error);
        alert('حدث خطأ أثناء معالجة ملف الـ PDF.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !coverPreview || !title || !author) return;

    setIsProcessing(true);
    try {
        const pdfBase64 = await fileToBase64(file);
        const newStory: Story = {
          id: Date.now().toString(),
          title,
          author,
          description,
          category,
          coverImage: coverPreview,
          pdfUrl: pdfBase64,
          likes: 0,
          dislikes: 0,
          views: 0,
          downloads: 0,
          createdAt: new Date().toISOString(),
          comments: []
        };
        await saveStory(newStory);
        setIsSuccess(true);
        setTimeout(() => onNavigate('home'), 2000);
    } catch (err) {
        console.error(err);
        alert("فشل في حفظ الملف. تأكد من وجود مساحة كافية.");
    } finally {
        setIsProcessing(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const removeFile = () => {
    setFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isSuccess) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in-up">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">تم نشر القصة بنجاح!</h2>
              <p className="text-gray-500 mb-8">تم حفظ القصة في قاعدة بيانات المتصفح بنجاح.</p>
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-primary-50">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <UploadIcon className="ml-3 h-6 w-6 text-primary-600" />
            رفع قصة جديدة
          </h2>
          <p className="mt-2 text-gray-600">سيتم حفظ الملف بشكل دائم في متصفحك الحالي.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">ملف القصة (PDF)</label>
            {!file ? (
              <div onClick={triggerFileInput} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-all group">
                <div className="space-y-1 text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="relative rounded-md font-medium text-primary-600 bg-transparent hover:text-primary-500">اختر ملفاً</span>
                    <span className="mr-1">أو اسحبه هنا</span>
                  </div>
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
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
          </div>

          {(isProcessing || (coverPreview && !isProcessing)) && (
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
               {isProcessing ? (
                 <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600 ml-2" />
                    <span className="text-gray-600">جاري معالجة وحفظ الملف...</span>
                 </div>
               ) : (
                 <div className="flex flex-col sm:flex-row gap-6">
                    <img src={coverPreview!} alt="Preview" className="w-24 rounded-lg shadow-sm border border-gray-200" />
                    <div className="text-sm text-gray-600 flex items-center">
                        <span className="font-medium text-green-700">تم استخراج الغلاف وتجهيز الملف للحفظ.</span>
                    </div>
                 </div>
               )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">عنوان القصة</label>
              <input type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">اسم الكاتب</label>
              <input type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">تصنيف القصة</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">نبذة عن القصة</label>
              <textarea rows={4} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={!file || !coverPreview || isProcessing} className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${!file || !coverPreview || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}>
              {isProcessing ? 'جاري الحفظ...' : 'نشر القصة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;