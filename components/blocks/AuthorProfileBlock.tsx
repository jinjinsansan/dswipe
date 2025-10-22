'use client';

import React from 'react';
import { TrophyIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { AuthorProfileBlockContent } from '@/types/templates';

interface AuthorProfileBlockProps {
  content: AuthorProfileBlockContent;
}

export default function AuthorProfileBlock({ content }: AuthorProfileBlockProps) {
  const {
    backgroundColor = '#0F172A',
    textColor = '#FFFFFF',
    titleColor,
    descriptionColor,
    nameColor = '#FBBF24',
    borderColor = '#FBBF24',
    accentColor = '#7C3AED',
  } = content;

  return (
    <div
      className="py-12 px-4"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div 
          className="rounded-3xl p-1"
          style={{ backgroundImage: `linear-gradient(to bottom right, ${accentColor}, #2563EB)` }}
        >
          <div className="rounded-3xl p-8 md:p-12" style={{ backgroundColor: backgroundColor }}>
            <div className="grid md:grid-cols-3 gap-8 items-start">
              {/* プロフィール画像 */}
              <div className="md:col-span-1">
                {content.imageUrl ? (
                  <div 
                    className="w-full aspect-square rounded-2xl overflow-hidden border-4 shadow-2xl"
                    style={{ borderColor }}
                  >
                    <img
                      src={content.imageUrl}
                      alt={content.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-full aspect-square rounded-2xl flex items-center justify-center border-4"
                    style={{ 
                      backgroundImage: `linear-gradient(to bottom right, ${nameColor}, #F97316)`,
                      borderColor,
                    }}
                  >
                    <UserCircleIcon className="h-24 w-24 text-white" aria-hidden="true" />
                  </div>
                )}
              </div>

              {/* プロフィール詳細 */}
              <div className="md:col-span-2">
                {/* 名前・肩書 */}
                <div className="mb-6">
                  <h2 
                    className="text-4xl md:text-5xl font-bold mb-2"
                    style={{ color: titleColor || textColor }}
                  >
                    {content.name}
                  </h2>
                  {content.title && (
                    <p 
                      className="text-xl md:text-2xl"
                      style={{ color: nameColor }}
                    >
                      {content.title}
                    </p>
                  )}
                </div>

                {/* 経歴・自己紹介 */}
                {content.bio && (
                  <p 
                    className="text-lg leading-relaxed mb-8"
                    style={{ color: descriptionColor || textColor }}
                  >
                    {content.bio}
                  </p>
                )}

                {/* 実績・功績 */}
                {content.achievements && content.achievements.length > 0 && (
                  <div className="space-y-3 mb-8">
                    <h3 
                      className="flex items-center gap-2 text-2xl font-bold mb-4"
                      style={{ color: nameColor }}
                    >
                      <TrophyIcon className="h-6 w-6" aria-hidden="true" />
                      実績
                    </h3>
                    {content.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3"
                      >
                        <span 
                          className="text-2xl flex-shrink-0"
                          style={{ color: accentColor }}
                        >
                          ✓
                        </span>
                        <span 
                          className="text-lg"
                          style={{ color: descriptionColor || textColor }}
                        >
                          {achievement}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* メディア掲載 */}
                {content.mediaLogos && content.mediaLogos.length > 0 && (
                  <div>
                    <h3 
                      className="text-xl font-bold mb-4"
                      style={{ color: titleColor || textColor }}
                    >
                      メディア掲載実績
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {content.mediaLogos.map((logo, index) => (
                        <div
                          key={index}
                          className="rounded-lg p-4 h-16 flex items-center justify-center"
                          style={{ backgroundColor: textColor + '20' }}
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
            <div 
              className="mt-12 pt-8 text-center"
              style={{ borderTopColor: nameColor + '40', borderTopWidth: '2px' }}
            >
              <p 
                className="text-2xl md:text-3xl font-semibold"
                style={{ color: nameColor }}
              >
                この実績を持つ私が、あなたを成功に導きます
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
