import type { Metadata } from "next";

import { termsUk } from "@/app/legal/docs";
import LegalPage from "@/app/legal/legal-page";

export const metadata: Metadata = {
  title: "Регламент. Wonderland Club",
};

export default function Page() {
  return (
    <LegalPage
      doc={termsUk()}
      lang="uk"
      updatedLabel="Оновлено"
      other={{ href: "/pl/regulamin", label: "Polski", lang: "pl" }}
    />
  );
}
