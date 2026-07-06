// Создание нового тура.

import Topbar from "@/components/admin/Topbar";
import TourForm from "@/components/admin/TourForm";
import type { TourInput } from "@/lib/validation";
import { getCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

const EMPTY: TourInput = {
  title: "",
  slug: "",
  category: "",
  shortDesc: "",
  fullDesc: "",
  program: "",
  conditions: "",
  price: 0,
  priceOnReq: false,
  duration: "",
  difficulty: "Лёгкая",
  ageLimit: "0+",
  nearestDate: "",
  startDate: "",
  unlimitedSeats: true,
  seats: 0,
  scene: "s-dusk",
  images: [],
  paymentMode: "request",
  isActive: true,
  showOnHome: false,
  sortOrder: 0,
  metaTitle: "",
  metaDescription: "",
};

export default async function NewTourPage() {
  const categories = await getCategories();
  const initial = { ...EMPTY, category: categories[0]?.name ?? "" };
  return (
    <>
      <Topbar title="Новый тур" />
      <div className="admin-body">
        <TourForm mode="create" initial={initial} categories={categories.map((c) => c.name)} />
      </div>
    </>
  );
}
