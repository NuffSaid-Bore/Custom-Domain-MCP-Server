# 🧠 Financial Wellness & Personalization MCP Server

**Version:** 1.0.0

---

## 📘 Overview

The **Financial Wellness & Personalization MCP Server** is a modular financial analysis and planning engine built on the **Model Context Protocol (MCP)**.
It exposes a set of intelligent tools to handle various aspects of personal finance — including budgeting, debt management, expense categorization, and net worth calculation — through a standardized protocol interface.

This server enables AI agents or client applications to interact with financial data models and generate personalized insights, forecasts, and synthetic (dummy) financial profiles for testing or personalization.

---

## ⚙️ Core Features

* 💰 **Budgeting Tool** — Generate and analyze personal budgets.
* 👤 **Financial Profile Tool** — Create and manage user financial profiles.
* 🎲 **Random Profile Generator** — Produce realistic synthetic financial data.
* 🧾 **Expense Categorization** — Classify transactions into intuitive spending categories.
* 💳 **Debt Repayment Planner** — Model repayment strategies and schedules.
* 📊 **Net Worth Calculator** — Compute total financial standing (assets vs. liabilities).
* 🔮 **Cash Flow Forecasting** — Predict upcoming income and expenses.
* 🧠 **MCP Prompt Integration** — Generate dummy profiles via prompt instructions.
* ✅ **Goal-Based Recommendations** — Suggest actionable steps for achieving goals.
* ✅ **Synthetic Profile Generation** — Produce realistic dummy financial data for testing or personalization.



---

## 🏗️ Project Structure

```
Server/
│
├── src/
│   ├── data/
│   │   └── financial.profiles.json
│   │
│   ├── lib/
│   │   ├── financial-profile-analyzer/
│   │   │   ├── calculate-risk-tolerance.ts
│   │   │   ├── created-at.ts
│   │   │   ├── finance-profiles.ts
│   │   │   ├── goal-based-recoms.ts
│   │   │   └── recommendations.ts
│   │   │
│   │   └── functions/
│   │       └── get-predict-dates.ts
│   │
│   ├── server.ts
│   │
│   └── tools/
│       ├── budgeting-tool.ts
│       ├── cash-flow-forecast.ts
│       ├── debt-repayments.ts
│       ├── expense-categorization.ts
│       ├── financial-profile-tool.ts
│       ├── net-worth.ts
│       └── random-financial-profile.ts
│
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

Each tool module registers an MCP-compliant tool with the server and exposes specific functionality related to financial planning or analysis.

---

## 🧩 Architecture

### 1. **MCP Server**

The project uses the `@modelcontextprotocol/sdk` package to define and manage an MCP (Model Context Protocol) server:

```js
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
```

The server defines:

* **Tools** — modular functions for financial tasks.
* **Prompts** — structured AI-driven instructions.
* **Resources** — potential shared data or model definitions (currently unused).

---

### 2. **Transport Layer**

The server communicates using **standard I/O (stdio)**:

```js
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```

This allows it to easily integrate with CLI tools or MCP clients.

---

### 3. **Tool Registration**

Each financial module is registered with the MCP server:

```js
registerFinancialProfileTool(server);
registerBudgetingTool(server);
registerGenerateRandomFinancialProfileTool(server);
registerExpenseCategorizationTool(server);
registerDebtRepaymentTool(server);
registerNetWorthTool(server);
registerCashFlowTool(server);
```

Each `registerXYZTool()` function:

* Defines an MCP tool schema.
* Provides input validation (via `zod`).
* Exposes a handler that executes the tool’s logic.

---

### 4. **Prompts**

A built-in prompt `generate-dummy-financial-profile` creates a realistic synthetic profile with fields like:

```json
{
  "name": "Jane Doe",
  "age": 32,
  "goals": [{"name": "Emergency Fund", "amount": 5000}],
  "income": {"salary": 75000, "freelance": 5000, "consulting": 0},
  "debts": [{"name": "Student Loan", "monthly_payment": 250, "interestRate": 15.5}],
  "transactionAggregates": [
    {"category": "Groceries", "totalAmount": 400, "month": "October"}
  ],
  "recurringMerchants": [
    {"name": "Netflix", "amount": 15, "frequency": "monthly"}
  ],
  "payDates": [{"date": "2025-11-01", "category": "Salary"}],
  "sessionContext": {}
}
```

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/NuffSaid-Bore/Custom-Domain-MCP-Server.git
cd Custom-Domain-MCP-Server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the MCP server

```bash
nmp run server:inspect
```

### 4. Run the build watch
```bash
nmp run server:build:watch
```

The server will start and wait for communication via stdio.

---

## 🧠 Usage

This MCP server is designed to be embedded or connected to AI systems that understand the Model Context Protocol.

### Example MCP Client Integration

If using an MCP-compatible client (like a LangChain or LLM runtime):

```js
const { McpClient } = require("@modelcontextprotocol/sdk/client");
const client = new McpClient("stdio", { command: "node", args: ["index.js"] });

await client.connect();


const profile = await client.prompt("generate-dummy-financial-profile");
console.log(profile);
```

---

## 🧰 Tool Descriptions

| Tool                                   | File                                | Purpose                                                               |
| -------------------------------------- | ----------------------------------- | --------------------------------------------------------------------- |
| **Financial Profile Tool**             | `tools/financial-profile-tool.js`   | Manage user’s financial profile data (income, expenses, debts, etc.). |
| **Budgeting Tool**                     | `tools/budgeting-tool.js`           | Generate or evaluate personal budgets.                                |
| **Random Financial Profile Generator** | `tools/random-financial-profile.js` | Create realistic dummy financial profiles.                            |
| **Expense Categorization Tool**        | `tools/expense-categorization.js`   | Categorize raw transaction data into spending categories.             |
| **Debt Repayment Tool**                | `tools/debt-repayment.js`           | Simulate repayment strategies and payoff timelines.                   |
| **Net Worth Tool**                     | `tools/net-worth.js`                | Calculate net worth based on assets and liabilities.                  |
| **Cash Flow Forecast Tool**            | `tools/cash-flow-forecast.js`       | Predict cash flow patterns over time.                                 |

---

## 🧾 Example: Budgeting Tool

Example schema and usage (simplified):

```js
{
  "income": {"salary": 10000, "freelance": 500, "consulting": 500},
  "recurringMerchants": [
    {"category": "Rent", "amount": 1500, "month": "November" },
    {"category": "Utilities", "amount": 200, "month": "November"},
    {"category": "Groceries", "amount": 400, "month": "November"}
  ]
}
```

The tool might return:

```json
{
  "totalIncome": 11000,
  "totalExpenses": 2100,
  "savings": 2900,
  "savingsRate": 0.58
}
```

---

## 🧩 Technologies Used

* **Node.js (v18+)**
* **Model Context Protocol SDK**
* **Zod** for schema validation
* **ES Modules** for modern import/export syntax

---

## 🛠️ Development

To extend this server:

1. Create a new tool in `/tools/your-new-tool.js`.
2. Define input/output schemas using `zod`.
3. Register the tool in `index.js`:

   ```js
   import { registerYourNewTool } from "./tools/your-new-tool";
   registerYourNewTool(server);
   ```

---


## 🤝 Contributing

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Open a Pull Request with a clear description of your improvement.

---

## 🧭 Future Roadmap

* 🔐 Add authentication for multi-user sessions.
* 📈 Integrate external financial APIs (Plaid, Yodlee, etc.).
* 💬 Add NLP-based expense categorization.
* 🧮 Introduce investment and retirement planning modules.

---

