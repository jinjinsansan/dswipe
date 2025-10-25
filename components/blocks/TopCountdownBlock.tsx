import { CountdownBlockContent } from '@/types/templates';

interface TopCountdownBlockProps {
  content: CountdownBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

function getTimeLeft(targetDate: string) {
  const target = new Date(targetDate).getTime();
  if (Number.isNaN(target)) return { days: '--', hours: '--', minutes: '--', seconds: '--' };

  const now = Date.now();
  const diff = Math.max(target - now, 0);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days: days.toString().padStart(2, '0'),
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  };
}

export default function TopCountdownBlock({ content, isEditing, onEdit }: TopCountdownBlockProps) {
  const title = content?.title ?? '特別オファー終了まで';
  const urgencyText = content?.urgencyText ?? '締切までに参加いただいた方限定で、追加特典と返金保証をご提供します。';
  const targetDate = content?.targetDate ?? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const timeLeft = getTimeLeft(targetDate);

  return (
    <section
      className="relative w-full bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 py-16 text-white sm:py-20"
      style={{ backgroundColor: content?.backgroundColor, color: content?.textColor }}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 text-center">
        {isEditing ? (
          <div className="grid gap-3 rounded-xl bg-white/10 p-4 text-sm text-white">
            <input
              className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2"
              value={title}
              onChange={(e) => onEdit?.('title', e.target.value)}
              placeholder="タイトル"
            />
            <textarea
              className="min-h-[80px] w-full rounded-md border border-white/30 bg-white/10 px-3 py-2"
              value={urgencyText}
              onChange={(e) => onEdit?.('urgencyText', e.target.value)}
              placeholder="緊急性テキスト"
            />
            <input
              className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2"
              value={targetDate}
              onChange={(e) => onEdit?.('targetDate', e.target.value)}
              placeholder="ターゲット日時 (ISO形式)"
            />
          </div>
        ) : null}

        <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {([
            { label: '日', value: timeLeft.days },
            { label: '時間', value: timeLeft.hours },
            { label: '分', value: timeLeft.minutes },
            { label: '秒', value: timeLeft.seconds },
          ] as const).map((segment) => (
            <div key={segment.label} className="rounded-2xl bg-white/10 px-4 py-6">
              <div className="text-3xl font-bold tracking-wide sm:text-4xl">{segment.value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.4em] text-white/70">{segment.label}</div>
            </div>
          ))}
        </div>

        <p className="text-sm leading-relaxed text-white/90 sm:text-base">
          {urgencyText}
        </p>
      </div>
    </section>
  );
}
