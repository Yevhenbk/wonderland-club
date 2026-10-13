import type { Metadata } from "next";
import Link from "next/link";

import Shell from "@/app/components/shell";
import { faq } from "@/app/content";
import StaffForm from "@/app/staff/staff-form";
import { lastDays, report, type Report } from "@/lib/analytics";
import { CATALOG, type ItemId } from "@/lib/catalog";
import { availability, type StockMap } from "@/lib/inventory";
import { DEV_PIN, isStaff } from "@/lib/staff";
import { storeReady } from "@/lib/store";
import { stripeSales, type Sales } from "@/lib/stripe";

import styles from "./dashboard.module.scss";

export const metadata: Metadata = {
  title: "Статистика. Wonderland Club",
  robots: { index: false },
};

const RANGES = [
  { key: "1", label: "Сьогодні", days: 1 },
  { key: "7", label: "7 днів", days: 7 },
  { key: "30", label: "30 днів", days: 30 },
];

const SECTIONS: [string, string][] = [
  ["hero", "Перший екран"],
  ["atmosphere", "Відео, атмосфера"],
  ["quote", "Цитата"],
  ["nights", "Перша ніч"],
  ["expect", "Що на тебе чекає"],
  ["vip", "VIP-зона"],
  ["tickets", "Квитки і ціни"],
  ["rules", "Правила"],
  ["worlds", "Наш формат"],
  ["gallery", "Галерея"],
  ["faq", "Питання"],
  ["final", "Фінальний заклик"],
];

const CLICKS: Record<string, string> = {
  buy_standard: "«Купити» стандарт",
  buy_vip: "«Купити» VIP",
  to_tickets: "Перехід до цін",
  header_tickets: "«Квитки» в меню",
  map: "Карта (локація)",
  sound: "Звук на відео",
  faq: "Відкрили питання (до 13.10)",
  /* Each FAQ question by its own text: what visitors were looking for. */
  ...Object.fromEntries(faq.items.map((item, i) => [`faq_${i + 1}`, `Питання: ${item.q}`])),
  instagram: "Instagram",
  tiktok: "TikTok",
  telegram: "Telegram",
  terms: "Регламент",
  privacy: "Конфіденційність",
};

const SOURCES: Record<string, string> = {
  direct: "Прямий захід",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  telegram: "Telegram",
  google: "Google",
  search: "Інші пошукові",
  x: "X (Twitter)",
};

const STEPS = ["visit", "stay30", "stay120", "click_buy", "pay_start", "page:checkout", "page:home"];

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);
const num = (value: number) => new Intl.NumberFormat("uk-UA").format(Math.round(value));
const zl = (value: number) => `${num(value)} zł`;
const duration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0 с";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m ? `${m} хв ${s} с` : `${s} с`;
};

