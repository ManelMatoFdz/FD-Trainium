module.exports = {
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
        "node_modules/(?!(date-fns|@babel|@react-router))"
      ]
    }
  }
};