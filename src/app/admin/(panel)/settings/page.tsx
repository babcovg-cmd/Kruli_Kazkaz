// Раздел «Настройки сайта».

import Topbar from "@/components/admin/Topbar";
import SettingsForm from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/settings";
import type { SettingsInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const s = await getSettings();

  const initial: SettingsInput = {
    phone: s.phone,
    whatsapp: s.whatsapp,
    telegram: s.telegram,
    whatsappUrl: s.whatsappUrl,
    telegramUrl: s.telegramUrl,
    maxUrl: s.maxUrl,
    email: s.email,
    address: s.address,
    mapEmbed: s.mapEmbed,
    heroTitle: s.heroTitle,
    heroSubtitle: s.heroSubtitle,
    aboutText: s.aboutText,
    seoHomeTitle: s.seoHomeTitle,
    seoHomeDesc: s.seoHomeDesc,
    seoHomeKeywords: s.seoHomeKeywords,
    seoCatalogTitle: s.seoCatalogTitle,
    seoCatalogDesc: s.seoCatalogDesc,
    seoCatalogKeywords: s.seoCatalogKeywords,
    seoTourTitle: s.seoTourTitle,
    seoTourDesc: s.seoTourDesc,
    yandexMetrika: s.yandexMetrika,
  };

  return (
    <>
      <Topbar title="Настройки сайта" />
      <div className="admin-body">
        <SettingsForm initial={initial} />
      </div>
    </>
  );
}
