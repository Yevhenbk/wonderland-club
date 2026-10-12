"use client";

import { useState, type FormEvent } from "react";

import styles from "@/app/components/checkout/checkout.module.scss";

export default function StaffForm({
  signedIn,
  back,
  devHint,
}: {
  signedIn: boolean;
  back: string | null;
  /** The development PIN, shown only locally. */
  devHint: string | null;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const call = async (method: "POST" | "DELETE", body?: object) => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/staff", {
        method,
        headers: { "content-type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Щось пішло не так.");
      window.location.assign(method === "POST" ? (back ?? "/staff") : "/staff");
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Щось пішло не так.");
      setBusy(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    call("POST", { pin });
  };

  if (signedIn)
    return (
      <div className={styles.card}>
        <p className={styles.eyebrow}>Персонал</p>
        <h1 className={styles.title}>Ти на вході</h1>
        <p className={styles.meta}>
          Скануй QR-код квитка камерою телефона. На сторінці квитка буде кнопка
          «Впустити». Кожен квиток проходить один раз.
        </p>
        {back && (
          <a href={back} className={`${styles.pay} ${styles.payLink}`}>
            Назад до квитка
          </a>
        )}
        <button
          type="button"
          className={styles.secondary}
          onClick={() => call("DELETE")}
          disabled={busy}
        >
          Вийти
        </button>
      </div>
    );

  return (
    <form className={styles.card} onSubmit={submit} noValidate>
      <p className={styles.eyebrow}>Персонал</p>
      <h1 className={styles.title}>Вхід для персоналу</h1>
      <p className={styles.meta}>Один раз на телефон, на всю ніч.</p>

      <label className={styles.field}>
        <span className={styles.legend}>PIN</span>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          required
          autoFocus
          value={pin}
          onChange={(change) => setPin(change.target.value)}
        />
        {devHint && (
          <span className={styles.help}>Локально PIN: {devHint}</span>
        )}
      </label>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={styles.pay} disabled={busy || !pin}>
        {busy ? "Зачекай…" : "Увійти"}
      </button>
    </form>
  );
}
