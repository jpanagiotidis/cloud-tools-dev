'use strict';

const _ = require('lodash');

function clearRequireCache() {
  const keys = _.map(require.cache, (v, k) => {
    return k;
  });
  _.each(keys, (k) => {
    delete require.cache[k];
  });
}

module.exports = {
  clearRequireCache,
}
