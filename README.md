# Muh

Muh (say: Moo!) stands for "mustached hypertext" and is the template language that runs [Sissi](https://sissi.js.org), the static site generator. It is put into a single package so it can be re-used in other projects as well.

## Syntax

The syntax is `{{ moo }}` where `moo` can be any arbitrary JavaScript. JavaScript is evaluated in a safe context. The only globals it can access are the ones you provide, plus a few built-ins.

When the evaluated expression is a promise, it is automatically resolved (or rejected). When the evaluated expression is a function, it is automatically invoked without parameters.

Under the hood, it uses `node:vm`, which makes it a node-only library (for now). It should work in Deno 2, as it provides some backwards-compatibility to node.js.

## Filters

You can apply filters to your mustache expressions using the pipe notation. There are a few built-in filters: 

```js
{{ content | safe }} // dont escape html
{{ promise | async }} // resolve promises
{{ result | json }} // print json
{{ article.date | dateFormat: 'dd.mm.YYYY' }} // TODO: format a date
{{ price | numberFormat: 'de', 'euro' }} // TODO: format a number or currency
{{ 20 | padStart: ' ', 3 }}
{{ articles | async | limit: 5 | each: templateFunction }} 
// articles are a promise
// first resolve that, 
// then limit to five, 
// then map each to a template function
// concatenate the result
```

## Helpers

There are a few built-in helper functions:

```js
{{ Date.now() }} // from JS.
{{ JSON.stringify() }} // from JS.

{{ fetchJson('https://yesno.wtf/api') | async | json }}
{{ fetchText('https://some-html.api/api/weather') | async }}

{{ include('_includes/partial.html', {title: 'some additional data'}) }} /* TODO */
```
## Loops

Use array functions:

```html
<ul>
  {{ people.map(p => `<li>${p.name}</li>`) }}
</ul>
```
