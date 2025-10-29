
type RiskLevel = "very low" | "low" | "medium" | "high" | "very high";

export function calculateRiskTolerance(
  incomeTotal: number,
  expensesTotal: number,
  debtsTotal: number,
  age?: number,
  goals?: string[]
): RiskLevel {
  // Base risk from expenses & debts
  let baseRisk: RiskLevel = "medium";

  if (expensesTotal > incomeTotal && debtsTotal > incomeTotal) {
    baseRisk = "very high";
  } else if (
    (expensesTotal > incomeTotal && debtsTotal <= incomeTotal) ||
    (expensesTotal <= incomeTotal && debtsTotal > incomeTotal)
  ) {
    baseRisk = "high";
  } else if (
    expensesTotal >= 0.8 * incomeTotal &&
    expensesTotal <= incomeTotal &&
    debtsTotal <= 0.5 * incomeTotal
  ) {
    baseRisk = "medium";
  } else if (
    expensesTotal <= 0.5 * incomeTotal &&
    debtsTotal >= 0.5 * incomeTotal &&
    debtsTotal <= incomeTotal
  ) {
    baseRisk = "medium";
  } else if (
    expensesTotal <= 0.5 * incomeTotal &&
    debtsTotal <= 0.5 * incomeTotal
  ) {
    baseRisk = "low";
  } else if (expensesTotal < incomeTotal && debtsTotal < incomeTotal) {
    baseRisk = "low";
  } else {
    baseRisk = "medium";
  }

  // Adjust risk by age (if provided)
  if (age !== undefined) {
    if (age < 35) {
      // Younger users: bump risk one level higher (if not very high already)
      if (baseRisk === "low") baseRisk = "medium";
      else if (baseRisk === "medium") baseRisk = "high";
      else if (baseRisk === "high") baseRisk = "very high";
    } else if (age >= 60) {
      // Older users: reduce risk one level (if not very low)
      if (baseRisk === "very high") baseRisk = "high";
      else if (baseRisk === "high") baseRisk = "medium";
      else if (baseRisk === "medium") baseRisk = "low";
      else if (baseRisk === "low") baseRisk = "very low";
    }
  }

  // Adjust risk by goals
  if (goals && goals.length > 0) {
    if (goals.includes("aggressive growth")) {
      // Increase risk tolerance one level
      if (baseRisk === "low") baseRisk = "medium";
      else if (baseRisk === "medium") baseRisk = "high";
      else if (baseRisk === "high") baseRisk = "very high";
    }
    if (goals.includes("capital preservation")) {
      // Decrease risk tolerance one level
      if (baseRisk === "very high") baseRisk = "high";
      else if (baseRisk === "high") baseRisk = "medium";
      else if (baseRisk === "medium") baseRisk = "low";
      else if (baseRisk === "low") baseRisk = "very low";
    }
  }

  return baseRisk;
}