/**
 * Who sells the tickets: the organizer, a private person. These details
 * appear in the terms, the privacy policy, the footer and the ticket email,
 * and must match the Stripe account holder, whose bank account receives the
 * payouts. The club is rented separately and is named only as the venue.
 *
 * PENDING: fill in before taking real payments. Until then the pages show
 * a bracketed placeholder where each detail goes.
 */
export const organizer = {
  /** Full name of the organizer (the seller). */
  name: "Yevhen Blahutrak",
  /** Correspondence address: street, postcode, city. */
  address: "ul. Racławicka 18/5, 30-075 Kraków",
  /** Where buyers write: questions, complaints, refunds, data requests. */
  email: "hello@wonderlandkrk.club",
  /** NIP, if the organizer has one; left out of the pages when empty. */
  nip: "",
  /** The club's official name: where the nights take place. */
  club: "SNY",
};

type Lang = "uk" | "pl";

const PLACEHOLDER: Record<keyof typeof organizer, Record<Lang, string>> = {
  name: { uk: "[ім'я та прізвище організатора]", pl: "[imię i nazwisko organizatora]" },
  address: { uk: "[адреса для кореспонденції]", pl: "[adres do korespondencji]" },
  email: { uk: "[email організатора]", pl: "[email organizatora]" },
  nip: { uk: "", pl: "" },
  club: { uk: "[назва клубу]", pl: "[nazwa klubu]" },
};

/** A detail, or its placeholder while it is still empty. */
export const org = (field: keyof typeof organizer, lang: Lang) =>
  organizer[field] || PLACEHOLDER[field][lang];

/** Whether every required detail is filled in. */
export const organizerComplete = () =>
  Boolean(organizer.name && organizer.address && organizer.email && organizer.club);
