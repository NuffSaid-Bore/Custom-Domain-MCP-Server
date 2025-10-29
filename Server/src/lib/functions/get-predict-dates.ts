import { parseISO, format, addMonths } from "date-fns";

export function getPredictedPayDates(payDates: { date: string; category: string }[]) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const output: string[] = [];

  payDates.forEach(pay => {
    const parsed = parseISO(pay.date);
    const isThisMonth = parsed.getMonth() === thisMonth && parsed.getFullYear() === thisYear;

    // We only predict forward if this month contains the payDate
    if (isThisMonth && /salary/i.test(pay.category)) {
      const nextMonthDate = addMonths(parsed, 1);
      output.push(
        `💼 Salary Payment:\n- This Month: ${format(parsed, "yyyy-MM-dd")}\n- Next Month (predicted): ${format(nextMonthDate, "yyyy-MM-dd")}`
      );
    } else {
      output.push(`📌 ${pay.category}: ${format(parsed, "yyyy-MM-dd")}`);
    }
  });

  return output;
}
