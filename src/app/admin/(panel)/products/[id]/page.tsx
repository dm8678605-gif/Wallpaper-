import { ProductEditor } from "@/components/admin/ProductEditor";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductEditor productId={decodeURIComponent(id)} />;
}
