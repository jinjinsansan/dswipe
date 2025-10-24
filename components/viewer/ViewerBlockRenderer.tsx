'use client';

import type { CSSProperties, ReactElement, ReactNode } from 'react';
import type {
  AuthorProfileBlockContent,
  BaseBlockContent,
  BeforeAfterBlockContent,
  BonusListBlockContent,
  ComparisonBlockContent,
  CountdownBlockContent,
  CTABlockContent,
  FAQBlockContent,
  FeaturesBlockContent,
  FormBlockContent,
  GalleryBlockContent,
  HeroBlockContent,
  InlineCTABlockContent,
  GuaranteeBlockContent,
  LogoGridBlockContent,
  ProblemBlockContent,
  PricingBlockContent,
  ScarcityBlockContent,
  SpecialPriceBlockContent,
  StatsBlockContent,
  TeamBlockContent,
  TestimonialBlockContent,
  TimelineBlockContent,
  UrgencyBlockContent,
} from '@/types/templates';
import { resolveSectionColors, viewerTheme } from './theme';

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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function pickFirstString(values: unknown[]): string | undefined {
  return values.find(isNonEmptyString);
}

function BaseSection({ content, children }: { content?: Partial<BaseBlockContent>; children: ReactNode }): ReactElement {
  const { backgroundColor, textColor } = resolveSectionColors(content);
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
  return (
    <h2
      className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight"
      style={{ letterSpacing: viewerTheme.typography.heading.letterSpacing }}
    >
      {children}
    </h2>
  );
}

function Paragraph({ children, muted }: { children: ReactNode; muted?: boolean }): ReactElement {
  const style: CSSProperties = { letterSpacing: viewerTheme.typography.body.letterSpacing };
  if (muted) {
    style.color = 'var(--viewer-muted)';
  }

  return (
    <p className="text-base sm:text-lg md:text-xl leading-relaxed" style={style}>
      {children}
    </p>
  );
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
  const className = 'viewer-button-primary';
  const style = color
    ? { backgroundColor: color, backgroundImage: 'none', color: '#0B1120' }
    : undefined;

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
  const className = 'viewer-button-secondary';

  if (href) {
    return <a href={href} className={className}>{label}</a>;
  }

  return <span className={className}>{label}</span>;
}

