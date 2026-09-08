const RAW_BASE = process.env.NEXT_PUBLIC_BASE_URL || "";

export function shortUrl(shortCode) {
  if (!shortCode) return "";
  const base = RAW_BASE.replace(/\/+$/, "");
  const withScheme = /^https?:\/\//i.test(base) ? base : `https://${base}`;
  return `${withScheme}/${shortCode}`;
}

export function shortBaseLabel() {
  return RAW_BASE.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

export function shortUrlLabel(shortCode) {
  return shortUrl(shortCode).replace(/^https?:\/\//i, "");
}

export function titleFromUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    const name = hostname.replace(/^www\./, "").split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return "Untitled";
  }
}

export function faviconFor(url, size = 64) {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=${size}`;
  } catch {
    return null;
  }
}
