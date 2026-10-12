import type { Metadata } from "next";

import { termsPl } from "@/app/legal/docs";
import LegalPage from "@/app/legal/legal-page";

export const metadata: Metadata = {
  title: "Regulamin. Wonderland Club",
};

export default function Page() {
  return (
    <LegalPage
      doc={termsPl()}
      lang="pl"
      updatedLabel="Aktualizacja:"
      other={{ href: "/terms", label: "Українська", lang: "uk" }}
    />
  );
}
