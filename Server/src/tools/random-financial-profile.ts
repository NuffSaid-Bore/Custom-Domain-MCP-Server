import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { createFinancialProfile } from "../lib/finance profile analizer/finance-profiles"
import { calculateRiskTolerance } from "../lib/finance profile analizer/calculate-risk-tolarence"
import { getRecommendations } from "../lib/finance profile analizer/recommendations"
import { getGoalBasedRecommendations } from "../lib/finance profile analizer/goal-based-recoms"
import { CreateMessageResultSchema } from "@modelcontextprotocol/sdk/types.js"


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
      const res = await server.server.request(
        {
          method: "sampling/createMessage",
          params: {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `
                    Generate a realistic dummy financial profile.

                    The profile must include:
                    - id and createdAt (use ISO string format for date)
                    - name and age
                    - 2–3 financial goals (e.g. Emergency Fund, Buy a House)
                    - income: salary, freelance, and/or consulting
                    - fixed and variable expenses
                    - debts with monthly payments
                    - transaction aggregates by category for a recent month
                    - 3–4 recurring merchants (Netflix, Spotify, Gym, etc.)
                    - 2–3 upcoming pay dates
                    - sessionContext: {}

                    Respond ONLY with a valid JSON object matching this shape:

                    {
                    "id": 1,
                    "createdAt": "2025-10-13T16:35:19+02:00",
                    "name": "Jane Doe",
                    "age": 32,
                    "goals": [{ "name": "...", "amount": 0 }],
                    "income": { "salary": 0, "freelance": 0, "consulting": 0 },
                    "debts": [{ "name": "...", "monthly_payment": 0 }],
                    "transactionAggregates": [{ "category": "...", "totalAmount": 0, "month": "October" }],
                    "recurringMerchants": [{ "name": "...", "amount": 0, "frequency": "monthly" | "weekly" | "biweekly" }],
                    "payDates": [{ "date": "YYYY-MM-DD", "category": "Salary" }],
                    "sessionContext": {}
                    }

                    Return only the JSON. No extra explanation or markdown.
                    `
                 ,
                },
              },
            ],
            maxTokens: 2048,
          },
        },
        CreateMessageResultSchema
      )
        console.log("Received response content:", res.content);

      if (res.content.type !== "text") {
        return {
          content: [{ type: "text", text: "❌ Failed to generate financial profile data." }],
        }
      }

      try {
        const profile = JSON.parse(
          res.content.text
          .trim()
          .replace(/^```json/, "")
          .replace(/```$/, "")
          .trim()
        )

        // Save profile to disk
        await createFinancialProfile(profile)

        // Compute totals
        const incomeTotal = (Object.values(profile.income || {}) as number[]).reduce((a, b) => a + b, 0)
        const expensesTotal = [...profile.expenses.fixed,...profile.expenses.variable,].reduce((sum, e) => sum + e.amount, 0)
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
        console.error("JSON parse error:", err, "Response text:", res.content.text);
        return {
          content: [{ type: "text", text: "❌ Failed to parse generated JSON." }],
        }
      }
    }
  )
}
