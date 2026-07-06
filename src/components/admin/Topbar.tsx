// Верхняя панель раздела админки: заголовок + опциональное действие справа.

import type { ReactNode } from "react";

export default function Topbar({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="admin-topbar">
      <h1>{title}</h1>
      {action}
    </div>
  );
}
