export function thumbnailUrl(url: string, size = 160): string {
  const marker = "/upload/";
  if (!url.includes(marker)) return url;
  return url.replace(marker, `${marker}w_${size},h_${size},c_fill/`);
}
