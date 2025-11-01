import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";


export async function registerExpenseCategorizationTool(server: McpServer) {
  server.tool(
    "analyze-expenses",
    "Analyze expenses from saved financial profiles and provide suggestions",
    {
      title: "Expense Categorization Analysis",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async () => {
      try {
        // Load your saved financial profiles
        const profiles = await import("../data/financial-profiles.json", {
          with: { type: "json" },
        }).then(m => m.default)

        const results = profiles.map(profile => {
          const { name, transactionAggregates, income } = profile

          const totalMonthlyIncome =
            (income?.salary || 0) +
            (income?.freelance || 0) +
            (income?.consulting || 0)

          const totalExpenses = transactionAggregates.reduce(
            (sum, t) => sum + (t.totalAmount || 0),
            0
          )

          // Identify top spending categories
          const topCategories = [...transactionAggregates]
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 3)

          // Financial suggestions
          const savingsPotential = totalMonthlyIncome - totalExpenses

          let suggestions = []

          if (savingsPotential > 0) {
            suggestions.push(
              `You're saving about R${savingsPotential.toLocaleString()} per month — consider allocating it toward goals like "${profile.goals[0]?.name}".`
            )
          } else {
            suggestions.push(
              `You're overspending by R${Math.abs(savingsPotential).toLocaleString()} — review discretionary categories like "${topCategories[0].category}".`
            )
          }

          const utilitySpending = transactionAggregates.find(
            t => t.category.toLowerCase() === "utilities"
          )
          if (utilitySpending && utilitySpending.totalAmount > 2500) {
            suggestions.push(
              "Your utility costs are quite high — consider optimizing energy or data plans."
            )
          }

          const diningOut = transactionAggregates.find(
            t => t.category.toLowerCase() === "dining out"
          )
          if (diningOut && diningOut.totalAmount > 1000) {
            suggestions.push(
              "Dining out expenses are significant — try meal prepping to save."
            )
          }

          return {
            user: name,
            totalMonthlyIncome,
            totalExpenses,
            savingsPotential,
            topCategories,
            suggestions,
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
        console.error("Failed to analyze expenses:", err)
        return {
          content: [
            {
              type: "text",
              text: "Error: Unable to analyze expenses from saved profiles.",
            },
          ],
        }
      }
    }
  )
}