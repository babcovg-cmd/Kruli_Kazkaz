// Layout публичной части сайта: шапка, контент, подвал, виджет AI-консультанта
// и cookie-баннер (Метрика грузится только после согласия — 152-ФЗ).

import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import AIWidget from "@/components/public/AIWidget";
import CookieConsent from "@/components/public/CookieConsent";
import { getSettings, getAiConfig } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, ai] = await Promise.all([getSettings(), getAiConfig()]);

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      {ai.enabled && <AIWidget phone={settings.phone} />}
      <CookieConsent metrikaId={settings.yandexMetrika || undefined} />
    </>
  );
}
