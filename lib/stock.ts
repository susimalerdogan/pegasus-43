import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";

import type { Product, SizeItem, SizeState, StockData } from "./sizes";

const STOCK_PATH = path.join(process.cwd(), "data", "stock.json");

type Row = Record<string, unknown>;

function num(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeRow(r: Row): SizeItem | null {
  const sku = typeof r.sku === "string" ? r.sku : null;
  const men = num(r.size_us_men);
  const women = num(r.size_us_women);
  const order = num(r.display_order);
  if (!sku || men === null || women === null || order === null || r.size_eu == null) {
    console.warn("[stock] Skipping invalid row:", r);
    return null;
  }
  const qtyRaw = num(r.stock_quantity);
  const quantity = qtyRaw === null || qtyRaw < 0 ? 0 : qtyRaw;
  if (qtyRaw === null) console.warn("[stock] Bad stock_quantity, treating as sold out:", sku);

  // Defensive: any sign of "no stock" wins over the status string.
  const soldOut =
    qtyRaw === null || r.in_stock === false || quantity === 0 || r.stock_status === "sold_out";
  const state: SizeState = soldOut
    ? "sold_out"
    : r.stock_status === "low_stock"
      ? "low_stock"
      : "in_stock";

  return {
    sku,
    displayOrder: order,
    men: String(men),
    women: String(women),
    eu: String(r.size_eu),
    quantity: soldOut ? 0 : quantity,
    state,
  };
}

/** Reads data/stock.json, validates it and returns sizes sorted by display_order. */
export const getStock = cache(async (): Promise<StockData> => {
  const raw = await fs.readFile(STOCK_PATH, "utf8");
  const rows: unknown = JSON.parse(raw);
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("data/stock.json must be a non-empty array");
  }

  const sizes = (rows as Row[])
    .map(normalizeRow)
    .filter((s): s is SizeItem => s !== null)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  if (sizes.length === 0) throw new Error("data/stock.json has no valid size rows");

  const first = rows.find((r): r is Row => typeof r === "object" && r !== null) as Row;
  const price = num(first.price);
  const product: Product = {
    name: typeof first.product_name === "string" ? first.product_name : "Nike Pegasus 43",
    colorway: typeof first.colorway === "string" ? first.colorway : "",
    priceLabel:
      price === null
        ? ""
        : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price),
  };

  return { product, sizes };
});
