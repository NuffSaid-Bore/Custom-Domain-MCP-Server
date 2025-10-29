import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerCashFlowTool(server: McpServer) {

    server.tool(
        "cash-flow-forecast",
        "Predict user cash flow over time (supports all users or specific IDs)",
        {
            // optional → if missing, forecast for all users
            userIds: z.array(z.number()).optional(),
            months: z.number().default(6),
        },
        {
            title: "Cash Flow Forecast",
            openWorldHint: true,
        },
        async ({ userIds, months }) => {
            try {
                // Load all users
                const users = await import("../data/financial-profiles.json", {
                    with: { type: "json" },
                }).then(m => m.default)

                // Filter users based on provided IDs (if any)
                const selectedUsers =
                    userIds && userIds.length > 0
                        ? users.filter((u: any) => userIds.includes(u.id))
                        : users

                // Helper to calculate recurring costs per month (normalize weekly to monthly)
                const calcRecurringMonthly = (recurringMerchants: any[]) => {
                    return recurringMerchants.reduce((sum, r) => {
                        let monthly = r.amount
                        if (r.frequency === "weekly") monthly *= 4
                        else if (r.frequency === "biweekly") monthly *= 2
                        return sum + monthly
                    }, 0)
                }

                const results = selectedUsers.map((user: any) => {
                    const totalIncome =
                        (user.income.salary || 0) +
                        (user.income.freelance || 0) +
                        (user.income.consulting || 0)

                    const totalVariableExpenses = user.transactionAggregates?.reduce(
                        (sum: number, t: any) => sum + t.totalAmount,
                        0
                    ) || 0

                    const totalDebts = user.debts?.reduce(
                        (sum: number, d: any) => sum + d.monthly_payment,
                        0
                    ) || 0

                    const totalRecurring = calcRecurringMonthly(user.recurringMerchants || [])

                    const totalMonthlyExpenses =
                        totalVariableExpenses + totalDebts + totalRecurring

                    const netMonthly = totalIncome - totalMonthlyExpenses

                    // Project month-by-month forecast
                    const projection = Array.from({ length: months }).map((_, i) => ({
                        month: `Month ${i + 1}`,
                        projectedBalance: netMonthly * (i + 1),
                        cumulativeNetFlow: netMonthly * (i + 1),
                        summary: {
                            income: totalIncome,
                            expenses: totalMonthlyExpenses,
                            netMonthly,
                        },
                    }))

                    return {
                        userId: user.id,
                        name: user.name,
                        age: user.age,
                        goals: user.goals.map((g: any) => g.name),
                        projection,
                    }
                })

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(results, null, 2),
                        },
                    ],
                }
            } catch (err) {
                console.error(err)
                return {
                    content: [
                        {
                            type: "text",
                            text: "Error generating cash flow forecast.",
                        },
                    ],
                }
            }
        }
    )
}