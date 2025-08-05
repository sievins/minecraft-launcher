import { NextResponse } from "next/server";
import { describe } from "~/lib/ec2";

export async function GET() {
  const inst = await describe();
  const state = inst?.State?.Name ?? "unknown";
  const publicIp = inst?.PublicIpAddress ?? null;
  return NextResponse.json({ state, publicIp });
}
