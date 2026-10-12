"use client";

import { useState, type FormEvent } from "react";

import type { CatalogItem, EVENT, ItemId } from "@/lib/catalog";
import type { StockMap } from "@/lib/inventory";

import Wide from "../wide";
import styles from "./checkout.module.scss";
import Price from "../price";
import { stockLabel } from "../stock-label";

/**
 * Step one: which ticket, how many, and where to send it.
 *
 * The total shown here is only a preview. The server works the price out
 * again from its own catalogue and never uses a number sent from here.
 */
export default function CheckoutForm({
  items,
  initialItem,
  event,
  stock,
}: {
  items: CatalogItem[];
  initialItem: ItemId;
  event: typeof EVENT;
  /** VIP zones left; a size with none is shown but cannot be chosen. */
  stock: StockMap;
}) {
  const [itemId, setItemId] = useState<ItemId>(initialItem);
  const [qty, setQty] = useState(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const item = items.find((candidate) => candidate.id === itemId) ?? items[0];
  const quantity = Math.min(qty, item.maxQty);
  const total = item.price * quantity;

  const choose = (id: ItemId) => {
    setItemId(id);
    setQty(1);
  };

  const submit = async (formEvent: FormEvent) => {
    formEvent.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ item: item.id, qty: quantity, email, name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Щось пішло не так.");
      window.location.assign(data.url);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Щось пішло не так.");
      setBusy(false);
    }
  };

  return (
    <form className={styles.card} onSubmit={submit} noValidate>
      <p className={styles.eyebrow}>
        {event.title}. {event.theme}
      </p>
      <h1 className={styles.title}>Квитки на Wonderland</h1>
      <p className={styles.meta}>
        {event.date}, {event.time}
        <br />
        {event.venueStreet}
        <Wide>, {event.venueCity}</Wide>
      </p>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Квиток</legend>
        <div className={styles.options}>
          {items.map((option) => {
            const left = stockLabel(stock[option.id]);
            const out = stock[option.id]?.left === 0;
            return (
              <label
                key={option.id}
                className={styles.option}
                data-selected={option.id === itemId || undefined}
                data-out={out || undefined}
              >
                <input
                  type="radio"
                  name="item"
                  value={option.id}
                  checked={option.id === itemId}
                  onChange={() => choose(option.id)}
                  disabled={out}
                  className={styles.radio}
                />
                <span className={styles.optionText}>
                  <span className={styles.optionName}>{option.name}</span>
                  <span className={styles.optionDetail}>
                    {option.detail}
                    {left && <span className={styles.optionStock}>{left}</span>}
                  </span>
                </span>
                <span className={styles.optionPrice}>
                  <Price value={option.price} />
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {item.maxQty > 1 && (
        <div className={styles.qtyRow}>
          <span className={styles.legend} id="qty-label">
            Кількість
          </span>
          <div className={styles.stepper} role="group" aria-labelledby="qty-label">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              aria-label="Менше"
            >
              −
            </button>
            <output aria-live="polite">{quantity}</output>
            <button
              type="button"
              onClick={() => setQty(Math.min(item.maxQty, quantity + 1))}
              disabled={quantity >= item.maxQty}
              aria-label="Більше"
            >
              +
            </button>
          </div>
        </div>
      )}

      <label className={styles.field}>
        <span className={styles.legend}>Email</span>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="ти@приклад.com"
          value={email}
          onChange={(change) => setEmail(change.target.value)}
        />
        <span className={styles.help}>Сюди прийдуть квитки з QR-кодом.</span>
      </label>

      <label className={styles.field}>
        <span className={styles.legend}>
          Ім&apos;я <span className={styles.optional}>(необов&apos;язково)</span>
        </span>
        <input
          type="text"
          autoComplete="name"
          maxLength={60}
          placeholder="Як тебе звати"
          value={name}
          onChange={(change) => setName(change.target.value)}
        />
        <span className={styles.help}>З&apos;явиться на квитку.</span>
      </label>

      <div className={styles.summary}>
        <span>
          {item.name}: {item.detail}
          {item.maxQty > 1 && ` × ${quantity}`}
        </span>
        <strong>
          <Price value={total} />
        </strong>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={styles.pay} disabled={busy}>
        {busy ? "Зачекай…" : `Перейти до оплати, ${total} zł`}
      </button>
    </form>
  );
}
