/**
 * Random public order id, e.g. SM20260403110027656 (date + time + random suffix).
 */
export function generateOrderNumber(): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  const r = String(Math.floor(Math.random() * 900_000) + 100_000);
  return `SM${y}${mo}${day}${h}${min}${s}${r}`;
}