function renderHero(content: HeroBlockContent, shared: SharedRenderArgs): ReactElement {
  const highlight = pickFirstString([content.highlightText]);
  const tagline = pickFirstString([content.tagline]);
  const subtitle = pickFirstString([content.subtitle]);
  const stats = Array.isArray(content.stats) 
    ? content.stats.filter((stat) => stat && (isNonEmptyString(stat.value) || isNonEmptyString(stat.label)))
    : [];
  const secondaryText = pickFirstString([content.secondaryButtonText]);
  const secondaryUrl = pickFirstString([content.secondaryButtonUrl]);

  return (
    <BaseSection content={content}>
      <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center gap-8">
        <div
          className="absolute inset-x-12 -top-24 h-48 opacity-40 blur-[64px] pointer-events-none select-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.45), rgba(56, 189, 248, 0))',
          }}
        />

        {highlight && (
          <span
            className="relative inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold tracking-[0.14em] uppercase"
            style={{
              background: 'rgba(99, 102, 241, 0.18)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: viewerTheme.colors.text,
              letterSpacing: '0.14em',
            }}
          >
            {highlight}
          </span>
        )}

        <div className="space-y-4 text-center relative z-[1]">
          <Heading>{content.title}</Heading>
          {tagline && <Paragraph muted>{tagline}</Paragraph>}
          {subtitle && <Paragraph>{subtitle}</Paragraph>}
        </div>

        {content.imageUrl && (
          <div className="relative w-full max-w-4xl z-[1]">
            <div
              className="absolute inset-4 rounded-[1.75rem] opacity-45 blur-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.45), rgba(99, 102, 241, 0.25))',
              }}
            />
            <div
              className="viewer-card-strong overflow-hidden relative"
              style={{ padding: 0, borderRadius: '1.75rem' }}
            >
              <div
                className="aspect-[16/9] w-full"
                style={{
                  backgroundImage: `url(${content.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </div>
          </div>
        )}

        {(content.buttonText || secondaryText) && (
          <div className="flex flex-wrap items-center justify-center gap-3 relative z-[1]">
            {content.buttonText && (
              <PrimaryButton
                label={content.buttonText}
                href={content.buttonUrl}
                color={content.buttonColor}
                shared={shared}
              />
            )}
            {secondaryText && <SecondaryButton label={secondaryText} href={secondaryUrl} />}
          </div>
        )}

        {stats.length > 0 && (
          <div className="relative w-full max-w-4xl z-[1] space-y-4">
            <div className="viewer-divider" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="viewer-card text-left space-y-1"
                  style={{ padding: 'clamp(1rem, 3vw, 1.4rem)' }}
                >
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.label && <div className="text-sm opacity-80">{stat.label}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseSection>
  );
}

function renderCTA(content: CTABlockContent | InlineCTABlockContent, shared: SharedRenderArgs): ReactElement {
  const subtitle = pickFirstString([content.subtitle]);
  const subText = 'subText' in content ? pickFirstString([content.subText]) : undefined;
  const secondaryText = 'secondaryButtonText' in content ? pickFirstString([content.secondaryButtonText]) : undefined;
  const secondaryUrl = 'secondaryButtonUrl' in content ? pickFirstString([content.secondaryButtonUrl]) : undefined;
  const buttonText = pickFirstString([content.buttonText]) ?? '詳しく見る';
  const buttonUrl = pickFirstString([content.buttonUrl]);
  const buttonColor = pickFirstString([content.buttonColor]);
  const countdownDate = 'countdown' in content ? content.countdown?.endDate : undefined;
  const countdownSummary = countdownDate ? getCountdownSummary(countdownDate) : undefined;

  return (
    <BaseSection content={content}>
      <div className="relative w-full max-w-3xl mx-auto space-y-6">
        <div
          className="absolute inset-x-12 -top-20 h-32 opacity-45 blur-[72px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.4), rgba(99, 102, 241, 0))',
          }}
        />

        {subText && (
          <span
            className="relative inline-flex items-center px-5 py-2 rounded-full text-xs font-semibold tracking-[0.18em] uppercase"
            style={{
              background: 'rgba(56, 189, 248, 0.18)',
              border: '1px solid rgba(56, 189, 248, 0.32)',
              color: viewerTheme.colors.text,
              letterSpacing: '0.18em',
            }}
          >
            {subText}
          </span>
        )}

        <div className="relative space-y-4 text-center">
          <Heading>{content.title}</Heading>
          {subtitle && <Paragraph muted>{subtitle}</Paragraph>}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <PrimaryButton label={buttonText} href={buttonUrl} color={buttonColor} shared={shared} />
          {secondaryText && <SecondaryButton label={secondaryText} href={secondaryUrl} />}
        </div>

        {countdownSummary && (
          <div className="viewer-card text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-white/70">Offer Ends</p>
            <div className="text-2xl font-semibold">{countdownSummary}</div>
            <Paragraph muted>お急ぎください。期限が迫っています。</Paragraph>
          </div>
        )}
      </div>
    </BaseSection>
  );
}

function renderSpecialPrice(content: SpecialPriceBlockContent, shared: SharedRenderArgs): ReactElement {
  const subtitle = pickFirstString([content.subtitle]);
  const features = Array.isArray(content.features) ? content.features : [];
  const buttonLabel = pickFirstString([content.buttonText]) ?? '今すぐ申し込む';
  const buttonUrl = undefined;

  return (
    <BaseSection content={content}>
      <div className="relative w-full max-w-3xl mx-auto space-y-6">
        {content.discountBadge && (
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
            }}
          >
            {content.discountBadge}
          </span>
        )}

        <div className="space-y-3 text-center">
          <Heading>{content.title ?? '特別オファー'}</Heading>
          {subtitle && <Paragraph muted>{subtitle}</Paragraph>}
        </div>

        <div
          className="viewer-card-strong space-y-4 text-left"
          style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(99, 102, 241, 0.14))',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            padding: 'clamp(1.75rem, 5vw, 2.4rem)',
          }}
        >
          <div className="space-y-1">
            <div className="text-sm uppercase tracking-[0.24em] text-white/70">限定価格</div>
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-3xl font-bold">{content.specialPrice}</span>
              {content.originalPrice && (
                <span className="text-base line-through opacity-60">{content.originalPrice}</span>
              )}
              {content.period && <span className="text-sm opacity-70">（{content.period}）</span>}
            </div>
          </div>

          {features.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm opacity-85">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: viewerTheme.colors.accent }} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="pt-2">
            <PrimaryButton label={buttonLabel} href={buttonUrl} color={content.buttonColor} shared={shared} />
          </div>
        </div>
      </div>
    </BaseSection>
  );
}

function renderProblem(content: ProblemBlockContent): ReactElement {
  const subtitle = pickFirstString([content.subtitle]);

  return (
    <BaseSection content={content}>
      <div className="relative w-full max-w-3xl mx-auto space-y-6">
        <div
          className="absolute inset-x-10 -top-16 h-28 opacity-35 blur-[72px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.35), rgba(15, 23, 42, 0))',
          }}
        />

        <div className="relative space-y-4 text-center">
          <Heading>{content.title ?? 'こんな悩みはありませんか？'}</Heading>
          {subtitle && <Paragraph muted>{subtitle}</Paragraph>}
        </div>

        <ProblemList items={content.problems} />
      </div>
    </BaseSection>
  );
}

function renderFeatures(content: FeaturesBlockContent): ReactElement {
  const tagline = pickFirstString([content.tagline]);
  const highlight = pickFirstString([content.highlightText]);

  return (
    <BaseSection content={content}>
      <div className="relative w-full max-w-4xl mx-auto space-y-6">
        {highlight && (
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.18em] uppercase"
            style={{
              background: 'rgba(56, 189, 248, 0.18)',
              border: '1px solid rgba(56, 189, 248, 0.32)',
              letterSpacing: '0.18em',
            }}
          >
            {highlight}
          </span>
        )}

        <div className="space-y-3 text-center">
          <Heading>{content.title ?? '選ばれる理由'}</Heading>
          {tagline && <Paragraph muted>{tagline}</Paragraph>}
        </div>

        <FeatureGrid features={content.features} />
      </div>
    </BaseSection>
  );
}

function renderPricing(content: PricingBlockContent, shared: SharedRenderArgs): ReactElement {
  const meta = content as unknown as {
    title?: string;
    subtitle?: string;
    description?: string;
    tagline?: string;
  };
  const heading = pickFirstString([meta.title]) ?? '料金プラン';
  const subtitle = pickFirstString([meta.subtitle, meta.description, meta.tagline]);

  return (
    <BaseSection content={content}>
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <div className="space-y-3 text-center">
          <Heading>{heading}</Heading>
          {subtitle && <Paragraph muted>{subtitle}</Paragraph>}
        </div>

        <PricingGrid plans={content.plans} shared={shared} />
      </div>
    </BaseSection>
  );
}

function renderTestimonials(content: TestimonialBlockContent): ReactElement {
  const meta = content as unknown as {
    title?: string;
    description?: string;
    subtitle?: string;
  };
  const heading = pickFirstString([meta.title, meta.subtitle]);
  const description = pickFirstString([meta.description]);

  return (
    <BaseSection content={content}>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {heading && (
          <div className="text-center space-y-3">
            <Heading>{heading}</Heading>
            {description && <Paragraph muted>{description}</Paragraph>}
          </div>
        )}
        <TestimonialList testimonials={content.testimonials} />
      </div>
    </BaseSection>
  );
}

function renderFAQ(content: FAQBlockContent): ReactElement {
  const meta = content as unknown as {
    description?: string;
    subtitle?: string;
  };
  const description = pickFirstString([meta.description, meta.subtitle]);

  return (
    <BaseSection content={content}>
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {content.title && (
          <div className="text-center space-y-3">
            <Heading>{content.title}</Heading>
            {description && <Paragraph muted>{description}</Paragraph>}
          </div>
        )}
        <FAQList faqs={content.faqs} />
      </div>
    </BaseSection>
  );
}

function renderCountdown(content: CountdownBlockContent): ReactElement {
  const heading = pickFirstString([content.title]) ?? '締切まで残りわずか';

  return (
    <BaseSection content={content}>
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {heading && (
          <div className="text-center space-y-3">
            <Heading>{heading}</Heading>
          </div>
        )}
        <CountdownCallout content={content} />
      </div>
    </BaseSection>
  );
}

function renderScarcity(content: ScarcityBlockContent): ReactElement {
  const heading = pickFirstString([content.title]) ?? '残りわずかの枠です';

  return (
    <BaseSection content={content}>
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {heading && (
          <div className="text-center space-y-3">
            <Heading>{heading}</Heading>
          </div>
        )}
        <ScarcityDetails content={content} />
      </div>
    </BaseSection>
  );
}

function renderUrgency(content: UrgencyBlockContent): ReactElement {
  return (
    <BaseSection content={content}>
      <div className="w-full max-w-3xl mx-auto space-y-5">
        <UrgencyCallout content={content} />
      </div>
    </BaseSection>
  );
}

function renderBeforeAfter(content: BeforeAfterBlockContent): ReactElement {
  const heading = pickFirstString([content.title]) ?? 'Before / After';

  return (
    <BaseSection content={content}>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {heading && (
          <div className="text-center space-y-3">
            <Heading>{heading}</Heading>
          </div>
        )}
        <BeforeAfterColumns content={content} />
      </div>
    </BaseSection>
  );
}

function renderAuthor(content: AuthorProfileBlockContent): ReactElement {
  return (
    <BaseSection content={content}>
      <div className="w-full max-w-3xl mx-auto">
        <AuthorProfile content={content} />
      </div>
    </BaseSection>
  );
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
        <div
          key={index}
          className="viewer-card text-left space-y-2"
          style={{
            padding: 'clamp(1.4rem, 4vw, 1.8rem)',
            background: 'linear-gradient(135deg, rgba(56,189,248,0.1), rgba(99,102,241,0.1))',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
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
        <li
          key={index}
          className="viewer-card text-sm md:text-base text-left"
          style={{
            padding: 'clamp(1.25rem, 3.2vw, 1.7rem)',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}
        >
          <span
            className="mt-1 h-2 w-2 rounded-full"
            style={{ background: viewerTheme.colors.accentAlt }}
          />
          <span>{problem}</span>
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
        <div
          key={index}
          className="viewer-card text-left space-y-4"
          style={{
            padding: 'clamp(1.75rem, 5vw, 2.2rem)',
            border: plan.highlighted ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(248, 250, 252, 0.12)',
            background: plan.highlighted
              ? 'linear-gradient(135deg, rgba(56,189,248,0.16), rgba(99,102,241,0.22))'
              : 'var(--viewer-surface)',
            boxShadow: plan.highlighted ? viewerTheme.shadows.card : undefined,
            transform: plan.highlighted ? 'translateY(-4px)' : undefined,
            transition: 'transform 0.25s ease',
          }}
        >
          <div>
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            {plan.description && <p className="text-sm opacity-80 mt-2">{plan.description}</p>}
          </div>
          <div className="text-2xl font-bold">
            {plan.price}
            {plan.period && <span className="text-sm font-normal opacity-70 ml-1">/{plan.period}</span>}
          </div>
          {plan.features?.length ? (
            <ul className="space-y-2 text-sm opacity-85">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: viewerTheme.colors.accent }} />
                  <span>{feature}</span>
                </li>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
      {safeTestimonials.map((testimonial, index) => (
        <blockquote
          key={index}
          className="viewer-card text-left space-y-3"
          style={{ padding: 'clamp(1.4rem, 4vw, 1.9rem)' }}
        >
          <div className="text-sm uppercase tracking-[0.24em] text-white/60">VOICE</div>
          <p className="text-sm md:text-base opacity-90 leading-relaxed">“{testimonial.text}”</p>
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
        <div key={index} className="viewer-card text-left space-y-2" style={{ padding: 'clamp(1.1rem, 3.5vw, 1.6rem)' }}>
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
    <div className="space-y-5 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {safeBonuses.map((bonus, index) => (
          <div
            key={index}
            className="viewer-card text-left space-y-3"
            style={{
              padding: 'clamp(1.6rem, 4vw, 2rem)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              background: 'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(234,179,8,0.06))',
            }}
          >
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold tracking-[0.18em] uppercase bg-white/10">
              BONUS {index + 1}
            </div>
            {bonus.title && <h3 className="text-lg font-semibold">{bonus.title}</h3>}
            {bonus.description && <p className="text-sm opacity-80">{bonus.description}</p>}
            {bonus.value && <p className="text-sm font-semibold text-white/80">価値: {bonus.value}</p>}
          </div>
        ))}
      </div>
      {content.totalValue && (
        <div className="viewer-card text-center" style={{ padding: 'clamp(1.4rem, 4vw, 1.9rem)' }}>
          <p className="text-xs uppercase tracking-[0.24em] text-white/70">合計特典価値</p>
          <div className="text-2xl font-semibold mt-2">{content.totalValue}</div>
        </div>
      )}
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
        <div
          key={index}
          className="viewer-card text-left space-y-1"
          style={{ padding: 'clamp(1.3rem, 3vw, 1.7rem)' }}
        >
          <div className="text-xs uppercase tracking-[0.28em] text-white/60">STAT</div>
          <div className="text-3xl font-bold">{stat.value}</div>
          {stat.label && <div className="text-sm opacity-80">{stat.label}</div>}
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
        <div
          key={index}
          className="viewer-card text-left space-y-2"
          style={{ padding: 'clamp(1.4rem, 4vw, 1.9rem)' }}
        >
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: viewerTheme.colors.accent }} />
            {item.date && <p className="text-xs uppercase tracking-[0.28em] opacity-70">{item.date}</p>}
          </div>
          {item.title && <h3 className="text-lg font-semibold">{item.title}</h3>}
          {item.description && <p className="text-sm opacity-80 leading-relaxed">{item.description}</p>}
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
        <div
          key={index}
          className="viewer-card text-left space-y-3"
          style={{ padding: 'clamp(1.4rem, 4vw, 1.9rem)' }}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
              {member.name.slice(0, 1)}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{member.name}</h3>
              {member.role && <p className="text-sm opacity-70">{member.role}</p>}
            </div>
          </div>
          {member.bio && <p className="text-sm opacity-75 leading-relaxed">{member.bio}</p>}
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
        <div
          key={index}
          className="viewer-card flex items-center justify-center text-center"
          style={{ padding: 'clamp(1.1rem, 3vw, 1.6rem)' }}
        >
          <span className="text-sm font-semibold tracking-[0.18em] uppercase opacity-80">
            {logo.alt || logo.url}
          </span>
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
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {safeImages.map((image, index) => (
        <figure
          key={index}
          className="viewer-card overflow-hidden"
          style={{ padding: 0, borderRadius: '1.25rem' }}
        >
          <div className="relative aspect-square w-full">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${image.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.95)',
              }}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 text-left">
              {image.caption && <figcaption className="text-xs font-semibold tracking-wide text-white/80">{image.caption}</figcaption>}
            </div>
          </div>
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
      <div className="viewer-card text-left space-y-2">
        <h3 className="text-lg font-semibold">{content.beforeTitle ?? 'Before'}</h3>
        {content.beforeText && <p className="text-sm opacity-80">{content.beforeText}</p>}
      </div>
      <div className="viewer-card text-left space-y-2">
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
    <div
      className="viewer-card-strong space-y-4 text-left"
      style={{
        padding: 'clamp(1.8rem, 5vw, 2.4rem)',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.06))',
      }}
    >
      {content.badgeText && (
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.24em] uppercase bg-white/10">
          {content.badgeText}
        </div>
      )}
      {content.description && <Paragraph>{content.description}</Paragraph>}
      {content.features?.length ? (
        <ul className="space-y-2 text-left text-sm opacity-85">
          {content.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: viewerTheme.colors.accentAlt }} />
              <span>{feature}</span>
            </li>
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
  const target = new Date(content.targetDate);
  const diff = Math.max(0, target.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts: { key: string; label: string; value: number }[] = [];
  if (content.showDays ?? true) {
    parts.push({ key: 'days', label: '日', value: days });
  }
  if (content.showHours ?? true) {
    parts.push({ key: 'hours', label: '時間', value: hours });
  }
  if (content.showMinutes ?? true) {
    parts.push({ key: 'minutes', label: '分', value: minutes });
  }
  if (content.showSeconds ?? false) {
    parts.push({ key: 'seconds', label: '秒', value: seconds });
  }

  const columnCount = Math.max(1, parts.length || 3);
  const gridStyle: CSSProperties = { gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` };

  return (
    <div
      className="viewer-card-strong space-y-4 text-left"
      style={{
        padding: 'clamp(1.8rem, 5vw, 2.4rem)',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.24), rgba(56,189,248,0.12))',
      }}
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/70">
        <span>Deadline</span>
        {formattedDate && <span>{formattedDate}</span>}
      </div>

      {parts.length > 0 && (
        <div className="grid gap-3 text-center" style={gridStyle}>
          {parts.map((part) => (
            <div key={part.key} className="viewer-card" style={{ padding: 'clamp(1rem, 3vw, 1.4rem)' }}>
              <div className="text-3xl font-bold tracking-tight">
                {String(Math.max(0, part.value)).padStart(2, '0')}
              </div>
              <div className="text-xs uppercase tracking-[0.24em] opacity-70">{part.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="text-lg font-semibold">{summary}</div>
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
  const accent = content.accentColor ?? viewerTheme.colors.accent;
  const progressColor = content.progressColor ?? accent;

  return (
    <div
      className="viewer-card-strong space-y-4 text-left"
      style={{
        padding: 'clamp(1.6rem, 4vw, 2.1rem)',
        background: 'linear-gradient(135deg, rgba(248,113,113,0.22), rgba(239,68,68,0.1))',
      }}
    >
      <div className="flex items-end justify-between">
        {typeof content.remainingCount === 'number' ? (
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/70">残り枠</p>
            <div className="text-3xl font-bold">
              {remaining}
              {total > 0 && <span className="text-base font-normal opacity-70 ml-2">/ {total}</span>}
            </div>
          </div>
        ) : null}
        {percentage !== undefined && <div className="text-sm font-semibold text-white/80">{percentage}%</div>}
      </div>

      {percentage !== undefined && (
        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full" style={{ width: `${percentage}%`, background: progressColor }} />
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
    <div
      className="viewer-card-strong space-y-3 text-left"
      style={{
        padding: 'clamp(1.6rem, 4vw, 2.1rem)',
        background: 'linear-gradient(135deg, rgba(248,113,113,0.18), rgba(239,68,68,0.08))',
        border: '1px solid rgba(248, 113, 113, 0.35)',
      }}
    >
      <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.24em] bg-white/10">
        ALERT
      </div>
      {content.title && <h3 className="text-lg font-semibold">{content.title}</h3>}
      <p className="text-sm opacity-90 leading-relaxed">{content.message}</p>
    </div>
  );
}

function AuthorProfile({ content }: { content?: Partial<AuthorProfileBlockContent> }): ReactElement | null {
  if (!content?.name) {
    return null;
  }

  const initials = content.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="viewer-card-strong space-y-5 text-left" style={{ padding: 'clamp(1.8rem, 5vw, 2.4rem)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative h-16 w-16 rounded-full overflow-hidden bg-white/15 flex items-center justify-center text-2xl font-semibold">
          {content.imageUrl ? (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${content.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ) : null}
          {!content.imageUrl && <span>{initials}</span>}
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold">{content.name}</h3>
          {content.title && <Paragraph muted>{content.title}</Paragraph>}
        </div>
      </div>

      {content.bio && <Paragraph>{content.bio}</Paragraph>}

      {content.achievements?.length ? (
        <ul className="space-y-2 text-left text-sm opacity-85">
          {content.achievements.map((achievement, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: viewerTheme.colors.accent }} />
              <span>{achievement}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {content.mediaLogos?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs uppercase tracking-[0.18em] opacity-70">
          {content.mediaLogos.map((logo, index) => (
            <div key={index} className="viewer-card text-center" style={{ padding: '0.75rem' }}>
              {logo}
            </div>
          ))}
        </div>
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

  if (['hero', 'hero-1', 'hero-2', 'hero-3', 'hero-aurora'].includes(blockType)) {
    return renderHero(content as unknown as HeroBlockContent, shared);
  }

  if (['cta', 'cta-1', 'cta-2', 'cta-3', 'cta-inline-1', 'sticky-cta-1'].includes(blockType)) {
    const ctaContent = content as unknown as CTABlockContent | InlineCTABlockContent;
    return renderCTA(ctaContent, shared);
  }

  if (['special-price', 'special-price-1'].includes(blockType)) {
    return renderSpecialPrice(content as unknown as SpecialPriceBlockContent, shared);
  }

  if (['problem', 'problem-1'].includes(blockType)) {
    return renderProblem(content as unknown as ProblemBlockContent);
  }

  if (['features', 'features-1', 'features-2', 'features-aurora'].includes(blockType)) {
    return renderFeatures(content as unknown as FeaturesBlockContent);
  }

  if (['pricing', 'pricing-1', 'pricing-2', 'pricing-3'].includes(blockType)) {
    return renderPricing(content as unknown as PricingBlockContent, shared);
  }

  if (['testimonial', 'testimonial-1', 'testimonial-2', 'testimonial-3'].includes(blockType)) {
    return renderTestimonials(content as unknown as TestimonialBlockContent);
  }

  if (['faq', 'faq-1', 'faq-2'].includes(blockType)) {
    return renderFAQ(content as unknown as FAQBlockContent);
  }

  if (['countdown', 'countdown-1'].includes(blockType)) {
    return renderCountdown(content as unknown as CountdownBlockContent);
  }

  if (['scarcity', 'scarcity-1'].includes(blockType)) {
    return renderScarcity(content as unknown as ScarcityBlockContent);
  }

  if (['urgency', 'urgency-1'].includes(blockType)) {
    return renderUrgency(content as unknown as UrgencyBlockContent);
  }

  if (['before-after', 'before-after-1'].includes(blockType)) {
    return renderBeforeAfter(content as unknown as BeforeAfterBlockContent);
  }

  if (['author-profile', 'author-profile-1'].includes(blockType)) {
    return renderAuthor(content as unknown as AuthorProfileBlockContent);
  }

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
