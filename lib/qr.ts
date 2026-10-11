import QRCode from "qrcode";

/**
 * QR codes for the passes. Dark on white with a quiet margin, whatever the
 * page around them looks like: scanners need the contrast, and a door
 * scanner in a dark club needs it most. Error correction M survives a
 * cracked screen or a thumb over a corner.
 */
const OPTIONS = {
  errorCorrectionLevel: "M" as const,
  margin: 2,
  color: { dark: "#0f0b19", light: "#ffffff" },
};

/** For pages: crisp at any size. */
export function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { ...OPTIONS, type: "svg" });
}

/** For email, where SVG is not reliably shown. */
export function qrPng(text: string): Promise<string> {
  return QRCode.toDataURL(text, { ...OPTIONS, width: 360 });
}
