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
  /* `position` is the CSS object-position for the crop, e.g. "50% 30%"
     to keep faces in a tall photo shown in a shorter frame. */
  | { type: "image"; src: string; alt?: string; position?: string }
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
/**
 * Tickets sold directly (to friends, by hand), before or outside the site.
 * UPDATE BY HAND when tickets are sold directly. The site shows this plus
 * every ticket paid online (from Stripe): "Вже продано 21 квиток".
 */
export const soldOffline = 21;

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
  /* One tap to Stripe's payment page for a standard ticket (app/buy). */
  cta: "Купити квиток, 40 zł",
  ctaHref: "/buy?item=standard",
  /* The deadline, under the card, after the sold count (soldOffline). */
  note: "Онлайн 40 zł до 31.10, потім дорожче. На вході 50 zł.",
};

/** A ticket that can be bought online. `id` is what checkout and the passes
    refer to; `price` (zł) is what the server charges, never the browser. */
export interface SellableTier {
  id: "standard" | "vip-4-5" | "vip-6-8" | "vip-8-10";
  k: string;
  price: number;
  best?: boolean;
  /** How many exist, for tickets that run out (each VIP zone is one). */
  stock?: number;
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
      /* EARLY BIRD: 40 zł until 31.10. On 1.11 the online price must
         really rise (a new Stripe price of 45 zł in STRIPE_PRICE_STANDARD,
         and this tier's price), or the deadline is not true. */
      { id: "standard", k: "Онлайн до 31.10", price: 40, best: true },
      { k: "Онлайн з 1.11", price: 45 },
      { k: "На вході", price: 50 },
    ] as (SellableTier | DoorTier)[],
    /* Follows the sold count (components/sold-count.tsx). */
    note: "З 1 листопада онлайн-квиток дорожчає.",
    buyItem: "standard" as SellableTier["id"],
  },
  vip: {
    eyebrow: "VIP-зона",
    name: "Твоя компанія. Твій простір.",
    /* One purchase is a whole zone, whatever the number of people in it.
       `stock` is how many zones of each size there are; a sold zone is
       locked for everyone else (lib/inventory.ts). */
    tiers: [
      { id: "vip-4-5", k: "4-5 людей", price: 290, stock: 2 },
      { id: "vip-6-8", k: "6-8 людей", price: 420, stock: 1 },
      { id: "vip-8-10", k: "8-10 людей", price: 650, stock: 2 },
    ] as (SellableTier | DoorTier)[],
    note: "Ціна за всю зону, а не за людину. Зон лише п’ять.",
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
  /* On a phone the paragraph comes after the quote, so it cannot end on
     "ти думав:"; this version follows the quote instead of leading to it.
     Worded so its lines nearly fill the quote's width on their own, which
     keeps the gaps small when they are spread to the edges. */
  afterPhone:
    "Саме це ти маєш думати вранці після Wonderland. Ми тут не для того, щоб просто потусити, а щоб ти прожив ніч, яку не забудеш.",
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
  /* On a phone the two paragraphs above become this one: the same night in
     two lines (the date is already in the label). */
  leadPhone: "Ніч без правил, де кожен трек звучить як останній. Важкі баси, дим і стробоскопи до самого ранку.",
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
  includesTitle: "Що входить у вартість?",
  includes: [
    "VIP-зона з комфортними місцями для твоєї компанії",
    "Окремий простір для відпочинку та тусовки",
    "VIP-браслети для всіх гостей компанії",
    "Найкраще місце, щоб насолодитися музикою, димом і хаосом цієї ночі",
    "Особлива атмосфера WONDERLAND.KRK",
  ],
  note: "Одна покупка, вся зона для твоєї компанії. Кількість зон обмежена.",
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

/* The first night is still ahead, so this is a mood piece, not a recap:
   the clips set the tone for what 14.11 will feel like. */
export const aftermovie = {
  label: "Атмосфера",
  title: "Одна ніч. Один світ. Без повторів.",
  lead1: "Важкі баси, світло на межі реальності й люди, які прийшли не спостерігати, а бути частиною подій.",
  lead2: "14 листопада Краків стане частиною Wonderland.",
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
  /** What the photo shows, in a word: "Сцена", "Бар"... */
  tag: string;
  /** The lead photo's width / height, so its frame shows it whole. */
  frame?: string;
  caption: string;
  media?: MediaSource;
}

/* The mood of the night, space by space. The first item runs wide; on a
   phone only the first three show. Swap in photos from the night itself
   once there are some. */
export const gallery = {
  label: "Медіа",
  title: "Атмосфера, заради якої варто прийти.",
  items: [
    {
      id: "stage",
      tag: "Сцена",
      frame: "1280 / 790",
      caption: "Музика, що задає ритм до самого ранку",
      media: { type: "image", src: "/media/pic_main.jpg", alt: "Діджей за пультом, натовп у світлі й диму", position: "50% 45%" },
    },
    {
      id: "vip",
      tag: "VIP-зона",
      caption: "Твоя компанія, твій простір",
      media: { type: "image", src: "/media/pic_3.jpg", alt: "Компанія піднімає келихи, пляшка з бенгальським вогнем", position: "50% 40%" },
    },
    {
      id: "floor",
      tag: "Танцпол",
      caption: "Ніч, яка не дає стояти на місці",
      media: { type: "image", src: "/media/pic_4.jpg", alt: "Натовп на танцполі під мильними бульбашками", position: "50% 45%" },
    },
    {
      id: "bar",
      tag: "Бар",
      caption: "Напої до самого фіналу",
      media: { type: "image", src: "/media/pic_bar.jpg", alt: "Бармен готує напій за барною стійкою", position: "65% 50%" },
    },
    {
      id: "show",
      tag: "Шоу",
      caption: "Світло й атмосфера на межі реальності",
      media: { type: "image", src: "/media/pic_2.jpg", alt: "Світлове шоу, гість знімає сцену на телефон", position: "52% 50%" },
    },
    {
      id: "people",
      tag: "Люди",
      caption: "Ті, хто прийшов бути частиною подій",
      media: { type: "image", src: "/media/pic_1.jpg", alt: "Гостя в темному образі серед натовпу", position: "55% 35%" },
    },
    {
      id: "evening",
      tag: "Знайомства",
      caption: "Нові знайомства й спогади після фіналу",
      media: { type: "image", src: "/media/pic_5.jpg", alt: "Дві гості позують на тлі неонового світла", position: "50% 28%" },
    },
  ] as GalleryItem[],
};

export const faq = {
  label: "Часті питання",
  title: "Питання, які ти хотів поставити.",
  /* Practical answers in the night's voice: the dashboard showed visitors
     opening the questions more than anything else, looking for facts. */
  items: [
    {
      q: "Що таке Wonderland?",
      a: "Клубні ночі в Кракові з різними темами, музикою та атмосферою. Кожна подія це окрема історія.",
    },
    {
      q: "Як одягатися на Wonderland?",
      a: "Наче завтра кінець світу. Хоч у спортивках, хоч у total black.",
    },
    {
      q: "Яка музика?",
      a: "Реп, хіп-хоп, треп і рейдж. У кожної ночі свій саунд, а 14.11 звучатиме кінець світу.",
    },
    {
      q: "Коли і де перша ніч?",
      a: "14 листопада, субота, з 22:00 до 04:00. Клуб SNY, Stefana Batorego 1, Краків.",
    },
    {
      q: "Де купити квиток?",
      a: "Тут, на сайті: 40 zł до 31.10, з 1 листопада 45 zł. Оплата карткою, BLIK, Apple Pay або Google Pay, квиток з QR-кодом одразу приходить на пошту.",
    },
    {
      q: "Чи можна купити квиток на вході?",
      a: "Так, на вході квиток коштує 50 zł. Онлайн дешевше, і місце вже твоє.",
    },
    {
      q: "Чи є вікові обмеження?",
      a: "Вхід лише 18+. Візьми документ з фото: на вході можуть попросити.",
    },
    {
      q: "Що таке VIP-зона?",
      a: "Окрема зона для твоєї компанії на 4-5, 6-8 або 8-10 людей, з VIP-браслетами для всіх. Купується цілком, а не за людину, і таких зон лише п’ять.",
    },
    {
      q: "Чи можна повернути квиток?",
      a: "Квитки не повертаються. Якщо ніч скасують, повернемо повну вартість.",
    },
    {
      q: "Хто сюди приходить?",
      a: "Ті, кому «просто потусити» вже недостатньо.",
    },
  ],
};

export const final = {
  title: "Вітаємо у Wonderland.",
  line: "Кінець це лише початок. Перша ніч 14.11 на Stefana Batorego 1, квитки онлайн від 40 zł.",
  button: "Обрати квиток",
};
