/**
 * Render.com Health Check & UptimeRobot Keep-Alive Endpoint — /api/health
 * UptimeRobot (HEAD ve GET istekleri) ile 7/24 uyanık tutma (Anti-Sleep) ve
 * Render sağlık kontrolü için veritabanı yormayan sıfır gecikmeli yanıt döner.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "onbsaglik-web",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
