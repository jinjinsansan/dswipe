'use client';

import React, { useState, useEffect } from 'react';
import { CountdownBlockContent } from '@/types/templates';

interface CountdownBlockProps {
  content: CountdownBlockContent;
}

export default function CountdownBlock({ content }: CountdownBlockProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(content.targetDate) - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [content.targetDate]);

  const timeUnits = [
    { label: '日', value: timeLeft.days, show: content.showDays !== false },
    { label: '時間', value: timeLeft.hours, show: content.showHours !== false },
    { label: '分', value: timeLeft.minutes, show: content.showMinutes !== false },
    { label: '秒', value: timeLeft.seconds, show: content.showSeconds !== false },
  ];

  return (
    <div
      className="px-4"
      style={{
        backgroundColor: content.backgroundColor || '#EF4444',
        color: content.textColor || '#FFFFFF',
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* タイトル */}
        {content.title && (
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-pulse">
            {content.title}
          </h2>
        )}

        {/* 緊急性テキスト */}
        {content.urgencyText && (
          <p className="text-xl md:text-2xl mb-8 font-semibold">
            {content.urgencyText}
          </p>
        )}

        {/* カウントダウンタイマー */}
        <div className="flex justify-center gap-4 md:gap-8">
          {timeUnits.map((unit, index) => 
            unit.show ? (
              <div
                key={index}
                className="flex flex-col items-center bg-black/30 backdrop-blur-sm rounded-xl p-4 md:p-6 min-w-[80px] md:min-w-[120px] shadow-2xl border-2 border-white/20"
              >
                <div className="text-4xl md:text-6xl font-bold mb-2 tabular-nums">
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="text-sm md:text-base font-semibold opacity-90">
                  {unit.label}
                </div>
              </div>
            ) : null
          )}
        </div>

        {/* 警告アイコン */}
        <div className="mt-8 flex justify-center items-center gap-2 text-xl md:text-2xl animate-bounce">
          <span>⚠️</span>
          <span className="font-bold">時間がありません！</span>
          <span>⚠️</span>
        </div>
      </div>
    </div>
  );
}
