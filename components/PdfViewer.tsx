import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from 'lucide-react';

interface PdfViewerProps {
  url: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url }) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(1.2); // Start with a slightly larger comfortable scale
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    const loadPdf = async () => {
      // Check if library is available
      if (!window.pdfjsLib) {
          setError("مكتبة PDF لم يتم تحميلها بشكل صحيح. تأكد من اتصالك بالإنترنت.");
          setLoading(false);
          return;
      }

      try {
        setLoading(true);
        setError(null);
        const loadingTask = window.pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setPageCount(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("تعذر تحميل ملف القصة. قد يكون الرابط تالفاً أو محظوراً.");
        setLoading(false);
      }
    };

    if (url) {
        loadPdf();
    }
  }, [url]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        const page = await pdfDoc.getPage(pageNum);
        
        // Double check canvas exists after await (component might be unmounted)
        if (!canvasRef.current) return;
        
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;

        // Cancel previous render if any to prevent glitches
        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        
        await renderTask.promise;
      } catch (err: any) {
          // Ignore cancellation errors
          if (err?.name !== 'RenderingCancelledException') {
            console.error("Render error", err);
          }
      }
    };

    renderPage();
  }, [pdfDoc, pageNum, scale]);

  const changePage = (offset: number) => {
    setPageNum(prev => Math.min(Math.max(1, prev + offset), pageCount));
  };

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
              <p className="text-gray-500 font-medium">جاري تجهيز صفحات القصة...</p>
          </div>
      );
  }

  if (error) {
       return (
          <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-xl border border-red-100 p-8 text-center">
              <p className="text-red-600 font-bold text-lg mb-2">عذراً، حدث خطأ</p>
              <p className="text-red-500">{error}</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col items-center w-full select-none">
        {/* Canvas Area - Moved to top */}
        <div className="w-full overflow-auto bg-gray-500/5 p-4 sm:p-8 rounded-2xl border border-gray-200 flex justify-center min-h-[600px] mb-6">
            <canvas 
                ref={canvasRef} 
                className="shadow-2xl bg-white max-w-full h-auto rounded-sm"
                style={{ maxHeight: '85vh' }}
            />
        </div>

        {/* Toolbar - Moved to bottom */}
        <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between w-full max-w-2xl bg-white p-3 rounded-xl shadow-lg border border-gray-100 ring-1 ring-black ring-opacity-5">
             <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button 
                    onClick={() => changePage(-1)} 
                    disabled={pageNum <= 1}
                    className="p-2 rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:shadow-none transition-all"
                    title="الصفحة التالية"
                >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
                <span className="text-sm font-bold text-gray-700 mx-4 min-w-[80px] text-center" dir="ltr">
                    {pageNum} / {pageCount}
                </span>
                <button 
                    onClick={() => changePage(1)} 
                    disabled={pageNum >= pageCount}
                    className="p-2 rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:shadow-none transition-all"
                    title="الصفحة السابقة"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
             </div>

             <div className="flex items-center space-x-2 space-x-reverse mt-2 sm:mt-0">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all" title="تصغير">
                        <ZoomOut className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={() => setScale(s => Math.min(3.0, s + 0.2))} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all" title="تكبير">
                        <ZoomIn className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
             </div>
        </div>
        
        <p className="mt-4 text-sm text-gray-400">استخدم الأزرار للتنقل بين الصفحات</p>
    </div>
  );
};

export default PdfViewer;