import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });
  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  };
}

export default function PrivacyPolicyPage() {
  const t = useTranslations("legal.privacy");

  const informationItems = t.raw("sections.information.items") as string[];
  const purposeItems = t.raw("sections.purpose.items") as string[];

  const renderParagraphs = (key: string) => {
    const paragraphs = (t.raw(key) as string[]) ?? [];
    return paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>);
  };

  return (
    <DashboardLayout pageTitle={t("pageTitle")} pageSubtitle={t("pageSubtitle")} requireAuth={false}>
      <div className="relative min-h-screen bg-slate-950 text-slate-200">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(147,197,253,0.22),transparent_60%)]" />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(148,163,184,0.12)_1px,transparent_1px)]"
          style={{ backgroundSize: "46px 46px" }}
        />

        <main className="relative z-10 pt-6 pb-20">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="mb-12 space-y-4">
              <p className="text-base leading-relaxed text-slate-300">{t("intro")}</p>
            </div>

            <div className="space-y-12 text-base leading-relaxed">
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">{t("sections.information.title")}</h2>
                <p>{t("sections.information.description")}</p>
                <ul className="list-disc space-y-2 pl-6 text-slate-300">
                  {informationItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">{t("sections.purpose.title")}</h2>
                <p>{t("sections.purpose.description")}</p>
                <ul className="list-disc space-y-2 pl-6 text-slate-300">
                  {purposeItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">{t("sections.thirdParty.title")}</h2>
                {renderParagraphs("sections.thirdParty.paragraphs")}
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">{t("sections.security.title")}</h2>
                {renderParagraphs("sections.security.paragraphs")}
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">{t("sections.rights.title")}</h2>
                {renderParagraphs("sections.rights.paragraphs")}
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">{t("sections.cookies.title")}</h2>
                {renderParagraphs("sections.cookies.paragraphs")}
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">{t("sections.changes.title")}</h2>
                {renderParagraphs("sections.changes.paragraphs")}
              </section>

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
