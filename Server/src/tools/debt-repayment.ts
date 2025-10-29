import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const strategySchema = z
  .preprocess(
    val => val ?? "avalanche",
    z.enum(["avalanche", "snowball"])
  );


export async function registerDebtRepaymentTool(server: McpServer) {
  server.tool(
    "debt-repayment-strategy",
    "Suggest optimal debt repayment order from saved financial profiles",
    { strategy: strategySchema },
    {
      title: "Debt Repayment Strategy Analysis",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async ({ strategy }) => {
      try {
      
        // ✅ Load financial profiles JSON file dynamically
        const profiles = await import("../data/financial-profiles.json", {
          with: { type: "json" },
        }).then(m => m.default);

        // ✅ Build recommendations for each user
        const results = profiles.map(profile => {
          const { name, debts } = profile;

          if (!debts || debts.length === 0) {
            return {
              user: name,
              message: "No debts found in this profile.",
            };
          }

          // Copy to avoid mutating original
          const sortedDebts = [...debts];

          if (strategy === "avalanche") {
            // Sort by descending interest rate (higher first)
            sortedDebts.sort((a, b) => (b.interestRate ?? 0) - (a.interestRate ?? 0));
          } else {
            // Sort by ascending balance (lower first)
            sortedDebts.sort((a, b) => (a.monthly_payment ?? 0) - (b.monthly_payment ?? 0));
          }

          const recommendedOrder = sortedDebts.map(d => d.name);

          // ✅ Generate a readable summary
          let summary = `💰 **${name}** — Recommended Debt Repayment Strategy (${strategy.toUpperCase()}):\n`;
          summary += `\nOrder of repayment:\n`;
          recommendedOrder.forEach((debt, i) => {
            summary += `  ${i + 1}. ${debt}\n`;
          });

          // Optional: add estimated timeline or suggestions
          const totalMonthlyPayments = debts.reduce(
            (sum, d) => sum + (d.monthly_payment ?? 0),
            0
          );
          summary += `\nTotal monthly debt payments: R${totalMonthlyPayments.toLocaleString()}.\n`;

          return { user: name, summary };
        });

        // ✅ Return as text output for MCP compatibility
        return {
          content: [
            {
              type: "text",
              text: results.map(r => r.summary || `${r.user}: ${r.message}`).join("\n\n"),
            },
          ],
        };
      } catch (err) {
        console.error("Failed to generate debt repayment strategy:", err);
        return {
          content: [
            {
              type: "text",
              text: "Error: Unable to analyze debt repayment strategy from saved profiles.",
            },
          ],
        };
      }
    }
  );
}
