'use client';

import React, { useEffect, useState } from 'react';

interface MediaItem {
  url: string;
  uploaded_at: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaLibraryModal({ isOpen, onClose, onSelect }: MediaLibraryModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = () => {
    const storedMedia = localStorage.getItem('uploaded_media');
    if (storedMedia) {
      setMedia(JSON.parse(storedMedia));
    }
  };

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
      setSelectedUrl(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-light text-white">メディアライブラリ</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {media.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🖼️</div>
              <h3 className="text-xl font-light text-white mb-2">画像がありません</h3>
              <p className="text-gray-400 text-sm font-light mb-4">
                メディアページから画像をアップロードしてください
              </p>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/media';
                }}
                className="inline-block px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-light"
              >
                メディアページへ
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {media.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedUrl(item.url)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    selectedUrl === item.url
                      ? 'border-blue-500 ring-2 ring-blue-500/50'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="aspect-square bg-gray-900">
                    <img
                      src={item.url}
                      alt="Media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {selectedUrl === item.url && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm font-light"
          >
            キャンセル
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            選択
          </button>
        </div>
      </div>
    </div>
  );
}
