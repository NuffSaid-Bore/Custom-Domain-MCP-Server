import { z } from "zod"
import { createFinancialProfile } from "../lib/finance profile analizer/finance-profiles"
import { calculateRiskTolerance } from "../lib/finance profile analizer/calculate-risk-tolarence"
import { getRecommendations } from "../lib/finance profile analizer/recommendations"
import { getGoalBasedRecommendations } from "../lib/finance profile analizer/goal-based-recoms"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

const debtSchema = z.object({
  name: z.string(),
  interestRate: z.number().default(0),
  monthly_payment: z.number(),
})

const goalItemSchema = z.object({
  name: z.string(),
  amount: z.number(),
})

const transactionAggregateSchema = z.object({
  category: z.string(),
  totalAmount: z.number(),
  month: z.string(),
})

const recurringMerchantSchema = z.object({
  name: z.string(),
  amount: z.number(),
  frequency: z.enum(["monthly", "weekly", "biweekly"]),
})

const payDateSchema = z.object({
  date: z.string(),
  category: z.string(),
})

export function registerFinancialProfileTool(server: McpServer) {
  server.tool(
    "analyze-financial-profile",
    "Submit financial profile, save to file, and generate recommendations",
    {
      name: z.string(),
      age: z.number().int(),
      goals: z.array(goalItemSchema),
      income: z.record(z.string(), z.number()),
      debts: z.array(debtSchema),
      sessionContext: z.record(z.string(), z.any()).optional(),
      transactionAggregates: z.array(transactionAggregateSchema),
      recurringMerchants: z.array(recurringMerchantSchema),
      payDates: z.array(payDateSchema),
    },
    {
      title: "Analyze Financial Profile",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async (input) => {
      await createFinancialProfile(input)

      // 1️⃣ Total income and 10% reserved safety
      const incomeTotal = Object.values(input.income || {}).reduce((a, b) => a + b, 0)
      const reservedAmount = incomeTotal * 0.1
      const usableIncome = incomeTotal - reservedAmount

      // 2️⃣ Calculate totals
      const expensesTotal = input.transactionAggregates.reduce((sum, e) => sum + e.totalAmount, 0)
      const debtsTotal = input.debts.reduce((sum, d) => sum + d.monthly_payment, 0)
      const goalNames = input.goals.map(goal => goal.name)

      // 3️⃣ Adjusted disposable income after expenses + debts
      const leftover = usableIncome - (expensesTotal + debtsTotal)
      const hasSurplus = leftover > 0

      // 4️⃣ Risk and Recommendations
      const riskTolerance = calculateRiskTolerance(
        incomeTotal,
        expensesTotal,
        debtsTotal,
        input.age,
        goalNames
      )

      const riskRecs = getRecommendations(riskTolerance, incomeTotal, expensesTotal, debtsTotal)
      const goalRecs = getGoalBasedRecommendations(goalNames, incomeTotal, expensesTotal, debtsTotal)

      // 5️⃣ Intelligent summary
      const financialHealth =
        hasSurplus
          ? `✅ You have a monthly surplus of ${leftover.toLocaleString()} after reserving 10% of your income.`
          : `⚠️ You are overspending by ${Math.abs(leftover).toLocaleString()} even after keeping 10% reserved. Consider reducing discretionary expenses.`

      // 6️⃣ Suggest optimal debt focus
      const highestInterestDebt = input.debts.reduce(
        (max, d) => (d.interestRate > (max?.interestRate ?? 0) ? d : max),
        input.debts[0]
      )

      const debtAdvice = highestInterestDebt
        ? `💡 Focus extra payments on **${highestInterestDebt.name}**, which has the highest interest rate (${highestInterestDebt.interestRate}%).`
        : "💡 No debts found to prioritize."

      return {
        content: [
          {
            type: "text" as const,
            text: `✅ Financial profile saved for: **${input.name}**\n`,
          },
          {
            type: "text" as const,
            text: `🧮 Total Income: ${incomeTotal.toLocaleString()}\n💰 Reserved 10% Safety Buffer: ${reservedAmount.toLocaleString()}\n`,
          },
          {
            type: "text" as const,
            text: `📊 Usable Income (after reserve): ${usableIncome.toLocaleString()}\n💸 Total Expenses: ${expensesTotal.toLocaleString()}\n🏦 Total Debts: ${debtsTotal.toLocaleString()}\n`,
          },
          {
            type: "text" as const,
            text: `${financialHealth}\n\n${debtAdvice}\n`,
          },
          {
            type: "text" as const,
            text: `🧠 Risk Tolerance: **${riskTolerance.toUpperCase()}**\n`,
          },
          {
            type: "text" as const,
            text: `\n📊 Based on Financial Risk:\n`,
          },
          ...riskRecs.map(rec => ({
            type: "text" as const,
            text: `💡 ${rec.title}\n📝 ${rec.explanation}\n📈 Confidence: ${(rec.confidence * 100).toFixed(1)}%`,
          })),
          {
            type: "text" as const,
            text: `\n🎯 Based on Your Goals:\n`,
          },
          ...goalRecs.map(rec => ({
            type: "text" as const,
            text: `💡 ${rec.title}\n📝 ${rec.explanation}\n📈 Confidence: ${(rec.confidence * 100).toFixed(1)}%`,
          })),
        ],
      }
    }
  )
}
