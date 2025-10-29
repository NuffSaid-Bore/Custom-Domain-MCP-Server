import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import financialProfile from "../data/financial-profiles.json";
import { getFutureMonth } from "../lib/functions/month";
import { getPredictedPayDates } from "../lib/functions/get-predict-dates"

export function registerBudgetingTool(server: McpServer) {
  server.tool(
    "budgeting-cashflow-analyzer",
    "Analyze saved financial profile + user input to produce forecasts and budgets",
    {
      title: "Advanced Budgeting & Cashflow Analyzer",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async () => {
      const latestProfile = financialProfile
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      const income = latestProfile?.income || {};
      const debts = latestProfile?.debts || [];
      const goals = latestProfile?.goals || [];
      const transactionAggregates = latestProfile?.transactionAggregates || [];
      const recurringMerchants = latestProfile?.recurringMerchants || [];
      const payDates = latestProfile?.payDates || [];

      // Step 1: Core Budget Elements
      const totalIncome = Object.values(income).reduce(
        (sum, val) => (typeof val === "number" ? sum + val : sum),
        0
      )
      

     
      const transactions = transactionAggregates.reduce((sum, e) => sum + e.totalAmount, 0);
      const totalDebtMinimums = debts.reduce((sum, d) => sum + d.monthly_payment, 0);

      const essentialSpending = transactions + totalDebtMinimums;
      const remainingAfterEssentials = totalIncome - essentialSpending;

      // Step 2: Reserve Buffer (15% of income)
      const bufferPercent = 0.15;
      const safetyBuffer = totalIncome * bufferPercent;
      const allocatableSurplus = remainingAfterEssentials - safetyBuffer;

      // Step 3: Emergency Fund + Goal Allocations
      const calculatedBurnRate = essentialSpending;
      const emergencyFundTarget = calculatedBurnRate * 3; // conservative minimum

      const goalTargets = goals.map((g) => ({ ...g }));
      const totalGoalNeed = goalTargets.reduce((sum, g) => sum + g.amount, 0);
      const combinedNeed = emergencyFundTarget + totalGoalNeed;

      let emergencyFundThisMonth = 0;
      let goalSavingsPlan: {
        name: string;
        target: number;
        saveThisMonth: number;
        estimatedMonths: number;
      }[] = [];

      if (allocatableSurplus > 0 && combinedNeed > 0) {
        const availableRatio = allocatableSurplus / combinedNeed;

        emergencyFundThisMonth = parseFloat(
          Math.min(emergencyFundTarget, emergencyFundTarget * availableRatio).toFixed(2)
        );

        goalSavingsPlan = goalTargets.map((goal) => {
          const thisMonth = goal.amount * availableRatio;
          return {
            name: goal.name,
            target: goal.amount,
            saveThisMonth: parseFloat(thisMonth.toFixed(2)),
            estimatedMonths: Math.ceil(goal.amount / (thisMonth || 1)),
          };
        });
      }

      // Step 4: Forecast
      const forecast = Array.from({ length: 3 }).map((_, i) => {
        const month = getFutureMonth(i);
        const netCashflow = totalIncome - essentialSpending;
        return {
          month,
          income: totalIncome,
          burn: essentialSpending,
          net: netCashflow,
        };
      });

      // Step 5: Final Remaining
      const totalGoalSavingsThisMonth = goalSavingsPlan.reduce((sum, g) => sum + g.saveThisMonth, 0);
      const totalAllocation = essentialSpending + emergencyFundThisMonth + totalGoalSavingsThisMonth + safetyBuffer;
      const finalRemaining = totalIncome - totalAllocation;

      // Format paydates
      const renderedPayDates = getPredictedPayDates(payDates).join("\n");


      // Top 5 spending categories
      const topCategories = transactionAggregates
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5)
        .map((t) => `- ${t.category}: R${t.totalAmount.toFixed(2)}`)
        .join("\n");

      // Recurring Merchants Summary
      const recurringSummary = recurringMerchants
        .sort((a, b) => b.amount - a.amount)
        .map((m) => `- ${m.name} (${m.frequency}): R${m.amount.toFixed(2)}`)
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `📊 Monthly Essentials (Burn Rate): R${essentialSpending.toFixed(2)}`,
          },
          {
            type: "text",
            text: `💵 Total Monthly Income: R${totalIncome.toFixed(2)}`,
          },
          {
            type: "text",
            text: `💾 Reserved Safety Buffer (15%): R${safetyBuffer.toFixed(2)}`,
          },
          {
            type: "text",
            text: `📅 Upcoming Pay Dates:\n${renderedPayDates}`,
          },
          {
            type: "text",
            text: `💰 Emergency Fund Plan:\n- Target (3 months): R${emergencyFundTarget.toFixed(2)}\n- Saving This Month: R${emergencyFundThisMonth.toFixed(2)}`,
          },
          {
            type: "text",
            text: `🎯 Goal Contributions This Month:\n` +
              (goalSavingsPlan.length > 0
                ? goalSavingsPlan
                    .map((g) => `- ${g.name}: Save R${g.saveThisMonth} → ~${g.estimatedMonths} months`)
                    .join("\n")
                : `🚫 No surplus available for goals.`),
          },
          {
            type: "text",
            text: `📉 Cashflow Forecast (next 3 months):\n` +
              forecast
                .map(
                  (f) =>
                    `- ${f.month}: Income: R${f.income.toFixed(2)}, Burn: R${f.burn.toFixed(
                      2
                    )}, Net: R${f.net.toFixed(2)}`
                )
                .join("\n"),
          },
          {
            type: "text",
            text: `📌 Top Spending Categories:\n${topCategories}`,
          },
          {
            type: "text",
            text: `🔁 Recurring Merchants:\n${recurringSummary}`,
          },
          {
            type: "text",
            text: `✅ Final Summary:\n- Total Income: R${totalIncome.toFixed(2)}\n- Essentials: R${essentialSpending.toFixed(
              2
            )}\n- Emergency Fund (this month): R${emergencyFundThisMonth.toFixed(
              2
            )}\n- Goals (this month): R${totalGoalSavingsThisMonth.toFixed(2)}\n- Reserved Buffer: R${safetyBuffer.toFixed(
              2
            )}\n- 🧮 Remaining Surplus: R${finalRemaining.toFixed(2)}`,
          },
        ],
      };
    }
  );
}
