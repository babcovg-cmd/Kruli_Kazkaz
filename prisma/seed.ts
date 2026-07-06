// Наполнение БД стартовыми данными: туры из дизайн-макета, настройки,
// конфиг AI и учётная запись администратора.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedTour = {
  slug: string;
  title: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  program: string;
  conditions: string;
  price: number;
  priceOnReq?: boolean;
  duration: string;
  difficulty: string;
  ageLimit: string;
  nearestDate: string;
  startDate?: string; // YYYY-MM-DD; пусто = «по запросу»
  unlimitedSeats?: boolean; // по умолчанию true
  seats?: number; // свободных мест, если ограничено
  scene: string;
  paymentMode: "online" | "request";
  showOnHome?: boolean;
  sortOrder: number;
};

const TOURS: SeedTour[] = [
  {
    slug: "sulakskiy-kanyon",
    title: "Сулакский каньон",
    category: "Однодневные туры",
    shortDesc:
      "Самый глубокий каньон Европы, катер по бирюзовой Сулакской воде и форелевое хозяйство.",
    fullDesc:
      "<p>Сулакский каньон — одно из самых впечатляющих мест Дагестана и самый глубокий каньон Европы (до 1920 м). За один насыщенный день вы увидите бирюзовую воду с высоты птичьего полёта, прокатитесь на катере вдоль отвесных стен и попробуете свежую форель.</p><p>Тур подходит для семей с детьми и не требует подготовки. Всё включено: трансфер из Махачкалы, гид, катер и обед.</p>",
    program:
      "<h4>День 1 — Выезд и смотровая площадка</h4><p>Сбор в Махачкале, переезд к Сулакскому каньону, обзорная точка над бирюзовой водой.</p><h4>День 1 — Катер по каньону</h4><p>Прогулка на катере вдоль отвесных стен глубиной до 1920 метров.</p><h4>День 1 — Форелевое хозяйство и обед</h4><p>Дегустация свежей форели, дагестанская кухня, возвращение к вечеру.</p>",
    conditions:
      "<ul><li>Включено: трансфер, гид, катер, обед, страховка.</li><li>Не включено: личные расходы и сувениры.</li><li>Оплата: онлайн на сайте или безналичный расчёт по договору.</li><li>Отмена: бесплатно за 3 дня до выезда.</li></ul>",
    price: 4900,
    duration: "1 день",
    difficulty: "Лёгкая",
    ageLimit: "0+",
    nearestDate: "каждую субботу",
    startDate: "2026-06-27",
    scene: "s-canyon",
    paymentMode: "online",
    showOnHome: true,
    sortOrder: 1,
  },
  {
    slug: "gunib-saltinskiy-vodopad",
    title: "Гуниб и Салтинский водопад",
    category: "Экскурсии",
    shortDesc: "Подземный водопад в Салтинской теснине и виды на Гунибское плато.",
    fullDesc:
      "<p>Однодневное путешествие в горный Дагестан: единственный в России подземный водопад в Салтинской теснине, исторический Гуниб и панорамы Гунибского плато.</p>",
    program:
      "<h4>День 1</h4><p>Выезд из Махачкалы, Салтинская теснина и подземный водопад.</p><h4>День 1</h4><p>Гуниб, царская поляна, виды на плато, обед с дагестанской кухней.</p>",
    conditions:
      "<ul><li>Включено: трансфер, гид, обед.</li><li>Не включено: личные расходы.</li><li>Отмена: бесплатно за 3 дня до выезда.</li></ul>",
    price: 5600,
    duration: "1 день",
    difficulty: "Лёгкая",
    ageLimit: "6+",
    nearestDate: "вт, чт, сб",
    startDate: "2026-06-25",
    scene: "s-dusk",
    paymentMode: "online",
    showOnHome: true,
    sortOrder: 2,
  },
  {
    slug: "staryy-goor-karadahskaya-tesnina",
    title: "Старый Гоор и Карадахская теснина",
    category: "Сборные туры",
    shortDesc: "Башни заброшенного аула Гоор над облаками и узкая Карадахская теснина.",
    fullDesc:
      "<p>Двухдневный маршрут к легендарным башням Старого Гоора, парящим над облаками, и в узкую Карадахскую теснину — «ворота чудес».</p>",
    program:
      "<h4>День 1</h4><p>Переезд в горный Дагестан, Карадахская теснина, ночёвка в гостевом доме.</p><h4>День 2</h4><p>Старый Гоор, башенный комплекс, смотровые площадки, возвращение.</p>",
    conditions:
      "<ul><li>Включено: трансфер, гид, проживание, завтраки.</li><li>Не включено: обеды и ужины, личные расходы.</li></ul>",
    price: 16200,
    duration: "2 дня / 1 ночь",
    difficulty: "Средняя",
    ageLimit: "12+",
    nearestDate: "14 июля",
    startDate: "2026-07-14",
    unlimitedSeats: false,
    seats: 4,
    scene: "s-village",
    paymentMode: "request",
    showOnHome: true,
    sortOrder: 3,
  },
  {
    slug: "voshozhdenie-na-shalbuzdag",
    title: "Восхождение на Шалбуздаг",
    category: "Спортивный туризм",
    shortDesc: "Священная вершина 4142 м — трекинг с опытными гидами и ночёвкой в горах.",
    fullDesc:
      "<p>Многодневное восхождение на священную вершину Шалбуздаг (4142 м). Трекинг с опытными гидами, ночёвки в горах и незабываемые панорамы Южного Дагестана.</p>",
    program:
      "<h4>День 1–2</h4><p>Акклиматизация, переход к базовому лагерю.</p><h4>День 3</h4><p>Восхождение на вершину.</p><h4>День 4</h4><p>Спуск и возвращение.</p>",
    conditions:
      "<ul><li>Требуется хорошая физическая форма.</li><li>Включено: гид, снаряжение, питание на маршруте.</li></ul>",
    price: 38900,
    duration: "4 дня / 3 ночи",
    difficulty: "Сложная",
    ageLimit: "18+",
    nearestDate: "по запросу",
    scene: "s-peak",
    paymentMode: "request",
    showOnHome: true,
    sortOrder: 4,
  },
  {
    slug: "karmadonskoe-ushchelye",
    title: "Кармадонское ущелье",
    category: "Тематические туры",
    shortDesc: "Северная Осетия: ледник Колка, древние склепы Даргавса и башенные комплексы.",
    fullDesc:
      "<p>Тематический тур по Северной Осетии: Кармадонское ущелье и ледник Колка, «город мёртвых» Даргавс и средневековые башенные комплексы.</p>",
    program:
      "<h4>День 1</h4><p>Переезд во Владикавказ, обзорная экскурсия.</p><h4>День 2</h4><p>Кармадонское ущелье, ледник Колка.</p><h4>День 3</h4><p>Даргавс, башни, возвращение.</p>",
    conditions:
      "<ul><li>Включено: трансфер, гид, проживание, завтраки.</li><li>Не включено: обеды и ужины.</li></ul>",
    price: 29500,
    duration: "3 дня / 2 ночи",
    difficulty: "Средняя",
    ageLimit: "12+",
    nearestDate: "2 августа",
    startDate: "2026-08-02",
    unlimitedSeats: false,
    seats: 8,
    scene: "s-night",
    paymentMode: "request",
    sortOrder: 5,
  },
  {
    slug: "digoriya-tseyskoe-ushchelye",
    title: "Дигория и Цейское ущелье",
    category: "Сборные туры",
    shortDesc: "Альпийские луга, водопады Галдоридон и ледники Цейского ущелья.",
    fullDesc:
      "<p>Пятидневный маршрут по красивейшим ущельям Северной Осетии: альпийские луга Дигории, водопады Галдоридон и ледники Цейского ущелья.</p>",
    program:
      "<h4>День 1–2</h4><p>Дигорское ущелье, водопады.</p><h4>День 3–4</h4><p>Цейское ущелье, ледники, святилище Реком.</p><h4>День 5</h4><p>Возвращение.</p>",
    conditions:
      "<ul><li>Включено: трансфер, гид, проживание, завтраки.</li></ul>",
    price: 46700,
    duration: "5 дней / 4 ночи",
    difficulty: "Средняя",
    ageLimit: "12+",
    nearestDate: "19 августа",
    startDate: "2026-08-19",
    scene: "s-dawn",
    paymentMode: "request",
    sortOrder: 6,
  },
  {
    slug: "samurskiy-les-derbent",
    title: "Самурский лес и Дербент",
    category: "Экскурсии",
    shortDesc:
      "Единственный лиановый лес России и древнейший город страны — крепость Нарын-Кала.",
    fullDesc:
      "<p>Двухдневная поездка на юг Дагестана: единственный лиановый (реликтовый) лес России в дельте Самура и древнейший город страны Дербент с крепостью Нарын-Кала.</p>",
    program:
      "<h4>День 1</h4><p>Самурский лес, побережье Каспия, ночёвка в Дербенте.</p><h4>День 2</h4><p>Крепость Нарын-Кала, старый город, магалы.</p>",
    conditions:
      "<ul><li>Включено: трансфер, гид, проживание, завтрак.</li></ul>",
    price: 13400,
    duration: "2 дня / 1 ночь",
    difficulty: "Лёгкая",
    ageLimit: "0+",
    nearestDate: "каждое вс",
    startDate: "2026-06-28",
    scene: "s-village",
    paymentMode: "online",
    sortOrder: 7,
  },
  {
    slug: "individualnyy-marshrut",
    title: "Индивидуальный маршрут",
    category: "Туры под запрос",
    shortDesc: "Составим программу под ваши интересы, темп и состав группы.",
    fullDesc:
      "<p>Индивидуальный тур по Дагестану и Северному Кавказу. Составим программу под ваши интересы, темп и состав группы — от однодневных выездов до многодневных экспедиций.</p>",
    program: "<p>Программа формируется индивидуально после консультации с менеджером.</p>",
    conditions:
      "<ul><li>Стоимость рассчитывается под запрос.</li><li>Возможен трансфер, проживание, гид и питание.</li></ul>",
    price: 0,
    priceOnReq: true,
    duration: "обсуждается",
    difficulty: "Лёгкая",
    ageLimit: "0+",
    nearestDate: "ваши даты",
    scene: "s-dusk",
    paymentMode: "request",
    sortOrder: 8,
  },
];

