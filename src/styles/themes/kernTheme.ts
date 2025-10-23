import { Theme } from '@publicplan/kern-react-kit';

export const KernTheme: Theme = {
  color: {
    layout: {
      background: {
        default: '#003064',
        overlay: '#FFFFFF',
      },
      text: {
        default: '#003064',
        inverse: '#FFFFFF',
      },
    },
    action: {
      default: '#1869DB',
      state: {
        indicator: {
          shadeHover: '#00A085',
          tintHoverOpacity: '#00B89420',
        },
      },
    },
  },
  typography: {
    fontSize: {
      static: {
        medium: '18px',
      },
    },
    fontWeight: {
      regular: 400,
      semiBold: 500,
    },
    lineHeight: {
      static: {
        medium: '24px',
      },
    },
  },
};

export const useKernTheme = () => KernTheme;
