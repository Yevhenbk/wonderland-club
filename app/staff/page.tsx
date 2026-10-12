import type { Metadata } from "next";

import Shell from "@/app/components/shell";
import { DEV_PIN, isStaff } from "@/lib/staff";

import StaffForm from "./staff-form";

export const metadata: Metadata = {
  title: "Персонал. Wonderland Club",
  robots: { index: false },
};

/**
 * Where the door staff enter the PIN, once per phone per night. After it,
 * scanning a ticket's QR shows the «Впустити» button.
 */
export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  /* Only paths on this site, so the page cannot be used to send someone
     elsewhere after signing in. */
  const back = next?.startsWith("/") && !next.startsWith("//") ? next : null;

  return (
    <Shell>
      <StaffForm
        signedIn={await isStaff()}
        back={back}
        devHint={
          process.env.NODE_ENV !== "production" && !process.env.STAFF_PIN
            ? DEV_PIN
            : null
        }
      />
    </Shell>
  );
}
