'use strict';

var Multilange = require('./multilang');

module.exports = function (ops) {
    var multilang = new Multilang(ops);

    return multilang.getPlugin();
};
