import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'xm-components-v3',
  favicon:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  outputPath: 'docs-dist',
  mode: 'site',
  lessLoader: {
    modifyVars: {
      '@xm-prefix': 'xm-components',
    },
    javascriptEnabled: true,
  },
  cssLoader: {
    localsConvention: 'camelCase',
  },
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
      },
    ],
  ],
});
