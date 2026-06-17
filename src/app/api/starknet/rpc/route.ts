import { NextResponse } from "next/server";

const DEFAULT_UPSTREAM_RPC_URL = "https://starknet-sepolia.public.blastapi.io/";
const UPSTREAM_RPC_URL =
  process.env.STARKNET_RPC_UPSTREAM_URL?.trim() || DEFAULT_UPSTREAM_RPC_URL;

async function proxyRpc(request: Request) {
  let body: string;

  try {
    body = await request.text();
  } catch {
    return NextResponse.json(
      { error: { code: -32600, message: "Invalid JSON-RPC request body." } },
      { status: 400 },
    );
  }

  const upstreamResponse = await fetch(UPSTREAM_RPC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body,
    cache: "no-store",
  });

  const responseText = await upstreamResponse.text();

  return new NextResponse(responseText, {
    status: upstreamResponse.status,
    headers: {
      "content-type":
        upstreamResponse.headers.get("content-type") || "application/json",
      "cache-control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  return proxyRpc(request);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      allow: "POST, OPTIONS",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}
