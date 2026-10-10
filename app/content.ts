/**
 * Everything the page says, in one place.
 *
 * The manifesto ("Why Wonderland?") and the FAQ are final copy. Everything
 * marked PENDING is a stand-in: dates, venues, themes, prices, links and
 * media. Swap the values here; no component needs to change.
 *
 * Media: drop files into /public/media and set `media` on the item, e.g.
 *   media: { type: "image", src: "/media/night-01.jpg" }
 *   media: { type: "video", src: "/media/aftermovie.mp4", poster: "/media/aftermovie.jpg" }
 * Without `media` the slot renders a labelled placeholder of the right shape.
 */

export type MediaSource =
  | { type: "image"; src: string; alt?: string }
  /* `src` may list several clips: they play back to back as one video. */
  | { type: "video"; src: string | string[]; poster?: string };

/**
 * A per-night identity ramp, the same four stops the product cards use.
 * The defaults are cut from the logo: rose-gold chrome, steel-blue chrome,
 * silver over the nebula.
 */
export interface Ramp {
  from: string;
  mid: string;
  mid2: string;
  to: string;
}

export const site = {
  name: "WONDERLAND.KRK",
  city: "Краків",
  /* PENDING: real profile links. */
  socials: [
    { label: "Instagram", href: "#" },
    { label: "TikTok", href: "#" },
    { label: "Telegram", href: "#" },
  ],
};

export const nav = [
  { href: "#nights", label: "Ночі" },
  { href: "#tickets", label: "Квитки" },
  { href: "#gallery", label: "Медіа" },
  { href: "#faq", label: "Питання" },
];

export const header = {
  menuLabel: "Меню",
};

export const hero = {
  eyebrow: "Краків. Одна ніч, один світ",
  title: "Вітаємо у Wonderland.",
  sub: "Не просто вечірки. Різні світи, які з’являються лише на одну ніч.",
  ticker: ["Нова тема", "Новий вайб", "Новий саунд", "Нова історія"],
};

/* Where every night happens. The street stays in Polish, the way it is
   signed and the way maps find it. */
export const venue = {
  name: "Wonderland Club",
  address: "Stefana Batorego 1",
  city: "Краків",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Stefana+Batorego+1%2C+Krak%C3%B3w",
};

/* The first night: 14.11.2026, a Saturday. The theme stays a secret. */
export const nextNight = {
  label: "Перша ніч",
  number: "№ 01",
  theme: "Тема поки що секрет",
  rows: [
    { k: "Дата", v: "14.11, субота" },
    { k: "Локація", v: `${venue.address}, ${venue.city}`, href: venue.mapsHref },
    { k: "Саунд", v: "Залежить від ночі" },
  ] as { k: string; v: string; href?: string }[],
  /** PENDING: set to the ticket shop URL once online sales open. Until then
      the ticket calls lead to the prices section and to Instagram. */
  ticketsHref: null as string | null,
  cta: "Купити квиток",
  ctaPending: "Ціни на квитки",
  note: "Квиток онлайн 40 zł, на вході 50 zł.",
};

/* Prices exactly as announced. VIP prices are for the whole group. */
export const tickets = {
  label: "Квитки",
  title: "Обери свій вхід у Wonderland.",
  lead: "Онлайн дешевше. На компанію ще вигідніше.",
  standard: {
    eyebrow: "Стандарт",
    name: "Вхідний квиток",
    tiers: [
      { k: "Онлайн", v: "40 zł", best: true },
      { k: "На вході", v: "50 zł" },
    ],
    note: "Купуй онлайн і заощадь 10 zł.",
  },
  vip: {
    eyebrow: "VIP-група",
    name: "Для твоєї компанії",
    /* PENDING: what a VIP group gets (table, entry, drinks...). */
    tiers: [
      { k: "4-5 людей", v: "290 zł" },
      { k: "6-8 людей", v: "420 zł" },
      { k: "10+ людей", v: "650 zł" },
    ],
    note: "Ціна за всю компанію.",
  },
  cta: "Купити квиток",
  ctaPending: "Стежити за стартом продажу",
};

export const worlds = {
  label: "Наш формат",
  title: "Це різні світи, які з’являються лише на одну ніч.",
  lead: "Кожен івент має нову тему.",
  items: [
    { n: "01", word: "Нова тема" },
    { n: "02", word: "Новий вайб" },
    { n: "03", word: "Новий саунд" },
    { n: "04", word: "Нова історія" },
  ],
  close: "Ти ніколи не знаєш, що буде наступного разу. І саме в цьому весь сенс.",
};

export const quote = {
  before:
    "Ми не хочемо, щоб ти приходив просто «потусити». Ми хочемо, щоб після кожної ночі ти думав:",
  text: "«Що це, блять, було?»",
  after: "І вже чекав на наступну.",
};

