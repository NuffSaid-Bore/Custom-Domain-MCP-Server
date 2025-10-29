type RiskLevel = "very low" | "low" | "medium" | "high" | "very high";

export function getRecommendations(
  riskTolerance: RiskLevel,
  incomeTotal: number,
  expensesTotal: number,
  debtsTotal: number
) {
  const recs = [];

  const expenseRatio = incomeTotal > 0 ? expensesTotal / incomeTotal : 1;
  const debtRatio = incomeTotal > 0 ? debtsTotal / incomeTotal : 1;
  const savingsSurplus = incomeTotal - expensesTotal;

  function confidenceByCondition(
    condition: boolean,
    high = 0.9,
    low = 0.75
  ): number {
    return condition ? high : low;
  }

  function assessConfidence(factor: number, thresholds: [number, number]): number {
    if (factor < thresholds[0]) return 0.6;
    if (factor < thresholds[1]) return 0.75;
    return 0.9;
  }

  switch (riskTolerance) {
    case "very low":
      recs.push({
        title: "Prioritize Capital Preservation",
        explanation:
          "Focus on stable, low-risk investments such as government bonds or insured savings.",
        confidence: confidenceByCondition(expenseRatio < 0.5 && debtRatio < 0.2),
      });
      recs.push({
        title: "Maintain a Robust Emergency Fund",
        explanation:
          "Keep a 6+ month emergency fund to safeguard against financial shocks.",
        confidence: confidenceByCondition(savingsSurplus > 5000),
      });
      break;

    case "low":
      recs.push({
        title: "Consider High-Yield Savings or CDs",
        explanation:
          "Low risk means you can safely grow savings with minimal exposure to market volatility.",
        confidence: confidenceByCondition(savingsSurplus > 3000),
      });
      recs.push({
        title: "Explore Conservative Mutual Funds",
        explanation:
          "Balanced funds or bond-heavy mutual funds can offer modest growth with limited risk.",
        confidence: assessConfidence(debtRatio, [0.1, 0.25]),
      });
      break;

    case "medium":
      recs.push({
        title: "Build a Balanced Portfolio",
        explanation:
          "Mix stocks, bonds, and cash to balance growth potential with risk mitigation.",
        confidence: confidenceByCondition(expenseRatio <= 0.7 && debtRatio <= 0.4),
      });
      recs.push({
        title: "Establish an Emergency Fund",
        explanation:
          "Aim for 3–6 months of expenses saved to cushion against unexpected costs.",
        confidence: confidenceByCondition(savingsSurplus > 3000),
      });
      recs.push({
        title: "Review Budget and Debt Strategy",
        explanation:
          "Optimizing spending and paying off high-interest debt can improve your financial health.",
        confidence: confidenceByCondition(debtRatio > 0.25 || expenseRatio > 0.6),
      });
      break;

    case "high":
      recs.push({
        title: "Focus on Debt Reduction",
        explanation:
          "High risk indicates liabilities are a major concern—prioritize paying these down aggressively.",
        confidence: assessConfidence(debtRatio, [0.3, 0.5]),
      });
      recs.push({
        title: "Limit Exposure to Volatile Investments",
        explanation:
          "Avoid high-risk investments until your financial position stabilizes.",
        confidence: confidenceByCondition(debtRatio > 0.4 || savingsSurplus < 2000),
      });
      recs.push({
        title: "Create and Follow a Strict Budget",
        explanation:
          "Tracking expenses closely can help free up resources to reduce debt and expenses.",
        confidence: confidenceByCondition(expenseRatio > 0.6),
      });
      break;

    case "very high":
      recs.push({
        title: "Seek Professional Financial Counseling",
        explanation:
          "With very high financial risk, expert advice is critical to develop a sustainable plan.",
        confidence: 0.95, // keep this high — always a strong recommendation
      });
      recs.push({
        title: "Immediately Reduce Expenses and Debt",
        explanation:
          "Urgent action is needed to stabilize your financial situation and avoid worsening debt.",
        confidence: confidenceByCondition(expenseRatio > 0.8 || debtRatio > 0.6),
      });
      recs.push({
        title: "Avoid New Debt or Risky Investments",
        explanation:
          "Focus on stopping the accumulation of debt and preserving what you have.",
        confidence: confidenceByCondition(debtRatio > 0.5),
      });
      break;
  }

  return recs;
}