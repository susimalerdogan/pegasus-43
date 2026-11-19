// Shared types/helpers. No Node imports here, so client components can use it.

export type SizeState = "in_stock" | "low_stock" | "sold_out";

export interface SizeItem {
  sku: string;
  displayOrder: number;
  men: string; // e.g. "9.5"
  women: string; // e.g. "11"
  eu: string; // e.g. "43"
  quantity: number;
  state: SizeState;
}

export interface Product {
  name: string;
  colorway: string;
  priceLabel: string; // e.g. "$140.00"
}

export interface StockData {
  product: Product;
  sizes: SizeItem[];
}

export function sizeAriaLabel(s: SizeItem): string {
  let t = `Men's ${s.men}, Women's ${s.women}, EU ${s.eu}`;
  if (s.state === "sold_out") t += ", sold out";
  if (s.state === "low_stock") t += `, low stock, only ${s.quantity} left`;
  return t;
}
