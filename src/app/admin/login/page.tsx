"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { http } from "@/services/http";

type Mode = "login" | "register";

function errMsg(e: unknown, fallback: string) {
  if (isAxiosError(e) && e.response?.data && typeof e.response.data === "object") {
    const d = e.response.data as { error?: string };
    if (d.error) return d.error;
  }
  return fallback;
}

export default function AdminLoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [canRegister, setCanRegister] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await http.get<{ canRegister: boolean }>(
          "/api/admin/register-status"
        );
        setCanRegister(data.canRegister);
        if (data.canRegister) setMode("register");
      } catch {
        setCanRegister(false);
      } finally {
        setStatusLoaded(true);
      }
    })();
  }, []);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#faf8f5] p-4 font-body">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl">
        <h1 className="font-logo text-3xl text-[#e60000]">Admin</h1>
        {/* <p className="mt-2 text-sm text-neutral-600">
          <code className="rounded bg-neutral-100 px-1">MONGODB_URI</code> aur{" "}
          <code className="rounded bg-neutral-100 px-1">JWT_SECRET</code>{" "}
          <code className="rounded bg-neutral-100 px-1">.env</code> ya{" "}
          <code className="rounded bg-neutral-100 px-1">.env.local</code> mein hon —
          <span className="font-medium text-amber-800"> = ke baad space mat rakho</span>.
          Naya setup: pehle <span className="font-semibold">Register</span> se admin banao (jab tak DB khali ho).
        </p> */}

        {!statusLoaded && (
          <p className="mt-6 text-center text-sm text-neutral-500">Loading…</p>
        )}
        {statusLoaded && (
          <div className="mt-4 flex gap-2 rounded-2xl bg-neutral-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMsg(null);
              }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                mode === "login"
                  ? "bg-white text-[#e60000] shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setMsg(null);
              }}
              disabled={!canRegister}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                mode === "register"
                  ? "bg-white text-[#e60000] shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              } disabled:cursor-not-allowed disabled:opacity-45`}
            >
              Register
            </button>
          </div>
        )}

        {!canRegister && statusLoaded && mode === "register" && (
          <p className="mt-3 text-xs text-neutral-500">
            Register sirf tab khulega jab database mein{" "}
            <span className="font-semibold">koi admin na ho</span> (pehla setup).
            Pehle se admin hai to sirf login karein.
          </p>
        )}

        {statusLoaded && mode === "login" ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setMsg(null);
              setLoading(true);
              try {
                await http.post("/api/admin/login", { username, password });
                router.push("/admin");
                router.refresh();
              } catch (e) {
                setMsg(errMsg(e, "Invalid username or password."));
              } finally {
                setLoading(false);
              }
            }}
          >
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Username
              </label>
              <input
                required
                autoComplete="username"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none ring-[#e60000]/30 focus:ring-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Password
              </label>
              <input
                required
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none ring-[#e60000]/30 focus:ring-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#e60000] py-3 text-sm font-bold text-white shadow-lg shadow-red-500/30 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : statusLoaded ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setMsg(null);
              setLoading(true);
              try {
                await http.post("/api/admin/register", {
                  username,
                  password,
                  confirmPassword,
                });
                router.push("/admin");
                router.refresh();
              } catch (e) {
                setMsg(errMsg(e, "Register failed."));
              } finally {
                setLoading(false);
              }
            }}
          >
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Username
              </label>
              <input
                required
                minLength={3}
                autoComplete="username"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none ring-[#e60000]/30 focus:ring-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="naya username"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Password
              </label>
              <input
                required
                minLength={6}
                type="password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none ring-[#e60000]/30 focus:ring-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Confirm password
              </label>
              <input
                required
                minLength={6}
                type="password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none ring-[#e60000]/30 focus:ring-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !canRegister}
              className="w-full rounded-full bg-[#e60000] py-3 text-sm font-bold text-white shadow-lg shadow-red-500/30 disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>
        ) : null}

        {msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}
      </div>
    </div>
  );
}
