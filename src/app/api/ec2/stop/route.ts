import { NextResponse } from "next/server";
import { stopInstance } from "~/lib/ec2";

export async function POST() {
  const inst = await stopInstance();
  return NextResponse.json({
    state: inst?.State?.Name,
    publicIp: inst?.PublicIpAddress ?? null,
  });
}
