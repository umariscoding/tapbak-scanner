/**
 * Extracts the customer id from a scanned wallet-pass QR payload.
 * Replicates the web scanner logic (Tapbak/src/pages/ScanQRCode/index.jsx):
 *  - a URL containing "/join/<id>"        -> the segment after /join/
 *  - a string containing "customer_id=<id>" -> the value after customer_id=
 *  - otherwise the raw value is treated as the bare Customer UUID.
 */
export function parseScannedId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;

  if (value.includes("/join/")) {
    const after = value.split("/join/")[1] ?? "";
    const id = after.split(/[/?#]/)[0];
    return id || null;
  }

  if (value.includes("customer_id=")) {
    const after = value.split("customer_id=")[1] ?? "";
    const id = after.split(/[&?#]/)[0];
    return id || null;
  }

  return value;
}
