/**
 * This service handles PDF processing in the browser.
 * It replaces the need for a Python backend (pdf2image) by using PDF.js
 */

export const extractCoverFromPdf = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Safety check for PDF.js library
    if (!window.pdfjsLib) {
      reject(new Error("مكتبة PDF.js غير محملة. يرجى تحديث الصفحة."));
      return;
    }

    const fileReader = new FileReader();

    fileReader.onload = async function() {
      const typedarray = new Uint8Array(this.result as ArrayBuffer);

      try {
        const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
        
        // Fetch the first page
        const page = await pdf.getPage(1);
        
        // Increased scale for better clarity (High Resolution)
        const scale = 2.0; 
        const viewport = page.getViewport({ scale });

        // Prepare canvas using PDF page dimensions
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
            reject('Could not create canvas context');
            return;
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        
        // Convert canvas to base64 image with high quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);

      } catch (error) {
        console.error('Error extracting PDF cover:', error);
        reject(error);
      }
    };

    fileReader.readAsArrayBuffer(file);
  });
};

export const createPdfUrl = (file: File): string => {
  return URL.createObjectURL(file);
};
