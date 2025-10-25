import { Theme } from "@publicplan/kern-react-kit";

export const KernTheme: Theme = {
  typography: {
    fontSize: {
      static: {
        medium: "18px",
      },
    },
    fontWeight: {
      regular: 400,
      semiBold: 500,
    },
    lineHeight: {
      static: {
        medium: "24px",
      },
    },
  },
};

export const useKernTheme = () => KernTheme;
