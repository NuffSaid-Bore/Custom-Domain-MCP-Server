import fs from "fs/promises"
import {getJohannesburgTimestampISO} from "./created-at"

const filePath = "./src/data/financial-profiles.json"

export type FinancialProfile = {
  name: string
  age: number
  goals: { name: string; amount: number }[]
  income: Record<string, number>
  debts:{name: string; monthly_payment: number}[]
  sessionContext?: Record<string, any>
  transactionAggregates?: {
    category: string
    totalAmount: number
    month: string
  }[]
  recurringMerchants?: {
    name: string
    amount: number
    frequency: "monthly" | "weekly" | "biweekly"
  }[]
  payDates?: {
    date: string
    category: string
  }[]
}

export async function createFinancialProfile(profile: FinancialProfile) {
  let profiles: any[] = []

  try {
    const data = await import("../../data/financial-profiles.json", {
      with: { type: "json" },
    }).then(m => m.default)

    profiles = Array.isArray(data) ? data : []
  } catch {
    profiles = []
  }

  const id = profiles.length + 1
  const createdAt = getJohannesburgTimestampISO()

  const newProfile = {
    id,
    createdAt,
    ...profile,
  }

  profiles.push(newProfile)

  await fs.writeFile(filePath, JSON.stringify(profiles, null, 2))

  return id
}
