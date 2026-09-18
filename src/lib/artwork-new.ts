const NEW_BADGE_WINDOW_DAYS = 30;

export function isRecentlyAdded(createdAt: string): boolean {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs >= 0 && ageMs <= NEW_BADGE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}
