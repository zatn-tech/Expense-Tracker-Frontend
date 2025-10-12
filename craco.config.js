const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Optimize for production
      if (env === 'production') {
        // Enable tree shaking
        webpackConfig.optimization.usedExports = true;
        webpackConfig.optimization.sideEffects = false;

        // Enhanced chunk optimization
        webpackConfig.optimization.splitChunks = {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              enforce: true,
            },
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 20,
              enforce: true,
            },
            // Separate chunk for Chart.js and related libraries
            charts: {
              test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2|chartjs-adapter-date-fns)[\\/]/,
              name: 'charts',
              chunks: 'all',
              priority: 15,
              enforce: true,
            },
            // Separate chunk for React Router
            router: {
              test: /[\\/]node_modules[\\/](react-router|react-router-dom)[\\/]/,
              name: 'router',
              chunks: 'all',
              priority: 12,
              enforce: true,
            },
            // Capacitor chunk
            capacitor: {
              test: /[\\/]node_modules[\\/]@capacitor[\\/]/,
              name: 'capacitor',
              chunks: 'all',
              priority: 18,
              enforce: true,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            }
          },
        };

        // Enable module concatenation
        webpackConfig.optimization.concatenateModules = true;

        // Optimize runtime chunk
        webpackConfig.optimization.runtimeChunk = 'single';

        // Enhanced minification
        webpackConfig.optimization.minimizer = [
          new TerserPlugin({
            terserOptions: {
              parse: {
                ecma: 8,
              },
              compress: {
                ecma: 5,
                warnings: false,
                comparisons: false,
                inline: 2,
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
              },
              mangle: {
                safari10: true,
              },
              output: {
                ecma: 5,
                comments: false,
                ascii_only: true,
              },
            },
            parallel: true,
            extractComments: false,
          }),
          new CssMinimizerPlugin({
            minimizerOptions: {
              preset: [
                'default',
                {
                  discardComments: { removeAll: true },
                },
              ],
            },
          }),
        ];

        // Add compression plugin
        webpackConfig.plugins.push(
          new CompressionPlugin({
            test: /\.(js|css|html|svg)$/,
            algorithm: 'gzip',
            threshold: 8192,
            minRatio: 0.8,
          })
        );

        // Optimize module resolution
        webpackConfig.resolve.alias = {
          ...webpackConfig.resolve.alias,
          'react-dom$': 'react-dom/profiling',
          'scheduler/tracing': 'scheduler/tracing-profiling',
        };
      }

      return webpackConfig;
    },
  },
  // Development server configuration
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      // Add cache headers for development
      devServer.app.use((req, res, next) => {
        // Set cache headers for static assets in development
        if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (req.url.match(/\.html$/)) {
          res.setHeader('Cache-Control', 'public, max-age=3600');
        } else {
          res.setHeader('Cache-Control', 'no-cache');
        }
        next();
      });
      
      return middlewares;
    },
  },
};