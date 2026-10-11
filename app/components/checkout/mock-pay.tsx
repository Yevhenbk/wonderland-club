"use client";

import { useState } from "react";

import styles from "./checkout.module.scss";
import Price from "../price";

interface Summary {
  event: string;
  ticket: string;
  qty: number | null;
  email: string;
  total: number;
  backHref: string;
}

/**
 * Step two, standing in for Stripe's hosted checkout page.
 *
 * It deliberately asks for no card details. Real Stripe Checkout collects
 * the card on Stripe's own page, so this site never needs a card form, and
 * a fake one could lead a visitor to type a real card number into it. The
 * button simply confirms, as a successful payment would.
 */
export default function MockPay({
  token,
  summary,
  expired = false,
}: {
  token?: string;
  summary?: Summary;
  expired?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (expired || !token || !summary)
    return (
      <div className={styles.card}>
        <p className={styles.eyebrow}>Оплата</p>
        <h1 className={styles.title}>Час на оплату вийшов</h1>
        <p className={styles.meta}>
          Сесія оплати діє 30 хвилин. Обери квиток ще раз, це займе хвилину.
        </p>
        <a href="/checkout" className={`${styles.pay} ${styles.payLink}`}>
          До вибору квитка
        </a>
      </div>
    );

  const pay = async () => {
    setBusy(true);
    setError("");
    try {
      /* A short pause, as a real payment takes a moment. */
      await new Promise((resolve) => setTimeout(resolve, 900));
      const response = await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ s: token }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Оплата не пройшла.");
      window.location.assign(data.url);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Оплата не пройшла.");
      setBusy(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.testBanner} role="note">
        <span className={styles.testBadge}>Тест</span>
        <span>
          Тестовий режим: оплата імітується, гроші не списуються і дані картки
          не потрібні.
        </span>
      </div>

      <p className={styles.eyebrow}>Оплата</p>
      <h1 className={styles.title}>
        <Price value={summary.total} />
      </h1>

      <dl className={styles.lines}>
        <div>
          <dt>Подія</dt>
          <dd>{summary.event}</dd>
        </div>
        <div>
          <dt>Квиток</dt>
          <dd>{summary.ticket}</dd>
        </div>
        {summary.qty !== null && (
          <div>
            <dt>Кількість</dt>
            <dd>{summary.qty}</dd>
          </div>
        )}
        <div>
          <dt>Квитки на</dt>
          <dd>{summary.email}</dd>
        </div>
      </dl>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="button" className={styles.pay} onClick={pay} disabled={busy}>
        {busy ? (
          <span className={styles.processing}>
            <span className={styles.spinner} aria-hidden="true" />
            Обробка оплати…
          </span>
        ) : (
          `Оплатити ${summary.total} zł`
        )}
      </button>

      <a href={summary.backHref} className={styles.secondary}>
        Змінити замовлення
      </a>
    </div>
  );
}
