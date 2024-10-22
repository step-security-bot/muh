import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import nonStrictAssert from 'node:assert';
import { createContext } from 'node:vm';

import { parseFilterExpression, template } from '../src/muh.js';
import * as builtinFilters from '../src/builtin-filters.js';

const TEST_DATA = {
  'title': 'This is a title',
  'tags': ['html', 'css', 'javascript'],
  'meta': {
    'authors': ['Joe', 'Lea'],
  },
  'theMatrix': [[1,2,3],[4,5,6],[7,8,9]],
  date() {
    return '12.03.2024'
  },
  greet(str) {
    return 'Hello ' + str;
  }
}

const TEST_MD = `# {{ title }}

An article by {{ author }}
`

const TEST_TEMPLATE = `<h1>{{ title }}</h1>
<p>Blog article by {{ meta.authors[1] }}</p>
`

const TEST_TEMPLATE_EXPECTED = `<h1>This is a title</h1>
<p>Blog article by Lea</p>
`

const TEST_TEMPLATE_2 = `{{ date }}`
const TEST_TEMPLATE_EXPECTED_2 = '12.03.2024';

const TEST_TEMPLATE_3 = `{{ greet(meta.authors[1]) }}`
const TEST_TEMPLATE_EXPECTED_3 = 'Hello Lea';

describe('parseFilterExpression function', () => {
  const scope = { meta: { authors: ['Joe', 'Lea'] }, foo: 'bar' };
  const context = createContext(scope);

  it('should parse a parameterless filter', () => {
    const [filter, args] = parseFilterExpression('uppercase', context);

    assert.equal(filter, 'uppercase');
    assert.equal(args, null);
  });

  it('should parse the filter and a list of constant arguments from an expression', () => {
    const [filter, args] = parseFilterExpression('language: "de"', context);

    assert.equal(filter, 'language');
    nonStrictAssert.deepEqual(args, ["de"]);
  });

  it('should addionally resolve any variable used', () => {
    const [filter, args] = parseFilterExpression('author: meta.authors[1]', context);

    assert.equal(filter, 'author');
    nonStrictAssert.deepEqual(args, ['Lea']);
  });

  
});

describe('template function', () => {
  it('should insert data into the placeholders wrapped in double curly brackets', async () => {
    assert.equal(await template(TEST_TEMPLATE)(TEST_DATA), TEST_TEMPLATE_EXPECTED);
  });

  it('should be able to invoke functions', async () => {
    assert.equal(await template(TEST_TEMPLATE_2)(TEST_DATA), TEST_TEMPLATE_EXPECTED_2);
    assert.equal(await template(TEST_TEMPLATE_3)(TEST_DATA), TEST_TEMPLATE_EXPECTED_3);
  });

  it('should be able to apply a filter', async () => {
    const filters = new Map();
    filters.set('shout', (str) => (str||'').toUpperCase());
    const result = await template('{{greeting | shout }}')({greeting: "Hello"}, filters);
    
    assert.equal(result, "HELLO");
  });

  it('should escape angle brackets and ampersands by default', async () => {
    const result = await template('{{ content }}')({content: '<h1>Hello</h1>'});

    assert.equal(result, '&lt;h1&gt;Hello&lt;/h1&gt;')
  });

  it('should not escape angle brackets and ampersands when marked safe', async () => {
    const result = await template('{{ content | safe }}')({content: '<h1>Hello</h1>'});

    assert.equal(result, '<h1>Hello</h1>')
  });

  it('should be able to apply a filter with additional parameters', async () => {
    const data = { greeting: 'Hello Lea' }
    const filters = new Map();
    filters.set('piratify', (str, prefix = 'Yo-ho-ho', suffix = 'yarrr') => `${prefix}! ${str}, ${suffix}!`);

    assert.equal(await template('{{ greeting | piratify }}')(data, filters), 'Yo-ho-ho! Hello Lea, yarrr!');
    assert.equal(await template('{{ greeting | piratify: "AYE" }}')(data, filters), 'AYE! Hello Lea, yarrr!');
    assert.equal(await template('{{ greeting | piratify: "Ahoy", "matey" }}')(data, filters), 'Ahoy! Hello Lea, matey!');
  });

  it('should be able to chain filters', async () => {
    const filters = new Map();
    filters.set('shout', (str) => (str||'').toUpperCase());
    filters.set('piratify', (str, prefix = 'Yo-ho-ho', suffix = 'yarrr') => `${prefix}! ${str}, ${suffix}!`);

    const data = { greeting: 'Hello Lea' };
    assert.equal(await template('{{ greeting | piratify | shout }}')(data, filters), 'YO-HO-HO! HELLO LEA, YARRR!');

    // order matters
    assert.equal(await template('{{ greeting | shout | piratify }}')(data, filters), 'Yo-ho-ho! HELLO LEA, yarrr!');
  });

  it('should be able to do async operations', async () => {
    const filters = new Map();
    filters.set('async', builtinFilters.async);
    const data = { answer: () => Promise.resolve(42) };

    assert.equal(await (template('{{ answer | async }}')(data, filters)), '42');
  });
});
