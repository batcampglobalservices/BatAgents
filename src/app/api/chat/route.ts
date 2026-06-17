import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { agents, getAgentById } from "@/data/agents";
import type { Agent } from "@/types/agent";
import { getAgentReviews } from "@/lib/db/reviews";

export const maxDuration = 30;

type ChatRequestBody = {
  messages?: UIMessage[];
  agent?: Agent;
};

function buildSystemPrompt(agent: Agent, recentFeedback: string) {
  return `You are ${agent.name}, a paid AI agent on BatAgents.

Category: ${agent.category}
Service: ${agent.service}
Description: ${agent.description}

Your creator configured you with these instructions:
${agent.systemPrompt}

Recent buyer feedback and usage context:
${recentFeedback || "No buyer feedback has been recorded yet."}

Your job is to help the user complete tasks related to your service.

Answer like a focused digital worker:
- Be practical
- Be specific
- Stay on task
- Give structured responses when useful
- Avoid generic AI disclaimers
- Ask clarifying questions only when needed
- Do not mention internal implementation details
- Do not claim payment was processed
`;
}

export async function POST(request: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        { error: "GROQ_API_KEY is missing from the environment." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as ChatRequestBody;
    const messages = body.messages ?? [];
    const requestedAgent = body.agent;

    if (!messages.length) {
      return Response.json({ error: "Messages are required." }, { status: 400 });
    }

    if (!requestedAgent) {
      return Response.json({ error: "Agent is required." }, { status: 400 });
    }

    const selectedAgent =
      (requestedAgent.id ? getAgentById(requestedAgent.id) : undefined) ??
      (requestedAgent.slug
        ? agents.find((entry) => entry.slug === requestedAgent.slug)
        : undefined) ??
      requestedAgent;

    const recentReviews = await getAgentReviews(selectedAgent.id, 5);
    const recentFeedback = recentReviews.length
      ? recentReviews
          .map((review) => `- ${review.rating}/5: ${review.review ?? "No comment"} (${review.created_at})`)
          .join("\n")
      : "";

    const result = streamText({
      model: groq("llama-3.1-8b-instant"),
      system: buildSystemPrompt(selectedAgent, recentFeedback),
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      onError: () => "The agent could not complete the response.",
    });
  } catch {
    return Response.json(
      { error: "Unable to process the chat request." },
      { status: 400 },
    );
  }
}
