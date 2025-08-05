import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "mc_auth";

export const config = {
  matcher: ["/", "/manage", "/api/ec2/(.*)"],
};

async function verifyToken(token: string, secret: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expStr, nonce, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );

  const data = enc.encode(`${exp}.${nonce}`);
  const mac = await crypto.subtle.sign("HMAC", key, data);
  // base64url encode
  const macB64url = Buffer.from(mac)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return macB64url === sig;
}

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const isRoot = url.pathname === "/";
  const isManage = url.pathname.startsWith("/manage");
  const isEC2API = url.pathname.startsWith("/api/ec2");

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.AUTH_SECRET || "";

  const authed = token && secret ? await verifyToken(token, secret) : false;

  // If authenticated and at "/", go to /manage
  if (authed && isRoot) {
    const to = new URL("/manage", url);
    return NextResponse.redirect(to);
  }

  // If not authenticated and trying to access /manage, send to "/"
  if (!authed && isManage) {
    const to = new URL("/", url);
    return NextResponse.redirect(to);
  }

  if (!authed && isEC2API) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  return NextResponse.next();
}
