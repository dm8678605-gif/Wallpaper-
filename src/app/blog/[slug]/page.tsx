import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogRepo } from "@/lib/data/repos";
import { Prose } from "@/components/ui/Prose";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await blogRepo.bySlug(slug);
  return { title: post?.seo?.title ?? post?.title, description: post?.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await blogRepo.bySlug(slug);
  if (!post || !post.published) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <Reveal>
        <Link href="/blog" className="text-xs tracking-[0.25em] uppercase text-[var(--color-primary)] hover:underline">← Journal</Link>
        <p className="eyebrow mt-6">{post.tags.join(" · ")}</p>
        <h1 className="font-display text-4xl sm:text-5xl mt-4 leading-tight">{post.title}</h1>
        <p className="text-sm text-[var(--color-muted)] mt-4">{formatDate(post.publishedAt)}{post.author ? ` · ${post.author}` : ""}</p>
        {post.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image} alt={post.title} className="w-full aspect-[16/9] object-cover mt-10" />
        )}
        <div className="mt-10">
          <Prose content={post.content} />
        </div>
      </Reveal>
    </article>
  );
}
