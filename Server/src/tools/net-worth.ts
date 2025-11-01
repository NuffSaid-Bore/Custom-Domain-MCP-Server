import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerNetWorthTool(server: McpServer) {
  server.tool(
    "calculate-net-worth",
    "Calculate user’s total net worth",
    {
      assets: z.array(z.object({ name: z.string(), value: z.number() })),
      liabilities: z.array(z.object({ name: z.string(), value: z.number() })),
    },
    {
      title: "Analyze NetWorth based on Assets and Liabilities",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async ({ assets = [], liabilities = [] }) => {
      const totalAssets = assets.reduce((s, a) => s + a.value, 0);
      const totalLiabilities = liabilities.reduce((s, l) => s + l.value, 0);
      const netWorth = totalAssets - totalLiabilities;

      // 🧮 Determine a quick summary
      const status =
        netWorth > 0
          ? `✅ Positive net worth — you own more than you owe.`
          : netWorth < 0
          ? `⚠️ Negative net worth — your liabilities exceed your assets.`
          : `⚖️ Net worth is balanced — assets equal liabilities.`;

      // ✅ Return as "text" instead of "json"
      return {
        content: [
          {
            type: "text",
            text: [
              `📊 Net Worth Summary`,
              `-------------------------`,
              `💰 Total Assets: R${totalAssets.toLocaleString()}`,
              `🏦 Total Liabilities: R${totalLiabilities.toLocaleString()}`,
              `🧾 Net Worth: ${netWorth.toLocaleString()}`,
              ``,
              status,
            ].join("\n"),
          },
        ],
      }
    }
  )
}
