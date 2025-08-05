"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const sp = useSearchParams();
  const err = sp.get("e");
  const [pw, setPw] = useState("");

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">
          Diamond Piglins Minecraft Server Launcher
        </h1>
        <form
          method="POST"
          action="/api/login"
          className="w-full max-w-sm space-y-4"
        >
          <h2 className="text-lg font-semibold">Enter password</h2>

          {err && (
            <p className="rounded bg-red-50 p-2 text-sm text-red-700">
              Incorrect password. Please try again.
            </p>
          )}

          <input
            type="password"
            name="password"
            required
            className="w-full rounded border p-2"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="current-password"
          />

          <button
            type="submit"
            className="cursor-pointer w-full rounded bg-blue-600 px-4 py-2 font-medium text-white"
          >
            Sign in
          </button>
        </form>
      </main>
    </div>
  );
}
