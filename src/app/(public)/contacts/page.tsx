// Контакты объединены со страницей «О компании».
// Старый адрес /contacts перенаправляем на блок контактов.

import { redirect } from "next/navigation";

export default function ContactsPage() {
  redirect("/about#contacts");
}