const CATEGORIES = [
  { name: "Однодневные туры", description: "Каньоны, водопады и аулы за один выезд", glyph: "☀", badgeClass: "b-green", sortOrder: 1 },
  { name: "Экскурсии", description: "Города, крепости и культурное наследие", glyph: "◈", badgeClass: "b-green", sortOrder: 2 },
  { name: "Сборные туры", description: "Многодневные маршруты в малых группах", glyph: "⛰", badgeClass: "b-blue", sortOrder: 3 },
  { name: "Тематические туры", description: "Гастрономия, история, ремёсла", glyph: "✦", badgeClass: "b-purple", sortOrder: 4 },
  { name: "Спортивный туризм", description: "Восхождения, треккинг, экспедиции", glyph: "▲", badgeClass: "b-amber", sortOrder: 5 },
  { name: "Туры под запрос", description: "Индивидуальные программы под вас", glyph: "✎", badgeClass: "b-amber", sortOrder: 6 },
];

async function main() {
  console.log("⏳ Заполняем базу данных…");

  // ───── Категории ─────
  for (const c of CATEGORIES) {
    await prisma.category.upsert({ where: { name: c.name }, update: {}, create: c });
  }
  console.log(`✅ Категории: ${CATEGORIES.length} шт.`);

  // ───── Туры ─────
  for (const t of TOURS) {
    await prisma.tour.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        slug: t.slug,
        title: t.title,
        category: t.category,
        shortDesc: t.shortDesc,
        fullDesc: t.fullDesc,
        program: t.program,
        conditions: t.conditions,
        price: t.price,
        priceOnReq: t.priceOnReq ?? false,
        duration: t.duration,
        difficulty: t.difficulty,
        ageLimit: t.ageLimit,
        nearestDate: t.nearestDate,
        startDate: t.startDate ? new Date(t.startDate) : null,
        unlimitedSeats: t.unlimitedSeats ?? true,
        seats: t.seats ?? 0,
        scene: t.scene,
        images: "[]",
        paymentMode: t.paymentMode,
        isActive: true,
        showOnHome: t.showOnHome ?? false,
        sortOrder: t.sortOrder,
      },
    });
  }
  console.log(`✅ Туры: ${TOURS.length} шт.`);

  // ───── Настройки сайта ─────
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      aboutText:
        "«Крылья Кавказа» — туроператор по Дагестану и республикам Северного Кавказа. " +
        "17 лет опыта, более 60 авторских программ. Мы открываем гостям подлинные горы, " +
        "аулы и каньоны — официально, по договору.",
    },
  });
  console.log("✅ Настройки сайта созданы");

  // ───── Конфиг AI ─────
  await prisma.aiConfig.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });
  console.log("✅ Конфиг AI-консультанта создан");

  // ───── Главный администратор (владелец) ─────
  const login = process.env.ADMIN_LOGIN || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { login },
    update: { password: hash, role: "owner" },
    create: { login, password: hash, name: "Владелец", role: "owner", permissions: "[]" },
  });
  console.log(`✅ Владелец: логин «${login}»`);

  console.log("🎉 Готово!");
}

main()
  .catch((e) => {
    console.error("❌ Ошибка при заполнении БД:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
