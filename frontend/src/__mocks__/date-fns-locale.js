// Mock para date-fns/locale
// Exporta objetos mock básicos para los locales que necesitamos

const monthsEs = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const daysEs = ['do','lu','ma','mi','ju','vi','sá'];

export const es = {
  code: 'es',
  formatDistance: () => '',
  formatLong: {},
  formatRelative: () => '',
  localize: {
    month: (idx) => monthsEs[idx] || '',
    day: (idx) => daysEs[idx] || '',
    ordinalNumber: (n) => String(n),
  },
  match: {},
  options: {}
};

export const enUS = {
  code: 'en-US',
  formatDistance: () => '',
  formatLong: {},
  formatRelative: () => '',
  localize: {
    month: (idx) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][idx] || '',
    day: (idx) => ['Su','Mo','Tu','We','Th','Fr','Sa'][idx] || '',
    ordinalNumber: (n) => String(n),
  },
  match: {},
  options: {}
};
