import { parseScannedId } from "./parseQr";

const UUID = "0246d251-5cb0-4ed9-8fea-577ac5688600";

describe("parseScannedId", () => {
  it("returns the bare UUID unchanged", () => {
    expect(parseScannedId(UUID)).toBe(UUID);
  });

  it("extracts the id after /join/", () => {
    expect(parseScannedId(`https://app.tapbak.co/join/${UUID}`)).toBe(UUID);
  });

  it("extracts the id after /join/ with a trailing query/hash", () => {
    expect(parseScannedId(`https://app.tapbak.co/join/${UUID}?ref=x`)).toBe(UUID);
    expect(parseScannedId(`https://app.tapbak.co/join/${UUID}/`)).toBe(UUID);
  });

  it("extracts customer_id query param", () => {
    expect(parseScannedId(`https://x.co/process?customer_id=${UUID}`)).toBe(UUID);
    expect(parseScannedId(`https://x.co/process?customer_id=${UUID}&a=1`)).toBe(UUID);
  });

  it("trims whitespace", () => {
    expect(parseScannedId(`  ${UUID}  `)).toBe(UUID);
  });

  it("returns null for empty input", () => {
    expect(parseScannedId("")).toBeNull();
    expect(parseScannedId(null)).toBeNull();
    expect(parseScannedId(undefined)).toBeNull();
  });
});
