export function getCookieValue(
  request: Request,
  cookieName: string
): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((entry) => entry.trim());
  const target = cookies.find((entry) => entry.startsWith(`${cookieName}=`));

  if (!target) {
    return null;
  }

  const raw = target.slice(cookieName.length + 1);

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
