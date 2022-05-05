export default {
  esm: 'babel',
  cssModules: true,
  extractCSS: true,
  lessInRollupMode: {
    modifyVars: {
      '@xm-prefix': 'xm-components',
    },
  },
};
