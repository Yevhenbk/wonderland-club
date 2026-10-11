/** Whether imitated emails can be opened in the browser (/api/dev/outbox).
    On in development; in production only with EMAIL_PREVIEW=1, since these
    are customers' emails. */
export const emailPreviewEnabled = () =>
  process.env.NODE_ENV !== "production" || process.env.EMAIL_PREVIEW === "1";
