// /admin → перенаправление на раздел туров.

import { redirect } from "next/navigation";

export default function AdminIndex() {
  redirect("/admin/tours");
}
