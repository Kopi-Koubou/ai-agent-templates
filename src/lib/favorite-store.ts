const favoritesByEmail = new Map<string, Set<string>>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function listFavoritesByEmail(email: string): string[] {
  const favorites = favoritesByEmail.get(normalizeEmail(email));
  if (!favorites) {
    return [];
  }

  return Array.from(favorites).sort((a, b) => a.localeCompare(b));
}

export function isTemplateFavoritedByEmail(
  email: string,
  templateSlug: string
): boolean {
  const favorites = favoritesByEmail.get(normalizeEmail(email));
  if (!favorites) {
    return false;
  }

  return favorites.has(templateSlug);
}

export function addFavoriteTemplate(email: string, templateSlug: string): string[] {
  const normalizedEmail = normalizeEmail(email);
  const favorites = favoritesByEmail.get(normalizedEmail) ?? new Set<string>();
  favorites.add(templateSlug);
  favoritesByEmail.set(normalizedEmail, favorites);
  return Array.from(favorites).sort((a, b) => a.localeCompare(b));
}

export function removeFavoriteTemplate(
  email: string,
  templateSlug: string
): string[] {
  const normalizedEmail = normalizeEmail(email);
  const favorites = favoritesByEmail.get(normalizedEmail);

  if (!favorites) {
    return [];
  }

  favorites.delete(templateSlug);
  if (favorites.size === 0) {
    favoritesByEmail.delete(normalizedEmail);
    return [];
  }

  favoritesByEmail.set(normalizedEmail, favorites);
  return Array.from(favorites).sort((a, b) => a.localeCompare(b));
}

export function clearFavoriteStoreForTests(): void {
  favoritesByEmail.clear();
}
