export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl">Admin Settings</h1>
      <div className="bg-white border border-black/10 p-6 mt-6 space-y-4 text-sm">
        <p><strong>Authentication:</strong> Admin access is secured via environment variables — no database required.</p>
        <ul className="list-disc pl-6 space-y-1 text-[#4a3f36]">
          <li><code>ADMIN_USERNAME</code> — admin username (default: admin)</li>
          <li><code>ADMIN_PASSWORD_HASH</code> — scrypt hash in saltHex:hashHex format</li>
          <li><code>SESSION_SECRET</code> — HMAC secret for signed session cookies (min 16 chars)</li>
          <li><code>SESSION_MAX_AGE</code> — session lifetime in seconds (default 28800)</li>
        </ul>
        <p className="text-[#8A7B6B]">To change the password, generate a new hash and update .env.local:</p>
        <pre className="bg-[#F4F1EA] p-4 text-xs overflow-x-auto">node -e &quot;const c=require(&apos;crypto&apos;);const s=c.randomBytes(16).toString(&apos;hex&apos;);console.log(s+&apos;:&apos;+c.scryptSync(&apos;NEW_PASSWORD&apos;,s,64).toString(&apos;hex&apos;))&quot;</pre>
        <p className="text-[#8A7B6B]">Sessions are HTTP-only, signed and expire automatically. Login is rate-limited (5 attempts / 15 min).</p>
      </div>
    </div>
  );
}
