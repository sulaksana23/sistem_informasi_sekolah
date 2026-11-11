import { Settings } from './types';

export const APP_SETTINGS: Settings = {
  // 'demo1' -- template-react cuma punya satu layout (MainLayout, turunan
  // demo1 dari Metronic). Beberapa halaman contoh account/* mengecek
  // settings.layout === 'demo1' untuk nampilin toolbar/heading-nya.
  layout: 'demo1',
  container: 'fixed',
  layouts: {
    demo1: {
      sidebarCollapse: false,
      sidebarTheme: 'light',
    },
    demo2: {
      headerSticky: true,
      headerStickyOffset: 200,
    },
    demo5: {
      headerSticky: true,
      headerStickyOffset: 200,
    },
    demo7: {
      headerSticky: true,
      headerStickyOffset: 200,
    },
    demo9: {
      headerSticky: true,
      headerStickyOffset: 200,
    },
  },
};
