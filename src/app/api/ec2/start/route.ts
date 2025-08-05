import { NextResponse } from "next/server";
import { startInstance } from "~/lib/ec2";

export async function POST() {
  const inst = await startInstance();
  return NextResponse.json({
    state: inst?.State?.Name,
    publicIp: inst?.PublicIpAddress ?? null,
  });
}
