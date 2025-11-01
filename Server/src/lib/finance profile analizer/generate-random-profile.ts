import { FinancialProfile } from "./finance-profiles"
import { getJohannesburgTimestampISO } from "./created-at"

export function generateRandomProfile(): FinancialProfile {
  const names = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack"]
  const goals = [
    { name: "Emergency Fund", amount: Math.floor(Math.random() * 50000) + 10000 },
    { name: "Vacation", amount: Math.floor(Math.random() * 10000) + 2000 },
    { name: "Buy a House", amount: Math.floor(Math.random() * 500000) + 100000 },
    { name: "Retirement", amount: Math.floor(Math.random() * 200000) + 50000 },
    { name: "Car Purchase", amount: Math.floor(Math.random() * 300000) + 50000 }
  ]

  const merchants = [
    { name: "Netflix", amount: 159.99, frequency: "monthly" as const },
    { name: "Spotify", amount: 59.99, frequency: "monthly" as const },
    { name: "Gym Membership", amount: 500, frequency: "monthly" as const },
    { name: "Amazon Prime", amount: 299, frequency: "monthly" as const },
    { name: "MTN Data Plan", amount: 200, frequency: "weekly" as const },
    { name: "WiFi Data Plan", amount: 250, frequency: "monthly" as const }
  ]

  const categories = ["Groceries", "Utilities", "Transport", "Dining Out", "Entertainment", "Healthcare"]

  // Generate random profile
  const name = names[Math.floor(Math.random() * names.length)]
  const age = Math.floor(Math.random() * 40) + 20 // 20-60 years old

  // Random income
  const salary = Math.floor(Math.random() * 200000) + 30000
  const freelance = Math.random() > 0.7 ? Math.floor(Math.random() * 50000) + 5000 : 0
  const consulting = Math.random() > 0.8 ? Math.floor(Math.random() * 30000) + 2000 : 0

  // Random goals (2-3)
  const numGoals = Math.floor(Math.random() * 2) + 2
  const selectedGoals = goals.sort(() => 0.5 - Math.random()).slice(0, numGoals)

  // Random debts
  const debtTypes = ["Student Loan", "Credit Card", "Personal Loan", "Car Loan"]
  const numDebts = Math.floor(Math.random() * 3) + 1
  const debts = debtTypes.sort(() => 0.5 - Math.random()).slice(0, numDebts).map(debtName => ({
    name: debtName,
    monthly_payment: Math.floor(Math.random() * 3000) + 500
  }))

  // Random transaction aggregates
  const transactionAggregates = categories.slice(0, 4).map(category => ({
    category,
    totalAmount: Math.floor(Math.random() * 4000) + 1000,
    month: "October"
  }))

  // Random recurring merchants (3-4)
  const numMerchants = Math.floor(Math.random() * 2) + 3
  const recurringMerchants = merchants.sort(() => 0.5 - Math.random()).slice(0, numMerchants)

  // Random pay dates
  const payDates = [
    { date: "2025-10-25", category: "Salary" },
    { date: "2025-11-10", category: freelance > 0 ? "Freelance" : "Salary" },
    { date: "2025-11-25", category: consulting > 0 ? "Consulting" : "Salary" }
  ].slice(0, Math.floor(Math.random() * 2) + 2)

  return {
    name,
    age,
    goals: selectedGoals,
    income: {
      salary,
      ...(freelance > 0 && { freelance }),
      ...(consulting > 0 && { consulting })
    },
    debts,
    transactionAggregates,
    recurringMerchants,
    payDates,
    sessionContext: {}
  }
}