import { getStock } from "@/lib/stock";
import TitleBlock from "./TitleBlock";
import SizeSelector from "./SizeSelector";
import SizeGridError from "./SizeGridError";

/**
 * Server component: reads data/stock.json, renders title + size selector.
 * If the data can't be read or validated, it renders the error panel (same footprint) with a Retry button.
 */
export default async function ProductData() {
  try {
    const { product, sizes } = await getStock();
    return (
      <>
        <TitleBlock product={product} />
        <SizeSelector sizes={sizes} />
      </>
    );
  } catch (err) {
    console.error("[stock] Failed to load stock data:", err);
    return <SizeGridError />;
  }
}
