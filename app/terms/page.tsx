import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

type StandardSectionKey =
  | "application"
  | "registration"
  | "usageRestriction"
  | "disclaimer"
  | "transactionFee"
  | "forex"
  | "changes";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.terms" });
  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  };
}

export default function TermsPage() {
  const t = useTranslations("legal.terms");

  const getParagraphs = (sectionKey: string) => (t.raw(`sections.${sectionKey}.paragraphs`) as string[]) ?? [];
  const standardSectionKeys: StandardSectionKey[] = [
    "application",
    "registration",
    "usageRestriction",
    "disclaimer",
    "transactionFee",
    "forex",
    "changes",
  ];

  const prohibitedItems = t.raw("sections.prohibited.items") as string[];
  const suspensionItems = t.raw("sections.serviceSuspension.items") as string[];

  return (
    <DashboardLayout pageTitle={t("pageTitle")} pageSubtitle={t("pageSubtitle")} requireAuth={false}>
      <div className="relative min-h-screen bg-slate-950 text-slate-200">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_60%)]" />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(148,163,184,0.12)_1px,transparent_1px)]"
          style={{ backgroundSize: "44px 44px" }}
        />

        <main className="relative z-10 pt-6 pb-20">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="mb-12 space-y-4">
              <p className="text-base leading-relaxed text-slate-300">{t("intro")}</p>
            </div>

            <div className="space-y-12 text-base leading-relaxed">
              {standardSectionKeys.slice(0, 2).map((sectionKey) => (
                <section key={sectionKey} className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">{t(`sections.${sectionKey}.title`)}</h2>
                  {getParagraphs(sectionKey).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </section>
              ))}

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">{t("sections.prohibited.title")}</h2>
                <p>{t("sections.prohibited.description")}</p>
                <ul className="list-disc space-y-2 pl-6 text-slate-300">
                  {prohibitedItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">{t("sections.serviceSuspension.title")}</h2>
                <p>{t("sections.serviceSuspension.description")}</p>
                <ul className="list-disc space-y-2 pl-6 text-slate-300">
                  {suspensionItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {standardSectionKeys.slice(2).map((sectionKey) => (
                <section key={sectionKey} className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">{t(`sections.${sectionKey}.title`)}</h2>
                  {getParagraphs(sectionKey).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </section>
              ))}

              <section className="space-y-3 border-l-2 border-blue-500/40 pl-6 text-sm text-slate-400">
                <p>{t("contact.description")}</p>
                <address className="not-italic">
                  {t("contact.organization")}
                  <br />
                  {t("contact.email")}
                </address>
              </section>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
