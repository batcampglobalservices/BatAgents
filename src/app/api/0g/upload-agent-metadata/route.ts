import { uploadAgentMetadataTo0G } from "@/lib/0g";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return Response.json({ error: "Metadata payload is required." }, { status: 400 });
    }

    const proof = await uploadAgentMetadataTo0G(body);

    return Response.json({
      proof,
      mode: proof.mode ?? "real",
      message: "0G proof generated for the agent metadata.",
    });
  } catch {
    return Response.json(
      { error: "Unable to create the 0G metadata proof." },
      { status: 400 },
    );
  }
}
