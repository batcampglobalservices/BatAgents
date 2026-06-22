import { NextResponse } from "next/server";
import { createPublicClient, http, verifyMessage } from "viem";
import { ogGalileoTestnet } from "@/config/chains";

const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x378B76beE85dcc4998ED099ED3373C8438e73958") as `0x${string}`;
const ACCESS_CONTROL_ADDRESS = (process.env.NEXT_PUBLIC_ACCESS_CONTROL_ADDRESS || "0xDC140d2B1429878D81F1CB65ab134839d01aB29A") as `0x${string}`;

const ACCESS_ABI = [
  {
    inputs: [
      { internalType: "address", name: "buyer", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" }
    ],
    name: "hasAccess",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export async function POST(req: Request) {
  try {
    const { messages, model, tokenId, buyer, signature } = await req.json();

    // 1. Enforce access credentials checking on the backend
    if (!tokenId || !buyer || !signature) {
      return NextResponse.json(
        { error: "Authentication credentials (buyer address, token ID, and cryptographic signature) are required." },
        { status: 401 }
      );
    }

    // 2. Cryptographically verify signature to prevent impersonation
    const messageToVerify = `Access Bat Agent ${tokenId}`;
    const isSignatureValid = await verifyMessage({
      address: buyer as `0x${string}`,
      message: messageToVerify,
      signature: signature as `0x${string}`,
    });

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: "Access Denied: Invalid signature verification." },
        { status: 403 }
      );
    }

    // 3. Setup Viem public client for 0G Galileo Testnet
    const rpcUrl = process.env.OG_RPC_URL || process.env.NEXT_PUBLIC_ZERO_G_RPC_URL || "https://rpc.ankr.com/0g_galileo_testnet_evm";
    const publicClient = createPublicClient({
      chain: ogGalileoTestnet,
      transport: http(rpcUrl),
    });

    // 4. Verify on-chain access authorization
    let hasAccess = false;
    try {
      // Check Marketplace
      hasAccess = await publicClient.readContract({
        address: MARKETPLACE_ADDRESS,
        abi: ACCESS_ABI,
        functionName: "hasAccess",
        args: [buyer as `0x${string}`, BigInt(tokenId)],
      });

      // If not access in marketplace, check AccessControl contract
      if (!hasAccess) {
        hasAccess = await publicClient.readContract({
          address: ACCESS_CONTROL_ADDRESS,
          abi: ACCESS_ABI,
          functionName: "hasAccess",
          args: [buyer as `0x${string}`, BigInt(tokenId)],
        });
      }
    } catch (err: any) {
      console.error("Contract read error on backend access control checks:", err);
      // Fail closed: if contract query failed, assume unauthorized
      return NextResponse.json(
        { error: "Failed to verify on-chain authorization from Galileo testnet." },
        { status: 500 }
      );
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access Denied: You do not own this Agentic ID or your rental subscription has expired." },
        { status: 403 }
      );
    }

    // 5. Query 0G Compute
    const baseUrl = process.env.ZERO_G_COMPUTE_BASE_URL || process.env.NEXT_PUBLIC_ZERO_G_COMPUTE_BASE_URL || "https://router-api.0g.ai/v1";
    const apiKey = process.env.ZERO_G_COMPUTE_API_KEY;

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: "0G Compute is not configured yet. Add the required compute configuration to enable live agent responses." },
        { status: 400 }
      );
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || "Qwen/Qwen2.5-72B-Instruct",
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `0G Compute error: ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process completion request" },
      { status: 500 }
    );
  }
}
