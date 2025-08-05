import { NextResponse } from "next/server";
import crypto from "node:crypto";

const DASH_PASSWORD = process.env.DASH_PASSWORD!;
const AUTH_SECRET = process.env.AUTH_SECRET!;

const COOKIE_NAME = "mc_auth";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function timingSafeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function sign(data: string) {
  return crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(data)
    .digest("base64url");
}

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");

  // Verify password without leaking timing
  if (!timingSafeEqual(sign(password), sign(DASH_PASSWORD))) {
    return NextResponse.redirect(new URL("/?e=1", req.url), 303);
  }

  // Create a short, signed token: exp.nonce.sig
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const nonce = crypto.randomBytes(16).toString("base64url");
  const data = `${exp}.${nonce}`;
  const sig = sign(data);
  const token = `${exp}.${nonce}.${sig}`;

  const res = NextResponse.redirect(new URL("/manage", req.url), 303);
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });

  return res;
}
