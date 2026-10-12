import type { Metadata } from "next";

import { privacyUk } from "@/app/legal/docs";
import LegalPage from "@/app/legal/legal-page";

export const metadata: Metadata = {
  title: "Політика конфіденційності. Wonderland Club",
};

export default function Page() {
  return (
    <LegalPage
      doc={privacyUk()}
      lang="uk"
      updatedLabel="Оновлено"
      other={{ href: "/pl/polityka-prywatnosci", label: "Polski", lang: "pl" }}
    />
  );
}
