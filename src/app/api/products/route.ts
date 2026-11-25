import { NextResponse } from "next/server";
import { productsRepo } from "@/lib/data/repos";

/** Public read-only product list for client components (wishlist/cart enrichment). */
export async function GET() {
  const items = await productsRepo.published();
  return NextResponse.json({ items });
}
