export function getAuthCookieOptions() {
  const crossSite = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: crossSite,
    sameSite: crossSite ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function getClearCookieOptions() {
  const { maxAge, ...rest } = getAuthCookieOptions();
  return rest;
}
