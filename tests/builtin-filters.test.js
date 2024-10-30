import { describe, test } from 'node:test'
import assert from 'node:assert/strict'

import { json } from '../src/builtin-filters.js'

describe('built-in filters', () => {
  test('json', () => {
    assert.equal(json({name: 'Lea'}), '{"name":"Lea"}');
  });

  

});
