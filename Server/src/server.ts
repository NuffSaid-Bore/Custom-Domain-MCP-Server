import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { registerBudgetingTool } from "./tools/budgeting-tool"
import {registerFinancialProfileTool} from "./tools/financial-profile-tool"
import { registerGenerateRandomFinancialProfileTool } from "./tools/random-financial-profile"
import { registerExpenseCategorizationTool } from "./tools/expense-categorization"
import { registerDebtRepaymentTool } from "./tools/debt-repayment"
import { registerNetWorthTool } from "./tools/net-worth"
import { registerCashFlowTool } from "./tools/cash-flow-forecast"



const server = new McpServer({
  name: "Financial Wellness & Personalization",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
    prompts: {},
  },
})

registerFinancialProfileTool(server)

registerBudgetingTool(server)

registerGenerateRandomFinancialProfileTool(server)

registerExpenseCategorizationTool(server)

registerDebtRepaymentTool(server)

registerNetWorthTool(server)

registerCashFlowTool(server)

server.prompt(
  "generate-dummy-financial-profile",
  "Generate a realistic dummy financial profile",
  {},
  () => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate a realistic dummy financial profile.

            The profile should include:
            - name and age
            - 2–3 financial goals (e.g. Emergency Fund, Buy a House)
            - income: salary, freelance, and/or consulting
            - fixed and variable expenses
            - list of debts with monthly payments
            - transaction aggregates by category for a recent month
            - 3–4 recurring merchants (Netflix, Spotify, Gym, etc.)
            - 2–3 upcoming pay dates
            - sessionContext: an empty object

            Respond ONLY with a valid JSON object matching this shape:

            {
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
            `,
          },
        },
      ],
    }
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main()