import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.OG_BASE_URL || "https://router-api-testnet.integratenetwork.work/v1";
  const apiKey = process.env.OG_API_KEY;
  const model = process.env.OG_MODEL || "qwen2.5-omni";

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      baseUrl,
      model,
      error: "OG_API_KEY is not configured in the environment variables."
    }, { status: 400 });
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "user", content: "Hello! Reply as a Bat Agents assistant." }
        ]
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
        // Fallback to simple string checks
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

      return NextResponse.json({
        success: false,
        baseUrl,
        model,
        error: consumerError
      }, { status: response.status });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No reply from 0G Router.";
    
    return NextResponse.json({
      success: true,
      baseUrl,
      model,
      reply
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      baseUrl,
      model,
      error: error.message || "Failed to make call to 0G Router."
    }, { status: 500 });
  }
}
