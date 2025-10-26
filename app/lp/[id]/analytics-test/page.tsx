'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { analyticsApi } from '@/lib/api';

export default function AnalyticsTestPage() {
  const params = useParams();
  const lpId = params.id as string;
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    analyticsApi.getLPAnalytics(lpId)
      .then(res => {
        console.log('Data received:', res.data);
        setData(res.data);
      })
      .catch(err => {
        console.error('Error:', err);
        setError(err.message);
      });
  }, [lpId]);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl mb-4">エラーが発生しました</h1>
        <pre className="bg-red-900 p-4 rounded">{error}</pre>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl mb-6">分析データテスト</h1>
      
      <div className="space-y-4">
        <div className="bg-slate-800 p-4 rounded">
          <h2 className="text-xl mb-2">基本情報</h2>
          <p>LP ID: {data.lp_id}</p>
          <p>タイトル: {data.title}</p>
          <p>総閲覧数: {data.total_views}</p>
        </div>

        <div className="bg-slate-800 p-4 rounded">
          <h2 className="text-xl mb-2">ステップファネル</h2>
          {data.step_funnel && data.step_funnel.length > 0 ? (
            <ul className="space-y-2">
              {data.step_funnel.map((step: any, index: number) => (
                <li key={step.step_id || index} className="bg-slate-700 p-2 rounded">
                  ステップ {step.step_order + 1}: 
                  閲覧 {step.step_views}, 
                  離脱 {step.step_exits}, 
                  転換率 {step.conversion_rate}%
                </li>
              ))}
            </ul>
          ) : (
            <p>ステップデータなし</p>
          )}
        </div>

        <div className="bg-green-800 p-4 rounded">
          <p>✅ データの読み込みとレンダリングに成功しました！</p>
          <p className="mt-2">
            問題は元の analytics ページの複雑なUIコンポーネントにあります。
          </p>
        </div>
      </div>
    </div>
  );
}
