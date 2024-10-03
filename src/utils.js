export function generateRandomID() {
  return Math.random().toString(36).substring(2, 15);
}

export function hexView(data, length = 16) {
  return Array.from(data)
    .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
    .map((byte, i) => (i % length === 0 ? `\n${byte}` : byte))
    .join(" ")
    .trim();
}

export const bytesToHex = (bytes) => {
  return bytes
    .map((byte) => byte?.toString(16)?.padStart(2, "0")?.toUpperCase())
    ?.join(" ");
};
