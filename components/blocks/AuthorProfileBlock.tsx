'use client';

import React from 'react';
import { AuthorProfileBlockContent } from '@/types/templates';

interface AuthorProfileBlockProps {
  content: AuthorProfileBlockContent;
}

export default function AuthorProfileBlock({ content }: AuthorProfileBlockProps) {
  return (
    <div
      className="py-12 px-4"
      style={{
        backgroundColor: content.backgroundColor || '#0F172A',
        color: content.textColor || '#FFFFFF',
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-1">
          <div className="bg-gray-900 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 items-start">
              {/* プロフィール画像 */}
              <div className="md:col-span-1">
                {content.imageUrl ? (
                  <div className="w-full aspect-square rounded-2xl overflow-hidden border-4 border-yellow-400 shadow-2xl">
                    <img
                      src={content.imageUrl}
                      alt={content.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-4 border-yellow-400">
                    <span className="text-8xl">👤</span>
                  </div>
                )}
              </div>

              {/* プロフィール詳細 */}
              <div className="md:col-span-2">
                {/* 名前・肩書 */}
                <div className="mb-6">
                  <h2 className="text-4xl md:text-5xl font-bold mb-2">
                    {content.name}
                  </h2>
                  {content.title && (
                    <p className="text-xl md:text-2xl text-yellow-400">
                      {content.title}
                    </p>
                  )}
                </div>

                {/* 経歴・自己紹介 */}
                {content.bio && (
                  <p className="text-lg text-gray-300 leading-relaxed mb-8">
                    {content.bio}
                  </p>
                )}

                {/* 実績・功績 */}
                {content.achievements && content.achievements.length > 0 && (
                  <div className="space-y-3 mb-8">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                      🏆 実績
                    </h3>
                    {content.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3"
                      >
                        <span className="text-green-400 text-2xl flex-shrink-0">✓</span>
                        <span className="text-lg text-gray-200">{achievement}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* メディア掲載 */}
                {content.mediaLogos && content.mediaLogos.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-400 mb-4">
                      メディア掲載実績
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {content.mediaLogos.map((logo, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-4 h-16 flex items-center justify-center"
                        >
                          <img
                            src={logo}
                            alt="Media logo"
                            className="h-full w-auto object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 権威性訴求 */}
            <div className="mt-12 pt-8 border-t border-gray-700 text-center">
              <p className="text-2xl md:text-3xl font-semibold text-yellow-400">
                この実績を持つ私が、あなたを成功に導きます
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
