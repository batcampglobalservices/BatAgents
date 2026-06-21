import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();

    const baseUrl = process.env.ZERO_G_COMPUTE_BASE_URL || process.env.NEXT_PUBLIC_ZERO_G_COMPUTE_BASE_URL;
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
