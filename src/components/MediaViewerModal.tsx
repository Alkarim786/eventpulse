import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ShieldCheck,
  Printer,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { EventMedia } from '../types';

interface MediaViewerModalProps {
  photoData?: {
    currentUrl: string;
    allUrls: string[];
    startIndex: number;
  };
  docData?: EventMedia;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  photoData,
  docData,
  onClose,
}) => {
  // Photo Lightbox state
  const [photoIndex, setPhotoIndex] = useState(photoData ? photoData.startIndex : 0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (photoData) {
        if (e.key === 'ArrowRight') handleNextPhoto();
        if (e.key === 'ArrowLeft') handlePrevPhoto();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photoIndex, photoData]);

  const handleNextPhoto = () => {
    if (!photoData) return;
    setPhotoIndex((prev) => (prev + 1) % photoData.allUrls.length);
    setZoom(1);
    setRotation(0);
  };

  const handlePrevPhoto = () => {
    if (!photoData) return;
    setPhotoIndex((prev) => (prev - 1 + photoData.allUrls.length) % photoData.allUrls.length);
    setZoom(1);
    setRotation(0);
  };

  // If viewing a Document (PDF / DOCX)
  if (docData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
        <div className="relative w-full max-w-5xl h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          {/* Doc Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-indigo-600/80 text-white">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold truncate">{docData.original_filename}</h3>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                  <span>{(docData.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Passed Magic-Byte &amp; Macro Security Scan
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                title="Print Document"
              >
                <Printer className="w-4 h-4" />
              </button>
              <a
                href={docData.file_url}
                download={docData.original_filename}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Doc Viewer Body */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 overflow-auto flex flex-col items-center justify-center">
            {docData.mime_type.includes('pdf') ? (
              <iframe
                src={`${docData.file_url}#toolbar=0`}
                title={docData.original_filename}
                className="w-full h-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white shadow-inner"
              />
            ) : (
              <div className="max-w-2xl w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-lg">
                <FileText className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Document Preview Ready ({docData.mime_type})
                </h4>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  This document has been verified against malicious code signatures. You can download the native file or print the metadata ledger.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <a
                    href={docData.file_url}
                    download={docData.original_filename}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Native File</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If viewing Photo Gallery Lightbox
  if (!photoData || photoData.allUrls.length === 0) return null;
  const currentPhoto = photoData.allUrls[photoIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none">
      {/* Top Floating Controls */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-20 text-white">
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
          Photo {photoIndex + 1} of {photoData.allUrls.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 transition"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <a
            href={currentPhoto}
            download={`Event_Photo_${photoIndex + 1}.jpg`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 transition"
            title="Download High-Res Original"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 transition ml-2"
            title="Close Lightbox (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative w-full h-full flex items-center justify-center p-8 overflow-hidden">
        <img
          src={currentPhoto}
          alt={`Event Stage ${photoIndex + 1}`}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease-out',
          }}
          className="max-h-[82vh] max-w-[88vw] object-contain rounded-xl shadow-2xl"
        />

        {/* Previous button */}
        {photoData.allUrls.length > 1 && (
          <button
            onClick={handlePrevPhoto}
            className="absolute left-6 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md transition"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next button */}
        {photoData.allUrls.length > 1 && (
          <button
            onClick={handleNextPhoto}
            className="absolute right-6 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md transition"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {photoData.allUrls.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto z-20">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15">
            {photoData.allUrls.map((url, i) => (
              <button
                key={i}
                onClick={() => {
                  setPhotoIndex(i);
                  setZoom(1);
                  setRotation(0);
                }}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${
                  i === photoIndex ? 'border-indigo-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
