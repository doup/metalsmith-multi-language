> **THIS PROJECT IS NO LONGER MAINTAINED, OPEN A ISSUE IF YOU WANT TAKE OWNERSHIP**

# metalsmith-multi-language

## Instalation

    $ npm install --save metalsmith-multi-language

## Usage

Add the plugin:

```javascript
var multiLanguage = require('metalsmith-multi-language');

Metalsmith(__dirname)
    .use(multiLanguage({ default: 'es', locales: ['en', 'es'] }))
```

The plugin needs both a `default` locale and the supported `locales` list. Note that `default` repeats in the `locales` array. `default` will act as the **main** locale while the others will be the **secondary** ones.

Append the locale to your file names (`_{locale}` with the underscore), e.g.:

```
index_es.md
index_en.md
path/file_es.md
path/file_en.md
```

Or put your files in locale-specific directories, e.g.:

```
path/es/file.md
path/en/file.md
path/es/subdir/file.md
path/en/subdir/file.md
```

Note that **this plugin does not handle URL generation**, if you need URLs in the `:locale/:slug` format or similar check [`metalsmith-permalinks`](https://github.com/segmentio/metalsmith-permalinks).

### Property merging

The plugin will merge properties from the **main** locale to the **secondary** ones. This is usefull if you want a property shared between all the locales (e.g.: `date`, `template`…).

### `locale` property

Each file will have a `locale` property with its locale, if the filename does not have the locale extension the **main** locale will be set, e.g.: `file_en.md` `locale` property would be `en`, while for `rand.md` will be `es`.

### `lang()` method

Each file will have a `lang()` method which is usefull to reference the translated files. So, if you're in the `index_es.md` file, and you want to get the english version just call `lang('en')`.

If the locale is not found this will throw an expection.

### `defaultLocale` & `locales`

Both options will be added to Metalsmith metadata as: `defaultLocale` and `locales` so that you can use them in your templates.

### Index handling

The plugin will handle the index files gracefully, so that, if `es` is the **main** locale and `en` is the **secondary** one. This:

```
index_es.md
index_en.md
```

Becomes:

```
index.md
en/index.md
```

The plugin will also add a `path` property to each index file with the pretty path, e.g.: `''` (empty string) for `index.md` and `en/` for `en/index.md`.

## Tests

`npm test` to run the tests.

## License

The MIT License (MIT)

Copyright (c) 2015 Asier Illarramendi <asier@illarra.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
