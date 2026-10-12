import type { Metadata } from "next";

import { privacyPl } from "@/app/legal/docs";
import LegalPage from "@/app/legal/legal-page";

export const metadata: Metadata = {
  title: "Polityka prywatności. Wonderland Club",
};

export default function Page() {
  return (
    <LegalPage
      doc={privacyPl()}
      lang="pl"
      updatedLabel="Aktualizacja:"
      other={{ href: "/privacy", label: "Українська", lang: "uk" }}
    />
  );
}
