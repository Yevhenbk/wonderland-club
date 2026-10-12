"use client";

import { useState, type ReactNode } from "react";

import styles from "@/app/verify/[token]/verify.module.scss";

type State =
  | { kind: "valid" }
  /* Let in just now, from this phone: green, with a way to take it back. */
  | { kind: "in"; at: number }
  /* Came in before: red. A copied or shared QR ends up here. */
  | { kind: "used"; at: number };

const time = (at: number) =>
  new Intl.DateTimeFormat("uk-UA", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(at)
    .replace(", ", " о ");

/**
 * The verify card's state and, for staff, the «Впустити» button. Whatever
 * the page loads with comes from the server; after a tap this phone shows
 * its own result, so a later scan of the same code (on any phone) shows red.
 */
export default function DoorCheck({
  token,
  usedAt,
  staff,
  storeDown,
  staffHref,
  children,
}: {
  token: string;
  usedAt: number | null;
  staff: boolean;
  /** Check-ins cannot be read or saved; the door checks by hand. */
  storeDown: boolean;
  staffHref: string;
  /** The pass's details, under the state. */
  children: ReactNode;
}) {
  const [state, setState] = useState<State>(
    usedAt ? { kind: "used", at: usedAt } : { kind: "valid" }
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const send = async (body: object) => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, ...body }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Щось пішло не так.");
      return data;
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Щось пішло не так.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const letIn = async () => {
    const data = await send({});
    if (data) setState(data.first ? { kind: "in", at: data.at } : { kind: "used", at: data.at });
  };

  const undo = async (at: number) => {
    const data = await send({ undo: at });
    if (data?.undone) setState({ kind: "valid" });
    else if (data) setError("Скасувати вже не можна: минуло понад 5 хвилин.");
  };

  const look = {
    valid: { tone: "valid", icon: "✓", title: "Квиток дійсний" },
    in: { tone: "valid", icon: "✓", title: "Впущено" },
    used: { tone: "invalid", icon: "!", title: "Вже використано" },
  }[state.kind];

  return (
    <div className={styles.card} data-state={look.tone}>
      <span className={styles.icon} aria-hidden="true">
        {look.icon}
      </span>
      <h1 className={styles.title}>{look.title}</h1>
      {state.kind !== "valid" && (
        <p className={styles.when}>
          {time(state.at)}
          {state.kind === "used" && ". Повторно не пропускати."}
        </p>
      )}

      {children}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {staff && storeDown && (
        <p className={styles.error}>
          Відмітки недоступні: сховище не підключене. Звіряй коди вручну.
        </p>
      )}

      {staff && !storeDown && state.kind === "valid" && (
        <button type="button" className={styles.letIn} onClick={letIn} disabled={busy}>
          {busy ? "Зачекай…" : "Впустити"}
        </button>
      )}

      {staff && state.kind === "in" && (
        <button
          type="button"
          className={styles.undo}
          onClick={() => undo(state.at)}
          disabled={busy}
        >
          Скасувати (помилково)
        </button>
      )}

      {!staff && (
        <a href={staffHref} className={styles.staffLink}>
          Вхід для персоналу
        </a>
      )}
    </div>
  );
}
