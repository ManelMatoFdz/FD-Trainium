module.exports = {
  // Fix for webpack-dev-server allowedHosts schema error on some environments
  // Ensures the dev-server accepts incoming hosts (useful in Docker/VM/Windows setups)
  devServer: {
    // 'all' is accepted by webpack-dev-server v4
    allowedHosts: 'all'
  },
  webpack: {
    configure: (webpackConfig) => {
      // Ignorar warnings de source maps de node_modules
      webpackConfig.ignoreWarnings = [
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource.includes('node_modules') &&
            warning.details &&
            warning.details.includes('source-map-loader')
          );
        },
      ];

      // Deshabilitar source-map-loader para node_modules
      const sourceMapLoaderRule = webpackConfig.module.rules.find(
        rule => rule.enforce === 'pre' && rule.use && rule.use.some(
          loader => loader.loader && loader.loader.includes('source-map-loader')
        )
      );

      if (sourceMapLoaderRule) {
        sourceMapLoaderRule.exclude = /node_modules/;
      }

      return webpackConfig;
    },
  },
  jest: {
    configure: {
      transformIgnorePatterns: [
        'node_modules/(?!(date-fns|react-calendar))'
      ],
      moduleNameMapper: {
        '^react-calendar$': '<rootDir>/src/__mocks__/react-calendar.js',
        '^react-calendar/dist/Calendar.css$': '<rootDir>/src/__mocks__/styleMock.js',
        '^date-fns/locale$': '<rootDir>/src/__mocks__/date-fns-locale.js'
      }
    }
  }
};