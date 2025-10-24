'use client';

import type { ReactElement, ReactNode } from 'react';
import type {
  AuthorProfileBlockContent,
  BaseBlockContent,
  BeforeAfterBlockContent,
  BonusListBlockContent,
  ComparisonBlockContent,
  CountdownBlockContent,
  FAQBlockContent,
  FeaturesBlockContent,
  FormBlockContent,
  GalleryBlockContent,
  GuaranteeBlockContent,
  LogoGridBlockContent,
  PricingBlockContent,
  ScarcityBlockContent,
  SpecialPriceBlockContent,
  StatsBlockContent,
  TeamBlockContent,
  TestimonialBlockContent,
  TimelineBlockContent,
  UrgencyBlockContent,
} from '@/types/templates';

type ViewerBlockRendererProps = {
  blockType: string;
  content: Record<string, unknown> | undefined;
  productId?: string;
  onProductClick?: (productId?: string) => void;
};

type SharedRenderArgs = {
  productId?: string;
  onProductClick?: (productId?: string) => void;
};

const DEFAULT_BG = '#050814';
const DEFAULT_TEXT = '#F8FAFC';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function pickFirstString(values: unknown[]): string | undefined {
  return values.find(isNonEmptyString);
}

function getColors(content?: Partial<BaseBlockContent>) {
  return {
    backgroundColor: content?.backgroundColor ?? DEFAULT_BG,
    textColor: content?.textColor ?? DEFAULT_TEXT,
  };
}

function BaseSection({ content, children }: { content?: Partial<BaseBlockContent>; children: ReactNode }): ReactElement {
  const { backgroundColor, textColor } = getColors(content);
  return (
    <section
      className="w-full h-full flex items-center justify-center px-5 py-10 sm:py-14"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="w-full max-w-4xl mx-auto space-y-6 text-center">
        {children}
      </div>
    </section>
  );
}

function Heading({ children }: { children: ReactNode }): ReactElement {
  return <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">{children}</h2>;
}

function Paragraph({ children, muted }: { children: ReactNode; muted?: boolean }): ReactElement {
  return <p className={`text-base sm:text-lg md:text-xl leading-relaxed ${muted ? 'opacity-80' : ''}`}>{children}</p>;
}

function PrimaryButton({
  label,
  href,
  color,
  shared,
}: {
  label: string;
  href?: string;
  color?: string;
  shared: SharedRenderArgs;
}): ReactElement {
  const className =
    'inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 text-sm md:text-lg font-semibold rounded-md shadow-lg transition-transform hover:scale-[1.02]';
  const style = color
    ? { backgroundColor: color, color: '#0B1120' }
    : { background: 'linear-gradient(135deg, #38bdf8, #6366f1)' };

  const handleClick = shared.onProductClick && !href ? () => shared.onProductClick?.(shared.productId) : undefined;

  if (handleClick) {
    return (
      <button type="button" className={className} style={style} onClick={handleClick}>
        {label}
      </button>
    );
  }

  if (href) {
    return (
      <a href={href} className={className} style={style}>
        {label}
      </a>
    );
  }

  return (
    <span className={className} style={style}>
      {label}
    </span>
  );
}

function SecondaryButton({ label, href }: { label: string; href?: string }): ReactElement {
  const className =
    'inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 text-sm md:text-lg font-semibold rounded-md border border-white/40 text-white/90 transition-transform hover:scale-[1.02]';

  if (href) {
    return <a href={href} className={className}>{label}</a>;
  }

  return <span className={className}>{label}</span>;
}

