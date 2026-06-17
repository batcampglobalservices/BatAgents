import { NextResponse } from "next/server";

function getUpstreamRpcUrl() {
  const configuredUrl = process.env.STARKNET_RPC_UPSTREAM_URL?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }

  const alchemyKey = process.env.ALCHEMY_STARKNET_API_KEY?.trim();
  if (alchemyKey) {
    return `https://starknet-sepolia.g.alchemy.com/v2/${alchemyKey}`;
  }

  return "";
}

async function proxyRpc(request: Request) {
  const upstreamRpcUrl = getUpstreamRpcUrl();

  if (!upstreamRpcUrl) {
    return NextResponse.json(
      {
        error: {
          code: -32000,
          message:
            "Starknet RPC upstream is not configured. Set STARKNET_RPC_UPSTREAM_URL or ALCHEMY_STARKNET_API_KEY.",
        },
      },
      { status: 503 },
    );
  }

  let body: string;

  try {
    body = await request.text();
  } catch {
    return NextResponse.json(
      { error: { code: -32600, message: "Invalid JSON-RPC request body." } },
      { status: 400 },
    );
  }

  const upstreamResponse = await fetch(upstreamRpcUrl, {
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
