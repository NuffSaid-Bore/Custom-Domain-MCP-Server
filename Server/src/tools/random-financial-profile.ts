import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { createFinancialProfile } from "../lib/finance profile analizer/finance-profiles"
import { calculateRiskTolerance } from "../lib/finance profile analizer/calculate-risk-tolarence"
import { getRecommendations } from "../lib/finance profile analizer/recommendations"
import { getGoalBasedRecommendations } from "../lib/finance profile analizer/goal-based-recoms"
import { generateRandomProfile } from "../lib/finance profile analizer/generate-random-profile"


export function registerGenerateRandomFinancialProfileTool(server: McpServer) {
  server.tool(
    "generate-random-financial-profile",
    "Generate and analyze a random financial profile",
   {
    title: "Generate Random Financial Profile",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
    },

    async () => {
      try {
        // Generate random profile using local function instead of MCP sampling
        const profile = generateRandomProfile()

        // Save profile to disk
        await createFinancialProfile(profile)

        // Compute totals
        const incomeTotal = (Object.values(profile.income || {}) as number[]).reduce((a, b) => a + b, 0)
        // Calculate expenses from transaction aggregates as approximation
        const expensesTotal = (profile.transactionAggregates || []).reduce((sum: number, t: any) => sum + t.totalAmount, 0)
        const debtsTotal = (profile.debts || []).reduce((sum: number, debt: { monthly_payment: number }) => sum + debt.monthly_payment, 0)
        const goalNames = (profile.goals || []).map((goal: { name: string; amount: number }) => goal.name)

        // Analyze
        const riskTolerance = calculateRiskTolerance(
          incomeTotal,
          expensesTotal,
          debtsTotal,
          profile.age,
          goalNames
        )

        const riskRecs = getRecommendations(
          riskTolerance,
          incomeTotal,
          expensesTotal,
          debtsTotal
        )

        const goalRecs = getGoalBasedRecommendations(
          goalNames,
          incomeTotal,
          expensesTotal,
          debtsTotal
        )

        return {
          content: [
            { type: "text", text: `✅ Random profile generated and saved: **${profile.name}**` },
            { type: "text", text: `🧠 Risk Tolerance: **${riskTolerance.toUpperCase()}**` },
            { type: "text", text: `\n📊 Based on Financial Risk:\n` },
            ...riskRecs.map(rec => ({
              type: "text" as const,
              text: `💡 ${rec.title}\n📝 ${rec.explanation}\n📈 Confidence: ${(rec.confidence * 100).toFixed(1)}%`,
            })),
            { type: "text", text: `\n🎯 Based on Your Goals:\n` },
            ...goalRecs.map(rec => ({
              type: "text" as const,
              text: `💡 ${rec.title}\n📝 ${rec.explanation}\n📈 Confidence: ${(rec.confidence * 100).toFixed(1)}%`,
            })),
          ],
        }
      } catch (err) {
        console.error("Error generating random profile:", err);
        return {
          content: [{ type: "text", text: "❌ Failed to generate random financial profile." }],
        }
      }
    }
  )
}
