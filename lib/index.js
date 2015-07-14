'use strict';

var extname = require('path').extname;

function getBaseFilename(file) {
    var base = file;
    var ext  = extname(base);

    return base.replace(RegExp('_('+ ops.locales.join('|') +')(?:'+ ext +')?$'), '_' + ops.default + ext);
}

function getAltFilename(file, fromLocale, toLocale) {
    var ext = extname(file);

    return file.replace('_'+ fromLocale + ext, '_'+ toLocale + ext);
}

function getLocale(file) {
    return file.match(pattern)[1];
}

function merge(src, dest) {
    for (var key in src) {
        if (!dest.hasOwnProperty(key)) {
            dest[key] = src[key];
        }
    }
}

module.exports = function (ops) {
    var pattern = RegExp('.*_('+ ops.locales.join('|') +')(?:\..*)?$');

    return function (files, ms, done) {
        ms.metadata().locales = ops;
        ms.metadata().filterByLocale = function (arr, locale) {
            return arr.filter(function (el, index) {
                return el.locale == locale;
            });
        };

        for (var file in files) {
            if (pattern.test(file)) {
                var base = getBaseFilename(file);

                files[file].locale = getLocale(file);

                // Add missing properties from base locale
                // This lets to have base some generic properties
                // applied only in the 'default' locale, e.g.: template
                if (base !== file) {
                    merge(files[base], files[file]);
                }
            } else {
                files[file].locale = ops.default;
            }

            files[file].altFiles = {};

            ops.locales.forEach(function (locale) {
                if (locale != files[file].locale) {
                    files[file].altFiles[locale] = files[getAltFilename(file, files[file].locale, locale)];
                } else {
                    files[file].altFiles[files[file].locale] = files[file];
                }
            });
        }

        // Index handling
        // Default locale will go in 'index.html'
        // Other index-es in '/:locale/index.html'
        for (file in files) {
            if (/^index/.test(file)) {
                var ext = extname(file);

                if (files[file].locale == ops.default) {
                    files[file].path = '';
                    files['index'+ ext] = files[file];
                } else {
                    files[file].path = files[file].locale +'/';
                    files[files[file].locale + '/index'+ext] = files[file];
                }

                // Remove old entry
                delete files[file];
            }
        }

        done();
    };
};
