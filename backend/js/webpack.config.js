const path = require('node:path');

/** @param {import('webpack').Configuration} options */
module.exports = function (options) {
  return {
    ...options,
    resolve: {
      ...options.resolve,
      alias: {
        ...(options.resolve?.alias ?? {}),
        '@roomly/common': path.resolve(__dirname, 'libs/common/src'),
        '@roomly/infra': path.resolve(__dirname, 'libs/infra/src'),
        '@roomly/contracts': path.resolve(__dirname, 'libs/contracts/src'),
      },
    },
  };
};
