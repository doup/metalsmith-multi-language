'use strict';

var extname = require('path').extname;

function Multilang(ops) {
    this.default = ops.default;
    this.locales = ops.locales;
    this.pattern = RegExp('.*_('+ ops.locales.join('|') +')(?:\..*)?$');
    this.pathPattern = RegExp('(^(' + ops.locales.join('|') +')/|/(' + ops.locales.join('|') +')/)');
}

Multilang.prototype.getAltFilename = function (file, fromLocale, toLocale) {
    var ext = extname(file);

    // Locale in the path.
    if (this.pathPattern.test(file)) {
      var replacementString = file.match(this.pathPattern)[0].replace(fromLocale, toLocale);
      return file.replace(this.pathPattern, replacementString);
    }

    // Locale in the filename.
    return file.replace('_'+ fromLocale + ext, '_'+ toLocale + ext);
};

// Returns the name of the main filename
// It's usefull to know which file is the main when merging properties
//
// Given { default: 'es', locales: ['ca', 'es'] }
// And file_ca.md as argument
// Returns file_es.md
Multilang.prototype.getBaseFilename = function (file) {

    // Locale in the path.
    if (this.pathPattern.test(file)) {
      var replacementString = file.match(this.pathPattern)[0].replace(
        RegExp('(/?)('+ this.locales.join('|') +')(/)'),
        '$1' + this.default + '$3'
      );
      return file.replace(this.pathPattern, replacementString);
    }

    // Locale in the filename.
    var ext = extname(file);
    return file.replace(RegExp('_('+ this.locales.join('|') +')(?:'+ ext +')?$'), '_' + this.default + ext);
};

Multilang.prototype.getLocale = function (file) {
    // Locale in the path.
    if (this.pathPattern.test(file)) {
        return file.match(this.pathPattern)[0].replace(
          RegExp('(/?)('+ this.locales.join('|') +')(/)'),
          '$2'
        );
    }

    // Locale in the filename.
    return file.match(this.pattern)[1];
};

Multilang.prototype.getPlugin = function () {
    var self = this;

    function lang(locale) {
        if (locale in this.altFiles) {
            return this.altFiles[locale];
        } else {
            throw new Error('Unknown locale "'+ locale +'".');
        }
    }

    return function (files, ms, done) {
        ms.metadata().locales       = self.locales;
        ms.metadata().defaultLocale = self.default;

        for (var file in files) {
            if (self.pattern.test(file) || self.pathPattern.test(file)) {
                var base = self.getBaseFilename(file);

                files[file].locale = self.getLocale(file);

                // Add missing properties from base locale
                // This lets to have base some generic properties
                // applied only in the 'default' locale, e.g.: template
                if (base !== file) {
                    self.merge(files[base], files[file]);
                }
            } else {
                files[file].locale = self.default;
            }

            // Generate altFiles map
            files[file].altFiles = {};

            self.locales.forEach(function (locale) {
                if (locale != files[file].locale) {
                    files[file].altFiles[locale] = files[self.getAltFilename(file, files[file].locale, locale)];
                } else {
                    files[file].altFiles[files[file].locale] = files[file];
                }
            });

            // Bind lang()
            files[file].lang = lang.bind(files[file]);
        }

        // Index handling
        // Default locale will go in 'index.html'
        // Other index-es in '/:locale/index.html'
        for (file in files) {
            if (/^index/.test(file)) {
                var ext = extname(file);

                if (files[file].locale == self.default) {
                    files[file].path = '';
                    files['index'+ ext] = files[file];
                } else {
                    files[file].path = files[file].locale +'/';
                    files[files[file].locale +'/index'+ ext] = files[file];
                }

                // Remove old entry
                delete files[file];
            }
        }

        done();
    };
};

Multilang.prototype.merge = function (src, dest) {
    for (var key in src) {
        if (!dest.hasOwnProperty(key)) {
            dest[key] = src[key];
        }
    }
};

module.exports = Multilang;
