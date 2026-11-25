"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(next.startsWith("/admin") ? next : "/admin");
        router.refresh();
      } else {
        setError(data.error ?? "Invalid credentials");
        setLoading(false);
      }
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F5EE] flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-black/10 p-10 shadow-sm">
        <p className="eyebrow text-center">Restricted Area</p>
        <h1 className="font-display text-3xl text-center mt-3 mb-2">Admin Login</h1>
        <p className="text-xs text-center text-[#8A7B6B] mb-8">Aurelia Walls management panel</p>
        <div className="space-y-4">
          <div>
            <label className="label-lux">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" className="input-lux" required />
          </div>
          <div>
            <label className="label-lux">Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="input-lux !pr-11" required />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7B6B]" aria-label="Toggle password visibility">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-lux w-full justify-center !bg-[#B79A61] !border-[#B79A61] !text-[#30251F]">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
