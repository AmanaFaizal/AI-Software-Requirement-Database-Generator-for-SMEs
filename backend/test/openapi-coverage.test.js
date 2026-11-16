const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const spec = require('../openapi/wso2-inventory.json');
const methods = ['get', 'post', 'put', 'delete', 'patch'];

test('OpenAPI covers mounted backend routes and exposes user-token input', () => {
  const expected = [];
  function walk(file, prefix) {
    const source = fs.readFileSync(file, 'utf8');
    const imports = {};
    for (const m of source.matchAll(/const\s+(\w+)\s*=\s*require\(['"]\.\/([^'"]+)['"]\)/g))
      imports[m[1]] = path.join(path.dirname(file), m[2] + '.js');
    for (const m of source.matchAll(/(?:app|router)\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g)) {
      expected.push(`${m[1]} ${(prefix + (m[2] === '/' ? '' : m[2])).replace(/:(\w+)/g, '{$1}')}`);
    }
    for (const m of source.matchAll(/(?:app|router)\.use\(['"]([^'"]+)['"],\s*(\w+)\)/g))
      if (imports[m[2]]) walk(imports[m[2]], prefix + m[1]);
  }
  walk(path.join(__dirname, '../src/app.js'), '');
  const actual = [];
  const ids = new Set();
  for (const [resource, item] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(item)) {
      if (!methods.includes(method)) continue;
      actual.push(`${method} ${resource}`);
      assert(!ids.has(op.operationId), 'Unique operation IDs');
      ids.add(op.operationId);
      for (const m of resource.matchAll(/\{(\w+)\}/g))
        assert(item.parameters.some(p => p.name === m[1] && p.required), resource);
      const protectedRoute = !['/api/health', '/api/auth/register', '/api/auth/login'].includes(resource);
      assert.equal(Boolean(op.parameters?.some(p => p.$ref === '#/components/parameters/bizguideToken')),
        protectedRoute, `${method} ${resource} header requirement`);
      assert.deepEqual(op.security || spec.security, [{ gatewayOAuth: [] }]);
    }
  }
  assert.deepEqual(actual.sort(), expected.sort());
  assert.equal(spec.components.parameters.bizguideToken.name, 'X-BizGuide-Token');
  assert.equal(spec.components.parameters.bizguideToken.in, 'header');
});
