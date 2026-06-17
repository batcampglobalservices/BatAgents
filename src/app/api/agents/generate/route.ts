import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export async function POST(request: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        { error: "GROQ_API_KEY is missing from the environment." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      name?: string;
      category?: string;
      service?: string;
      description?: string;
      prompt?: string;
    };

    const result = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system:
        "You generate concise BatAgents AI agent drafts as strict JSON with keys: name, category, service, description, systemPrompt, sampleQuestions, price, currency. Return only valid JSON.",
      prompt: `Draft the following agent:
name: ${body.name ?? ""}
category: ${body.category ?? ""}
service: ${body.service ?? ""}
description: ${body.description ?? ""}
prompt: ${body.prompt ?? ""}`,
    });

    const parsed = safeParseJson(result.text);

    return Response.json({
      agent: parsed ?? {
        name: body.name ?? "New Agent",
        category: body.category ?? "Business",
        service: body.service ?? "Agent service",
        description: body.description ?? "AI-generated agent draft.",
        systemPrompt: body.prompt ?? "You are a helpful BatAgents agent.",
        sampleQuestions: ["What can you do?", "How do you help me?"],
        price: 12,
        currency: "STRK",
      },
    });
  } catch {
    return Response.json(
      { error: "Unable to generate an agent draft right now." },
      { status: 400 },
    );
  }
}

function safeParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}
