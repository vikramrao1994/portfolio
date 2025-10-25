const BASE_SPACING = 8;
type Unit = "px" | "rem" | "em";

export const spacing = (multiplier: number, unit: Unit = "px"): string => {
  return `${multiplier * BASE_SPACING}${unit}`;
};

export const getDurationString = (exactDuration: string): string => {
  const [startStr, endStr] = exactDuration.split(" - ");
  const startDate = new Date(startStr);
  const endDate = endStr === "Present" ? new Date() : new Date(endStr);

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const result: string[] = [];
  if (years > 0) result.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months > 0) result.push(`${months} month${months > 1 ? "s" : ""}`);
  if (result.length === 0) return "Less than a month";
  return result.join(" ");
};
