"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { nextNight, tickets as ticketPlans, venue, type SellableTier } from "@/app/content";
import logo from "@/public/media/wonderland-wordmark.png";

import Price from "./price";
import SoldCount from "./sold-count";
import { useStock } from "./vip-stock";
import styles from "./hero-ticket.module.scss";

const standard = ticketPlans.standard.tiers.find((tier): tier is SellableTier => "id" in tier)!;
const vipTiers = ticketPlans.vip.tiers.filter((tier): tier is SellableTier => "id" in tier);

/**
 * The hero's ticket: a preview of the pass a buyer gets, stretched to the
 * height of the first screen. The upper part is the night, the stub under
 * the perforation is the price and the call. Tapping the ticket opens the
 * purchase sheet (a native <dialog>, so focus, Escape and the backdrop come
 * for free): standard straight to Stripe, or a VIP zone through the form.
 *
 * A foil shine runs across it now and then (a transform, so no repaint);
 * it stops for reduced motion. The ticket itself holds still.
 */
export default function HeroTicket({ extra }: { extra?: ReactNode }) {
  const sheet = useRef<HTMLDialogElement>(null);
  const stock = useStock();
  const [open, setOpen] = useState(false);

  const show = () => {
    sheet.current?.showModal();
    setOpen(true);
  };
  /* Closing plays the opening backwards: the sheet sinks and fades with
     its backdrop, and the dialog is closed once that has finished. */
  const hide = () => {
    const dialog = sheet.current;
    if (!dialog?.open || dialog.dataset.closing) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return dialog.close();
    dialog.dataset.closing = "true";
    const body = dialog.firstElementChild as HTMLElement | null;
    const done = () => {
      delete dialog.dataset.closing;
      dialog.close();
    };
    if (!body) return done();
    body.addEventListener("animationend", done, { once: true });
    /* In case the animation never reports its end (a hidden tab). */
    window.setTimeout(() => dialog.dataset.closing && done(), 600);
  };

  useEffect(() => {
    const dialog = sheet.current;
    const onClose = () => setOpen(false);
    /* Escape closes the same animated way instead of at once. */
    const onCancel = (event: Event) => {
      event.preventDefault();
      hide();
    };
    dialog?.addEventListener("close", onClose);
    dialog?.addEventListener("cancel", onCancel);
    return () => {
      dialog?.removeEventListener("close", onClose);
      dialog?.removeEventListener("cancel", onCancel);
    };
  }, []);

  return (
    <>
      <div
        className={styles.ticket}
        onClick={(event) => {
          /* The map link keeps its own job; anywhere else opens the sheet. */
          if (!(event.target as Element).closest("a")) show();
        }}
      >
        {/* Seasonal decoration sitting on the ticket (a Halloween pumpkin). */}
        {extra && <span className={styles.extra}>{extra}</span>}

        <div className={styles.top}>
          <span className={styles.foil} aria-hidden="true" />
          <div className={styles.head}>
            <Image src={logo} alt="Wonderland Club" className={styles.logo} sizes="160px" priority />
            <span className={styles.admit}>Квиток</span>
          </div>

          <div className={styles.night}>
            <p className={styles.eyebrow}>
              {nextNight.label} {nextNight.number}
            </p>
            <p className={styles.theme}>{nextNight.theme}</p>
          </div>

          <dl className={styles.rows}>
            {nextNight.rows.map((row) => (
              <div key={row.k}>
                <dt>{row.k}</dt>
                <dd>
                  {row.href ? (
                    <a href={row.href} target="_blank" rel="noopener noreferrer">
                      {row.v}
                    </a>
                  ) : (
                    row.v
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={styles.stub}>
          <div className={styles.stubInfo}>
            <span className={styles.from}>
              від <Price value={standard.price} />
            </span>
            <span className={styles.sold}>
              <SoldCount />
            </span>
          </div>
          <button type="button" className={styles.buy} onClick={show} data-track="ticket_open" aria-haspopup="dialog">
            Купити квиток
          </button>
        </div>
      </div>

      <dialog
        ref={sheet}
        className={styles.sheet}
        aria-labelledby="buy-title"
        onClick={(event) => {
          /* A click on the backdrop lands on the dialog itself. */
          if (event.target === sheet.current) hide();
        }}
      >
        <div className={styles.sheetBody} data-open={open || undefined}>
          <div className={styles.sheetHead}>
            <div>
              <p className={styles.eyebrow}>
                {nextNight.label} {nextNight.number}. {nextNight.theme}
              </p>
              <h2 id="buy-title" className={styles.sheetTitle}>
                Обери свій вхід
              </h2>
            </div>
            <button type="button" className={styles.close} onClick={hide} aria-label="Закрити">
              ✕
            </button>
          </div>

          <a href={`/buy?item=${standard.id}`} className={styles.option} data-best>
            <span className={styles.optionText}>
              <span className={styles.optionName}>{ticketPlans.standard.eyebrow}</span>
              <span className={styles.optionDetail}>Вхід для однієї особи. {standard.k}</span>
            </span>
            <span className={styles.optionPrice}>
              <Price value={standard.price} />
            </span>
          </a>

          <p className={styles.group}>{ticketPlans.vip.eyebrow}: ціна за всю зону</p>
          {vipTiers.map((tier) => {
            const left = stock?.[tier.id];
            const out = left?.left === 0;
            return out ? (
              <span key={tier.id} className={styles.option} data-out>
                <span className={styles.optionText}>
                  <span className={styles.optionName}>{tier.k}</span>
                  <span className={styles.optionDetail}>Розпродано</span>
                </span>
                <span className={styles.optionPrice}>
                  <Price value={tier.price} />
                </span>
              </span>
            ) : (
              <a key={tier.id} href={`/checkout?item=${tier.id}`} className={styles.option}>
                <span className={styles.optionText}>
                  <span className={styles.optionName}>{tier.k}</span>
                  <span className={styles.optionDetail}>
                    {left ? `Залишилось ${left.left} з ${left.total}` : "Окрема зона для компанії"}
                  </span>
                </span>
                <span className={styles.optionPrice}>
                  <Price value={tier.price} />
                </span>
              </a>
            );
          })}

          <p className={styles.sheetNote}>
            <strong>
              <SoldCount />.
            </strong>{" "}
            {nextNight.note} Картка, BLIK, Apple Pay або Google Pay; квиток з QR-кодом одразу на
            пошту. {venue.address}, {venue.city}.
          </p>
        </div>
      </dialog>
    </>
  );
}
