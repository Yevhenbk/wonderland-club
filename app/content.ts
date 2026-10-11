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

/* The desktop navbar's links. Absolute ("/#..."), so they also work from
   the checkout and ticket pages. Phones show the logo alone. */
export const nav = [
  { href: "/#nights", label: "Ночі" },
  { href: "/#tickets", label: "Квитки" },
  { href: "/#rules", label: "Правила" },
  { href: "/#gallery", label: "Медіа" },
  { href: "/#faq", label: "Питання" },
];

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

/* The first night: 14.11.2026, a Saturday, 22:00 to 04:00. Its world is
   "The End of the World", set here in Ukrainian as the rest of the page. */
export const nextNight = {
  /** Used on the passes and in the ticket email. */
  eventId: "wl-2026-11-14",
  dateLong: "14.11.2026, субота",
  time: "22:00-04:00",
  label: "Перша ніч",
  number: "№ 01",
  theme: "Кінець світу",
  rows: [
    { k: "Дата", v: "14.11, субота" },
    { k: "Час", v: "22:00-04:00" },
    /* The city is shown on wider screens only; on a phone the street says it. */
    { k: "Локація", v: venue.address, wide: `, ${venue.city}`, href: venue.mapsHref },
    { k: "Саунд", v: "Реп, хіп-хоп, треп, рейдж" },
  ] as { k: string; v: string; wide?: string; href?: string }[],
  /* The calls about the night lead to the prices; buying starts there. */
  cta: "Купити квиток",
  ctaHref: "#tickets",
  note: "Квиток онлайн 40 zł, на вході 50 zł.",
};

/** A ticket that can be bought online. `id` is what checkout and the passes
    refer to; `price` (zł) is what the server charges, never the browser. */
export interface SellableTier {
  id: "standard" | "vip-4-5" | "vip-6-8" | "vip-10";
  k: string;
  price: number;
  best?: boolean;
}

/** A price that is shown but not sold online (paid at the door). */
export interface DoorTier {
  k: string;
  price: number;
}

/* Prices exactly as announced. VIP prices are for the whole group. */
export const tickets = {
  label: "Квитки",
  title: "Обери свій вхід у Wonderland.",
  lead: "Онлайн дешевше. На компанію ще вигідніше.",
  standard: {
    eyebrow: "Стандарт",
    name: "Вхідний квиток",
    tiers: [
      { id: "standard", k: "Онлайн", price: 40, best: true },
      { k: "На вході", price: 50 },
    ] as (SellableTier | DoorTier)[],
    note: "Купуй онлайн і заощадь 10 zł.",
    buyItem: "standard" as SellableTier["id"],
  },
  vip: {
    eyebrow: "VIP-зона",
    name: "Твоя компанія. Твій простір.",
    /* PENDING: booking details and access conditions ("незабаром"). */
    tiers: [
      { id: "vip-4-5", k: "4-5 людей", price: 290 },
      { id: "vip-6-8", k: "6-8 людей", price: 420 },
      { id: "vip-10", k: "10+ людей", price: 650 },
    ] as (SellableTier | DoorTier)[],
    note: "Ціна за всю компанію. Деталі бронювання незабаром.",
    buyItem: "vip-4-5" as SellableTier["id"],
  },
  cta: "Купити",
  checkoutPath: "/checkout",
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

/* The night's own story: the "Ночі" section tells it around the night card. */
export const nights = {
  label: "14.11. Краків. 22:00-04:00",
  title: "Світ не закінчиться сам. Ми влаштуємо йому фінал.",
  lead: "14 листопада Краків зануриться в ніч, де не існує правил, завтра не гарантоване, а кожен трек звучить так, ніби це останній раз.",
  lead2: "Темна атмосфера. Важкі баси. Дим, стробоскопи та музика, яка не дає стояти на місці.",
  close: [
    "Це не просто вечірка. Це ніч перед кінцем усього, що ти знаєш.",
    "Забудь про завтра. Залиш усе за дверима. Проживи цю ніч так, ніби іншої вже не буде.",
  ],
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

/* What the first night holds. Keep an even number of items: the tiles sit
   four, two or one across, so an odd count leaves one alone on its row.
   (The VIP point lives in its own section right after this one.) */
export const expect = {
  label: "Що на тебе чекає?",
  title: "Твоя остання ніч за звичними правилами.",
  lead: "Цієї ночі Краків стане частиною Wonderland.",
  items: [
    "Реп, хіп-хоп, треп і рейдж, що задають ритм до самого ранку.",
    "Темна естетика, світло й атмосфера на межі реальності.",
    "Люди, які прийшли не спостерігати, а бути частиною подій.",
    "Нові знайомства, несподівані моменти та спогади, які залишаться після фіналу.",
  ],
  close: "Ти не просто приходиш на вечірку. Ти стаєш частиною історії Wonderland.",
};

/* The VIP pitch, just before the prices. */
export const vip = {
  label: "VIP-зона",
  title: "Не всі зустрічають кінець світу однаково.",
  lead: "Поки танцпол поглинає хаос, є місце для тих, хто хоче прожити цю ніч по-своєму.",
  trio: ["Твоя компанія.", "Твій простір.", "Твоя ніч."],
  body: "Без зайвих пояснень. Без випадкових людей за твоїм столом. Лише ти, твої люди та атмосфера, заради якої варто було прийти.",
  highlight: "VIP Wonderland: ти ближче до епіцентру.",
  note: "Деталі бронювання та умови доступу незабаром.",
  cta: "Ціни на VIP",
  ctaHref: "#tickets",
};

/* The house rules. */
export const rules = {
  label: "Правила",
  title: "У кінця світу є свої правила.",
  items: [
    "Залиш буденність за дверима.",
    "Не бійся бути собою. Тут не потрібно нікому нічого доводити.",
    "Поважай тих, хто поруч. Свобода одного закінчується там, де починається дискомфорт іншого.",
    "Жодної зайвої драми. Ми прийшли створювати спогади.",
    "Не чекай слушного моменту. Створи його сам.",
  ],
  close: "Одна ніч. Свій світ. Свої правила.",
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
  line: "Кінець це лише початок. Перша ніч 14.11 на Stefana Batorego 1, квитки онлайн від 40 zł.",
  button: "Обрати квиток",
};
