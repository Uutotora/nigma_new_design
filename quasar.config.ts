import { configure } from 'quasar/wrappers';

export default configure(() => {
  const basePath = (process.env.BUILD_BASE_PATH ?? 'nigma_new_design').trim().replace(/^\/+|\/+$/g, '');

  return {
    boot: [],

    css: ['app.scss'],

    extras: [
      'roboto-font',
      'material-icons',
      'mdi-v7',
    ],

    build: {
      target: { browser: ['es2022', 'firefox115', 'chrome115', 'safari14'] },
      vueRouterMode: 'hash',
      publicPath: basePath ? `/${basePath}/` : '/',
    },

    devServer: {
      open: true,
    },

    framework: {
      config: {
        brand: {
          primary: '#027be3',
          secondary: '#26A69A',
          accent: '#9C27B0',
          dark: '#1d1d1d',
          positive: '#21BA45',
          negative: '#C10015',
          info: '#31CCEC',
          warning: '#F2C037',
        },
      },
      plugins: [],
    },

    animations: [],

    ssr: { pwa: false },
    pwa: { workboxMode: 'GenerateSW' },
    cordova: {},
    capacitor: { hideSplashscreen: true },
    electron: {
      inspectPort: 5858,
      bundler: 'packager',
    },
    bex: { contentScripts: ['my-content-script'] },
  };
});
