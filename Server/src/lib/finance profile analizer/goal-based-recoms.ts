export function getGoalBasedRecommendations(
    goals: string[],
    incomeTotal: number,
    expensesTotal: number,
    debtsTotal: number,
    age?: number
    ) {
    const recs = [];

    const savingsSurplus = incomeTotal - expensesTotal;
    const debtRatio = incomeTotal > 0 ? debtsTotal / incomeTotal : 1;

    for (const goal of goals.map(g => g.toLowerCase())) {
        switch (goal) {
        case "buy a house":
            recs.push({
            title: "Start Saving for a Down Payment",
            explanation:
                "Open a dedicated savings account for your home fund. Aim to save at least 10–20% of your target home price.",
            confidence: savingsSurplus > 5000 ? 0.9 : 0.75,
            });
            if (debtRatio > 0.3) {
            recs.push({
                title: "Reduce Debt-to-Income Ratio",
                explanation:
                "Lenders prefer lower debt ratios. Pay off existing debts to improve mortgage eligibility.",
                confidence: 0.85,
            });
            }
            break;

        case "retirement":
            recs.push({
            title: "Contribute to a Retirement Account",
            explanation:
                "Use IRAs or 401(k)s to build tax-advantaged retirement savings.",
            confidence: age && age >= 50 ? 0.95 : 0.9,
            });
            if (savingsSurplus > 10000) {
            recs.push({
                title: "Automate Monthly Retirement Contributions",
                explanation:
                "Set automatic transfers to steadily grow your retirement savings.",
                confidence: 0.85,
            });
            }
            break;

        case "emergency fund":
            recs.push({
            title: "Build a 3–6 Month Emergency Fund",
            explanation:
                "Ensure you can cover essential expenses in case of job loss or emergencies.",
            confidence: 0.95,
            });
            if (expensesTotal > 0.6 * incomeTotal) {
            recs.push({
                title: "Adjust Expenses to Increase Savings",
                explanation:
                "Consider cutting unnecessary costs to build your emergency fund faster.",
                confidence: 0.8,
            });
            }
            break;

        case "education":
        case "save for children's education":
            recs.push({
            title: "Start a Dedicated Education Fund",
            explanation:
                "Look into 529 plans or education savings accounts to prepare for school fees.",
            confidence: 0.9,
            });
            if (savingsSurplus < 5000) {
            recs.push({
                title: "Set Small, Recurring Contributions",
                explanation:
                "Even small monthly contributions to an education fund can add up over time.",
                confidence: 0.75,
            });
            }
            break;

        case "aggressive growth":
            recs.push({
            title: "Explore Higher-Risk Investments",
            explanation:
                "Consider diversified stock portfolios, growth ETFs, or even startup investing (based on your risk profile).",
            confidence: debtRatio < 0.3 ? 0.85 : 0.7,
            });
            break;

        case "capital preservation":
            recs.push({
            title: "Prioritize Low-Risk, Stable Investments",
            explanation:
                "Look at treasury bonds, CDs, or money market accounts to preserve capital.",
            confidence: 0.9,
            });
            break;

        case "start a business":
            recs.push({
            title: "Create a Business Savings Fund",
            explanation:
                "Set aside capital for startup costs before quitting your job or seeking outside funding.",
            confidence: savingsSurplus > 8000 ? 0.85 : 0.7,
            });
            recs.push({
            title: "Draft a Lean Business Plan",
            explanation:
                "Outlining clear milestones and cash flow needs helps reduce risk.",
            confidence: 0.8,
            });
            break;

        case "travel":
            recs.push({
            title: "Set Up a Travel Budget",
            explanation:
                "Plan out how much you want to spend and save monthly toward that goal.",
            confidence: 0.85,
            });
            if (savingsSurplus < 1000) {
            recs.push({
                title: "Consider a Delayed Timeline",
                explanation:
                "With limited savings, pushing your travel goal back can help you avoid debt.",
                confidence: 0.75,
            });
            }
            break;

        case "early retirement":
            recs.push({
            title: "Maximize Retirement Contributions Now",
            explanation:
                "Early retirement requires front-loading your investments aggressively.",
            confidence: age && age < 40 && savingsSurplus > 15000 ? 0.9 : 0.75,
            });
            recs.push({
            title: "Track FIRE (Financial Independence, Retire Early) Metrics",
            explanation:
                "Calculate your savings rate, withdrawal rate, and target 'FI number' to stay on track.",
            confidence: 0.85,
            });
            break;
        }
    }

    return recs;
}