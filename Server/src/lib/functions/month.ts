
export function getFuturweMonth(offset: number): string {
  const now = new Date();
  const future = new Date(now.getFullYear(), now.getMonth() + offset, 1);

  const monthName = future.toLocaleString("en-ZA", { month: "long" });
  const year = future.getFullYear();

  return `${monthName} ${year}`;
}
