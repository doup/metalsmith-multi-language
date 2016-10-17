'use strict';

var expect     = require('chai').expect;
var Metalsmith = require('metalsmith');
var Multilang  = require('../lib/multilang');
var noop       = function () {};

describe('/lib/multilang.js', function () {
    var multilang = new Multilang({ default: 'es', locales: ['en', 'es'] });

    describe('getAltFilename()', function () {
        it('should return the alternative filename', function () {
            expect(multilang.getAltFilename('index_es.html', 'es', 'ca')).to.equal('index_ca.html');
            expect(multilang.getAltFilename('index_es.html', 'es', 'es')).to.equal('index_es.html');
            expect(multilang.getAltFilename('some/path/file_es.md', 'es', 'ca')).to.equal('some/path/file_ca.md');
            expect(multilang.getAltFilename('some/path/file_es.md', 'es', 'es')).to.equal('some/path/file_es.md');
            expect(multilang.getAltFilename('some/es/file.md', 'es', 'ca')).to.equal('some/ca/file.md');
            expect(multilang.getAltFilename('some/es/file.md', 'es', 'es')).to.equal('some/es/file.md');
            expect(multilang.getAltFilename('es/file.md', 'es', 'ca')).to.equal('ca/file.md');
            expect(multilang.getAltFilename('es/file.md', 'es', 'es')).to.equal('es/file.md');
        });
    });

    describe('getBaseFilename()', function () {
        it('should return the base filename', function () {
            expect(multilang.getBaseFilename('index_es.html')).to.equal('index_es.html');
            expect(multilang.getBaseFilename('index_en.html')).to.equal('index_es.html');
            expect(multilang.getBaseFilename('some/path/file_es.md')).to.equal('some/path/file_es.md');
            expect(multilang.getBaseFilename('some/path/file_en.md')).to.equal('some/path/file_es.md');
            expect(multilang.getBaseFilename('some/es/file.md')).to.equal('some/es/file.md');
            expect(multilang.getBaseFilename('some/en/file.md')).to.equal('some/es/file.md');
            expect(multilang.getBaseFilename('es/file.md')).to.equal('es/file.md');
            expect(multilang.getBaseFilename('en/file.md')).to.equal('es/file.md');
        });

        it('should ignore unknown locales', function () {
            expect(multilang.getBaseFilename('index_ca.html')).to.equal('index_ca.html');
            expect(multilang.getBaseFilename('ca/file.md')).to.equal('ca/file.md');
        });
    });

    describe('getLocale()', function () {
        it('should return the file locale', function () {
            expect(multilang.getLocale('index_es.html')).to.equal('es');
            expect(multilang.getLocale('index_en.html')).to.equal('en');
            expect(multilang.getLocale('some/path/file_es.md')).to.equal('es');
            expect(multilang.getLocale('some/path/file_en.md')).to.equal('en');
            expect(multilang.getLocale('some/es/file.md')).to.equal('es');
            expect(multilang.getLocale('some/en/file.md')).to.equal('en');
            expect(multilang.getLocale('es/file.md')).to.equal('es');
            expect(multilang.getLocale('en/file.md')).to.equal('en');
        });
    });

    describe('getPlugin()', function () {
        it('should add `defaultLocale` and `locales` to Metalsmith metadata', function () {
            var ms     = Metalsmith(__dirname);
            var plugin = multilang.getPlugin();

            plugin([], ms, noop);

            expect(ms.metadata()).to.have.property('defaultLocale');
            expect(ms.metadata().defaultLocale).to.equal('es');
            expect(ms.metadata()).to.have.property('locales');
            expect(ms.metadata().locales).to.deep.equal(['en', 'es']);
        });

        it('should handle index files gracefully', function () {
            var ms     = Metalsmith(__dirname);
            var plugin = multilang.getPlugin();
            var files  = { 'index_en.html': {}, 'index_es.html': {} };

            plugin(files, ms, noop);

            expect(files).not.to.have.property('index_en.html');
            expect(files).not.to.have.property('index_es.html');
            expect(files).to.have.property('index.html');
            expect(files).to.have.property('en/index.html');
            expect(files['index.html'].path).to.equal('');
            expect(files['en/index.html'].path).to.equal('en/');
        });

        it('should add `locale` property to files', function () {
            var ms     = Metalsmith(__dirname);
            var plugin = multilang.getPlugin();
            var files  = { 'rand.md': {}, 'file_ca.md': {}, 'file_en.md': {}, 'file_es.md': {} };

            plugin(files, ms, noop);

            expect(files['rand.md'].locale).to.equal('es');
            expect(files['file_ca.md'].locale).to.equal('es');
            expect(files['file_en.md'].locale).to.equal('en');
            expect(files['file_es.md'].locale).to.equal('es');
        });

        it('should merge main (default) locale properties into the secondary locales', function () {
            var ms     = Metalsmith(__dirname);
            var plugin = multilang.getPlugin();
            var files  = {
                'file_es.md': { base: 'copy-this', title: 'es' }, // main
                'file_en.md': { title: 'en', other: 'leave' }     // secondary
            };

            plugin(files, ms, noop);

            expect(files['file_es.md'].title).to.equal('es');
            expect(files['file_es.md'].base).to.equal('copy-this');

            expect(files['file_en.md'].title).to.equal('en');
            expect(files['file_en.md'].other).to.equal('leave');
            expect(files['file_en.md'].base).to.equal('copy-this');
        });

        it('should add `lang` method in each file to retrieve the alternative language file', function () {
            var ms     = Metalsmith(__dirname);
            var plugin = multilang.getPlugin();
            var files  = { 'file_es.md': { title: 'es' }, 'file_en.md': { title: 'en' } };

            plugin(files, ms, noop);

            expect(files['file_es.md']).to.have.property('lang');
            expect(files['file_en.md']).to.have.property('lang');

            // Check references
            expect(files['file_es.md'].lang('en')).to.equal(files['file_en.md']);
            expect(files['file_en.md'].lang('es')).to.equal(files['file_es.md']);

            expect(files['file_es.md'].lang('en').title).to.equal('en');
            expect(files['file_es.md'].lang('es').title).to.equal('es');
            expect(files['file_en.md'].lang('es').title).to.equal('es');
        });

        it('should throw an expection if alt file does not exist when calling `lang`', function () {
            var ms     = Metalsmith(__dirname);
            var plugin = multilang.getPlugin();
            var files  = { 'file_es.md': { title: 'es' }, 'file_en.md': { title: 'en' } };

            plugin(files, ms, noop);

            expect(function () {
                files['file_es.md'].lang('ca');
            }).to.throw('Unknown locale "ca".');
        });
    });

    describe('merge()', function () {
        it('should merge two objects', function () {
            var a = { base: 'a', title: 'a'};
            var b = { title: 'b', other: 'b' };

            multilang.merge(a, b);

            expect(b).to.deep.equal({ base: 'a', title: 'b', other: 'b' });
        });
    });
});
