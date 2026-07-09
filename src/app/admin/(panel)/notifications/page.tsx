// Раздел «Уведомления в ТГ»: настройка Telegram-бота для оповещений о заявках.

import Topbar from "@/components/admin/Topbar";
import NotificationsForm from "@/components/admin/NotificationsForm";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const s = await getSettings();

  return (
    <>
      <Topbar title="Уведомления в ТГ" />
      <div className="admin-body">
        <NotificationsForm initial={{ tgBotToken: s.tgBotToken, tgChatId: s.tgChatId }} />
      </div>
    </>
  );
}