function ImagePreview({ url, caption }: { url?: string; caption?: string }): ReactElement | null {
  if (!isNonEmptyString(url)) {
    return null;
  }

  return (
    <figure className="space-y-2">
      <div
        className="aspect-video w-full max-w-3xl mx-auto rounded-xl bg-white/10"
        style={{ backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      {isNonEmptyString(caption) && <figcaption className="text-xs opacity-70">{caption}</figcaption>}
    </figure>
  );
}

function VideoPreview({ videoUrl, title }: { videoUrl?: string; title?: string }): ReactElement | null {
  if (!isNonEmptyString(videoUrl)) {
    return null;
  }

  return (
    <div className="space-y-2">
      {isNonEmptyString(title) && <p className="text-sm font-semibold">{title}</p>}
      <a
        href={videoUrl}
        className="block w-full max-w-3xl mx-auto rounded-xl bg-white/10 px-6 py-10 text-center text-sm font-semibold"
      >
        動画を見る
      </a>
    </div>
  );
}

function FeatureGrid({ features }: { features?: { title?: string; description?: string }[] }): ReactElement | null {
  const safeFeatures = (features ?? []).filter((feature) => feature && (feature.title || feature.description));
  if (safeFeatures.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
      {safeFeatures.map((feature, index) => (
        <div key={index} className="rounded-xl bg-white/10 px-5 py-5">
          {feature.title && <h3 className="text-lg font-semibold">{feature.title}</h3>}
          {feature.description && <p className="text-sm opacity-80 mt-2">{feature.description}</p>}
        </div>
      ))}
    </div>
  );
}

function ProblemList({ items }: { items?: string[] }): ReactElement | null {
  const safeItems = (items ?? []).filter(isNonEmptyString);
  if (safeItems.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-3 text-left">
      {safeItems.map((problem, index) => (
        <li key={index} className="rounded-md bg-white/10 px-4 py-3 text-sm md:text-base">
          {problem}
        </li>
      ))}
    </ul>
  );
}

function PricingGrid({ plans, shared }: { plans?: PricingBlockContent['plans']; shared: SharedRenderArgs }): ReactElement | null {
  const safePlans = (plans ?? []).filter((plan) => plan && isNonEmptyString(plan.name));
  if (safePlans.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
      {safePlans.map((plan, index) => (
        <div key={index} className="rounded-xl bg-white/12 px-5 py-6 space-y-4">
          <div>
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            {plan.description && <p className="text-sm opacity-80 mt-2">{plan.description}</p>}
          </div>
          <div className="text-2xl font-bold">
            {plan.price}
            {plan.period && <span className="text-sm font-normal opacity-70 ml-1">/{plan.period}</span>}
          </div>
          {plan.features?.length ? (
            <ul className="space-y-1 text-sm opacity-80">
              {plan.features.map((feature, idx) => (
                <li key={idx}>• {feature}</li>
              ))}
            </ul>
          ) : null}
          {plan.buttonText && (
            <PrimaryButton label={plan.buttonText} href={plan.buttonUrl} shared={shared} />
          )}
        </div>
      ))}
    </div>
  );
}

function TestimonialList({ testimonials }: { testimonials?: TestimonialBlockContent['testimonials'] }): ReactElement | null {
  const safeTestimonials = (testimonials ?? []).filter((item) => item && isNonEmptyString(item.text));
  if (safeTestimonials.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 text-left">
      {safeTestimonials.map((testimonial, index) => (
        <blockquote key={index} className="rounded-xl bg-white/10 px-5 py-5 space-y-2">
          <p className="text-sm md:text-base opacity-90">“{testimonial.text}”</p>
          <footer className="text-sm font-semibold">
            {testimonial.name}
            {testimonial.role && <span className="opacity-70"> ・{testimonial.role}</span>}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}

function FAQList({ faqs }: { faqs?: FAQBlockContent['faqs'] }): ReactElement | null {
  const safeFaqs = (faqs ?? []).filter((faq) => faq && isNonEmptyString(faq.question) && isNonEmptyString(faq.answer));
  if (safeFaqs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 text-left">
      {safeFaqs.map((faq, index) => (
        <div key={index} className="rounded-xl bg-white/10 px-5 py-4 space-y-2">
          <h3 className="font-semibold">Q. {faq.question}</h3>
          <p className="text-sm opacity-80">A. {faq.answer}</p>
        </div>
      ))}
    </div>
  );
}

function BonusList({ content }: { content: Partial<BonusListBlockContent> }): ReactElement | null {
  const safeBonuses = (content.bonuses ?? []).filter((bonus) => bonus && (bonus.title || bonus.description));
  if (safeBonuses.length === 0 && !content.totalValue) {
    return null;
  }

  return (
    <div className="space-y-4 text-left">
      {safeBonuses.map((bonus, index) => (
        <div key={index} className="rounded-xl bg-white/10 px-5 py-4">
          {bonus.title && <h3 className="text-lg font-semibold">{bonus.title}</h3>}
          {bonus.description && <p className="text-sm opacity-80 mt-2">{bonus.description}</p>}
          {bonus.value && <p className="text-sm opacity-70 mt-1">価値: {bonus.value}</p>}
        </div>
      ))}
      {content.totalValue && <div className="text-lg font-semibold text-center">総額: {content.totalValue}</div>}
    </div>
  );
}

function StatsGrid({ stats }: { stats?: StatsBlockContent['stats'] }): ReactElement | null {
  const safeStats = (stats ?? []).filter((stat) => stat && isNonEmptyString(stat.value));
  if (safeStats.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {safeStats.map((stat, index) => (
        <div key={index} className="rounded-xl bg-white/10 px-4 py-5">
          <div className="text-2xl font-bold">{stat.value}</div>
          {stat.label && <div className="text-sm opacity-80 mt-1">{stat.label}</div>}
        </div>
      ))}
    </div>
  );
}

function TimelineList({ items }: { items?: TimelineBlockContent['items'] }): ReactElement | null {
  const safeItems = (items ?? []).filter((item) => item && (item.title || item.description));
  if (safeItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 text-left">
      {safeItems.map((item, index) => (
        <div key={index} className="rounded-xl bg-white/10 px-5 py-4 space-y-1">
          {item.date && <p className="text-xs uppercase tracking-wide opacity-70">{item.date}</p>}
          {item.title && <h3 className="text-lg font-semibold">{item.title}</h3>}
          {item.description && <p className="text-sm opacity-80">{item.description}</p>}
        </div>
      ))}
    </div>
  );
}

function TeamGrid({ members }: { members?: TeamBlockContent['members'] }): ReactElement | null {
  const safeMembers = (members ?? []).filter((member) => member && isNonEmptyString(member.name));
  if (safeMembers.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
      {safeMembers.map((member, index) => (
        <div key={index} className="rounded-xl bg-white/10 px-5 py-5 space-y-2">
          <h3 className="text-lg font-semibold">{member.name}</h3>
          {member.role && <p className="text-sm opacity-80">{member.role}</p>}
          {member.bio && <p className="text-sm opacity-70">{member.bio}</p>}
        </div>
      ))}
    </div>
  );
}

function LogoGrid({ logos }: { logos?: LogoGridBlockContent['logos'] }): ReactElement | null {
  const safeLogos = (logos ?? []).filter((logo) => logo && (logo.alt || logo.url));
  if (safeLogos.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm opacity-80">
      {safeLogos.map((logo, index) => (
        <div key={index} className="rounded-xl bg-white/10 px-4 py-3 flex items-center justify-center text-center">
          {logo.alt || logo.url}
        </div>
      ))}
    </div>
  );
}

function ComparisonTable({ products }: { products?: ComparisonBlockContent['products'] }): ReactElement | null {
  const safeProducts = (products ?? []).filter((product) => product && isNonEmptyString(product.name));
  if (safeProducts.length === 0) {
    return null;
  }

  const featureKeys = Array.from(
    new Set(safeProducts.flatMap((product) => Object.keys(product.features ?? {}))),
  );

  if (featureKeys.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            <th className="border-b border-white/20 px-4 py-3">機能</th>
            {safeProducts.map((product, index) => (
              <th key={index} className="border-b border-white/20 px-4 py-3">{product.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {featureKeys.map((key) => (
            <tr key={key} className="border-b border-white/10">
              <td className="px-4 py-3 font-medium">{key}</td>
              {safeProducts.map((product, index) => {
                const value = product.features?.[key];
                const display = typeof value === 'boolean' ? (value ? '◯' : '✕') : value;
                return (
                  <td key={index} className="px-4 py-3 opacity-80">
                    {display ?? '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GalleryGrid({ images }: { images?: GalleryBlockContent['images'] }): ReactElement | null {
  const safeImages = (images ?? []).filter((image) => image && isNonEmptyString(image.url));
  if (safeImages.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {safeImages.map((image, index) => (
        <figure key={index} className="space-y-2">
          <div
            className="aspect-square w-full rounded-xl bg-white/10"
            style={{ backgroundImage: `url(${image.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          {image.caption && <figcaption className="text-xs opacity-70">{image.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

function BeforeAfterColumns({ content }: { content?: Partial<BeforeAfterBlockContent> }): ReactElement | null {
  if (!content) {
    return null;
  }

  const hasBefore = pickFirstString([content.beforeTitle, content.beforeText, content.beforeImage]);
  const hasAfter = pickFirstString([content.afterTitle, content.afterText, content.afterImage]);

  if (!hasBefore && !hasAfter) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
      <div className="rounded-xl bg-white/10 px-5 py-5 space-y-2">
        <h3 className="text-lg font-semibold">{content.beforeTitle ?? 'Before'}</h3>
        {content.beforeText && <p className="text-sm opacity-80">{content.beforeText}</p>}
      </div>
      <div className="rounded-xl bg-white/10 px-5 py-5 space-y-2">
        <h3 className="text-lg font-semibold">{content.afterTitle ?? 'After'}</h3>
        {content.afterText && <p className="text-sm opacity-80">{content.afterText}</p>}
      </div>
    </div>
  );
}

function GuaranteeDetails({ content }: { content?: Partial<GuaranteeBlockContent> }): ReactElement | null {
  if (!content || (!content.description && !content.features?.length && !content.badgeText)) {
    return null;
  }

  return (
    <div className="space-y-3">
      {content.badgeText && (
        <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/10 text-sm font-semibold">
          {content.badgeText}
        </div>
      )}
      {content.description && <Paragraph>{content.description}</Paragraph>}
      {content.features?.length ? (
        <ul className="space-y-2 text-left text-sm opacity-80">
          {content.features.map((feature, index) => (
            <li key={index}>• {feature}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FormPreview({ content }: { content: Partial<FormBlockContent> }): ReactElement | null {
  const safeFields = (content.fields ?? []).filter((field) => field && isNonEmptyString(field.label));
  if (safeFields.length === 0) {
    return null;
  }

  return (
    <form className="space-y-4 text-left" onSubmit={(e) => e.preventDefault()}>
      {safeFields.map((field, index) => (
        <label key={index} className="block space-y-2 text-sm">
          <span className="font-semibold text-white">{field.label}</span>
          {field.type === 'textarea' ? (
            <textarea
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white/90"
              placeholder={field.placeholder}
              rows={3}
              disabled
            />
          ) : field.type === 'select' && field.options ? (
            <select className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white/90" disabled>
              {field.options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ) : field.type === 'checkbox' ? (
            <div className="flex items-center gap-2">
              <input type="checkbox" disabled className="h-4 w-4 rounded border-white/40 bg-white/10" />
              {field.placeholder && <span className="opacity-70">{field.placeholder}</span>}
            </div>
          ) : (
            <input
              type={field.type}
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white/90"
              placeholder={field.placeholder}
              disabled
            />
          )}
        </label>
      ))}
      {content.submitButtonText && (
        <div className="inline-flex px-6 py-3 rounded-md bg-white/10 text-sm font-semibold text-white/80">
          {content.submitButtonText}
        </div>
      )}
    </form>
  );
}

function getCountdownSummary(targetDate: string): string {
  const target = new Date(targetDate);
  if (Number.isNaN(target.getTime())) {
    return targetDate;
  }

  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return '締切が終了しました';
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${days}日 ${hours}時間 ${minutes}分`;
}

function CountdownCallout({ content }: { content?: Partial<CountdownBlockContent> }): ReactElement | null {
  if (!content?.targetDate) {
    return null;
  }

  const summary = getCountdownSummary(content.targetDate);
  const formatted = new Date(content.targetDate);
  const formattedDate = Number.isNaN(formatted.getTime()) ? undefined : formatted.toLocaleString('ja-JP');

  return (
    <div className="space-y-3">
      <div className="text-3xl font-bold tracking-wide">{summary}</div>
      {formattedDate && <div className="text-sm opacity-70">締切: {formattedDate}</div>}
      {content.urgencyText && <Paragraph>{content.urgencyText}</Paragraph>}
    </div>
  );
}

function SpecialPriceDetails({ content }: { content?: Partial<SpecialPriceBlockContent> }): ReactElement | null {
  if (!content?.specialPrice) {
    return null;
  }

  return (
    <div className="space-y-3">
      {content.discountBadge && (
        <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-white/10 text-sm font-semibold">
          {content.discountBadge}
        </div>
      )}
      <div className="text-3xl font-bold">
        {content.specialPrice}
        {content.period && <span className="text-base font-normal opacity-70 ml-2">（{content.period}）</span>}
      </div>
      {content.originalPrice && <div className="text-base opacity-60 line-through">通常価格: {content.originalPrice}</div>}
      {content.features?.length ? (
        <ul className="space-y-1 text-left text-sm opacity-80">
          {content.features.map((feature, index) => (
            <li key={index}>• {feature}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ScarcityDetails({ content }: { content?: Partial<ScarcityBlockContent> }): ReactElement | null {
  if (!content || (!content.message && typeof content.remainingCount !== 'number')) {
    return null;
  }

  const remaining = content.remainingCount ?? 0;
  const total = content.totalCount ?? 0;
  const percentage = total > 0 ? Math.min(100, Math.max(0, Math.round((remaining / total) * 100))) : undefined;

  return (
    <div className="space-y-3">
      {typeof content.remainingCount === 'number' && (
        <div className="text-2xl font-bold">
          残り {remaining}
          {total > 0 && <span className="text-base font-normal opacity-70 ml-2">/ {total}</span>}
        </div>
      )}
      {percentage !== undefined && (
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-white/70" style={{ width: `${percentage}%` }} />
        </div>
      )}
      {content.message && <Paragraph>{content.message}</Paragraph>}
    </div>
  );
}

function UrgencyCallout({ content }: { content?: Partial<UrgencyBlockContent> }): ReactElement | null {
  if (!content?.message) {
    return null;
  }

  return (
    <div className="rounded-xl bg-white/10 px-5 py-4 space-y-2 text-left">
      {content.title && <h3 className="text-lg font-semibold">{content.title}</h3>}
      <p className="text-sm opacity-90">{content.message}</p>
    </div>
  );
}

function AuthorProfile({ content }: { content?: Partial<AuthorProfileBlockContent> }): ReactElement | null {
  if (!content?.name) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{content.name}</h3>
      {content.title && <Paragraph muted>{content.title}</Paragraph>}
      {content.bio && <Paragraph>{content.bio}</Paragraph>}
      {content.achievements?.length ? (
        <ul className="space-y-1 text-left text-sm opacity-80">
          {content.achievements.map((achievement, index) => (
            <li key={index}>• {achievement}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function ViewerBlockRenderer({
  blockType,
  content,
  productId,
  onProductClick,
}: ViewerBlockRendererProps): ReactElement {
  void blockType;

  if (!content) {
    return (
      <BaseSection>
        <Paragraph muted>コンテンツが設定されていません</Paragraph>
      </BaseSection>
    );
  }

  const data = content as Record<string, unknown> & Partial<BaseBlockContent>;
  const shared: SharedRenderArgs = { productId, onProductClick };

  const title = pickFirstString([data.title, data.heading, data.headline]);
  const subtitle = pickFirstString([data.subtitle, data.tagline, data.subText]);
  const body = pickFirstString([data.description, data.text, data.message, data.copy]);

  const buttonText = pickFirstString([data.buttonText, data.primaryButtonText]);
  const buttonUrl = pickFirstString([data.buttonUrl, data.primaryButtonUrl]);
  const buttonColor = pickFirstString([data.buttonColor]);
  const secondaryButtonText = pickFirstString([data.secondaryButtonText]);
  const secondaryButtonUrl = pickFirstString([data.secondaryButtonUrl]);

  const imageUrl = pickFirstString([data.imageUrl, data.image_url]);
  const imageCaption = pickFirstString([data.caption]);
  const videoUrl = pickFirstString([data.videoUrl]);
  const videoTitle = pickFirstString([data.videoTitle]);

  return (
    <BaseSection content={data}>
      {title && <Heading>{title}</Heading>}
      {subtitle && <Paragraph muted>{subtitle}</Paragraph>}
      {body && <Paragraph>{body}</Paragraph>}

      <ImagePreview url={imageUrl} caption={imageCaption} />
      <VideoPreview videoUrl={videoUrl} title={videoTitle} />

      <SpecialPriceDetails content={data as Partial<SpecialPriceBlockContent>} />
      <CountdownCallout content={data as Partial<CountdownBlockContent>} />
      <BeforeAfterColumns content={data as Partial<BeforeAfterBlockContent>} />
      <FeatureGrid features={data.features as FeaturesBlockContent['features'] | undefined} />
      <ProblemList items={data.problems as string[] | undefined} />
      <PricingGrid plans={data.plans as PricingBlockContent['plans'] | undefined} shared={shared} />
      <TestimonialList testimonials={data.testimonials as TestimonialBlockContent['testimonials'] | undefined} />
      <FAQList faqs={data.faqs as FAQBlockContent['faqs'] | undefined} />
      <BonusList content={data as Partial<BonusListBlockContent>} />
      <GuaranteeDetails content={data as Partial<GuaranteeBlockContent>} />
      <StatsGrid stats={data.stats as StatsBlockContent['stats'] | undefined} />
      <TimelineList items={data.items as TimelineBlockContent['items'] | undefined} />
      <TeamGrid members={data.members as TeamBlockContent['members'] | undefined} />
      <GalleryGrid images={data.images as GalleryBlockContent['images'] | undefined} />
      <LogoGrid logos={data.logos as LogoGridBlockContent['logos'] | undefined} />
      <ComparisonTable products={data.products as ComparisonBlockContent['products'] | undefined} />
      <FormPreview content={data as Partial<FormBlockContent>} />
      <AuthorProfile content={data as Partial<AuthorProfileBlockContent>} />
      <UrgencyCallout content={data as Partial<UrgencyBlockContent>} />
      <ScarcityDetails content={data as Partial<ScarcityBlockContent>} />

      {buttonText && (
        <div className="pt-3">
          <PrimaryButton label={buttonText} href={buttonUrl} color={buttonColor} shared={shared} />
        </div>
      )}

      {secondaryButtonText && (
        <div className="pt-2">
          <SecondaryButton label={secondaryButtonText} href={secondaryButtonUrl} />
        </div>
      )}
    </BaseSection>
  );
}
