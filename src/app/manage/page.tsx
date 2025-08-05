"use client";

import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

type Status = { state: string; publicIp: string | null };

export default function Home() {
  const [status, setStatus] = useState<Status>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fetchStatus = async () => {
      const res = await fetch("/api/ec2/status");
      setStatus(await res.json());
    };
    fetchStatus();
    timer = setInterval(fetchStatus, 10_000);
    return () => clearInterval(timer);
  }, []);

  const startServer = async () => {
    setBusy(true);
    await fetch("/api/ec2/start", { method: "POST" });
    setBusy(false);
  };

  const running = status?.state === "running" || status?.state === "pending";

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">
          Diamond Piglins Minecraft Server Launcher
        </h1>
        <div className="text-lg">
          Status:&nbsp;
          <span
            className={
              running
                ? "text-green-600 font-semibold"
                : "text-red-600 font-semibold"
            }
          >
            {status?.state ?? "…"}
          </span>
        </div>

        <div className="text-lg">
          Public IP:&nbsp;
          <code>{status?.publicIp ?? "—"}</code>
        </div>

        <button
          className={cn(
            "rounded bg-blue-600 px-6 py-2 text-white disabled:bg-gray-400",
            !running && !busy && "cursor-pointer",
          )}
          disabled={running || busy}
          onClick={startServer}
        >
          {busy ? "Starting…" : "Start server"}
        </button>
      </main>
    </div>
  );
}
