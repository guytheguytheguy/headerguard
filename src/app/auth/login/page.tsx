"use client";

import { getSupabase } from "@/lib/supabase";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { error: authError } = await getSupabase().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  }

  async function handleGitHubLogin() {
    await getSupabase().auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Check your email</h1>
        <p className="text-gray-400">
          We sent a magic link to <span className="text-white">{email}</span>.
          Click the link to sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign in to HeaderGuard</h1>

      <button
        onClick={handleGitHubLogin}
        className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition-colors mb-6"
      >
        Continue with GitHub
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#0a0a0a] px-2 text-gray-500">or</span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full py-2.5 px-4 bg-black/50 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
        />
        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors"
        >
          Send Magic Link
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
