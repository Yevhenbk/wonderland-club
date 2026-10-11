/**
 * A price, "40 zł". The figure stays in the face around it; "zł" is set in
 * the body face (Manrope). The "ł" is outside the headline face's Latin and
 * Cyrillic sets, so setting it in Unbounded made the browser fetch that
 * face's 115 KB extended-Latin file with the first screen, for one letter.
 * Manrope's extended file is 15 KB and is needed for running text anyway.
 */
export default function Price({ value }: { value: number }) {
  return (
    <>
      {value}
      <span className="zl"> zł</span>
    </>
  );
}