export interface Night {
  slug: string;
  number: string;
  /** PENDING: the theme / world of the night. */
  name: string;
  line: string;
  date: string;
  ramp: Ramp;
  media?: MediaSource;
}

export const nights = {
  label: "Ночі",
  title: "Кожна ніч це окремий світ.",
  lead: "Те, про що краще не розповідати до початку. Після можна.",
  pastLabel: "Минулі світи",
  /* One entry per night that has happened, newest first. Empty until the
     first one (14.11); the block shows up by itself once this has entries.
     Shape of an entry:
       {
         slug: "night-01",
         number: "№ 01",
         name: "Назва світу",
         line: "Одне речення про ніч.",
         date: "14.11.2026",
         ramp: { from: "#2b1a1c", mid: "#563431", mid2: "#a26c67", to: "#f0cbc5" },
         media: { type: "image", src: "/media/night-01.jpg" },
       }
     Ramps used so far: rose (above), steel
       { from: "#161c30", mid: "#222942", mid2: "#41577b", to: "#8aa5c8" },
     silver
       { from: "#120d20", mid: "#3c3348", mid2: "#7d7480", to: "#d9d0d2" }. */
  past: [] as Night[],
  flagshipRamp: {
    from: "#120d20",
    mid: "#2c3656",
    mid2: "#8a5d5f",
    to: "#e2a59d",
  } satisfies Ramp,
};

export const aftermovie = {
  label: "Відео з ночі",
  title: "Одна ніч. Один світ. Без повторів.",
  /* PENDING: replace with a few real lines about the last night. */
  lead1: "Тут буде кілька рядків про останню ніч: що це був за світ і як він звучав.",
  lead2: "Наступний Wonderland вже десь поруч.",
  /* Reference clips for now (9:16, H.264), played back to back and looped
     as one video. Swap for the real aftermovie (one file or several); add
     `poster` for a still to show before it loads. */
  media: {
    type: "video",
    src: ["/media/ref_1.mp4", "/media/ref_2.mp4", "/media/ref_3.mp4"],
  } as MediaSource | undefined,
};

export interface GalleryItem {
  id: string;
  caption: string;
  night: string;
  media?: MediaSource;
}

export const gallery = {
  label: "Медіа",
  title: "Що там було.",
  all: "Більше в Instagram",
  /* PENDING: photos / clips. The first one runs wide. */
  items: [
    { id: "g1", night: "№ 03", caption: "Фото з ночі" },
    { id: "g2", night: "№ 03", caption: "Фото з ночі" },
    { id: "g3", night: "№ 02", caption: "Фото з ночі" },
    { id: "g4", night: "№ 02", caption: "Фото з ночі" },
    { id: "g5", night: "№ 01", caption: "Фото з ночі" },
    { id: "g6", night: "№ 01", caption: "Фото з ночі" },
    { id: "g7", night: "№ 01", caption: "Фото з ночі" },
  ] as GalleryItem[],
};

export const faq = {
  label: "Часті питання",
  title: "Питання, які ти хотів поставити.",
  items: [
    {
      q: "Що таке Wonderland?",
      a: "Місце, де кожна ніч має свій характер.",
    },
    {
      q: "Чому ви це створили?",
      a: "Нам набридло бачити одну й ту саму ніч під різними назвами.",
    },
    {
      q: "Чому кожна вечірка інша?",
      a: "Бо повторення залишимо тим, кому більше нічого придумати.",
    },
    {
      q: "Що буде цього разу?",
      a: "Новий світ. Старих сценаріїв не буде.",
    },
    {
      q: "Що я знайду всередині?",
      a: "Те, про що краще не розповідати до початку.",
    },
    {
      q: "Яка музика?",
      a: "Все залежить від ночі. Один стиль це занадто просто.",
    },
    {
      q: "Хто сюди приходить?",
      a: "Ті, кому «просто потусити» вже недостатньо.",
    },
    {
      q: "Де купити квиток?",
      a: "Квитки з’являються разом з анонсом кожної нової ночі.",
    },
    {
      q: "Де дізнатися про наступну вечірку?",
      a: "У наших соцмережах. Наступний Wonderland вже десь поруч.",
    },
    {
      q: "Що буде після?",
      a: "Наступна дата, яку ти захочеш запам’ятати.",
    },
  ],
};

export const final = {
  title: "Вітаємо у Wonderland.",
  line: "Перша ніч 14.11 на Stefana Batorego 1. Квитки онлайн від 40 zł.",
  button: "Обрати квиток",
};

export const bar = {
  strong: "Перша ніч 14.11",
  note: "Stefana Batorego 1, від 40 zł",
  button: "Квитки",
};