/**
 * Statistics for the organizer, behind the same PIN as the door (/staff).
 * Visits, sections and clicks come from the anonymous page statistics
 * (lib/analytics.ts); sales from Stripe, entries from the door check-ins.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ r?: string }>;
}) {
  if (!(await isStaff()))
    return (
      <Shell>
        <StaffForm
          signedIn={false}
          back="/dashboard"
          devHint={process.env.NODE_ENV !== "production" && !process.env.STAFF_PIN ? DEV_PIN : null}
        />
      </Shell>
    );

  const { r } = await searchParams;
  const range = RANGES.find((option) => option.key === r) ?? RANGES[1];
  const days = lastDays(range.days);
  const since = new Date(`${days[0]}T00:00:00+01:00`).getTime();

  let data: Report | null = null;
  let sales: Sales | null = null;
  let stock: StockMap = {};
  const problems: string[] = [];

  if (storeReady()) {
    try {
      data = await report(days, STEPS);
    } catch (error) {
      console.error("[dashboard] report failed", error);
      problems.push("Не вдалося прочитати статистику відвідувань.");
    }
  } else problems.push("Сховище не підключене (Upstash), статистика не збирається.");

  try {
    sales = await stripeSales(since);
    stock = await availability();
  } catch (error) {
    console.error("[dashboard] stripe failed", error);
    problems.push("Не вдалося прочитати продажі зі Stripe.");
  }

  const t = data?.totals ?? {};
  const u = data?.reached ?? {};
  const visitors = u.visit ?? 0;
  const paidOrders = sales?.orders ?? 0;

  const funnel: [string, number, string?][] = [
    ["Відвідали сайт", visitors],
    ["Дійшли до цін", u["sec:tickets"] ?? 0],
    ["Натиснули «Купити»", u.click_buy ?? 0],
    ["Відкрили оформлення", u["page:checkout"] ?? 0],
    ["Перейшли до оплати", u.pay_start ?? 0],
    ["Оплатили", paidOrders, "замовлень, зі Stripe"],
  ];

  const sources = Object.keys(u)
    .filter((key) => key.startsWith("src:"))
    .map((key) => [key.slice(4), u[key], t[key] ?? 0] as const)
    .sort((a, b) => b[1] - a[1]);

  const clicks = Object.keys(t)
    .filter((key) => key.startsWith("click:") && t[key] > 0)
    .map((key) => [key.slice(6), t[key]] as const)
    .sort((a, b) => b[1] - a[1]);

  const phone = u["dev:phone"] ?? 0;
  const desktop = u["dev:desktop"] ?? 0;

  return (
    <Shell wide>
      <div className={styles.board}>
        <header className={styles.top}>
          <div>
            <p className={styles.kicker}>Статистика</p>
            <h1 className={styles.title}>Як іде продаж</h1>
          </div>
          <nav className={styles.ranges} aria-label="Період">
            {RANGES.map((option) => (
              <Link
                key={option.key}
                href={`/dashboard?r=${option.key}`}
                className={styles.range}
                data-active={option === range || undefined}
              >
                {option.label}
              </Link>
            ))}
          </nav>
        </header>

        {problems.map((problem) => (
          <p key={problem} className={styles.problem}>
            {problem}
          </p>
        ))}

        {/* ------------------------------------------------- headline */}
        <section className={styles.tiles}>
          <Tile label="Відвідувачі" value={num(visitors)} note={`${num(t.pv ?? 0)} переглядів сторінок`} />
          <Tile
            label="Середній час на сторінці"
            value={duration((t.time ?? 0) / Math.max(1, t.pv ?? 0))}
            note={`${pct(u.stay30 ?? 0, visitors)}% залишились 30+ с`}
          />
          <Tile
            label="Натиснули «Купити»"
            value={num(u.click_buy ?? 0)}
            note={`${pct(u.click_buy ?? 0, visitors)}% відвідувачів`}
          />
          <Tile label="Перейшли до оплати" value={num(u.pay_start ?? 0)} note="відкрили сторінку оплати" />
          <Tile
            label="Продано квитків"
            value={num(sales?.tickets ?? 0)}
            note={`${num(paidOrders)} замовлень`}
            accent
          />
          <Tile label="Виручка" value={zl(sales?.revenue ?? 0)} note="оплачено через Stripe" accent />
          <Tile label="Пройшли на вході" value={num(t.door ?? 0)} note="відмічено на дверях" />
          <Tile
            label="Телефон / комп'ютер"
            value={`${pct(phone, phone + desktop)}% / ${pct(desktop, phone + desktop)}%`}
            note="частка відвідувачів"
          />
        </section>

        {/* ---------------------------------------------------- funnel */}
        <section className={styles.card}>
          <h2 className={styles.h2}>Шлях до покупки</h2>
          <p className={styles.sub}>Скільки людей дійшло до кожного кроку. Відсоток від усіх відвідувачів.</p>
          <ol className={styles.funnel}>
            {funnel.map(([label, value, note], index) => {
              const previous = index ? funnel[index - 1][1] : 0;
              return (
                <li key={label}>
                  <div className={styles.funnelHead}>
                    <span>{label}</span>
                    <strong>
                      {num(value)}
                      {note && <em> {note}</em>}
                    </strong>
                  </div>
                  <div className={styles.bar} title={`${label}: ${num(value)}`}>
                    <span style={{ width: `${Math.max(value ? 1.5 : 0, pct(value, visitors))}%` }} />
                  </div>
                  <div className={styles.funnelFoot}>
                    {pct(value, visitors)}% від відвідувачів
                    {index > 0 && previous > 0 && <>, {pct(value, previous)}% з попереднього кроку</>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ----------------------------------------------- daily chart */}
        {range.days > 1 && data && (
          <section className={styles.card}>
            <h2 className={styles.h2}>Відвідувачі по днях</h2>
            <div className={styles.chartScroll}>
              <DailyBars days={days} values={data.visitorsByDay} />
            </div>
          </section>
        )}

        <div className={styles.split}>
          {/* ------------------------------------------- sections */}
          <section className={styles.card}>
            <h2 className={styles.h2}>Що подивились</h2>
            <p className={styles.sub}>Частка відвідувачів, які догортали до розділу.</p>
            <ul className={styles.rows}>
              {SECTIONS.map(([id, label]) => {
                const seen = u[`sec:${id}`] ?? 0;
                return (
                  <li key={id} title={`${label}: ${num(seen)} людей`}>
                    <span className={styles.rowLabel}>{label}</span>
                    <span className={styles.rowBar}>
                      <span style={{ width: `${pct(seen, visitors)}%` }} />
                    </span>
                    <span className={styles.rowValue}>{pct(seen, visitors)}%</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className={styles.stack}>
            {/* --------------------------------------- sources */}
            <section className={styles.card}>
              <h2 className={styles.h2}>Звідки прийшли</h2>
              {sources.length ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Джерело</th>
                      <th>Людей</th>
                      <th>Візитів</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map(([source, people, visits]) => (
                      <tr key={source}>
                        <td>{SOURCES[source] ?? source}</td>
                        <td>{num(people)}</td>
                        <td>{num(visits)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.empty}>Ще немає даних.</p>
              )}
              <p className={styles.hint}>
                Щоб бачити рекламу окремо, додай до посилання <code>?utm_source=insta_ad</code>.
              </p>
            </section>

            {/* ---------------------------------------- clicks */}
            <section className={styles.card}>
              <h2 className={styles.h2}>Що натискали</h2>
              {clicks.length ? (
                <table className={styles.table}>
                  <tbody>
                    {clicks.map(([name, value]) => (
                      <tr key={name}>
                        <td>{CLICKS[name] ?? name}</td>
                        <td>{num(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.empty}>Ще немає даних.</p>
              )}
            </section>
          </div>
        </div>

        {/* ----------------------------------------------------- sales */}
        <section className={styles.card}>
          <h2 className={styles.h2}>Продажі за період</h2>
          {sales ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Квиток</th>
                  <th>Продано</th>
                  <th>Виручка</th>
                  <th>Залишилось</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(CATALOG) as ItemId[]).map((id) => {
                  const row = sales!.byItem[id];
                  const left = stock[id];
                  return (
                    <tr key={id}>
                      <td>
                        {CATALOG[id].name}: {CATALOG[id].detail}
                      </td>
                      <td>{num(row?.tickets ?? 0)}</td>
                      <td>{zl(row?.revenue ?? 0)}</td>
                      <td>{left ? `${left.left} з ${left.total}` : "без ліміту"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className={styles.empty}>Stripe не підключений.</p>
          )}
        </section>

        <p className={styles.footnote}>
          Статистика анонімна: без cookies, з добовим анонімним ідентифікатором, без IP-адрес.
          Боти і телефони персоналу не враховуються. Продажі беруться напряму зі Stripe.
        </p>
      </div>
    </Shell>
  );
}

function Tile({ label, value, note, accent }: { label: string; value: string; note: string; accent?: boolean }) {
  return (
    <div className={styles.tile} data-accent={accent || undefined}>
      <span className={styles.tileLabel}>{label}</span>
      <span className={styles.tileValue}>{value}</span>
      <span className={styles.tileNote}>{note}</span>
    </div>
  );
}

/* One series, so one colour: bars from a zero baseline, the busiest day and
   today labelled, every bar's value on hover. */
function DailyBars({ days, values }: { days: string[]; values: number[] }) {
  const width = 640;
  const height = 170;
  const top = 22;
  const bottom = 26;
  const max = Math.max(1, ...values);
  const slot = width / values.length;
  const bar = Math.max(4, Math.min(28, slot - 4));
  const peak = values.indexOf(Math.max(...values));
  const label = (day: string) => `${day.slice(8)}.${day.slice(5, 7)}`;
  const every = Math.ceil(values.length / 8);

  return (
    <svg className={styles.chart} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Відвідувачі по днях">
      <line x1="0" x2={width} y1={height - bottom} y2={height - bottom} className={styles.axis} />
      {values.map((value, i) => {
        const h = ((height - top - bottom) * value) / max;
        const x = i * slot + (slot - bar) / 2;
        const y = height - bottom - h;
        const showValue = value > 0 && (i === peak || i === values.length - 1);
        return (
          <g key={days[i]}>
            <rect x={i * slot} y={0} width={slot} height={height} className={styles.hit}>
              <title>{`${label(days[i])}: ${value} відвідувачів`}</title>
            </rect>
            {value > 0 && <rect x={x} y={y} width={bar} height={h} rx={Math.min(4, bar / 2)} className={styles.col} />}
            {showValue && (
              <text x={x + bar / 2} y={y - 6} textAnchor="middle" className={styles.colValue}>
                {value}
              </text>
            )}
            {(i % every === 0 || i === values.length - 1) && (
              <text x={x + bar / 2} y={height - 8} textAnchor="middle" className={styles.colLabel}>
                {label(days[i])}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
