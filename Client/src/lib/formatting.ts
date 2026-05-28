export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} км`;
  return `${Math.round(meters)} м`;
}

export function formatDistanceApprox(meters: number | null): string {
  if (meters == null) return 'байршил тодорхойгүй';
  if (meters < 1000) return `~${Math.round(meters)}м`;
  return `~${(meters / 1000).toFixed(1)}км`;
}
