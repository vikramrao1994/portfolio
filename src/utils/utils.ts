const BASE_SPACING = 8;
type Unit = "px" | "rem" | "em";

export const spacing = (multiplier: number, unit: Unit = "px"): string => {
  return `${multiplier * BASE_SPACING}${unit}`;
};
