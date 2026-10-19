/**
 * Saving a generated file. In the app it is an ordinary browser download; the
 * clickable mock swaps in the artifact viewer's `downloads` capability, which
 * asks the viewer to confirm. Resolves false when the viewer declined.
 */
type Saver = (blob: Blob, filename: string) => Promise<boolean>;

let saver: Saver = async (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return true;
};

export function setFileSaver(next: Saver) {
  saver = next;
}

export const saveFile: Saver = (blob, filename) => saver(blob, filename);
