const BASE_SPACING = 8;
type Unit = "px" | "rem" | "em";

export const spacing = (multiplier: number, unit: Unit = "px"): string => {
  return `${multiplier * BASE_SPACING}${unit}`;
};

export const getDurationString = (
  exactDuration: string,
  language: "en" | "de" = "en"
): string => {
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
  if (years > 0) {
    if (language === "de") {
      result.push(`${years} Jahr${years > 1 ? "e" : ""}`);
    } else {
      result.push(`${years} year${years > 1 ? "s" : ""}`);
    }
  }
  if (months > 0) {
    if (language === "de") {
      result.push(`${months} Monat${months > 1 ? "e" : ""}`);
    } else {
      result.push(`${months} month${months > 1 ? "s" : ""}`);
    }
  }
  if (result.length === 0) {
    return language === "de" ? "Weniger als ein Monat" : "Less than a month";
  }
  return result.join(" ");
};
