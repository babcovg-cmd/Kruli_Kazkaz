// Редактирование тура.

import { notFound } from "next/navigation";
import Topbar from "@/components/admin/Topbar";
import TourForm from "@/components/admin/TourForm";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import type { TourInput } from "@/lib/validation";
import { getCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tour, categories] = await Promise.all([
    prisma.tour.findUnique({ where: { id } }),
    getCategories(),
  ]);
  if (!tour) notFound();

  // Если категория тура была удалена — добавим её в список, чтобы не потерять выбор.
  const catNames = categories.map((c) => c.name);
  if (!catNames.includes(tour.category)) catNames.unshift(tour.category);

  const initial: TourInput = {
    title: tour.title,
    slug: tour.slug,
    category: tour.category,
    shortDesc: tour.shortDesc,
    fullDesc: tour.fullDesc,
    program: tour.program,
    conditions: tour.conditions,
    price: tour.price,
    priceOnReq: tour.priceOnReq,
    duration: tour.duration,
    difficulty: tour.difficulty,
    ageLimit: tour.ageLimit,
    nearestDate: tour.nearestDate,
    startDate: tour.startDate ? tour.startDate.toISOString().slice(0, 10) : "",
    unlimitedSeats: tour.unlimitedSeats,
    seats: tour.seats,
    scene: tour.scene,
    images: parseImages(tour.images),
    brochure: tour.brochure,
    paymentMode: tour.paymentMode as "online" | "request",
    isActive: tour.isActive,
    showOnHome: tour.showOnHome,
    sortOrder: tour.sortOrder,
    metaTitle: tour.metaTitle,
    metaDescription: tour.metaDescription,
  };

  return (
    <>
      <Topbar title="Редактирование тура" />
      <div className="admin-body">
        <TourForm mode="edit" tourId={tour.id} initial={initial} categories={catNames} />
      </div>
    </>
  );
}
