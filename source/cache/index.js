'use strict';

const _ = require('lodash');

function clearRequireCache(prefixes) {
  if (!prefixes) {
    prefixes = [];
  }

  if (!_.isArray(prefixes)) {
    prefixes = [prefixes];
  }

  const keys = _.map(require.cache, (v, k) => {
    return k;
  });
  _.chain(keys)
  .filter(k => (prefixes.some(x => (k.indexOf(x) === 0))))
  .each(k => (delete require.cache[k]))
  .value();
}

module.exports = {
  clearRequireCache,
};
