import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

type InfoItem = {
  label: string;
  values: string[];
  variant?: "highlight" | "chips";
};

const chipsBaseClasses = "rounded-lg bg-slate-200 px-3 py-1 font-medium text-slate-900";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.tokusho" });
  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  };
}

export default function TokushoPage() {
  const t = useTranslations("legal.tokusho");

  const sellerItems = t.raw("sections.seller.items") as InfoItem[];
  const contactItems = t.raw("sections.contact.items") as InfoItem[];
  const pricingItems = t.raw("sections.pricing.items") as InfoItem[];
  const returnsItems = t.raw("sections.returns.items") as string[];

  const renderValues = (item: InfoItem) => {
    if (item.variant === "chips") {
      return (
        <div className="flex flex-wrap gap-2">
          {item.values.map((value, index) => (
            <span key={index} className={chipsBaseClasses}>
              {value}
            </span>
          ))}
        </div>
      );
    }

    if (item.variant === "highlight") {
      return (
        <div className="rounded-lg bg-slate-200 px-4 py-3 text-slate-900">
          {item.values.map((value, index) => (
            <span key={index} className="block font-medium">
              {value}
            </span>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-1 text-slate-200">
        {item.values.map((value, index) => {
          const isEmail = value.includes("@");
          if (isEmail) {
            return (
              <a key={index} href={`mailto:${value}`} className="text-blue-300 hover:text-blue-200">
                {value}
              </a>
            );
          }
          return (
            <span key={index} className="block">
              {value}
            </span>
          );
        })}
      </div>
    );
  };

  const renderInfoSection = (titleKey: string, items: InfoItem[]) => (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-xl shadow-blue-900/10">
      <h2 className="text-xl font-semibold text-white">{t(titleKey)}</h2>
      <dl className="mt-4 space-y-3 text-sm leading-relaxed">
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex flex-col gap-1 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
            <dt className="text-slate-400">{item.label}</dt>
            <dd className="text-slate-100">{renderValues(item)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );

  const renderParagraphSection = (titleKey: string, paragraphsKey: string) => {
    const paragraphs = (t.raw(paragraphsKey) as string[]) ?? [];
    return (
      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-xl shadow-blue-900/10">
        <h2 className="text-xl font-semibold text-white">{t(titleKey)}</h2>
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="mt-4 text-sm leading-relaxed text-slate-200">
            {paragraph}
          </p>
        ))}
      </section>
    );
  };

  return (
    <DashboardLayout pageTitle={t("pageTitle")} pageSubtitle={t("pageSubtitle")} requireAuth={false}>
      <div className="relative min-h-screen bg-slate-950 text-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_62%)]" />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(148,163,184,0.12)_1px,transparent_1px)]"
          style={{ backgroundSize: "48px 48px" }}
        />

        <main className="relative z-10 pt-6 pb-20">
          <div className="container mx-auto max-w-4xl px-4">
            <section className="mb-10 space-y-4">
              <p className="text-base leading-relaxed text-slate-300">{t("intro")}</p>
            </section>

            <div className="space-y-8">
              {renderInfoSection("sections.seller.title", sellerItems)}
              {renderInfoSection("sections.contact.title", contactItems)}
              {renderInfoSection("sections.pricing.title", pricingItems)}
              {renderParagraphSection("sections.delivery.title", "sections.delivery.paragraphs")}

              <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-xl shadow-blue-900/10">
                <h2 className="text-xl font-semibold text-white">{t("sections.returns.title")}</h2>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
                  {returnsItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {renderParagraphSection("sections.disclaimer.title", "sections.disclaimer.paragraphs")}

              <section className="rounded-2xl border border-blue-500/50 bg-slate-900/70 p-6 shadow-xl shadow-blue-900/10">
                <h2 className="text-xl font-semibold text-white">{t("sections.updates.title")}</h2>
                {(t.raw("sections.updates.paragraphs") as string[]).map((paragraph, index) => (
                  <p key={index} className="mt-4 text-sm leading-relaxed text-slate-200">
                    {paragraph}
                  </p>
                ))}
              </section>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
