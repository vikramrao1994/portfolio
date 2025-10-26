import { spacing } from "@/utils/utils";

const cardRootStyle: React.CSSProperties = {
  borderRadius: spacing(1),
  marginTop: spacing(4),
  maxWidth: "800px",
  margin: "0 auto",
  backgroundColor: `rgba(255, 255, 255, 0.8)`,
  backdropFilter: `blur(${spacing(1.25)})`,
  zIndex: 1,
};

export { cardRootStyle };
