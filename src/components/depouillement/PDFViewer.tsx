import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronUp, ChevronDown, ZoomIn, ZoomOut } from 'lucide-react';

// Import des styles CSS nécessaires pour react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configuration du worker PDF.js - utiliser le package local
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFViewerProps {
  fileUrl: string | null;
}

export function PDFViewer({ fileUrl }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const goToPreviousPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(2.0, prev + 0.1));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.1));
  };

  if (!fileUrl) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-800/50 border-r border-slate-700">
        <div className="text-center text-slate-400 p-8">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-lg font-medium mb-2">Aucun scénario</p>
          <p className="text-sm">Importez un PDF dans les paramètres du projet</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" flex flex-col bg-slate-800/50 border-r border-slate-700">
      {/* Contrôles */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
            className="p-1.5 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            title="Page précédente"
          >
            <ChevronUp className="w-4 h-4 text-slate-300" />
          </button>
          <span className="text-sm text-slate-300 min-w-[80px] text-center">
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="p-1.5 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            title="Page suivante"
          >
            <ChevronDown className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            title="Zoom arrière"
          >
            <ZoomOut className="w-4 h-4 text-slate-300" />
          </button>
          <span className="text-sm text-slate-300 min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 2.0}
            className="p-1.5 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            title="Zoom avant"
          >
            <ZoomIn className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Viewer PDF */}
      <div className="flex-1 overflow-y-auto p-4">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          }
          error={
            <div className="text-center text-red-400 py-8">
              <p>Erreur lors du chargement du PDF</p>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="mx-auto shadow-lg"
          />
        </Document>
      </div>
    </div>
  );
}
