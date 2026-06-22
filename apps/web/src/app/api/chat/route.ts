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
    const baseUrl = process.env.OG_BASE_URL || "https://router-api-testnet.integratenetwork.work/v1";
    const apiKey = process.env.OG_API_KEY;
    const defaultModel = process.env.OG_MODEL || "qwen2.5-omni";

    if (!apiKey) {
      return NextResponse.json(
        { error: "0G Compute API key is not configured. Please add OG_API_KEY to your environment variables." },
        { status: 400 }
      );
    }

    // Map any unsupported model name from the client/metadata to the active testnet model
    const allowedModels = ["qwen2.5-omni", "qwen-image-edit"];
    const targetModel = allowedModels.includes(model) ? model : defaultModel;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: targetModel,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let consumerError = `0G Compute error (Status ${response.status}): ${errText}`;
      
      try {
        const parsed = JSON.parse(errText);
        const errObj = parsed.error || {};
        const code = (typeof errObj === "string" ? errObj : errObj.code || "").toLowerCase();
        const msg = (typeof errObj === "string" ? "" : errObj.message || "").toLowerCase();

        if (code === "invalid_api_key" || msg.includes("api key") || msg.includes("invalid key") || msg.includes("api_key") || response.status === 401) {
          consumerError = "Invalid 0G API key or wrong network endpoint.";
        } else if (code === "model_not_found" || msg.includes("model") || msg.includes("not found") || msg.includes("no such model")) {
          consumerError = "The selected 0G model is not available on this 0G network.";
        } else if (code === "insufficient_balance" || msg.includes("balance") || msg.includes("credit") || msg.includes("insufficient")) {
          consumerError = "Your 0G Router balance is too low.";
        } else if (code === "rate_limit_exceeded" || msg.includes("rate limit") || msg.includes("too many requests") || response.status === 429) {
          consumerError = "0G rate limit reached. Please try again later.";
        }
      } catch (e) {
        // Parsing failed, fallback to string checks
        const lowercaseBody = errText.toLowerCase();
        if (lowercaseBody.includes("invalid_api_key") || lowercaseBody.includes("api key") || response.status === 401) {
          consumerError = "Invalid 0G API key or wrong network endpoint.";
        } else if (lowercaseBody.includes("model_not_found") || lowercaseBody.includes("model")) {
          consumerError = "The selected 0G model is not available on this 0G network.";
        } else if (lowercaseBody.includes("insufficient_balance") || lowercaseBody.includes("balance") || lowercaseBody.includes("credit")) {
          consumerError = "Your 0G Router balance is too low.";
        } else if (lowercaseBody.includes("rate_limit_exceeded") || lowercaseBody.includes("rate limit") || response.status === 429) {
          consumerError = "0G rate limit reached. Please try again later.";
        }
      }

      return NextResponse.json(
        { error: consumerError },
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
