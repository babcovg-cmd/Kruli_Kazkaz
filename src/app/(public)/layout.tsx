// Layout публичной части сайта: шапка, контент, подвал и виджет AI-консультанта.

import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import AIWidget from "@/components/public/AIWidget";
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
    </>
  );
}
