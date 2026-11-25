import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="eyebrow">404</p>
      <h1 className="font-display text-4xl sm:text-6xl mt-4">Wall Not Found</h1>
      <p className="text-[var(--color-muted)] mt-4 max-w-md text-sm">The page you are looking for does not exist or may have been moved.</p>
      <div className="flex gap-4 mt-8">
        <Link href="/" className="btn-lux">Home</Link>
        <Link href="/shop" className="btn-lux btn-lux--outline">Shop Wallpapers</Link>
      </div>
    </div>
  );
}
