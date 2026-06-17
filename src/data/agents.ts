import type { Agent } from "@/types/agent";

export const agents: Agent[] = [
  {
    id: "pitch-coach-agent",
    name: "Pitch Coach Agent",
    slug: "pitch-coach-agent",
    category: "Business",
    description:
      "Sharp founder feedback for decks, product positioning, and demo-day readiness.",
    service: "Pitch review and startup storytelling",
    price: 12,
    currency: "STRK",
    rating: 4.9,
    completedJobs: 184,
    creator: "Batcamp Studio",
    creatorWallet: "0x08c3d0af120001",
    systemPrompt:
      "You are a strict but helpful pitch judge. Give direct feedback, highlight risk, and suggest specific improvements.",
    sampleQuestions: [
      "Can you tighten this one-liner?",
      "Where is the strongest proof point?",
      "What would an investor challenge first?",
    ],
    createdAt: "2026-06-01",
    zeroGProof: {
      rootHash: "0x0g_agent_pitch_coach_001",
      txHash: "0x0g_tx_pitch_coach_001",
      url: "https://0g.example/mock/agent/pitch-coach-agent",
      storedAt: "2026-06-16T12:00:00.000Z",
    },
  },
  {
    id: "study-tutor-agent",
    name: "Study Tutor Agent",
    slug: "study-tutor-agent",
    category: "Study",
    description:
      "Explains concepts clearly, checks understanding, and adapts to the learner's pace.",
    service: "Personalized tutoring sessions",
    price: 10,
    currency: "STRK",
    rating: 4.8,
    completedJobs: 236,
    creator: "Campus Labs",
    creatorWallet: "0x05aa4be9130001",
    systemPrompt:
      "You are a patient tutor who breaks topics into simple steps, asks follow-up questions, and confirms comprehension.",
    sampleQuestions: [
      "Explain this topic like I am new to it.",
      "Can you test me with practice questions?",
      "What should I study next?",
    ],
    createdAt: "2026-05-28",
    zeroGProof: {
      rootHash: "0x0g_agent_study_tutor_001",
      txHash: "0x0g_tx_study_tutor_001",
      url: "https://0g.example/mock/agent/study-tutor-agent",
      storedAt: "2026-06-16T12:00:00.000Z",
    },
  },
  {
    id: "startup-validator-agent",
    name: "Startup Validator Agent",
    slug: "startup-validator-agent",
    category: "Business",
    description:
      "Tests market assumptions, competition, pricing, and go-to-market logic before launch.",
    service: "Idea validation and market analysis",
    price: 16,
    currency: "ETH",
    rating: 4.7,
    completedJobs: 142,
    creator: "Launch House",
    creatorWallet: "0x031f14d400001",
    systemPrompt:
      "You are an analytical startup evaluator. Focus on demand, differentiation, pricing, and evidence of customer pain.",
    sampleQuestions: [
      "Is this idea actually viable?",
      "What is the weakest assumption?",
      "How should I validate demand fast?",
    ],
    createdAt: "2026-05-21",
    zeroGProof: {
      rootHash: "0x0g_agent_startup_validator_001",
      txHash: "0x0g_tx_startup_validator_001",
      url: "https://0g.example/mock/agent/startup-validator-agent",
      storedAt: "2026-06-16T12:00:00.000Z",
    },
  },
  {
    id: "research-agent",
    name: "Research Agent",
    slug: "research-agent",
    category: "Research",
    description:
      "Summarizes sources, extracts key findings, and turns dense topics into usable insight.",
    service: "Fast research briefs",
    price: 14,
    currency: "STRK",
    rating: 4.9,
    completedJobs: 198,
    creator: "Signal Forge",
    creatorWallet: "0x06b7c9d100001",
    systemPrompt:
      "You are a rigorous research analyst. Be precise, structured, and cite assumptions clearly when evidence is incomplete.",
    sampleQuestions: [
      "Summarize this topic in 5 bullet points.",
      "What are the most credible angles here?",
      "What should I verify before publishing?",
    ],
    createdAt: "2026-05-19",
    zeroGProof: {
      rootHash: "0x0g_agent_research_001",
      txHash: "0x0g_tx_research_001",
      url: "https://0g.example/mock/agent/research-agent",
      storedAt: "2026-06-16T12:00:00.000Z",
    },
  },
  {
    id: "code-explainer-agent",
    name: "Code Explainer Agent",
    slug: "code-explainer-agent",
    category: "Coding",
    description:
      "Breaks down code paths, debugging ideas, and implementation tradeoffs without the jargon.",
    service: "Code walkthroughs and debugging help",
    price: 11,
    currency: "STRK",
    rating: 4.8,
    completedJobs: 221,
    creator: "Dev Grid",
    creatorWallet: "0x041deb20a0001",
    systemPrompt:
      "You are a senior engineer explaining code clearly. Prefer concise explanations, trace execution step by step, and suggest fixes.",
    sampleQuestions: [
      "What does this function do?",
      "Why is this bug happening?",
      "How can I simplify this component?",
    ],
    createdAt: "2026-05-14",
    zeroGProof: {
      rootHash: "0x0g_agent_code_explainer_001",
      txHash: "0x0g_tx_code_explainer_001",
      url: "https://0g.example/mock/agent/code-explainer-agent",
      storedAt: "2026-06-16T12:00:00.000Z",
    },
  },
  {
    id: "web3-guide-agent",
    name: "Web3 Guide Agent",
    slug: "web3-guide-agent",
    category: "Web3",
    description:
      "Helps founders and users understand wallets, token flows, and 0G-powered product design.",
    service: "Web3 onboarding and product guidance",
    price: 15,
    currency: "ETH",
    rating: 4.7,
    completedJobs: 167,
    creator: "Chain Studio",
    creatorWallet: "0x0a1c0d8f30001",
    systemPrompt:
      "You are a practical Web3 guide. Explain concepts plainly, keep the flow grounded in product usage, and avoid hype.",
    sampleQuestions: [
      "How does the payment unlock flow work?",
      "What should this 0G demo show first?",
      "How do I explain wallet-based access simply?",
    ],
    createdAt: "2026-05-10",
    zeroGProof: {
      rootHash: "0x0g_agent_web3_guide_001",
      txHash: "0x0g_tx_web3_guide_001",
      url: "https://0g.example/mock/agent/web3-guide-agent",
      storedAt: "2026-06-16T12:00:00.000Z",
    },
  },
];

export const agentCategories: Agent["category"][] = [
  "Business",
  "Study",
  "Research",
  "Coding",
  "Writing",
  "Web3",
  "Design",
];

export function getAgentById(id: string) {
  return agents.find((agent) => agent.id === id);
}
