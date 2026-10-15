const memory = new Map<string, Blob>();
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("partsdesk-preview-files", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Dateiablage im Browser nicht verfügbar."));
  });
}
export async function putFile(id: string, file: Blob) {
  memory.set(id, file);
  try {
    const db = await database();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      tx.objectStore("files").put(file, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* Sandboxed previews may only support in-memory files. */
  }
}
export async function getFile(id: string): Promise<Blob> {
  if (memory.has(id)) return memory.get(id)!;
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const request = db
        .transaction("files", "readonly")
        .objectStore("files")
        .get(id);
      request.onsuccess = () =>
        request.result instanceof Blob
          ? resolve(request.result)
          : reject(
              new Error(
                "Diese Datei ist in der Vorschau nicht mehr vorhanden. Bitte erneut auswählen.",
              ),
            );
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}
export function browserFileType(bytes: Uint8Array, name: string) {
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v))
    return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    return "image/jpeg";
  const prefix = new TextDecoder().decode(bytes.subarray(0, 12));
  if (prefix.startsWith("RIFF") && prefix.slice(8, 12) === "WEBP")
    return "image/webp";
  if (prefix.startsWith("%PDF-")) return "application/pdf";
  if (/\.txt$/i.test(name) && !bytes.includes(0)) {
    try {
      new TextDecoder("utf8", { fatal: true }).decode(bytes);
      return "text/plain";
    } catch {}
  }
  throw new Error(
    "Erlaubt sind JPG, PNG, WebP, PDF oder UTF-8-TXT mit gültigem Dateiinhalt.",
  );
}
