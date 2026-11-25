import { FacetPage } from "@/components/shop/FacetPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ") };
}

export default async function Page({ params, searchParams }: Params) {
  const { slug } = await params;
  return <FacetPage kind="collection" slug={slug} searchParams={searchParams} />;
}
