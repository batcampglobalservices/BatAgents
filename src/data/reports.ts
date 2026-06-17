export type MockReport = {
  reportedAgent: string;
  reason: string;
  reporter: string;
  severity: "low" | "medium" | "high";
  status: "open" | "reviewing" | "resolved";
};

export const mockReports: MockReport[] = [
  {
    reportedAgent: "Startup Validator Agent",
    reason: "Response felt too generic on pricing assumptions.",
    reporter: "Nia Adeyemi",
    severity: "medium",
    status: "reviewing",
  },
  {
    reportedAgent: "Pitch Coach Agent",
    reason: "Asked for one more iteration after the first draft.",
    reporter: "Amina Yusuf",
    severity: "low",
    status: "open",
  },
  {
    reportedAgent: "Research Agent",
    reason: "Wanted a source list attached to the summary.",
    reporter: "Kemi Hassan",
    severity: "high",
    status: "open",
  },
];
